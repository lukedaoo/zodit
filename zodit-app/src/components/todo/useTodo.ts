import { useState, useEffect, useCallback, useMemo } from 'react';
import { getToday, convert, toDate } from '@common/utils';
import type { Todo as DisplayTodo, Group as DisplayGroup, Task as DisplayTask } from './types';
import type { Todo, Group } from '@database/models';
import { ModelFactory } from '@database/models';

import { useDataProvider } from '@context/DataProviderContext';

type ActionType =
    | 'init'
    | 'load_todos'
    | 'load_todo_by_date'
    | 'load_heatmap'
    | 'create_todo'
    | 'add_group'
    | 'update_group_name'
    | 'update_group_collapse_status'
    | 'delete_group'
    | 'add_task'
    | 'update_task'
    | 'delete_task'
    | 'reorder_tasks'
    | 'reorder_groups'
    | 'move_task_between_groups'
    | null;

// Utility to convert Data Model to Display Model
const toDisplayTodo = (dataTodo: Todo): DisplayTodo => ({
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

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
}

// Utility to convert Display Model to Data Model
const toDataTodo = (todo: DisplayTodo): Todo => {
    const dataTodo = ModelFactory.createTodo({
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
    return dataTodo;
};

const mergeTodos = (todos: DisplayTodo[]): DisplayTodo[] => {
    const dateMap = new Map<string, DisplayTodo>();
    todos.forEach(todo => {
        const existing = dateMap.get(todo.date);
        if (existing) {
            const mergedGroups = [
                ...existing.groups,
                ...todo.groups.filter(g => !existing.groups.some(eg => eg.id === g.id))
            ];
            existing.groups = mergedGroups;
        } else {
            dateMap.set(todo.date, { ...todo });
        }
    });
    return Array.from(dateMap.values());
};

export const useTodo = () => {
    const dataProvider = useDataProvider();

    const [todos, setTodos] = useState<DisplayTodo[]>([]);
    const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
    const [action, setAction] = useState<ActionType>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const groups = todos.find(t => t.id === activeTodoId)?.groups || [];

    useEffect(() => {
        const connectAndLoad = async () => {
            try {
                if (!dataProvider.isConnected()) {
                    dataProvider.connect();
                }
                const allTodos = dataProvider.getTodos();
                const displayTodos = mergeTodos(allTodos.map(toDisplayTodo));
                setTodos(displayTodos);

                const todayStr = getToday();
                const todayTodo = displayTodos.find(t => t.date === todayStr);
                if (todayTodo) {
                    setActiveTodoId(todayTodo.id);
                } else {
                    const newTodo = dataProvider.createTodo(ModelFactory.createTodo({ date: todayStr }));
                    const displayNewTodo = toDisplayTodo(newTodo);
                    setTodos(prev => mergeTodos([...prev, displayNewTodo]));
                    setActiveTodoId(displayNewTodo.id);
                }
                setAction('init');
                setError(null);
            } catch (err) {
                setError('Failed to load todos: ' + (err instanceof Error ? err.message : 'Unknown error'));
            } finally {
                setIsInitialized(true);
            }
        };
        connectAndLoad();
    }, []);

    const generateId = useCallback((prefix: string) => {
        return prefix + ":id#" + Math.floor(Math.random() * 8 ** 6).toString(8).padStart(6, '0');
    }, []);

    const debouncedUpdateTodo = useMemo(
        () => debounce((todoId: string, todoData: Todo) => {
            dataProvider.updateTodo(todoId, todoData);
        }, 300),
        [dataProvider]
    );

    const syncGroups = useCallback((newGroups: DisplayGroup[], actionType: ActionType) => {
        if (!activeTodoId) return;
        try {
            setTodos(currentTodos => {
                const updatedTodos = currentTodos.map(todo =>
                    todo.id === activeTodoId ? { ...todo, groups: newGroups } : todo
                );

                const activeTodo = updatedTodos.find(t => t.id === activeTodoId);
                if (activeTodo) {
                    debouncedUpdateTodo(activeTodoId, toDataTodo(activeTodo));
                }

                return updatedTodos;
            });

            setAction(actionType);
            setError(null);
        } catch (err) {
            setError('Failed to sync groups: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [activeTodoId, debouncedUpdateTodo]);

    const createTodo = useCallback((date: string): DisplayTodo => {
        try {
            if (!dataProvider.isConnected()) {
                dataProvider.connect();
            }
            const newTodo = dataProvider.createTodo(ModelFactory.createTodo({ date }));
            const displayTodo = toDisplayTodo(newTodo);
            setTodos(prev => [...prev, displayTodo]);
            setAction('create_todo');
            setError(null);
            return displayTodo;
        } catch (err) {
            setError('Failed to create todo: ' + (err instanceof Error ? err.message : 'Unknown error'));
            throw err; // Re-throw to allow caller to handle
        }
    }, []);

    const getTodoByDate = useCallback((date: string): DisplayTodo | undefined => {
        try {
            setAction('load_todo_by_date');
            setError(null);
            return todos.find(t => t.date === date);
        } catch (err) {
            setError('Failed to get todo by date: ' + (err instanceof Error ? err.message : 'Unknown error'));
            return undefined;
        }
    }, [todos]);

    const loadTodo = useCallback((todo: DisplayTodo) => {
        try {
            setActiveTodoId(todo.id as string);
            setAction('load_todo_by_date');
            setError(null);
        } catch (err) {
            setError('Failed to load todo: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, []);

    const buildHeatMapFromTaskDates = useCallback((month: string): Record<string, number> => {
        try {
            if (!isInitialized) return {};
            const heatMap: Record<string, number> = {};
            const [year, monthNum] = month.split('-');
            const targetYear = parseInt(year);
            const targetMonth = parseInt(monthNum);

            todos.forEach(todo => {
                todo.groups.forEach(group => {
                    group.tasks.forEach(_ => {
                        if (todo.date) {
                            const date = toDate(todo.date);
                            if (date.getFullYear() === targetYear && date.getMonth() + 1 === targetMonth) {
                                const dateKey = todo.date;
                                heatMap[dateKey] = (heatMap[dateKey] || 0) + 1;
                            }
                        }
                    });
                });
            });

            setAction('load_heatmap');
            setError(null);
            return heatMap;
        } catch (err) {
            setError('Failed to build heatmap: ' + (err instanceof Error ? err.message : 'Unknown error'));
            return {};
        }
    }, [todos]);

    const addGroup = useCallback(() => {
        try {
            const newGroup: DisplayGroup = {
                id: generateId('group'),
                title: 'Untitled',
                tasks: []
            };
            syncGroups([...groups, newGroup], 'add_group');
            setError(null);
        } catch (err) {
            setError('Failed to add group: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups, generateId]);

    const updateGroupName = useCallback((groupId: string, newName: string) => {
        try {
            syncGroups(
                groups.map(g => (g.id === groupId ? { ...g, title: newName } : g)),
                'update_group_name'
            );
            setError(null);
        } catch (err) {
            setError('Failed to update group name: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups]);

    const updateGroupCollapseStatus = useCallback((groupId: string, isCollapsed: boolean) => {
        try {
            syncGroups(
                groups.map(g => (g.id === groupId ? { ...g, collapsed: isCollapsed } : g)),
                'update_group_collapse_status'
            );
            setError(null);
        } catch (err) {
            setError('Failed to update group collapse status: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups]);

    const deleteGroup = useCallback((groupId: string) => {
        try {
            syncGroups(groups.filter(g => g.id !== groupId), 'delete_group');
            setError(null);
        } catch (err) {
            setError('Failed to delete group: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups]);

    const addTask = useCallback((groupId: string) => {
        try {
            const newTask: DisplayTask = {
                id: generateId('task'),
                title: '',
                completed: false,
                createdDate: convert(new Date()),
            };
            syncGroups(
                groups.map(group =>
                    group.id === groupId ? { ...group, tasks: [...group.tasks, newTask] } : group
                ),
                'add_task'
            );
            setError(null);
        } catch (err) {
            setError('Failed to add task: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups, generateId]);

    const updateTask = useCallback((groupId: string, taskId: string, updates: Partial<DisplayTask>) => {
        try {
            syncGroups(
                groups.map(group =>
                    group.id === groupId
                        ? {
                            ...group,
                            tasks: group.tasks.map(task =>
                                task.id === taskId ? { ...task, ...updates } : task
                            )
                        }
                        : group
                ),
                'update_task'
            );
            setError(null);
        } catch (err) {
            setError('Failed to update task: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups]);

    const deleteTask = useCallback((groupId: string, taskId: string) => {
        try {
            syncGroups(
                groups.map(group =>
                    group.id === groupId
                        ? { ...group, tasks: group.tasks.filter(task => task.id !== taskId) }
                        : group
                ),
                'delete_task'
            );
            setError(null);
        } catch (err) {
            setError('Failed to delete task: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups]);

    const reorderTask = useCallback((groupId: string, newOrder: string[]) => {
        try {
            const group = groups.find(g => g.id === groupId);
            if (!group) return;
            const taskMap = new Map(group.tasks.map(task => [task.id, task]));
            const reorderedTasks = newOrder
                .map(id => taskMap.get(id))
                .filter(Boolean) as DisplayTask[];
            syncGroups(
                groups.map(g => (g.id === groupId ? { ...g, tasks: reorderedTasks } : g)),
                'reorder_tasks'
            );
            dataProvider.reorderTasksInGroup(activeTodoId!, groupId, newOrder);
            setError(null);
        } catch (err) {
            setError('Failed to reorder tasks: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups, activeTodoId]);

    const reorderGroup = useCallback((newOrder: string[]) => {
        try {
            const groupMap = Object.fromEntries(groups.map(group => [group.id, group]));
            const reorderedGroups = newOrder
                .map(id => groupMap[id])
                .filter((group): group is DisplayGroup => Boolean(group));
            syncGroups(reorderedGroups, 'reorder_groups');
            dataProvider.reorderGroupsInTodo(activeTodoId!, newOrder);
            setError(null);
        } catch (err) {
            setError('Failed to reorder groups: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups, activeTodoId]);

    const moveTaskBetweenGroups = useCallback((
        sourceGroupId: string,
        targetGroupId: string,
        taskId: string,
        targetTaskId: string | null
    ) => {
        try {
            const sourceGroup = groups.find(g => g.id === sourceGroupId);
            const targetGroup = groups.find(g => g.id === targetGroupId);
            if (!sourceGroup || !targetGroup) return;

            const task = sourceGroup.tasks.find(t => t.id === taskId);
            if (!task) return;

            let targetIndex = targetGroup.tasks.length;
            if (targetTaskId) {
                const foundIndex = targetGroup.tasks.findIndex(t => t.id === targetTaskId);
                if (foundIndex !== -1) targetIndex = foundIndex;
            }

            const newGroups = groups.map(group => {
                if (group.id === sourceGroupId) {
                    return { ...group, tasks: group.tasks.filter(t => t.id !== taskId) };
                }
                if (group.id === targetGroupId) {
                    return {
                        ...group,
                        tasks: [...group.tasks.slice(0, targetIndex), task, ...group.tasks.slice(targetIndex)]
                    };
                }
                return group;
            });

            syncGroups(newGroups, 'move_task_between_groups');
            dataProvider.moveTaskBetweenGroups(activeTodoId!, taskId, targetGroupId, targetIndex);
            setError(null);
        } catch (err) {
            setError('Failed to move task: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [groups, syncGroups, activeTodoId]);

    return {
        todos,
        createTodo,
        getTodoByDate,
        loadTodo,
        buildHeatMapFromTaskDates,
        groups,
        addGroup,
        updateGroupName,
        updateGroupCollapseStatus,
        deleteGroup,
        addTask,
        updateTask,
        deleteTask,
        reorderTask,
        reorderGroup,
        moveTaskBetweenGroups,
        action,
        error,
        isInitialized
    };
};

