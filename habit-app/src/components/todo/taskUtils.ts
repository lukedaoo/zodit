import type { Task } from './types';

const DEFAULT_TEMPLATE = "title:{title};desc:{description};startTime:{startTime};startDate:{startDate};endDate:{endDate}";

export const taskToText = (task: Task, template: string = ""): string => {
    const finalTemplate = template || DEFAULT_TEMPLATE;

    return finalTemplate.replace(/\{(\w+)\}/g, (_, key) => {
        const value = (task as any)[key];
        return value !== undefined && value !== null ? value : '';
    });
};

export const textToTask = (input: string): Task => {
    const parts = input?.split(';') ?? [];
    const _task: Partial<Task> = {};

    for (const part of parts) {
        const [rawKey, ...rest] = part.split(':');
        const key = rawKey.trim().toLowerCase();
        const value = rest.join(':');

        switch (key) {
            case 'title':
                _task.title = value ?? '';
                break;
            case 'desc':
                _task.description = value ?? '';
                break;
            case 'starttime':
                _task.startTime = value ?? '';
                break;
            case 'startdate':
                _task.startDate = value ?? '';
                break;
            case 'enddate':
                _task.endDate = value ?? '';
                break;
        }
    }

    // fallback: if nothing was parsed, use full string as title
    if (!_task.title && input) {
        _task.title = input.trim();
    }
    return _task as Task;
};

