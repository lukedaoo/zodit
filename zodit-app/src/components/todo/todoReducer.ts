import type { Todo as DisplayTodo, Group as DisplayGroup, Task as DisplayTask } from './types';
import { TYPE_UTILS as tu, presets } from './types';
export type State = {
    todos: DisplayTodo[];
    activeTodoId: string | null;
};

export type TodoAction =
    | { type: 'SET_TODOS'; payload: DisplayTodo[] }
    | { type: 'SET_ACTIVE_TODO'; payload: string | null }
    | { type: 'SYNC_GROUPS'; payload: { update: (groups: DisplayGroup[]) => DisplayGroup[] } }
    | { type: 'ADD_GROUP'; payload: { generateId: (prefix: string) => string } }
    | { type: 'UPDATE_GROUP_NAME'; payload: { id: string; title: string } }
    | { type: 'UPDATE_GROUP_COLLAPSE'; payload: { id: string; collapsed: boolean } }
    | { type: 'DELETE_GROUP'; payload: { id: string } }
    | { type: 'ADD_TASK'; payload: { groupId: string; generateId: (prefix: string) => string; now: string } }
    | { type: 'UPDATE_TASK'; payload: { groupId: string; taskId: string; updates: Partial<DisplayTask> } }
    | { type: 'DELETE_TASK'; payload: { groupId: string; taskId: string } }
    | { type: 'REORDER_TASKS'; payload: { groupId: string; newOrder: string[] } }
    | { type: 'REORDER_GROUPS'; payload: { newOrder: string[] } }
    | { type: 'MOVE_TASK_BETWEEN_GROUPS'; payload: { sourceGroupId: string; targetGroupId: string; taskId: string; targetIndex: number } }

    | { type: 'BULK_UPDATE_GROUP_COLLAPSE'; payload: { collapsed: boolean } }
    | { type: 'BULK_DELETE_GROUPS' }
    | { type: 'BULK_DELETE_EMPTY_GROUPS' }
    // Toggle task completeness in bulk for active todo
    | { type: 'BULK_TOGGLE_TASKS'; payload: { completed: boolean } }
    | { type: 'BULK_DELETE_TASKS'; payload: { filter?: (task: DisplayTask) => boolean; taskIds?: string[]; } }
    | { type: 'MERGE_TODOS_V2'; payload: { importedTodos: any[] } };


export function todoReducer(state: State, action: TodoAction): State {
    switch (action.type) {
        case 'SET_TODOS':
            return { ...state, todos: action.payload };

        case 'SET_ACTIVE_TODO':
            return { ...state, activeTodoId: action.payload };

        case 'SYNC_GROUPS':
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === state.activeTodoId
                        ? { ...todo, groups: action.payload.update(todo.groups) }
                        : todo
                )
            };

        case 'ADD_GROUP':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => [...g, { id: action.payload.generateId('group'), title: 'Untitled', tasks: [] }]
                }
            });

        case 'UPDATE_GROUP_NAME':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr => gr.id === action.payload.id ? { ...gr, title: action.payload.title } : gr)
                }
            });

        case 'UPDATE_GROUP_COLLAPSE':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr => gr.id === action.payload.id ? { ...gr, collapsed: action.payload.collapsed } : gr)
                }
            });
        case 'BULK_UPDATE_GROUP_COLLAPSE':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr => ({ ...gr, collapsed: action.payload.collapsed }))
                }
            });

        case 'DELETE_GROUP':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: { update: g => g.filter(gr => gr.id !== action.payload.id) }
            });

        case 'BULK_DELETE_GROUPS':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: { update: () => [] }
            });

        case 'BULK_DELETE_EMPTY_GROUPS':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.filter(gr => gr.tasks.length > 0)
                }
            });

        case 'ADD_TASK':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr =>
                        gr.id === action.payload.groupId
                            ? {
                                ...gr, tasks: [...gr.tasks,
                                {
                                    id: action.payload.generateId('task'),
                                    title: '',
                                    completed: false,
                                    createdDate: action.payload.now
                                }]
                            }
                            : gr
                    )
                }
            });

        case 'UPDATE_TASK':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr =>
                        gr.id === action.payload.groupId
                            ? { ...gr, tasks: gr.tasks.map(t => t.id === action.payload.taskId ? { ...t, ...action.payload.updates } : t) }
                            : gr
                    )
                }
            });

        case 'DELETE_TASK':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr =>
                        gr.id === action.payload.groupId
                            ? { ...gr, tasks: gr.tasks.filter(t => t.id !== action.payload.taskId) }
                            : gr
                    )
                }
            });

        case 'REORDER_TASKS':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr =>
                        gr.id === action.payload.groupId
                            ? {
                                ...gr,
                                tasks: action.payload.newOrder
                                    .map(id => gr.tasks.find(t => t.id === id))
                                    .filter(Boolean) as DisplayTask[]
                            }
                            : gr
                    )
                }
            });

        case 'REORDER_GROUPS': {
            const activeGroups = state.todos.find(t => t.id === state.activeTodoId)?.groups || [];
            const groupMap = Object.fromEntries(activeGroups.map(g => [g.id, g]));
            const reorderedGroups = action.payload.newOrder.map(id => groupMap[id]).filter(Boolean);
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: { update: () => reorderedGroups }
            });
        }

        case 'MOVE_TASK_BETWEEN_GROUPS':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr => {
                        if (gr.id === action.payload.sourceGroupId) {
                            return { ...gr, tasks: gr.tasks.filter(t => t.id !== action.payload.taskId) };
                        }
                        if (gr.id === action.payload.targetGroupId) {
                            const sourceTask = state.todos
                                .find(t => t.id === state.activeTodoId)?.groups
                                .find(g2 => g2.id === action.payload.sourceGroupId)?.tasks
                                .find(t => t.id === action.payload.taskId);
                            if (!sourceTask) return gr;
                            const newTasks = [...gr.tasks];
                            newTasks.splice(action.payload.targetIndex, 0, sourceTask);
                            return { ...gr, tasks: newTasks };
                        }
                        return gr;
                    })
                }
            });

        case 'BULK_TOGGLE_TASKS':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: groups =>
                        groups.map(gr => ({
                            ...gr,
                            tasks: gr.tasks.map(t =>
                                tu.isEmpty(t, presets.minimal) // skip empty tasks
                                    ? t
                                    : { ...t, completed: action.payload.completed }
                            )
                        }))
                }
            });
        case 'BULK_DELETE_TASKS':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: groups => {
                        // Create the filter function
                        const filterFn = action.payload.taskIds
                            ? (task: DisplayTask) => action.payload.taskIds!.includes(task.id)
                            : action.payload.filter;

                        if (!filterFn) return groups; // No filter provided

                        return groups.map(gr => ({
                            ...gr,
                            tasks: gr.tasks.filter(t => !filterFn(t))
                        }));
                    }
                }
            });
        case 'MERGE_TODOS_V2': {
            const { importedTodos } = action.payload;

            // Since we only have 1 active todo, merge imported content into the current todo
            if (state.todos.length === 0 || importedTodos.length === 0) {
                return state;
            }

            const currentTodo = state.todos[0];
            const importedTodo = importedTodos[0]; // Take the first imported todo

            // Merge groups from imported todo into current todo
            const existingGroupIds = new Set(currentTodo.groups?.map(g => g.id) || []);
            const newGroups = importedTodo.groups?.filter((group: any) => !existingGroupIds.has(group.id)) || [];

            // Merge tasks within existing groups
            const mergedGroups = (currentTodo.groups || []).map(existingGroup => {
                const matchingImportedGroup = importedTodo.groups?.find((imported: any) => imported.id === existingGroup.id);

                if (matchingImportedGroup) {
                    const existingTaskIds = new Set(existingGroup.tasks?.map(t => t.id) || []);
                    const newTasks = matchingImportedGroup.tasks?.filter((task: any) => !existingTaskIds.has(task.id)) || [];

                    return {
                        ...existingGroup,
                        tasks: [...(existingGroup.tasks || []), ...newTasks]
                    };
                }

                return existingGroup;
            });

            const mergedTodo = {
                ...currentTodo,
                groups: [...mergedGroups, ...newGroups]
            };

            return {
                ...state,
                todos: [mergedTodo] // Keep only 1 todo
            };
        }

        default:
            return state;

    }
}

