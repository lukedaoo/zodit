import type { Todo as DisplayTodo, Group as DisplayGroup, Task as DisplayTask } from './types';

export type State = {
    todos: DisplayTodo[];
    activeTodoId: string | null;
};

export type TodoAction =
    | { type: 'SET_TODOS'; payload: DisplayTodo[] }
    | { type: 'SET_ACTIVE_TODO'; payload: string }
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
    | { type: 'MOVE_TASK_BETWEEN_GROUPS'; payload: { sourceGroupId: string; targetGroupId: string; taskId: string; targetIndex: number } };

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

        case 'DELETE_GROUP':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: { update: g => g.filter(gr => gr.id !== action.payload.id) }
            });

        case 'ADD_TASK':
            return todoReducer(state, {
                type: 'SYNC_GROUPS',
                payload: {
                    update: g => g.map(gr =>
                        gr.id === action.payload.groupId
                            ? { ...gr, tasks: [...gr.tasks, { id: action.payload.generateId('task'), title: '', completed: false, createdDate: action.payload.now }] }
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

        default:
            return state;
    }
}

