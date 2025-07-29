export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export abstract class BaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<BaseModel> = {}) {
        this.id = data.id || this.generateId();
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    protected generateId(): string {
        return `${this.getModelPrefix()}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    }

    protected abstract getModelPrefix(): string;

    toJSON(): Record<string, any> {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            ...this.serialize(),
        };
    }

    protected abstract serialize(): Record<string, any>;

    static fromJSON<T extends BaseModel>(this: new (data: any) => T, data: Record<string, any>): T {
        const parsed = {
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
        };
        return new this(parsed);
    }

    update(data: Partial<this>): void {
        Object.assign(this, data);
        this.updatedAt = new Date();
    }

    validate(): ValidationResult {
        const errors: string[] = [];

        if (!this.id) errors.push('ID is required');
        if (!this.createdAt) errors.push('Created date is required');
        if (!this.updatedAt) errors.push('Updated date is required');

        const customValidation = this.validateModel();
        errors.push(...customValidation);

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected abstract validateModel(): string[];
}
