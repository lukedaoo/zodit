import { BaseModel } from "./BaseModel";

export interface TaskData {
    id?: string;
    title: string;
    completed: boolean;
    description?: string;
    startTime?: string;
    startDate?: string;
    endDate?: string;
    groupId: string;
    order: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    customFields?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Task extends BaseModel {
    title: string;
    completed: boolean;
    description?: string;
    startTime?: string;
    startDate?: string;
    endDate?: string;
    groupId: string;
    order: number;
    tags: string[];
    priority: 'low' | 'medium' | 'high';
    customFields: Record<string, any>;

    constructor(data: TaskData) {
        super(data);
        this.title = data.title || '';
        this.completed = data.completed || false;
        this.description = data.description;
        this.startTime = data.startTime;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.groupId = data.groupId;
        this.order = data.order !== undefined ? data.order : 0;
        this.tags = data.tags || [];
        this.priority = data.priority || 'medium';
        this.customFields = data.customFields || {};
    }

    protected getModelPrefix(): string {
        return 'task';
    }

    protected serialize(): Record<string, any> {
        return {
            title: this.title,
            completed: this.completed,
            description: this.description,
            startTime: this.startTime,
            startDate: this.startDate,
            endDate: this.endDate,
            groupId: this.groupId,
            order: this.order,
            tags: this.tags,
            priority: this.priority,
            customFields: this.customFields
        };
    }

    protected validateModel(): string[] {
        const errors: string[] = [];

        if (!this.groupId) {
            errors.push('Task must belong to a group');
        }

        if (this.order < 0) {
            errors.push('Task order must be non-negative');
        }

        // if (this.startDate && this.endDate) {
        //     const start = new Date(this.startDate);
        //     const end = new Date(this.endDate);
        //     if (start > end) {
        //         errors.push('Start date cannot be after end date');
        //     }
        // }

        // Validate custom fields
        const customFieldErrors = this.validateCustomFields();
        errors.push(...customFieldErrors);

        return errors;
    }

    private validateCustomFields(): string[] {
        const errors: string[] = [];

        Object.entries(this.customFields).forEach(([key, value]) => {
            if (!key || typeof key !== 'string') {
                errors.push('Custom field keys must be non-empty strings');
                return;
            }

            try {
                JSON.stringify(value);
            } catch (error) {
                errors.push(`Custom field '${key}' contains circular references or non-serializable data`);
            }
        });

        return errors;
    }

    toggleComplete(): void {
        this.completed = !this.completed;
        this.updatedAt = new Date();
    }

    addTag(tag: string): void {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date();
        }
    }
    removeTag(tag: string): void {
        this.tags = this.tags.filter(t => t !== tag);
        this.updatedAt = new Date();
    }

    moveToPosition(newOrder: number): void {
        this.order = Math.max(0, newOrder);
        this.updatedAt = new Date();
    }

    moveToGroup(newGroupId: string, newOrder?: number): void {
        this.groupId = newGroupId;
        if (newOrder !== undefined) {
            this.order = Math.max(0, newOrder);
        }
        this.updatedAt = new Date();
    }


    // Priority helpers
    setPriority(priority: 'low' | 'medium' | 'high'): void {
        this.priority = priority;
        this.updatedAt = new Date();
    }

    isHighPriority(): boolean {
        return this.priority === 'high';
    }

    setCustomField(key: string, value: any): void {
        if (!key || typeof key !== 'string') {
            throw new Error('Custom field key must be a non-empty string');
        }

        this.customFields[key] = value;
        this.updatedAt = new Date();

        const validation = this.validate();
        if (!validation.isValid) {
            delete this.customFields[key];
            throw new Error(`Custom field validation failed: ${validation.errors.join(', ')}`);
        }
    }

    getCustomField<T = any>(key: string): T | undefined {
        return this.customFields[key] as T;
    }

    hasCustomField(key: string): boolean {
        return key in this.customFields;
    }

    removeCustomField(key: string): boolean {
        if (this.hasCustomField(key)) {
            delete this.customFields[key];
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    getCustomFieldKeys(): string[] {
        return Object.keys(this.customFields);
    }

    clearCustomFields(): void {
        this.customFields = {};
        this.updatedAt = new Date();
    }

    searchCustomFields(query: string): { key: string; value: any; matches: string[] }[] {
        const results: { key: string; value: any; matches: string[] }[] = [];
        const lowercaseQuery = query.toLowerCase();

        Object.entries(this.customFields).forEach(([key, value]) => {
            const matches: string[] = [];

            if (key.toLowerCase().includes(lowercaseQuery)) {
                matches.push(`key: ${key}`);
            }

            if (typeof value === 'string') {
                if (value.toLowerCase().includes(lowercaseQuery)) {
                    matches.push(`value: ${value}`);
                }
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    if (typeof item === 'string' && item.toLowerCase().includes(lowercaseQuery)) {
                        matches.push(`value[${index}]: ${item}`);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                const jsonString = JSON.stringify(value).toLowerCase();
                if (jsonString.includes(lowercaseQuery)) {
                    matches.push(`object value`);
                }
            }

            if (matches.length > 0) {
                results.push({ key, value, matches });
            }
        });

        return results;
    }

    exportCustomFields(): Record<string, any> {
        return { ...this.customFields };
    }

    exportCustomFieldsAsString(): string {
        return JSON.stringify(this.customFields, null, 2);
    }

    importCustomFields(fields: Record<string, any>, merge: boolean = true): void {
        if (merge) {
            this.customFields = { ...this.customFields, ...fields };
        } else {
            this.customFields = { ...fields };
        }
        this.updatedAt = new Date();

        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Custom fields validation failed: ${validation.errors.join(', ')}`);
        }
    }

    clone(newGroupId?: string): Task {
        const cloned = new Task({
            title: this.title,
            completed: this.completed,
            description: this.description,
            startTime: this.startTime,
            startDate: this.startDate,
            endDate: this.endDate,
            groupId: newGroupId || this.groupId,
            order: this.order,
            tags: [...this.tags],
            priority: this.priority,
            customFields: JSON.parse(JSON.stringify(this.customFields)) // Deep clone
        });
        return cloned;
    }
}
