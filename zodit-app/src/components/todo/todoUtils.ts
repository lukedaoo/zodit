import { convert } from '@common/utils';
import type { Todo as DisplayTodo } from './types';
import type { Todo, Group } from '@database/models';
import { ModelFactory } from '@database/models';

export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
};

export const toDisplayTodo = (dataTodo: Todo): DisplayTodo => ({
    id: dataTodo.id,
    date: dataTodo.date,
    title: dataTodo.title || '',
    createdAt: dataTodo.createdAt,
    updatedAt: dataTodo.updatedAt,
    groups: dataTodo.groups.map(group => ({
        id: group.id,
        title: group.title,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        collapsed: group.collapsed,
        tasks: group.tasks.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            startDate: task.startDate,
            description: task.description,
            priority: task.priority,
            createdDate: convert(task.createdAt),
            tags: task.tags,
            customFields: task.customFields,
            updatedAt: task.updatedAt
        }))
    }))
});

export const toDataTodo = (todo: DisplayTodo): Todo => {
    return ModelFactory.createTodo({
        id: todo.id,
        date: todo.date,
        title: todo.title,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
        groups: todo.groups.map(group => ({
            id: group.id,
            title: group.title,
            todoId: todo.id,
            collapsed: group.collapsed,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            tasks: group.tasks.map(task => ({
                id: task.id,
                title: task.title,
                completed: task.completed,
                startDate: task.startDate,
                description: task.description,
                priority: task.priority,
                tags: task.tags,
                customFields: task.customFields,
                groupId: group.id,
                createdAt: new Date(task.createdDate as string),
                updatedAt: task.updatedAt,
            }))
        })) as Group[]
    });
};

export const mergeTodos = (todos: DisplayTodo[]): DisplayTodo[] => {
    const dateMap = new Map<string, DisplayTodo>();
    todos.forEach(todo => {
        const existing = dateMap.get(todo.date);
        if (existing) {
            existing.groups = [
                ...existing.groups,
                ...todo.groups.filter(g => !existing.groups.some(eg => eg.id === g.id))
            ];
        } else {
            dateMap.set(todo.date, { ...todo });
        }
    });
    return Array.from(dateMap.values());
};

