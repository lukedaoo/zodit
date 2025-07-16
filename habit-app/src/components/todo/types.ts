export interface Task {
    id: string;
    title: string;
    completed: boolean;
    description?: string;
    startTime?: string;
    startDate?: string;
    endDate?: string;
}

export interface Group {
    id: string;
    name: string;
    tasks: Task[];
}

export const presets = {
    basic: { include: ['title', 'description', 'completed'] as (keyof Task)[] },

    scheduled: {
        include: ['title', 'description', 'startTime', 'startDate', 'endDate'] as (keyof Task)[],
        order: ['title', 'description', 'startDate', 'startTime', 'endDate'] as (keyof Task)[]
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
