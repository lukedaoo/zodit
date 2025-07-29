import { BaseModel } from './BaseModel';

export interface NoteData {
    id?: string;
    text: string;
    color: string;
    position: { x: number; y: number };
    width?: number;
    height?: number;
    isPinned?: boolean;
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class Note extends BaseModel {
    text: string;
    color: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    isPinned: boolean;
    tags: string[];

    constructor(data: NoteData) {
        super(data);
        this.text = data.text || '';
        this.color = data.color;
        this.position = data.position;
        this.width = data.width || 220;
        this.height = data.height || 180;
        this.isPinned = data.isPinned || false;
        this.tags = data.tags || [];
    }

    protected getModelPrefix(): string {
        return 'note';
    }

    protected serialize(): Record<string, any> {
        return {
            text: this.text,
            color: this.color,
            position: this.position,
            width: this.width,
            height: this.height,
            isPinned: this.isPinned,
            tags: this.tags
        };
    }

    protected validateModel(): string[] {
        const errors: string[] = [];

        if (!this.color) {
            errors.push('Note color is required');
        }

        if (!this.position || typeof this.position.x !== 'number' || typeof this.position.y !== 'number') {
            errors.push('Note position is required and must have x and y coordinates');
        }

        if (this.width <= 0 || this.height <= 0) {
            errors.push('Note dimensions must be positive numbers');
        }

        return errors;
    }

    pin(): void {
        this.isPinned = true;
        this.updatedAt = new Date();
    }

    unpin(): void {
        this.isPinned = false;
        this.updatedAt = new Date();
    }

    togglePin(): void {
        this.isPinned = !this.isPinned;
        this.updatedAt = new Date();
    }

    
  move(x: number, y: number): void {
    this.position = { x, y };
    this.updatedAt = new Date();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(100, width);
    this.height = Math.max(80, height);
    this.updatedAt = new Date();
  }

  isEmpty(): boolean {
    return !this.text?.trim();
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
}
