import { BaseModel } from './BaseModel';
import { Group } from './Group';
import { Task } from './Task';
import type { GroupData } from './Group';

export interface TodoData {
    id?: string;
    date: string; // convert other formats to YYYY-MM-DD
    title?: string;
    groups?: Group[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class Todo extends BaseModel {
    date: string;
    title: string;
    groups: Group[];

    constructor(data: TodoData) {
        super(data);
        this.date = data.date;
        this.title = data.title || `Todo for ${data.date}`;
        this.groups = data.groups ? data.groups.map(g => g instanceof Group ? g : new Group(g)) : [];
    }

    protected getModelPrefix(): string {
        return 'todo';
    }

    protected serialize(): Record<string, any> {
        return {
            date: this.date,
            title: this.title,
            groups: this.groups.map(group => group.toJSON())
        };
    }

    protected validateModel(): string[] {
        const errors: string[] = [];

        if (!this.date) {
            errors.push('Todo date is required');
        }

        // Validate date format (YYYY-MM-DD)
        if (this.date && !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
            errors.push('Todo date must be in YYYY-MM-DD format');
        }

        // Validate groups
        this.groups.forEach((group, index) => {
            const validation = group.validate();
            if (!validation.isValid) {
                errors.push(`Group ${index + 1}: ${validation.errors.join(', ')}`);
            }

            // Ensure group belongs to this todo
            if (group.todoId !== this.id) {
                errors.push(`Group ${index + 1}: todoId mismatch`);
            }
        });

        // Validate group order sequence
        const orders = this.groups.map(g => g.order).sort((a, b) => a - b);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i] !== i) {
                errors.push('Group orders must be sequential starting from 0');
                break;
            }
        }

        return errors;
    }

    // Todo-specific methods
    getFormattedDate(): string {
        return new Date(this.date).toLocaleDateString();
    }

    isToday(): boolean {
        const today = new Date().toISOString().split('T')[0];
        return this.date === today;
    }

    // Group management
    addGroup(group: Group): void {
        group.todoId = this.id;
        group.order = this.groups.length;
        this.groups.push(group);
        this.updatedAt = new Date();
    }

    removeGroup(groupId: string): Group | null {
        const index = this.groups.findIndex(g => g.id === groupId);
        if (index === -1) return null;

        const [removedGroup] = this.groups.splice(index, 1);
        this.reorderGroups();
        this.updatedAt = new Date();
        return removedGroup;
    }

    updateGroup(groupId: string, updates: Partial<GroupData>): Group | null {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return null;

        group.update(updates);
        this.updatedAt = new Date();
        return group;
    }

    // Group ordering
    reorderGroups(newOrder?: string[]): void {
        if (newOrder) {
            // Reorder based on provided order
            const groupMap = new Map(this.groups.map(g => [g.id, g]));
            this.groups = newOrder.map(id => groupMap.get(id)).filter(Boolean) as Group[];
        }

        // Update order indexes
        this.groups.forEach((group, index) => {
            group.order = index;
        });
        this.updatedAt = new Date();
    }

    moveGroup(groupId: string, newIndex: number): boolean {
        const currentIndex = this.groups.findIndex(g => g.id === groupId);
        if (currentIndex === -1 || newIndex < 0 || newIndex >= this.groups.length) {
            return false;
        }

        // Move group to new position
        const [group] = this.groups.splice(currentIndex, 1);
        this.groups.splice(newIndex, 0, group);

        // Update all order indexes
        this.reorderGroups();
        return true;
    }

    // Statistics
    getTotalTasksCount(): number {
        return this.groups.reduce((total, group) => total + group.getTotalTasksCount(), 0);
    }

    getCompletedTasksCount(): number {
        return this.groups.reduce((total, group) => total + group.getCompletedTasksCount(), 0);
    }

    getProgress(): number {
        const total = this.getTotalTasksCount();
        if (total === 0) return 0;
        return (this.getCompletedTasksCount() / total) * 100;
    }

    getHighPriorityTasksCount(): number {
        return this.groups.reduce((total, group) => total + group.getHighPriorityTasksCount(), 0);
    }

    // Cross-group operations
    getAllTasks(): Task[] {
        return this.groups.flatMap(group => group.tasks);
    }

    findTask(taskId: string): { group: Group; task: Task } | null {
        for (const group of this.groups) {
            const task = group.tasks.find(t => t.id === taskId);
            if (task) {
                return { group, task };
            }
        }
        return null;
    }

    findGroup(groupId: string): Group | null {
        return this.groups.find(g => g.id === groupId) || null;
    }

    moveTaskBetweenGroups(
        taskId: string,
        targetGroupId: string,
        targetIndex?: number
    ): boolean {
        const source = this.findTask(taskId);
        const targetGroup = this.findGroup(targetGroupId);

        if (!source || !targetGroup) return false;

        return source.group.moveTaskToGroup(taskId, targetGroup, targetIndex);
    }

    // Query helpers
    getTasksByPriority(priority: 'low' | 'medium' | 'high'): Task[] {
        return this.getAllTasks().filter(t => t.priority === priority);
    }

    getTasksByTag(tag: string): Task[] {
        return this.getAllTasks().filter(t => t.tags.includes(tag));
    }

    getTasksByCompletion(completed: boolean): Task[] {
        return this.getAllTasks().filter(t => t.completed === completed);
    }

    searchTasks(query: string): Task[] {
        const lowercaseQuery = query.toLowerCase();
        return this.getAllTasks().filter(task =>
            task.title.toLowerCase().includes(lowercaseQuery) ||
            task.description?.toLowerCase().includes(lowercaseQuery) ||
            task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
    }

    // Validation helpers
    isValidGroupOrder(): boolean {
        const orders = this.groups.map(g => g.order).sort((a, b) => a - b);
        return orders.every((order, index) => order === index);
    }

    fixGroupOrdering(): void {
        this.groups.sort((a, b) => a.order - b.order);
        this.reorderGroups();
    }

    // Bulk operations
    markAllTasksComplete(): void {
        this.getAllTasks().forEach(task => {
            if (!task.completed) {
                task.toggleComplete();
            }
        });
        this.updatedAt = new Date();
    }

    markAllTasksIncomplete(): void {
        this.getAllTasks().forEach(task => {
            if (task.completed) {
                task.toggleComplete();
            }
        });
        this.updatedAt = new Date();
    }

    deleteCompletedTasks(): number {
        let deletedCount = 0;
        this.groups.forEach(group => {
            const initialCount = group.tasks.length;
            group.tasks = group.tasks.filter(t => !t.completed);
            group.reorderTasks();
            deletedCount += initialCount - group.tasks.length;
        });

        if (deletedCount > 0) {
            this.updatedAt = new Date();
        }

        return deletedCount;
    }
}
