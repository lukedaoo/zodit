import { useReducer, useCallback, useEffect, useMemo, useState } from 'react';
import { convert, generateId } from '@common/utils';
import { useDataProvider } from '@context/DataProviderContext';
import { ModelFactory } from '@database/models';
import { toDisplayTodo, toDataTodo } from './todoUtils';
import { todoReducer } from './todoReducer';
import type { State, TodoAction as Action } from './todoReducer';

import { useUserSettings } from '@hooks/useUserSettings';
import { DEBOUNCE_TIME } from '@user-prefs/const';
import { debounce } from '@lib/debounce';
import { createLogger } from "@lib/logger";

const logger = createLogger("Todo");

const loggingReducer = (state: State, action: Action) => {
    logger.group(`[Todo Action] ${action.type}`);

    if (process.env.NODE_ENV === 'development') {
        logger.log('Prev State:', 'color: #9CA3AF; font-weight: bold;', state);
        logger.log('Action:', 'color: #03A9F4; font-weight: bold;', action);

        const nextState = todoReducer(state, action);

        logger.log('Next State:', 'color: #9CA3AF; font-weight: bold;', nextState);
        logger.groupEnd();

        return nextState;
    } else {
        const nextState = todoReducer(state, action);
        logger.groupEnd();
        return nextState;
    }
}

export const useTodo = () => {
    const { get } = useUserSettings();
    const delay = get<number>(DEBOUNCE_TIME);

    const dataProvider = useDataProvider();
    const [state, dispatch] = useReducer(loggingReducer, { todos: [], activeTodoId: null } as State);
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const groups = useMemo(() => {
        if (state.todos[0]?.groups) return state.todos[0].groups;
        return [];
    }, [state.todos]);

    // Debounced updater
    const debouncedUpdateTodo = useMemo(
        () => debounce((activeTodoId: string, todoData: any) => {
            dataProvider.updateTodo(activeTodoId, todoData);
        }, delay || 500),
        [dataProvider]
    );

    // Auto-sync to data provider when todoechanges
    useEffect(() => {
        if (state.todos && state.activeTodoId) {
            debouncedUpdateTodo(state.activeTodoId, toDataTodo(state.todos[0]));
        }
    }, [state.todos, state.activeTodoId, debouncedUpdateTodo]);

    // === Initialization ===
    useEffect(() => {
        const connectAndLoad = async () => {
            try {
                setIsLoading(true);
                if (!dataProvider.isConnected()) {
                    dataProvider.connect();
                }

                // Try to get existing todo or create a new one
                let existingTodo = null;
                const allTodos = dataProvider.getTodos();

                if (allTodos.length > 0) {
                    // Use the first todo if exists
                    existingTodo = allTodos[0];
                } else {
                    // Create a new todo if none exists
                    existingTodo = dataProvider.createTodo(ModelFactory.createTodo({ date: "" }));
                }
                const displayTodo = toDisplayTodo(existingTodo);
                dispatch({ type: 'SET_TODOS', payload: [displayTodo] });
                loadTodo(displayTodo.id);
                setError(null);
            } catch (err) {
                setError(
                    'Failed to load todo: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            } finally {
                setIsInitialized(true);
                setIsLoading(false);
            }
        };

        if (!isInitialized) {
            connectAndLoad();
        }
    }, [dataProvider, isInitialized]);

    // === Public API ===
    const getTodo = useCallback(() => {
        setAction('get_todo');
        return state.todos[0];
    }, [state.todos]);

    // === Groups ===
    const addGroup = () => dispatch({ type: 'ADD_GROUP', payload: { generateId } });
    const updateGroupName = (id: string, title: string) => dispatch({ type: 'UPDATE_GROUP_NAME', payload: { id, title } });
    const updateGroupCollapseStatus = (id: string, collapsed: boolean) => dispatch({ type: 'UPDATE_GROUP_COLLAPSE', payload: { id, collapsed } });
    const bulkUpdateGroupCollapse = (collapsed: boolean) => dispatch({ type: 'BULK_UPDATE_GROUP_COLLAPSE', payload: { collapsed } });
    const deleteGroup = (id: string) => dispatch({ type: 'DELETE_GROUP', payload: { id } });
    const bulkDeleteGroups = () => dispatch({ type: 'BULK_DELETE_GROUPS' });
    const bulkDeleteEmptyGroups = () => dispatch({ type: 'BULK_DELETE_EMPTY_GROUPS' });

    const copyTodoAndLoad = useCallback(
        () => {
            dispatch({ type: 'SET_ACTIVE_TODO', payload: state.todos[0].id ?? null });
        },
        [state.todos]
    )

    const loadTodo = useCallback(
        (todoId: string) => {
            dispatch({ type: 'SET_ACTIVE_TODO', payload: todoId });
        },
        [state.todos]
    )


    // === Tasks ===
    const addTask = (groupId: string) =>
        dispatch({ type: 'ADD_TASK', payload: { groupId, generateId, now: convert(new Date()) } });
    const updateTask = (groupId: string, taskId: string, updates: Partial<any>) =>
        dispatch({ type: 'UPDATE_TASK', payload: { groupId, taskId, updates } });
    const deleteTask = (groupId: string, taskId: string) =>
        dispatch({ type: 'DELETE_TASK', payload: { groupId, taskId } });
    const reorderTask = (groupId: string, newOrder: string[]) => {
        dispatch({ type: 'REORDER_TASKS', payload: { groupId, newOrder } });
        if (state.activeTodoId) {
            dataProvider.reorderTasksInGroup(state.activeTodoId, groupId, newOrder);
        }
    };
    const reorderGroup = (newOrder: string[]) => {
        dispatch({ type: 'REORDER_GROUPS', payload: { newOrder } });
        if (state.activeTodoId) {
            dataProvider.reorderGroupsInTodo(state.activeTodoId, newOrder);
        }
    };
    const moveTaskBetweenGroups = (sourceGroupId: string, targetGroupId: string, taskId: string, targetTaskId: string | null) => {
        let targetIndex = groups.length;
        if (targetTaskId) {
            const idx = groups.find(g => g.id === targetGroupId)?.tasks.findIndex(t => t.id === targetTaskId) ?? -1;
            if (idx !== -1) targetIndex = idx;
        }
        dispatch({ type: 'MOVE_TASK_BETWEEN_GROUPS', payload: { sourceGroupId, targetGroupId, taskId, targetIndex } });
        if (state.activeTodoId) {
            dataProvider.moveTaskBetweenGroups(state.activeTodoId, taskId, targetGroupId, targetIndex);
        }
    };
    const bulkToggleTasks = (completed: boolean) => dispatch({ type: 'BULK_TOGGLE_TASKS', payload: { completed } });
    const bulkDeleteTasksByIds = (ids: string[]) => dispatch({ type: 'BULK_DELETE_TASKS', payload: { taskIds: ids } });
    const bulkDeleteTasksWithFilter = (filter: (task: any) => boolean) => dispatch({ type: 'BULK_DELETE_TASKS', payload: { filter } });

    const importTodoData = useCallback((importData: any, mergeMode: boolean = false) => {
        try {
            if (mergeMode) {
                // Merge imported todos with existing ones
                dispatch({ type: 'MERGE_TODOS_V2', payload: { importedTodos: importData.todos } });
            } else {
                // Replace existing todos with imported ones
                dispatch({ type: 'SET_TODOS', payload: importData.todos });
                if (importData.todos.length > 0) {
                    loadTodo(importData.todos[0].id);
                }
            }
        } catch (error) {
            setError('Failed to import todo data');
            throw error;
        }
    }, []);

    return {
        todos: state.todos,
        todo: state.todos[0],
        activeTodoId: state.activeTodoId,
        groups,
        getTodo,
        addGroup,
        updateGroupName,
        updateGroupCollapseStatus,
        bulkUpdateGroupCollapse,
        deleteGroup,
        bulkDeleteGroups,
        bulkDeleteEmptyGroups,
        copyTodoAndLoad,
        addTask,
        updateTask,
        deleteTask,
        reorderTask,
        reorderGroup,
        moveTaskBetweenGroups,
        bulkToggleTasks,
        bulkDeleteTasksByIds,
        bulkDeleteTasksWithFilter,
        action,
        error,
        isInitialized,
        isLoading,
        importTodoData
    };
};
