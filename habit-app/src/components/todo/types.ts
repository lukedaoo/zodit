// update the metadatas if any
export interface Task {
    id: string;
    title: string;
    completed: boolean;
    description?: string;
    startTime?: string;
    startDate?: string;
    endDate?: string | any;

    createDate?: string;
}

export interface Group {
    id: string;
    name: string;
    tasks: Task[];
}

export const presets = {
    basic: { include: ['title', 'description', 'completed'] as (keyof Task)[] },

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
    endDate: ''
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
export const TYPE_UTILS = {
    isEmpty,
    trim,
}

