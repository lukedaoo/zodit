export interface Todo {
    id: string;
    date: string;
    title?: string;
    groups: Group[];

    createdAt?: Date;
    updatedAt?: Date;
}

export interface Group {
    id: string;
    title: string;
    priority?: 'low' | 'medium' | 'high';
    collapsed?: boolean;
    tasks: Task[];

    createdAt?: Date;
    updatedAt?: Date;
}


// update the metadatas if any
export interface Task {
    id: string;
    title: string;
    priority?: 'low' | 'medium' | 'high';
    completed: boolean;
    description?: string;
    startTime?: string;
    startDate?: string;
    endDate?: string | any;
    tags?: string[];

    createdDate?: string;
    customFields?: Record<string, any>;

    updatedAt?: Date;
}

export const presets = {
    basic: { include: ['title', 'id', 'completed'] as (keyof Task)[] },
    minimal: { include: ['title', 'completed'] as (keyof Task)[] },

    scheduled: {
        include: ['title', 'description', 'startTime', 'startDate', 'endDate', 'completed'] as (keyof Task)[],
        order: ['title', 'description', 'startDate', 'startTime', 'endDate', 'completed'] as (keyof Task)[],
    },

    full: { exclude: ['id'] as (keyof Task)[] },

    complete: { include: [] as (keyof Task)[], exclude: [] as (keyof Task)[] }
};

export const DEFAULT_TASK = {
    id: '',
    title: '',
    completed: false,
    description: '',
    startTime: '',
    startDate: '',
    endDate: '',
    tags: [],
};

const isEmpty = (task: Task, config: any): boolean => {
    const keysToCheck = config.include ?? (Object.keys(task) as (keyof Task)[]);

    return !keysToCheck.some((key: keyof Task) => {
        const value = task[key];
        if (typeof value === 'string') {
            return value.trim() !== '';
        }
        if (typeof value === 'boolean') {
            return value === true;
        }
        return value != null;
    });
};

const trim = (task: Task): Task => {
    return Object
        .fromEntries(Object.entries(task)
            .filter(([_, value]) => value !== null && value !== undefined)
        ) as Task;
};


function removeNullish<T>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj
            .map(item => removeNullish(item))
            .filter(item => item !== undefined && item !== null) as T;
    } else if (obj && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, value]) => value !== null && value !== undefined)
                .map(([key, value]) => [key, removeNullish(value)])
        ) as T;
    }
    return obj;
}

function trimTodoMetadata(todo: Todo): Todo {
    const trimmed: Todo = {
        id: todo.id,
        date: todo.date,
        title: todo.title,
        groups: todo.groups?.map(group => ({
            id: group.id,
            title: group.title,
            priority: group.priority,
            collapsed: group.collapsed,
            tasks: group.tasks?.map(task => ({
                id: task.id,
                title: task.title,
                priority: task.priority,
                completed: task.completed,
                description: task.description,
                startTime: task.startTime,
                startDate: task.startDate,
                endDate: task.endDate,
                tags: task.tags,
                customFields: task.customFields
            })) || []
        })) || []
    };

    return removeNullish(trimmed);
}

export const TYPE_UTILS = {
    isEmpty,
    trimTodoMetadata,
    trim,
}

