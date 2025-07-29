import { Todo, Group, Task, Note } from './models';
import type { TodoData, GroupData, TaskData, NoteData } from './models';
import type { DataProvider } from './provider/types';

export class ModelDataProvider {
    private provider: DataProvider;
    constructor(provider: DataProvider) {
        this.provider = provider;
    }

    async connect(): Promise<void> {
        await this.provider.connect();
    }

    async disconnect(): Promise<void> {
        await this.provider.disconnect();
    }

    // Todo operations
    async createTodo(data: TodoData): Promise<Todo> {
        const todo = new Todo(data);
        await this.provider.create('todos', todo.toJSON() as Todo & { id: string });
        return todo;
    }

    async getTodo(id: string): Promise<Todo | null> {
        const data = await this.provider.read<any>('todos', id);
        return data ? Todo.fromJSON(data) : null;
    }

    async updateTodo(id: string, updates: Partial<TodoData>): Promise<Todo | null> {
        const data = await this.provider.update('todos', id, updates);
        return data ? Todo.fromJSON(data) : null;
    }

    async deleteTodo(id: string): Promise<boolean> {
        // Also delete related groups and tasks
        const todo = await this.getTodo(id);
        if (!todo) return false;

        const groupIds = todo.groups.map(g => g.id);
        const taskIds = todo.getAllTasks().map(t => t.id);

        await this.provider.deleteMany('tasks', taskIds);
        await this.provider.deleteMany('groups', groupIds);
        return await this.provider.delete('todos', id);
    }

    async getTodosByDateRange(startDate: string, endDate: string): Promise<Todo[]> {
        const data = await this.provider.findWhere<any>('todos', {
            date: { $gte: startDate, $lte: endDate }
        });
        return data.map(d => Todo.fromJSON(d));
    }

    async getTodoByDate(date: string): Promise<Todo | null> {
        const todos = await this.provider.findWhere<any>('todos', { date });
        return todos.length > 0 ? Todo.fromJSON(todos[0]) : null;
    }

    // Group operations
    async createGroup(data: GroupData): Promise<Group> {
        const group = new Group(data);
        await this.provider.create('groups', group.toJSON() as Todo & { id: string });
        return group;
    }

    async getGroup(id: string): Promise<Group | null> {
        const data = await this.provider.read<any>('groups', id);
        return data ? Group.fromJSON(data) : null;
    }

    async updateGroup(id: string, updates: Partial<GroupData>): Promise<Group | null> {
        const data = await this.provider.update('groups', id, updates);
        return data ? Group.fromJSON(data) : null;
    }

    async deleteGroup(id: string): Promise<boolean> {
        // Also delete related tasks
        const tasks = await this.provider.findWhere<any>('tasks', { groupId: id });
        const taskIds = tasks.map(t => t.id);

        if (taskIds.length > 0) {
            await this.provider.deleteMany('tasks', taskIds);
        }

        return await this.provider.delete('groups', id);
    }

    async getGroupsByTodo(todoId: string): Promise<Group[]> {
        const data = await this.provider.findWhere<any>('groups', { todoId }, { orderBy: 'order' });
        return data.map(d => Group.fromJSON(d));
    }

    // Task operations
    async createTask(data: TaskData): Promise<Task> {
        const task = new Task(data);
        await this.provider.create('tasks', task.toJSON() as Task & { id: string });
        return task;
    }

    async getTask(id: string): Promise<Task | null> {
        const data = await this.provider.read<any>('tasks', id);
        return data ? Task.fromJSON(data) : null;
    }

    async updateTask(id: string, updates: Partial<TaskData>): Promise<Task | null> {
        const data = await this.provider.update('tasks', id, updates);
        return data ? Task.fromJSON(data) : null;
    }

    async deleteTask(id: string): Promise<boolean> {
        return await this.provider.delete('tasks', id);
    }

    async getTasksByGroup(groupId: string): Promise<Task[]> {
        const data = await this.provider.findWhere<any>('tasks', { groupId }, { orderBy: 'order' });
        return data.map(d => Task.fromJSON(d));
    }

    async getTasksByPriority(priority: 'low' | 'medium' | 'high'): Promise<Task[]> {
        const data = await this.provider.findWhere<any>('tasks', { priority });
        return data.map(d => Task.fromJSON(d));
    }

    async searchTasks(query: string): Promise<Task[]> {
        const allTasks = await this.provider.findAll<any>('tasks');
        return allTasks
            .map(d => Task.fromJSON(d))
            .filter(task =>
                task.title.toLowerCase().includes(query.toLowerCase()) ||
                task.description?.toLowerCase().includes(query.toLowerCase()) ||
                task.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
    }

    // Note operations
    async createNote(data: NoteData): Promise<Note> {
        const note = new Note(data);
        await this.provider.create('notes', note.toJSON() as Note & { id: string });
        return note;
    }

    async getNote(id: string): Promise<Note | null> {
        const data = await this.provider.read<any>('notes', id);
        return data ? Note.fromJSON(data) : null;
    }

    async updateNote(id: string, updates: Partial<NoteData>): Promise<Note | null> {
        const data = await this.provider.update('notes', id, updates);
        return data ? Note.fromJSON(data) : null;
    }

    async deleteNote(id: string): Promise<boolean> {
        return await this.provider.delete('notes', id);
    }

    async getAllNotes(): Promise<Note[]> {
        const data = await this.provider.findAll<any>('notes');
        return data.map(d => Note.fromJSON(d));
    }

    async getNotesByTag(tag: string): Promise<Note[]> {
        const allNotes = await this.getAllNotes();
        return allNotes.filter(note => note.tags.includes(tag));
    }

    // Task movement and reordering operations using model methods
    async moveTaskBetweenGroups(
        taskId: string,
        sourceGroupId: string,
        targetGroupId: string,
        targetIndex?: number
    ): Promise<{ task: Task; sourceGroup: Group; targetGroup: Group } | null> {
        return await this.provider.transaction(async () => {
            // Load full groups with their tasks to use model methods
            const sourceGroup = await this.loadFullGroup(sourceGroupId);
            const targetGroup = await this.loadFullGroup(targetGroupId);

            if (!sourceGroup || !targetGroup) {
                return null;
            }

            // Use the model's moveTaskToGroup method
            const success = sourceGroup.moveTaskToGroup(taskId, targetGroup, targetIndex);
            if (!success) {
                return null;
            }

            // Save both groups back to storage
            await this.saveGroup(sourceGroup);
            await this.saveGroup(targetGroup);

            const task = targetGroup.tasks.find(t => t.id === taskId)!;
            return { task, sourceGroup, targetGroup };
        });
    }

    async moveTaskWithinGroup(taskId: string, groupId: string, newIndex: number): Promise<Group | null> {
        return await this.provider.transaction(async () => {
            const group = await this.loadFullGroup(groupId);
            if (!group) return null;

            // Use the model's moveTask method
            const success = group.moveTask(taskId, newIndex);
            if (!success) return null;

            // Save group back to storage
            await this.saveGroup(group);
            return group;
        });
    }

    async reorderTasksInGroup(groupId: string, taskIds: string[]): Promise<Group | null> {
        return await this.provider.transaction(async () => {
            const group = await this.loadFullGroup(groupId);
            if (!group) return null;

            // Use the model's reorderTasks method
            group.reorderTasks(taskIds);

            // Save group back to storage
            await this.saveGroup(group);
            return group;
        });
    }

    // Group reordering operations using model methods
    async moveGroupWithinTodo(groupId: string, todoId: string, newIndex: number): Promise<Todo | null> {
        return await this.provider.transaction(async () => {
            const todo = await this.loadFullTodo(todoId);
            if (!todo) return null;

            // Use the model's moveGroup method
            const success = todo.moveGroup(groupId, newIndex);
            if (!success) return null;

            // Save todo back to storage
            await this.saveFullTodo(todo);
            return todo;
        });
    }

    async reorderGroupsInTodo(todoId: string, groupIds: string[]): Promise<Todo | null> {
        return await this.provider.transaction(async () => {
            const todo = await this.loadFullTodo(todoId);
            if (!todo) return null;

            // Use the model's reorderGroups method
            todo.reorderGroups(groupIds);

            // Save todo back to storage
            await this.saveFullTodo(todo);
            return todo;
        });
    }

    async moveTaskBetweenTodos(
        taskId: string,
        sourceTodoId: string,
        targetTodoId: string,
        targetGroupId: string,
        targetIndex?: number
    ): Promise<{ task: Task; sourceTodo: Todo; targetTodo: Todo } | null> {
        return await this.provider.transaction(async () => {
            const sourceTodo = await this.loadFullTodo(sourceTodoId);
            const targetTodo = await this.loadFullTodo(targetTodoId);

            if (!sourceTodo || !targetTodo) {
                return null;
            }

            // Use the model's moveTaskBetweenGroups method
            const success = sourceTodo.moveTaskBetweenGroups(taskId, targetGroupId, targetIndex);
            if (!success) return null;

            // Save both todos back to storage
            await this.saveFullTodo(sourceTodo);
            await this.saveFullTodo(targetTodo);

            const task = targetTodo.findTask(taskId)?.task!;
            return { task, sourceTodo, targetTodo };
        });
    }

    // Helper methods for loading/saving full model hierarchies
    private async loadFullGroup(groupId: string): Promise<Group | null> {
        const groupData = await this.provider.read<any>('groups', groupId);
        if (!groupData) return null;

        const tasks = await this.getTasksByGroup(groupId);
        const group = Group.fromJSON(groupData);
        group.tasks = tasks;
        return group;
    }

    private async loadFullTodo(todoId: string): Promise<Todo | null> {
        const todoData = await this.provider.read<any>('todos', todoId);
        if (!todoData) return null;

        const groups = await this.getGroupsByTodo(todoId);

        // Load tasks for each group
        for (const group of groups) {
            const tasks = await this.getTasksByGroup(group.id);
            group.tasks = tasks;
        }

        const todo = Todo.fromJSON(todoData);
        todo.groups = groups;
        return todo;
    }

    private async saveGroup(group: Group): Promise<void> {
        // Save the group itself
        await this.provider.update('groups', group.id, group.toJSON());

        // Save all tasks in the group
        const taskUpdates = group.tasks.map(task => ({
            id: task.id,
            data: task.toJSON()
        }));

        if (taskUpdates.length > 0) {
            await this.provider.updateMany('tasks', taskUpdates);
        }
    }

    private async saveFullTodo(todo: Todo): Promise<void> {
        // Save the todo itself
        await this.provider.update('todos', todo.id, todo.toJSON());

        // Save all groups
        const groupUpdates = todo.groups.map(group => ({
            id: group.id,
            data: group.toJSON()
        }));

        if (groupUpdates.length > 0) {
            await this.provider.updateMany('groups', groupUpdates);
        }

        // Save all tasks
        const taskUpdates = todo.getAllTasks().map(task => ({
            id: task.id,
            data: task.toJSON()
        }));

        if (taskUpdates.length > 0) {
            await this.provider.updateMany('tasks', taskUpdates);
        }
    }

    // Model method wrappers for common operations
    async toggleTaskComplete(taskId: string): Promise<Task | null> {
        const task = await this.getTask(taskId);
        if (!task) return null;

        task.toggleComplete();
        await this.provider.update('tasks', taskId, task.toJSON());
        return task;
    }

    async toggleGroupCollapsed(groupId: string): Promise<Group | null> {
        const group = await this.getGroup(groupId);
        if (!group) return null;

        group.toggle();
        await this.provider.update('groups', groupId, group.toJSON());
        return group;
    }

    async addTaskToGroup(groupId: string, taskData: Omit<TaskData, 'groupId' | 'order'>): Promise<Task | null> {
        return await this.provider.transaction(async () => {
            const group = await this.loadFullGroup(groupId);
            if (!group) return null;

            const task = new Task({
                ...taskData,
                groupId,
                order: 0 // Will be set by addTask
            } as TaskData);

            group.addTask(task);
            await this.saveGroup(group);
            return task;
        });
    }

    async removeTaskFromGroup(taskId: string, groupId: string): Promise<Task | null> {
        return await this.provider.transaction(async () => {
            const group = await this.loadFullGroup(groupId);
            if (!group) return null;

            const removedTask = group.removeTask(taskId);
            if (!removedTask) return null;

            await this.saveGroup(group);
            await this.provider.delete('tasks', taskId);
            return removedTask;
        });
    }

    async addGroupToTodo(todoId: string, groupData: Omit<GroupData, 'todoId' | 'order'>): Promise<Group | null> {
        return await this.provider.transaction(async () => {
            const todo = await this.loadFullTodo(todoId);
            if (!todo) return null;

            const group = new Group({
                ...groupData,
                todoId,
                order: 0 // Will be set by addGroup
            } as GroupData);

            todo.addGroup(group);
            await this.saveFullTodo(todo);
            return group;
        });
    }

    async removeGroupFromTodo(groupId: string, todoId: string): Promise<Group | null> {
        return await this.provider.transaction(async () => {
            const todo = await this.loadFullTodo(todoId);
            if (!todo) return null;

            const removedGroup = todo.removeGroup(groupId);
            if (!removedGroup) return null;

            // Delete all tasks in the group
            const taskIds = removedGroup.tasks.map(t => t.id);
            if (taskIds.length > 0) {
                await this.provider.deleteMany('tasks', taskIds);
            }

            await this.saveFullTodo(todo);
            await this.provider.delete('groups', groupId);
            return removedGroup;
        });
    }

    // Validation and fixing methods using model methods
    async validateAndFixTodo(todoId: string): Promise<{ isValid: boolean; errors: string[]; fixed: boolean }> {
        return await this.provider.transaction(async () => {
            const todo = await this.loadFullTodo(todoId);
            if (!todo) {
                return { isValid: false, errors: ['Todo not found'], fixed: false };
            }

            const initialValidation = todo.validate();
            if (initialValidation.isValid) {
                return { isValid: true, errors: [], fixed: false };
            }

            // Try to fix ordering issues
            todo.fixGroupOrdering();
            todo.groups.forEach(group => group.fixTaskOrdering());

            const finalValidation = todo.validate();
            if (finalValidation.isValid) {
                await this.saveFullTodo(todo);
                return { isValid: true, errors: initialValidation.errors, fixed: true };
            }

            return { isValid: false, errors: finalValidation.errors, fixed: false };
        });
    }

    // Utility methods
    async exportData(): Promise<any> {
        return await this.provider.export();
    }

    async importData(data: any): Promise<void> {
        await this.provider.import(data);
    }

    async clearAllData(): Promise<void> {
        await this.provider.clear('todos');
        await this.provider.clear('groups');
        await this.provider.clear('tasks');
        await this.provider.clear('notes');
    }

    // Real-time subscriptions
    subscribeTo<T>(
        type: 'todos' | 'groups' | 'tasks' | 'notes',
        callback: (action: 'create' | 'update' | 'delete', data: T) => void,
        filters?: Record<string, any>
    ): () => void {
        if (!this.provider.subscribe) {
            throw new Error('Real-time subscriptions not supported by this provider');
        }
        return this.provider.subscribe(type, callback, filters);
    }
}
