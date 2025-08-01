import { BaseModel } from './BaseModel';
import { Task } from './Task';
import type { TaskData } from './Task';

export interface GroupData {
    id?: string;
    title: string;
    todoId: string;
    order: number;
    color?: string;
    collapsed?: boolean;
    tasks?: Task[];
    priority?: 'low' | 'medium' | 'high';
    createdAt?: Date;
    updatedAt?: Date;
}

export class Group extends BaseModel {
    title: string;
    todoId: string;
    order: number;
    color?: string;
    collapsed: boolean;
    priority?: 'low' | 'medium' | 'high';
    tasks: Task[];

    constructor(data: GroupData) {
        super(data);
        this.title = data.title || 'Untitled';
        this.todoId = data.todoId;
        this.order = data.order !== undefined ? data.order : 0;
        this.color = data.color;
        this.priority = data.priority || 'medium';
        this.collapsed = data.collapsed || false;
        this.tasks = data.tasks ? data.tasks.map(t => t instanceof Task ? t : new Task(t)) : [];
    }

    protected getModelPrefix(): string {
        return 'group';
    }

    protected serialize(): Record<string, any> {
        return {
            title: this.title,
            todoId: this.todoId,
            order: this.order,
            color: this.color,
            collapsed: this.collapsed,
            tasks: this.tasks
                .filter((task): task is Task => task instanceof Task)
                .map(task => task.toJSON())
        };
    }

    protected validateModel(): string[] {
        const errors: string[] = [];

        if (!this.title?.trim()) {
            errors.push('Group title is required');
        }

        if (!this.todoId) {
            errors.push('Group must belong to a todo');
        }

        if (this.order < 0) {
            errors.push('Group order must be non-negative');
        }

        this.tasks.forEach((task, index) => {
            const validation = task.validate();
            if (!validation.isValid) {
                errors.push(`Task ${index + 1}: ${validation.errors.join(', ')}`);
            }

            if (task.groupId !== this.id) {
                errors.push(`Task ${index + 1}: groupId mismatch`);
            }
        });

        const orders = this.tasks.map(t => t.order).sort((a, b) => a - b);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i] !== i) {
                errors.push('Task orders must be sequential starting from 0');
                break;
            }
        }

        return errors;
    }

    toggle(): void {
        this.collapsed = !this.collapsed;
        this.updatedAt = new Date();
    }
    // Task management
    addTask(task: Task): void {
        task.groupId = this.id;
        task.order = this.tasks.length;
        this.tasks.push(task);
        this.updatedAt = new Date();
    }

    removeTask(taskId: string): Task | null {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index === -1) return null;

        const [removedTask] = this.tasks.splice(index, 1);
        this.reorderTasks();
        this.updatedAt = new Date();
        return removedTask;
    }

    updateTask(taskId: string, updates: Partial<TaskData>): Task | null {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return null;

        task.update(updates);
        this.updatedAt = new Date();
        return task;
    }

    // Task ordering
    reorderTasks(newOrder?: string[]): void {
        if (newOrder) {
            // Reorder based on provided order
            const taskMap = new Map(this.tasks.map(t => [t.id, t]));
            this.tasks = newOrder.map(id => taskMap.get(id)).filter(Boolean) as Task[];
        }

        // Update order indexes
        this.tasks.forEach((task, index) => {
            task.order = index;
        });
        this.updatedAt = new Date();
    }

    moveTask(taskId: string, newIndex: number): boolean {
        const currentIndex = this.tasks.findIndex(t => t.id === taskId);
        if (currentIndex === -1 || newIndex < 0 || newIndex >= this.tasks.length) {
            return false;
        }

        // Move task to new position
        const [task] = this.tasks.splice(currentIndex, 1);
        this.tasks.splice(newIndex, 0, task);

        // Update all order indexes
        this.reorderTasks();
        return true;
    }

    moveTaskToGroup(taskId: string, targetGroup: Group, targetIndex?: number): boolean {
        const task = this.removeTask(taskId);
        if (!task) return false;

        const insertIndex = targetIndex !== undefined ? targetIndex : targetGroup.tasks.length;
        task.groupId = targetGroup.id;
        task.order = insertIndex;

        targetGroup.tasks.splice(insertIndex, 0, task);
        targetGroup.reorderTasks();

        this.updatedAt = new Date();
        targetGroup.updatedAt = new Date();
        return true;
    }

    // Statistics
    getCompletedTasksCount(): number {
        return this.tasks.filter(t => t.completed).length;
    }

    getTotalTasksCount(): number {
        return this.tasks.length;
    }

    getProgress(): number {
        if (this.tasks.length === 0) return 0;
        return (this.getCompletedTasksCount() / this.getTotalTasksCount()) * 100;
    }

    getHighPriorityTasksCount(): number {
        return this.tasks.filter(t => t.isHighPriority()).length;
    }

    // Query helpers
    getTasksByPriority(priority: 'low' | 'medium' | 'high'): Task[] {
        return this.tasks.filter(t => t.priority === priority);
    }

    getTasksByTag(tag: string): Task[] {
        return this.tasks.filter(t => t.tags.includes(tag));
    }

    getTasksByCompletion(completed: boolean): Task[] {
        return this.tasks.filter(t => t.completed === completed);
    }

    // Order management
    moveToPosition(newOrder: number): void {
        this.order = Math.max(0, newOrder);
        this.updatedAt = new Date();
    }

    // Validation helpers
    isValidTaskOrder(): boolean {
        const orders = this.tasks.map(t => t.order).sort((a, b) => a - b);
        return orders.every((order, index) => order === index);
    }

    fixTaskOrdering(): void {
        this.tasks.sort((a, b) => a.order - b.order);
        this.reorderTasks();
    }
}

