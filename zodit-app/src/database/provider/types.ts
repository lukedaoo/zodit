import { Todo, Note } from '../models/index';
import type { TodoData, NoteData } from '../models/index';

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
    connect(): void;
    disconnect(): void;
    isConnected(): boolean;

    getStats(): any;
    resetStats(): void;

    // Todo operations (includes Groups and Tasks as nested entities)
    getTodos(queryOptions?: QueryOptions): Todo[];
    getTodo(id: string): Todo | null;
    createTodo(data: TodoData): Todo;
    updateTodo(id: string, data: Partial<TodoData>): Todo;
    deleteTodo(id: string): void;

    // Task and Group movement/reordering
    moveTaskBetweenGroups(todoId: string, taskId: string, targetGroupId: string, targetIndex?: number): boolean;
    reorderTasksInGroup(todoId: string, groupId: string, taskIds: string[]): void;
    reorderGroupsInTodo(todoId: string, groupIds: string[]): void;

    // Note operations
    getNotes(queryOptions?: QueryOptions): Note[];
    getNote(id: string): Note | null;
    createNote(data: NoteData): Note;
    updateNote(id: string, data: Partial<NoteData>): Note;
    deleteNote(id: string): void;

    // Bulk operations
    getAllData(): {
        todos: Todo[];
        notes: Note[];
    };
    saveToStorage(key: string, data: any): void;
    clearAllData(): void;
}

export interface DataProviderAsync {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;

    // Todo operations (includes Groups and Tasks as nested entities)
    getTodos(queryOptions?: QueryOptions): Promise<Todo[]>;
    getTodo(id: string): Promise<Todo | null>;
    createTodo(data: TodoData): Promise<Todo>;
    updateTodo(id: string, data: Partial<TodoData>): Promise<Todo>;
    deleteTodo(id: string): Promise<void>;

    // Task and Group movement/reordering
    moveTaskBetweenGroups(todoId: string, taskId: string, targetGroupId: string, targetIndex?: number): Promise<boolean>;
    reorderTasksInGroup(todoId: string, groupId: string, taskIds: string[]): Promise<void>;
    reorderGroupsInTodo(todoId: string, groupIds: string[]): Promise<void>;

    // Note operations
    getNotes(queryOptions?: QueryOptions): Promise<Note[]>;
    getNote(id: string): Promise<Note | null>;
    createNote(data: NoteData): Promise<Note>;
    updateNote(id: string, data: Partial<NoteData>): Promise<Note>;
    deleteNote(id: string): Promise<void>;

    // Bulk operations
    getAllData(): Promise<{
        todos: Todo[];
        notes: Note[];
    }>;
    clearAllData(): Promise<void>;
}
