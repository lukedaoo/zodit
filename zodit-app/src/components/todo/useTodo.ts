import { useReducer, useCallback, useEffect, useMemo, useState } from 'react';
import { getToday, convert, toDate } from '@common/utils';
import { useDataProvider } from '@context/DataProviderContext';
import { ModelFactory } from '@database/models';
import { toDisplayTodo, mergeTodos, toDataTodo } from './todoUtils';
import { todoReducer } from './todoReducer';
import type { State, TodoAction as Action } from './todoReducer';
import type { Todo as DisplayTodo } from './types';

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

    const groups = state.todos.find(t => t.id === state.activeTodoId)?.groups || [];

    const generateId = useCallback((prefix: string) =>
        `${prefix}:id#${Math.floor(Math.random() * 8 ** 6).toString(8).padStart(6, '0')}`,
        []
    );

    // Debounced updater
    const debouncedUpdateTodo = useMemo(
        () => debounce((todoId: string, todoData: any) => {
            dataProvider.updateTodo(todoId, todoData);
        }, delay || 500),
        [dataProvider]
    );

    // Auto-sync to data provider when todos change
    useEffect(() => {
        if (!state.activeTodoId) return;
        const activeTodo = state.todos.find(t => t.id === state.activeTodoId);
        if (activeTodo) {
            debouncedUpdateTodo(state.activeTodoId, toDataTodo(activeTodo));
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

                const allTodos = dataProvider.getTodos();
                const displayTodos = mergeTodos(allTodos.map(toDisplayTodo));
                dispatch({ type: 'SET_TODOS', payload: displayTodos });

                const todayStr = getToday();
                let targetTodo = displayTodos.find(t => t.date === todayStr);

                if (!targetTodo) {
                    const newTodo = dataProvider.createTodo(
                        ModelFactory.createTodo({ date: todayStr })
                    );
                    targetTodo = toDisplayTodo(newTodo);
                    dispatch({
                        type: 'SET_TODOS',
                        payload: mergeTodos([...displayTodos, targetTodo]),
                    });
                }

                setError(null);
            } catch (err) {
                setError(
                    'Failed to load todos: ' +
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
    const createTodo = (date: string): DisplayTodo | undefined => {
        try {
            setIsLoading(true);
            if (!dataProvider.isConnected()) dataProvider.connect();
            const newTodo = toDisplayTodo(dataProvider.createTodo(ModelFactory.createTodo({ date })));
            dispatch({ type: 'SET_TODOS', payload: [...state.todos, newTodo] });
            setAction('create_todo');
            return newTodo;
        } catch (err) {
            setError(`Failed to create todo: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getTodoByDate = useCallback(
        (date: string) => state.todos.find(t => t.date === date),
        [state.todos]
    );

    const loadTodo = useCallback((todo: DisplayTodo | undefined): void => {
        if (!todo) return;
        dispatch({ type: 'SET_ACTIVE_TODO', payload: todo.id });
    }, []);

    const buildHeatMapFromTaskDates = useCallback((month: string) => {
        if (!isInitialized) return {};
        const [year, monthNum] = month.split('-').map(Number);
        const heatMap: Record<string, number> = {};
        state.todos.forEach(todo => {
            if (toDate(todo.date).getFullYear() === year && toDate(todo.date).getMonth() + 1 === monthNum) {
                const count = todo.groups.reduce((sum, g) => sum + g.tasks.length, 0);
                if (count > 0) heatMap[todo.date] = (heatMap[todo.date] || 0) + count;
            }
        });
        setAction('load_heatmap');
        return heatMap;
    }, [state.todos, isInitialized]);

    // === Groups ===
    const addGroup = () => dispatch({ type: 'ADD_GROUP', payload: { generateId } });
    const updateGroupName = (id: string, title: string) => dispatch({ type: 'UPDATE_GROUP_NAME', payload: { id, title } });
    const updateGroupCollapseStatus = (id: string, collapsed: boolean) => dispatch({ type: 'UPDATE_GROUP_COLLAPSE', payload: { id, collapsed } });
    const deleteGroup = (id: string) => dispatch({ type: 'DELETE_GROUP', payload: { id } });

    // === Tasks ===
    const addTask = (groupId: string) =>
        dispatch({ type: 'ADD_TASK', payload: { groupId, generateId, now: convert(new Date()) } });
    const updateTask = (groupId: string, taskId: string, updates: Partial<any>) =>
        dispatch({ type: 'UPDATE_TASK', payload: { groupId, taskId, updates } });
    const deleteTask = (groupId: string, taskId: string) =>
        dispatch({ type: 'DELETE_TASK', payload: { groupId, taskId } });
    const reorderTask = (groupId: string, newOrder: string[]) => {
        dispatch({ type: 'REORDER_TASKS', payload: { groupId, newOrder } });
        dataProvider.reorderTasksInGroup(state.activeTodoId!, groupId, newOrder);
    };
    const reorderGroup = (newOrder: string[]) => {
        dispatch({ type: 'REORDER_GROUPS', payload: { newOrder } });
        dataProvider.reorderGroupsInTodo(state.activeTodoId!, newOrder);
    };
    const moveTaskBetweenGroups = (sourceGroupId: string, targetGroupId: string, taskId: string, targetTaskId: string | null) => {
        let targetIndex = groups.length;
        if (targetTaskId) {
            const idx = groups.find(g => g.id === targetGroupId)?.tasks.findIndex(t => t.id === targetTaskId) ?? -1;
            if (idx !== -1) targetIndex = idx;
        }
        dispatch({ type: 'MOVE_TASK_BETWEEN_GROUPS', payload: { sourceGroupId, targetGroupId, taskId, targetIndex } });
        dataProvider.moveTaskBetweenGroups(state.activeTodoId!, taskId, targetGroupId, targetIndex);
    };

    return {
        todos: state.todos,
        groups,
        createTodo,
        getTodoByDate,
        loadTodo,
        buildHeatMapFromTaskDates,
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
        isInitialized,
        isLoading
    };
};
