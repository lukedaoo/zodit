export interface DataProviderConfig {
    name: string;
    options?: Record<string, any>;
}

export interface QueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
}

export interface DataProvider {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;

    create<T extends { id: string }>(collection: string, data: T): Promise<T>;
    read<T extends { id: string }>(collection: string, id: string): Promise<T | null>;
    update<T extends { id: string }>(collection: string, id: string, data: Partial<T>): Promise<T | null>;
    delete(collection: string, id: string): Promise<boolean>;

    createMany<T extends { id: string }>(collection: string, data: T[]): Promise<T[]>;
    updateMany<T extends { id: string }>(collection: string, updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]>;
    deleteMany(collection: string, ids: string[]): Promise<boolean>;

    findAll<T>(collection: string, options?: QueryOptions): Promise<T[]>;
    findWhere<T>(collection: string, filters: Record<string, any>, options?: QueryOptions): Promise<T[]>;
    count(collection: string, filters?: Record<string, any>): Promise<number>;

    transaction<T>(operations: () => Promise<T>): Promise<T>;

    subscribe?<T>(
        collection: string,
        callback: (type: 'create' | 'update' | 'delete', data: T) => void,
        filters?: Record<string, any>
    ): () => void;

    clear(collection: string): Promise<void>;
    export(): Promise<Record<string, any>>;
    import(data: Record<string, any>): Promise<void>;
}
