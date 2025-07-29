import type { DataProvider, QueryOptions } from './types';

export class LocalStorageProvider implements DataProvider {
    private isInit = false;
    private listeners: Map<string, Set<Function>> = new Map();

    async connect(): Promise<void> {
        if (typeof window === 'undefined' || !window.localStorage) {
            throw new Error('LocalStorage is not available');
        }
        this.isInit = true;
    }

    async disconnect(): Promise<void> {
        this.listeners.clear();
        this.isInit = false;
    }

    isConnected(): boolean {
        return this.isInit;
    }

    private getStorageKey(collection: string): string {
        return `zodit_${collection}`;
    }

    private getCollectionData<T>(collection: string): Record<string, T> {
        const key = this.getStorageKey(collection);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    }

    private setCollectionData<T>(collection: string, data: Record<string, T>): void {
        const key = this.getStorageKey(collection);
        localStorage.setItem(key, JSON.stringify(data));
    }

    private notifyListeners<T>(collection: string, type: 'create' | 'update' | 'delete', data: T): void {
        const collectionListeners = this.listeners.get(collection);
        if (collectionListeners) {
            collectionListeners.forEach(callback => callback(type, data));
        }
    }

    async create<T extends { id: string }>(collection: string, data: T): Promise<T> {
        if (!this.isConnected()) throw new Error('Not connected');

        const collectionData = this.getCollectionData<T>(collection);

        if (collectionData[data.id]) {
            throw new Error(`Item with id ${data.id} already exists`);
        }

        const now = new Date().toISOString();
        const newItem = {
            ...data,
            createdAt: (data as any).createdAt || now,
            updatedAt: now
        } as T;

        collectionData[data.id] = newItem;
        this.setCollectionData(collection, collectionData);
        this.notifyListeners(collection, 'create', newItem);

        return newItem;
    }

    async read<T>(collection: string, id: string): Promise<T | null> {
        if (!this.isConnected()) throw new Error('Not connected');

        const collectionData = this.getCollectionData<T>(collection);
        return collectionData[id] || null;
    }

    async update<T extends { id: string }>(collection: string, id: string, data: Partial<T>): Promise<T | null> {
        if (!this.isConnected()) throw new Error('Not connected');

        const collectionData = this.getCollectionData<T>(collection);
        const existing = collectionData[id];

        if (!existing) return null;

        const updated = {
            ...existing,
            ...data,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        } as T;

        collectionData[id] = updated;
        this.setCollectionData(collection, collectionData);
        this.notifyListeners(collection, 'update', updated);

        return updated;
    }

    async delete(collection: string, id: string): Promise<boolean> {
        if (!this.isConnected()) throw new Error('Not connected');

        const collectionData = this.getCollectionData(collection);
        const existing = collectionData[id];

        if (!existing) return false;

        delete collectionData[id];
        this.setCollectionData(collection, collectionData);
        this.notifyListeners(collection, 'delete', existing);

        return true;
    }

    async createMany<T extends { id: string }>(collection: string, data: T[]): Promise<T[]> {
        if (!this.isConnected()) throw new Error('Not connected');

        const collectionData = this.getCollectionData<T>(collection);
        const results: T[] = [];
        const now = new Date().toISOString();

        for (const item of data) {
            if (collectionData[item.id]) {
                throw new Error(`Item with id ${item.id} already exists`);
            }

            const newItem = {
                ...item,
                createdAt: (item as any).createdAt || now,
                updatedAt: now
            } as T;

            collectionData[item.id] = newItem;
            results.push(newItem);
        }

        this.setCollectionData(collection, collectionData);

        // Notify listeners for each created item
        results.forEach(item => this.notifyListeners(collection, 'create', item));

        return results;
    }

    async updateMany<T extends { id: string }>(
        collection: string,
        updates: Array<{ id: string; data: Partial<T> }>
    ): Promise<T[]> {
        if (!this.isConnected()) throw new Error('Not connected');

        const collectionData = this.getCollectionData<T>(collection);
        const results: T[] = [];
        const now = new Date().toISOString();

        for (const { id, data } of updates) {
            const existing = collectionData[id];
            if (!existing) continue;

            const updated = {
                ...existing,
                ...data,
                id,
                updatedAt: now
            } as T;

            collectionData[id] = updated;
            results.push(updated);
        }

        this.setCollectionData(collection, collectionData);

        // Notify listeners for each updated item
        results.forEach(item => this.notifyListeners(collection, 'update', item));

        return results;
    }

    async deleteMany(collection: string, ids: string[]): Promise<boolean> {
        if (!this.isConnected()) throw new Error('Not connected');

        const collectionData = this.getCollectionData(collection);
        const deletedItems: any[] = [];

        for (const id of ids) {
            const existing = collectionData[id];
            if (existing) {
                deletedItems.push(existing);
                delete collectionData[id];
            }
        }

        if (deletedItems.length > 0) {
            this.setCollectionData(collection, collectionData);
            deletedItems.forEach(item => this.notifyListeners(collection, 'delete', item));
        }

        return deletedItems.length > 0;
    }

    async findAll<T>(collection: string, options: QueryOptions = {}): Promise<T[]> {
        if (!this.isConnected()) throw new Error('Not connected');

        const collectionData = this.getCollectionData<T>(collection);
        let items = Object.values(collectionData);

        // Apply ordering
        if (options.orderBy) {
            items.sort((a, b) => {
                const aVal = (a as any)[options.orderBy!];
                const bVal = (b as any)[options.orderBy!];

                if (aVal < bVal) return options.orderDirection === 'desc' ? 1 : -1;
                if (aVal > bVal) return options.orderDirection === 'desc' ? -1 : 1;
                return 0;
            });
        }

        // Apply pagination
        const start = options.offset || 0;
        const end = options.limit ? start + options.limit : undefined;
        return items.slice(start, end);
    }

    async findWhere<T>(
        collection: string,
        filters: Record<string, any>,
        options: QueryOptions = {}
    ): Promise<T[]> {
        if (!this.isConnected()) throw new Error('Not connected');

        const allItems = await this.findAll<T>(collection, options);

        return allItems.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                const itemValue = (item as any)[key];

                if (Array.isArray(value)) {
                    return value.includes(itemValue);
                }

                if (typeof value === 'object' && value !== null) {
                    if (value.$gt !== undefined) return itemValue > value.$gt;
                    if (value.$gte !== undefined) return itemValue >= value.$gte;
                    if (value.$lt !== undefined) return itemValue < value.$lt;
                    if (value.$lte !== undefined) return itemValue <= value.$lte;
                    if (value.$ne !== undefined) return itemValue !== value.$ne;
                    if (value.$in !== undefined) return value.$in.includes(itemValue);
                    if (value.$nin !== undefined) return !value.$nin.includes(itemValue);
                }

                return itemValue === value;
            });
        });
    }

    async count(collection: string, filters?: Record<string, any>): Promise<number> {
        if (!this.isConnected()) throw new Error('Not connected');

        if (filters) {
            const items = await this.findWhere(collection, filters);
            return items.length;
        }

        const collectionData = this.getCollectionData(collection);
        return Object.keys(collectionData).length;
    }

    async transaction<T>(operations: () => Promise<T>): Promise<T> {
        if (!this.isConnected()) throw new Error('Not connected');

        // For localStorage, we'll implement a simple rollback mechanism
        const backup: Record<string, string | null> = {};

        try {
            // Create backup of potentially affected data
            const collections = ['todos', 'groups', 'tasks', 'notes'];
            collections.forEach(collection => {
                const key = this.getStorageKey(collection);
                backup[key] = localStorage.getItem(key);
            });

            // Execute the operations
            const result = await operations();

            return result;
        } catch (error) {
            // Rollback on error
            Object.entries(backup).forEach(([key, value]) => {
                if (value === null) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, value);
                }
            });

            throw error;
        }
    }

    subscribe<T>(
        collection: string,
        callback: (type: 'create' | 'update' | 'delete', data: T) => void,
        filters?: Record<string, any>
    ): () => void {
        if (!this.listeners.has(collection)) {
            this.listeners.set(collection, new Set());
        }

        const wrappedCallback = (type: 'create' | 'update' | 'delete', data: T) => {
            // Apply filters if provided
            if (filters) {
                const matches = Object.entries(filters).every(([key, value]) => {
                    return (data as any)[key] === value;
                });
                if (!matches) return;
            }
            callback(type, data);
        };

        this.listeners.get(collection)!.add(wrappedCallback);

        // Return unsubscribe function
        return () => {
            const collectionListeners = this.listeners.get(collection);
            if (collectionListeners) {
                collectionListeners.delete(wrappedCallback);
                if (collectionListeners.size === 0) {
                    this.listeners.delete(collection);
                }
            }
        };
    }

    async clear(collection: string): Promise<void> {
        if (!this.isConnected()) throw new Error('Not connected');

        const key = this.getStorageKey(collection);
        localStorage.removeItem(key);
    }

    async export(): Promise<Record<string, any>> {
        if (!this.isConnected()) throw new Error('Not connected');

        const result: Record<string, any> = {};

        // Get all keys that belong to our app
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('todo_app_')) {
                const collection = key.replace('todo_app_', '');
                const data = localStorage.getItem(key);
                result[collection] = data ? JSON.parse(data) : {};
            }
        }

        return result;
    }

    async import(data: Record<string, any>): Promise<void> {
        if (!this.isConnected()) throw new Error('Not connected');

        Object.entries(data).forEach(([collection, collectionData]) => {
            const key = this.getStorageKey(collection);
            localStorage.setItem(key, JSON.stringify(collectionData));
        });
    }
}
