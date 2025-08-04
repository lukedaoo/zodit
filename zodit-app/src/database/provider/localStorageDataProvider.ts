import { Todo, Note } from '../models/index';
import type { TodoData, NoteData } from '../models/index';
import type { DataProvider, DataProviderConfig, QueryOptions } from './types';

interface StorageStats {
    reads: number; // Count of getFromStorage calls
    writes: number; // Count of saveToStorage calls
    clears: number; // Count of clearAllData calls
    deletes: number; // Count of deleteTodo and deleteNote calls
}

export class LocalStorageDataProvider implements DataProvider {
    private readonly TODO_KEY = 'todos';
    private readonly NOTE_KEY = 'notes';
    private connected: boolean = false;
    private storageStats: StorageStats = {
        reads: 0,
        writes: 0,
        clears: 0,
        deletes: 0,
    };

    constructor(_: DataProviderConfig) { }

    connect(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            this.connected = true;
            return;
        }
        throw new Error('LocalStorage is not available');
    }

    disconnect(): void {
        this.connected = false;
    }

    isConnected(): boolean {
        return this.connected;
    }

    private executeStorageOperation<T>(
        operation: () => T,
        operationType: keyof StorageStats,
        errorMessage: string
    ): T {
        if (!this.isConnected()) {
            throw new Error('Data provider is not connected');
        }
        try {
            return operation();
        } catch (error) {
            console.error(`${errorMessage}:`, error);
            throw error;
        } finally {
            this.storageStats[operationType]++;
            // console.log('Storage Stats:', this.storageStats);
        }
    }

    private getFromStorage<T>(key: string): T[] {
        return this.executeStorageOperation(
            () => {
                const data = localStorage.getItem(key);
                if (!data) {
                    return [];
                }
                return JSON.parse(data);
            },
            'reads',
            `Failed to read from localStorage for key "${key}"`
        );
    }

    saveToStorage<T>(key: string, data: T[]): void {
        this.executeStorageOperation(
            () => {
                localStorage.setItem(key, JSON.stringify(data));
            },
            'writes',
            `Failed to save to localStorage for key "${key}"`
        );
    }

    getTodos(queryOptions: QueryOptions = {}): Todo[] {
        let todos = this.getFromStorage<TodoData>(this.TODO_KEY).map(d => Todo.fromJSON(d));

        // Apply filters
        if (queryOptions.filters) {
            todos = todos.filter(todo => {
                return Object.entries(queryOptions.filters!).every(([key, value]) => {
                    if (key === 'date') {
                        return todo.date === value;
                    }
                    if (key === 'title') {
                        return todo.title.toLowerCase().includes((value as string).toLowerCase());
                    }
                    return true;
                });
            });
        }

        // Apply sorting
        if (queryOptions.orderBy) {
            todos.sort((a, b) => {
                const direction = queryOptions.orderDirection === 'desc' ? -1 : 1;
                if (queryOptions.orderBy === 'date') {
                    return (a.date > b.date ? 1 : -1) * direction;
                }
                if (queryOptions.orderBy === 'title') {
                    return a.title.localeCompare(b.title) * direction;
                }
                return 0;
            });
        }

        // Apply pagination
        const offset = Math.max(queryOptions.offset || 0, 0);
        const limit = queryOptions.limit && queryOptions.limit > 0
            ? queryOptions.limit
            : todos.length;
        return todos.slice(offset, offset + limit);
    }

    getTodo(id: string): Todo | null {
        const todos = this.getFromStorage<TodoData>(this.TODO_KEY);
        const todoData = todos.find(t => t.id === id);
        return todoData ? new Todo(todoData) : null;
    }

    createTodo(data: TodoData): Todo {
        const todos = this.getTodos();
        const todo = new Todo(data);
        todos.push(todo);
        this.saveToStorage(this.TODO_KEY, todos.map(t => t.toJSON()));
        return todo;
    }

    updateTodo(id: string, data: Partial<TodoData>): Todo {
        const todos = this.getTodos();
        const todoIndex = todos.findIndex(t => t.id === id);
        if (todoIndex === -1) {
            throw new Error(`Todo with id ${id} not found`);
        }
        const todo = todos[todoIndex];
        todo.update(data);
        this.saveToStorage(this.TODO_KEY, todos.map(t => t.toJSON()));
        return todo;
    }

    deleteTodo(id: string): void {
        this.executeStorageOperation(
            () => {
                const todos = this.getTodos();
                const filteredTodos = todos.filter(t => t.id !== id);
                this.saveToStorage(this.TODO_KEY, filteredTodos.map(t => t.toJSON()));
            },
            'deletes',
            `Failed to delete todo with id ${id}`
        );
    }

    moveTaskBetweenGroups(todoId: string, taskId: string, targetGroupId: string, targetIndex?: number): boolean {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === todoId);
        if (!todo) {
            throw new Error(`Todo with id ${todoId} not found`);
        }

        const result = todo.moveTaskBetweenGroups(taskId, targetGroupId, targetIndex);
        if (result) {
            this.saveToStorage(this.TODO_KEY, todos.map(t => t.toJSON()));
        }
        return result;
    }

    reorderTasksInGroup(todoId: string, groupId: string, taskIds: string[]): void {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === todoId);
        if (!todo) {
            throw new Error(`Todo with id ${todoId} not found`);
        }

        const group = todo.findGroup(groupId);
        if (!group) {
            throw new Error(`Group with id ${groupId} not found`);
        }

        group.reorderTasks(taskIds);
        this.saveToStorage(this.TODO_KEY, todos.map(t => t.toJSON()));
    }

    reorderGroupsInTodo(todoId: string, groupIds: string[]): void {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === todoId);
        if (!todo) {
            throw new Error(`Todo with id ${todoId} not found`);
        }

        todo.reorderGroups(groupIds);
        this.saveToStorage(this.TODO_KEY, todos.map(t => t.toJSON()));
    }

    getNotes(queryOptions: QueryOptions = {}): Note[] {
        let notes = this.getFromStorage<NoteData>(this.NOTE_KEY).map(d => Note.fromJSON(d));

        // Apply filters
        if (queryOptions.filters) {
            notes = notes.filter(note => {
                return Object.entries(queryOptions.filters!).every(([key, value]) => {
                    if (key === 'text') {
                        return note.text.toLowerCase().includes((value as string).toLowerCase());
                    }
                    if (key === 'color') {
                        return note.color === value;
                    }
                    if (key === 'tags') {
                        return Array.isArray(value) && value.every(v => note.tags.includes(v));
                    }
                    return true;
                });
            });
        }

        // Apply sorting
        if (queryOptions.orderBy) {
            notes.sort((a, b) => {
                const direction = queryOptions.orderDirection === 'desc' ? -1 : 1;
                if (queryOptions.orderBy === 'createdAt') {
                    return (a.createdAt > b.createdAt ? 1 : -1) * direction;
                }
                if (queryOptions.orderBy === 'text') {
                    return a.text.localeCompare(b.text) * direction;
                }
                return 0;
            });
        }

        // Apply pagination
        const offset = queryOptions.offset || 0;
        const limit = queryOptions.limit || notes.length;
        return notes.slice(offset, offset + limit);
    }

    getNote(id: string): Note | null {
        const notes = this.getNotes();
        return notes.find(note => note.id === id) || null;
    }

    createNote(data: NoteData): Note {
        const notes = this.getNotes();
        const note = new Note(data);
        notes.push(note);
        this.saveToStorage(this.NOTE_KEY, notes.map(n => n.toJSON()));
        return note;
    }

    updateNote(id: string, data: Partial<NoteData>): Note {
        const notes = this.getNotes();
        const note = notes.find(n => n.id === id);
        if (!note) {
            throw new Error(`Note with id ${id} not found`);
        }
        note.update(data);
        this.saveToStorage(this.NOTE_KEY, notes.map(n => n.toJSON()));
        return note;
    }

    deleteNote(id: string): void {
        this.executeStorageOperation(
            () => {
                const notes = this.getNotes();
                const filteredNotes = notes.filter(n => n.id !== id);
                this.saveToStorage(this.NOTE_KEY, filteredNotes.map(n => n.toJSON()));
            },
            'deletes',
            `Failed to delete note with id ${id}`
        );
    }

    getAllData(): { todos: Todo[]; notes: Note[] } {
        return {
            todos: this.getTodos(),
            notes: this.getNotes()
        };
    }

    clearAllData(): void {
        this.executeStorageOperation(
            () => {
                localStorage.removeItem(this.TODO_KEY);
                localStorage.removeItem(this.NOTE_KEY);
            },
            'clears',
            'Failed to clear all data'
        );
    }

    getStats(): StorageStats {
        return { ...this.storageStats }; // Return a copy to prevent external mutation
    }

    resetStats(): void {
        this.storageStats = { reads: 0, writes: 0, clears: 0, deletes: 0 };
    }
}
