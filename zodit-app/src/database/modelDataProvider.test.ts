import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalStorageProvider } from './provider';
import { ModelDataProvider } from './modelDataProvider';
import { Todo, Group, Task, Note } from './models';
import type { TodoData, GroupData, TaskData, NoteData } from './models';

const createMockLocalStorage = () => {
    const store = new Map<string, string>();

    return {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
            store.delete(key);
        }),
        clear: vi.fn(() => {
            store.clear();
        }),
        get length() {
            return store.size;
        },
        key: vi.fn((index: number) => {
            const keys = Array.from(store.keys());
            return keys[index] ?? null;
        })
    };
};

describe('ModelDataProvider with LocalStorage', () => {
    let dataProvider: ModelDataProvider;
    let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

    beforeEach(async () => {
        mockLocalStorage = createMockLocalStorage();

        // Mock global objects
        Object.defineProperty(globalThis, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });

        Object.defineProperty(globalThis, 'window', {
            value: { localStorage: mockLocalStorage },
            writable: true
        });

        const provider = new LocalStorageProvider();
        dataProvider = new ModelDataProvider(provider);
        await dataProvider.connect();
    });

    afterEach(async () => {
        await dataProvider.disconnect();
        vi.clearAllMocks();
    });

    describe('Connection Management', () => {
        test('should connect and disconnect properly', async () => {
            const provider = new LocalStorageProvider();
            const modelProvider = new ModelDataProvider(provider);

            expect(provider.isConnected()).toBe(false);

            await modelProvider.connect();
            expect(provider.isConnected()).toBe(true);

            await modelProvider.disconnect();
            expect(provider.isConnected()).toBe(false);
        });
    });

    describe('Todo Operations', () => {
        test('should create and retrieve a todo', async () => {
            const todoData: TodoData = {
                date: '2024-01-15',
                title: 'Test Todo'
            };

            const createdTodo = await dataProvider.createTodo(todoData);

            expect(createdTodo).toBeInstanceOf(Todo);
            expect(createdTodo.date).toBe('2024-01-15');
            expect(createdTodo.title).toBe('Test Todo');
            expect(createdTodo.id).toBeDefined();
            expect(createdTodo.id).toMatch(/^todo:/);

            const retrievedTodo = await dataProvider.getTodo(createdTodo.id);
            expect(retrievedTodo).toBeInstanceOf(Todo);
            expect(retrievedTodo?.id).toBe(createdTodo.id);
            expect(retrievedTodo?.date).toBe('2024-01-15');
            expect(retrievedTodo?.title).toBe('Test Todo');
        });

        test('should update a todo', async () => {
            const todo = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Original Title'
            });

            const updatedTodo = await dataProvider.updateTodo(todo.id, {
                title: 'Updated Title'
            });

            expect(updatedTodo?.title).toBe('Updated Title');
            expect(updatedTodo?.date).toBe('2024-01-15');
            expect(updatedTodo?.id).toBe(todo.id);
        });

        test('should delete a todo and its related data', async () => {
            const todo = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Test Todo'
            });

            // Add a group using the model method (properly associates with todo)
            const group = await dataProvider.addGroupToTodo(todo.id, {
                title: 'Test Group'
            });

            // Wait for group creation and check it exists
            expect(group).not.toBeNull();
            expect(group!.id).toBeDefined();

            // Add a task using the model method (properly associates with group)
            const task = await dataProvider.addTaskToGroup(group!.id, {
                title: 'Test Task',
                completed: false
            });

            // Wait for task creation and check it exists
            expect(task).not.toBeNull();
            expect(task!.id).toBeDefined();

            // Delete the todo
            const deleted = await dataProvider.deleteTodo(todo.id);
            expect(deleted).toBe(true);

            // Verify cascade delete
            expect(await dataProvider.getTodo(todo.id)).toBeNull();
            expect(await dataProvider.getGroup(group!.id)).toBeNull();
            expect(await dataProvider.getTask(task!.id)).toBeNull();
        });

        test('should get todo by date', async () => {
            const todo1 = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Todo 1'
            });

            const todo2 = await dataProvider.createTodo({
                date: '2024-01-16',
                title: 'Todo 2'
            });

            expect(todo2).toBeDefined();

            const retrievedTodo = await dataProvider.getTodoByDate('2024-01-15');
            expect(retrievedTodo?.id).toBe(todo1.id);
            expect(retrievedTodo?.title).toBe('Todo 1');
        });

        test('should get todos by date range', async () => {
            await dataProvider.createTodo({ date: '2024-01-14', title: 'Before' });
            await dataProvider.createTodo({ date: '2024-01-15', title: 'In Range 1' });
            await dataProvider.createTodo({ date: '2024-01-16', title: 'In Range 2' });
            await dataProvider.createTodo({ date: '2024-01-18', title: 'After' });

            const todos = await dataProvider.getTodosByDateRange('2024-01-15', '2024-01-16');
            expect(todos).toHaveLength(2);
            expect(todos.map(t => t.title).sort()).toEqual(['In Range 1', 'In Range 2']);
        });

        test('should return null for non-existent todo', async () => {
            const todo = await dataProvider.getTodo('non-existent-id');
            expect(todo).toBeNull();
        });
    });

    describe('Group Operations', () => {
        let todo: Todo;

        beforeEach(async () => {
            todo = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Test Todo'
            });
        });

        test('should create and retrieve a group', async () => {
            const groupData: GroupData = {
                title: 'Test Group',
                todoId: todo.id,
                order: 0,
                color: '#ff0000'
            };

            const createdGroup = await dataProvider.createGroup(groupData);

            expect(createdGroup).toBeInstanceOf(Group);
            expect(createdGroup.title).toBe('Test Group');
            expect(createdGroup.todoId).toBe(todo.id);
            expect(createdGroup.color).toBe('#ff0000');
            expect(createdGroup.id).toMatch(/^group:/);

            const retrievedGroup = await dataProvider.getGroup(createdGroup.id);
            expect(retrievedGroup?.id).toBe(createdGroup.id);
            expect(retrievedGroup?.title).toBe('Test Group');
        });

        test('should get groups by todo ordered correctly', async () => {
            const group1 = await dataProvider.createGroup({
                title: 'Group 1',
                todoId: todo.id,
                order: 1
            });

            expect(group1).toBeDefined();

            const group2 = await dataProvider.createGroup({
                title: 'Group 2',
                todoId: todo.id,
                order: 0
            });

            expect(group2).toBeDefined();

            const groups = await dataProvider.getGroupsByTodo(todo.id);
            expect(groups).toHaveLength(2);
            // Should be ordered by order field
            expect(groups[0].title).toBe('Group 2'); // order: 0
            expect(groups[1].title).toBe('Group 1'); // order: 1
        });

        test('should delete a group and its tasks', async () => {
            const group = await dataProvider.createGroup({
                title: 'Test Group',
                todoId: todo.id,
                order: 0
            });

            const task = await dataProvider.createTask({
                title: 'Test Task',
                completed: false,
                groupId: group.id,
                order: 0
            });

            const deleted = await dataProvider.deleteGroup(group.id);
            expect(deleted).toBe(true);

            expect(await dataProvider.getGroup(group.id)).toBeNull();
            expect(await dataProvider.getTask(task.id)).toBeNull();
        });

        test('should add group to todo using model method', async () => {
            const group = await dataProvider.addGroupToTodo(todo.id, {
                title: 'New Group',
                color: '#00ff00'
            });

            expect(group).toBeInstanceOf(Group);
            expect(group?.title).toBe('New Group');
            expect(group?.todoId).toBe(todo.id);
            expect(group?.order).toBe(0);
        });

        test('should remove group from todo using model method', async () => {
            const group = await dataProvider.createGroup({
                title: 'Test Group',
                todoId: todo.id,
                order: 0
            });

            const removedGroup = await dataProvider.removeGroupFromTodo(group.id, todo.id);
            expect(removedGroup?.id).toBe(group.id);
            expect(await dataProvider.getGroup(group.id)).toBeNull();
        });
    });

    describe('Task Operations', () => {
        let todo: Todo;
        let group: Group;

        beforeEach(async () => {
            todo = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Test Todo'
            });

            group = await dataProvider.createGroup({
                title: 'Test Group',
                todoId: todo.id,
                order: 0
            });
        });

        test('should create and retrieve a task', async () => {
            const taskData: TaskData = {
                title: 'Test Task',
                completed: false,
                description: 'Task description',
                priority: 'high',
                tags: ['urgent', 'work'],
                groupId: group.id,
                order: 0
            };

            const createdTask = await dataProvider.createTask(taskData);

            expect(createdTask).toBeInstanceOf(Task);
            expect(createdTask.title).toBe('Test Task');
            expect(createdTask.priority).toBe('high');
            expect(createdTask.tags).toEqual(['urgent', 'work']);
            expect(createdTask.id).toMatch(/^task:/);

            const retrievedTask = await dataProvider.getTask(createdTask.id);
            expect(retrievedTask?.id).toBe(createdTask.id);
            expect(retrievedTask?.title).toBe('Test Task');
        });

        test('should get tasks by group ordered correctly', async () => {
            const task1 = await dataProvider.createTask({
                title: 'Task 1',
                completed: false,
                groupId: group.id,
                order: 1
            });

            expect(task1).toBeDefined();

            const task2 = await dataProvider.createTask({
                title: 'Task 2',
                completed: false,
                groupId: group.id,
                order: 0
            });

            expect(task2).toBeDefined();

            const tasks = await dataProvider.getTasksByGroup(group.id);
            expect(tasks).toHaveLength(2);
            // Should be ordered by order field
            expect(tasks[0].title).toBe('Task 2'); // order: 0
            expect(tasks[1].title).toBe('Task 1'); // order: 1
        });

        test('should get tasks by priority', async () => {
            await dataProvider.createTask({
                title: 'High Priority',
                completed: false,
                priority: 'high',
                groupId: group.id,
                order: 0
            });

            await dataProvider.createTask({
                title: 'Medium Priority',
                completed: false,
                priority: 'medium',
                groupId: group.id,
                order: 1
            });

            const highPriorityTasks = await dataProvider.getTasksByPriority('high');
            expect(highPriorityTasks).toHaveLength(1);
            expect(highPriorityTasks[0].title).toBe('High Priority');
        });

        test('should search tasks', async () => {
            await dataProvider.createTask({
                title: 'Important meeting',
                completed: false,
                description: 'Client presentation',
                tags: ['work'],
                groupId: group.id,
                order: 0
            });

            await dataProvider.createTask({
                title: 'Buy groceries',
                completed: false,
                description: 'Get food for dinner',
                tags: ['personal'],
                groupId: group.id,
                order: 1
            });

            const searchResults = await dataProvider.searchTasks('meeting');
            expect(searchResults).toHaveLength(1);
            expect(searchResults[0].title).toBe('Important meeting');

            const tagSearch = await dataProvider.searchTasks('work');
            expect(tagSearch).toHaveLength(1);
            expect(tagSearch[0].title).toBe('Important meeting');
        });

        test('should toggle task complete using model method', async () => {
            const task = await dataProvider.createTask({
                title: 'Test Task',
                completed: false,
                groupId: group.id,
                order: 0
            });

            expect(task.completed).toBe(false);

            const toggledTask = await dataProvider.toggleTaskComplete(task.id);
            expect(toggledTask?.completed).toBe(true);

            // Toggle back
            const toggledAgain = await dataProvider.toggleTaskComplete(task.id);
            expect(toggledAgain?.completed).toBe(false);
        });

        test('should add task to group using model method', async () => {
            const task = await dataProvider.addTaskToGroup(group.id, {
                title: 'New Task',
                completed: false,
                description: 'Added via model method'
            });

            expect(task).toBeInstanceOf(Task);
            expect(task?.title).toBe('New Task');
            expect(task?.groupId).toBe(group.id);
            expect(task?.order).toBe(0);
        });

        test('should remove task from group using model method', async () => {
            const task = await dataProvider.createTask({
                title: 'Test Task',
                completed: false,
                groupId: group.id,
                order: 0
            });

            const removedTask = await dataProvider.removeTaskFromGroup(task.id, group.id);
            expect(removedTask?.id).toBe(task.id);
            expect(await dataProvider.getTask(task.id)).toBeNull();
        });
    });

    describe('Task and Group Movement Operations', () => {
        let todo: Todo;
        let group1: Group;
        let group2: Group;

        beforeEach(async () => {
            todo = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Test Todo'
            });

            group1 = await dataProvider.createGroup({
                title: 'Group 1',
                todoId: todo.id,
                order: 0
            });

            group2 = await dataProvider.createGroup({
                title: 'Group 2',
                todoId: todo.id,
                order: 1
            });
        });

        test('should move task between groups using model method', async () => {
            const task = await dataProvider.createTask({
                title: 'Moving Task',
                completed: false,
                groupId: group1.id,
                order: 0
            });

            const result = await dataProvider.moveTaskBetweenGroups(
                task.id,
                group1.id,
                group2.id,
                0
            );

            expect(result).toBeDefined();
            expect(result?.task.groupId).toBe(group2.id);
            expect(result?.task.order).toBe(0);

            // Verify task is no longer in group1
            const group1Tasks = await dataProvider.getTasksByGroup(group1.id);
            expect(group1Tasks).toHaveLength(0);

            // Verify task is in group2
            const group2Tasks = await dataProvider.getTasksByGroup(group2.id);
            expect(group2Tasks).toHaveLength(1);
            expect(group2Tasks[0].id).toBe(task.id);
        });

        test('should move task within group using model method', async () => {
            const task1 = await dataProvider.createTask({
                title: 'Task 1',
                completed: false,
                groupId: group1.id,
                order: 0
            });

            const task2 = await dataProvider.createTask({
                title: 'Task 2',
                completed: false,
                groupId: group1.id,
                order: 1
            });

            expect(task2.order).toBe(1);

            const task3 = await dataProvider.createTask({
                title: 'Task 3',
                completed: false,
                groupId: group1.id,
                order: 2
            });

            expect(task3.order).toBe(2);

            // Move task1 to position 2 (last)
            const result = await dataProvider.moveTaskWithinGroup(task1.id, group1.id, 2);
            expect(result).toBeDefined();

            const tasks = await dataProvider.getTasksByGroup(group1.id);
            expect(tasks.map(t => t.title)).toEqual(['Task 2', 'Task 3', 'Task 1']);
            expect(tasks.map(t => t.order)).toEqual([0, 1, 2]);
        });

        test('should reorder tasks in group using model method', async () => {
            const task1 = await dataProvider.createTask({
                title: 'Task 1',
                completed: false,
                groupId: group1.id,
                order: 0
            });

            const task2 = await dataProvider.createTask({
                title: 'Task 2',
                completed: false,
                groupId: group1.id,
                order: 1
            });

            const task3 = await dataProvider.createTask({
                title: 'Task 3',
                completed: false,
                groupId: group1.id,
                order: 2
            });

            // Reorder: task3, task1, task2
            const result = await dataProvider.reorderTasksInGroup(group1.id, [
                task3.id,
                task1.id,
                task2.id
            ]);

            expect(result).toBeDefined();

            const tasks = await dataProvider.getTasksByGroup(group1.id);
            expect(tasks.map(t => t.title)).toEqual(['Task 3', 'Task 1', 'Task 2']);
            expect(tasks.map(t => t.order)).toEqual([0, 1, 2]);
        });

        test('should move group within todo using model method', async () => {
            const group3 = await dataProvider.createGroup({
                title: 'Group 3',
                todoId: todo.id,
                order: 2
            });

            // Move group3 to position 0 (first)
            const result = await dataProvider.moveGroupWithinTodo(group3.id, todo.id, 0);
            expect(result).toBeDefined();

            const groups = await dataProvider.getGroupsByTodo(todo.id);
            expect(groups.map(g => g.title)).toEqual(['Group 3', 'Group 1', 'Group 2']);
            expect(groups.map(g => g.order)).toEqual([0, 1, 2]);
        });

        test('should reorder groups in todo using model method', async () => {
            const group3 = await dataProvider.createGroup({
                title: 'Group 3',
                todoId: todo.id,
                order: 2
            });

            // Reorder: group2, group3, group1
            const result = await dataProvider.reorderGroupsInTodo(todo.id, [
                group2.id,
                group3.id,
                group1.id
            ]);

            expect(result).toBeDefined();

            const groups = await dataProvider.getGroupsByTodo(todo.id);
            expect(groups.map(g => g.title)).toEqual(['Group 2', 'Group 3', 'Group 1']);
            expect(groups.map(g => g.order)).toEqual([0, 1, 2]);
        });
    });

    describe('Note Operations', () => {
        test('should create and retrieve a note', async () => {
            const noteData: NoteData = {
                text: 'Test note content',
                color: '#ffff00',
                position: { x: 100, y: 200 },
                width: 300,
                height: 250,
                tags: ['important']
            };

            const createdNote = await dataProvider.createNote(noteData);

            expect(createdNote).toBeInstanceOf(Note);
            expect(createdNote.text).toBe('Test note content');
            expect(createdNote.color).toBe('#ffff00');
            expect(createdNote.position).toEqual({ x: 100, y: 200 });
            expect(createdNote.id).toMatch(/^note:/);

            const retrievedNote = await dataProvider.getNote(createdNote.id);
            expect(retrievedNote?.id).toBe(createdNote.id);
            expect(retrievedNote?.text).toBe('Test note content');
        });

        test('should get all notes', async () => {
            await dataProvider.createNote({
                text: 'Note 1',
                color: '#ff0000',
                position: { x: 0, y: 0 }
            });

            await dataProvider.createNote({
                text: 'Note 2',
                color: '#00ff00',
                position: { x: 100, y: 100 }
            });

            const notes = await dataProvider.getAllNotes();
            expect(notes).toHaveLength(2);
            expect(notes.map(n => n.text).sort()).toEqual(['Note 1', 'Note 2']);
        });

        test('should get notes by tag', async () => {
            await dataProvider.createNote({
                text: 'Work note',
                color: '#ff0000',
                position: { x: 0, y: 0 },
                tags: ['work', 'important']
            });

            await dataProvider.createNote({
                text: 'Personal note',
                color: '#00ff00',
                position: { x: 100, y: 100 },
                tags: ['personal']
            });

            const workNotes = await dataProvider.getNotesByTag('work');
            expect(workNotes).toHaveLength(1);
            expect(workNotes[0].text).toBe('Work note');
        });
    });

    describe('Validation and Error Handling', () => {
        test('should validate and fix todo structure', async () => {
            const todo = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Test Todo'
            });

            // Create groups and tasks
            const group = await dataProvider.createGroup({
                title: 'Test Group',
                todoId: todo.id,
                order: 0
            });

            await dataProvider.createTask({
                title: 'Task 1',
                completed: false,
                groupId: group.id,
                order: 0
            });

            const result = await dataProvider.validateAndFixTodo(todo.id);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
            expect(result.fixed).toBe(false); // Nothing to fix
        });

        test('should handle non-existent resources gracefully', async () => {
            expect(await dataProvider.getTodo('non-existent')).toBeNull();
            expect(await dataProvider.getGroup('non-existent')).toBeNull();
            expect(await dataProvider.getTask('non-existent')).toBeNull();
            expect(await dataProvider.getNote('non-existent')).toBeNull();

            expect(await dataProvider.updateTodo('non-existent', {})).toBeNull();
            expect(await dataProvider.deleteTodo('non-existent')).toBe(false);
        });

        test('should handle toggle operations on non-existent items', async () => {
            expect(await dataProvider.toggleTaskComplete('non-existent')).toBeNull();
            expect(await dataProvider.toggleGroupCollapsed('non-existent')).toBeNull();
        });
    });

    describe('Data Export/Import', () => {
        test('should export and import data', async () => {
            // Create test data
            const todo = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Test Todo'
            });

            const group = await dataProvider.createGroup({
                title: 'Test Group',
                todoId: todo.id,
                order: 0
            });

            await dataProvider.createTask({
                title: 'Test Task',
                completed: false,
                groupId: group.id,
                order: 0
            });

            // Export data
            const exportedData = await dataProvider.exportData();
            expect(exportedData).toHaveProperty('todos');
            expect(exportedData).toHaveProperty('groups');
            expect(exportedData).toHaveProperty('tasks');

            // Clear data
            await dataProvider.clearAllData();

            // Verify data is cleared
            expect(await dataProvider.getTodo(todo.id)).toBeNull();

            // Import data back
            await dataProvider.importData(exportedData);

            // Verify data is restored
            const restoredTodo = await dataProvider.getTodo(todo.id);
            expect(restoredTodo?.title).toBe('Test Todo');
        });
    });

    describe('Real-time Subscriptions', () => {
        test('should subscribe to todo changes', async () => {
            const callback = vi.fn();
            const unsubscribe = dataProvider.subscribeTo('todos', callback);

            const todo = await dataProvider.createTodo({
                date: '2024-01-15',
                title: 'Test Todo'
            });

            expect(callback).toHaveBeenCalledWith('create', expect.objectContaining({
                title: 'Test Todo'
            }));

            await dataProvider.updateTodo(todo.id, { title: 'Updated Todo' });

            expect(callback).toHaveBeenCalledWith('update', expect.objectContaining({
                title: 'Updated Todo'
            }));

            await dataProvider.deleteTodo(todo.id);

            expect(callback).toHaveBeenCalledWith('delete', expect.objectContaining({
                title: 'Updated Todo'
            }));

            unsubscribe();
        });

        test('should subscribe with filters', async () => {
            const callback = vi.fn();
            const unsubscribe = dataProvider.subscribeTo('tasks', callback, {
                priority: 'high'
            });

            // This should trigger the callback
            await dataProvider.createTask({
                title: 'High Priority Task',
                completed: false,
                priority: 'high',
                groupId: 'test-group',
                order: 0
            });

            expect(callback).toHaveBeenCalledTimes(1);

            // This should NOT trigger the callback (wrong priority)
            await dataProvider.createTask({
                title: 'Low Priority Task',
                completed: false,
                priority: 'low',
                groupId: 'test-group',
                order: 1
            });

            expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2

            unsubscribe();
        });
    });
});

// Additional integration tests
describe('ModelDataProvider Integration Tests', () => {
    let dataProvider: ModelDataProvider;
    let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

    beforeEach(async () => {
        mockLocalStorage = createMockLocalStorage();

        Object.defineProperty(globalThis, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });

        Object.defineProperty(globalThis, 'window', {
            value: { localStorage: mockLocalStorage },
            writable: true
        });

        const provider = new LocalStorageProvider();
        dataProvider = new ModelDataProvider(provider);
        await dataProvider.connect();
    });

    afterEach(async () => {
        await dataProvider.disconnect();
        vi.clearAllMocks();
    });

    test('should handle complex todo structure operations', async () => {
        // Create a complete todo structure
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Complex Todo'
        });

        const group1 = await dataProvider.addGroupToTodo(todo.id, {
            title: 'Work Tasks',
            color: '#ff0000'
        });

        const group2 = await dataProvider.addGroupToTodo(todo.id, {
            title: 'Personal Tasks',
            color: '#00ff00'
        });

        // Add tasks to both groups
        const task1 = await dataProvider.addTaskToGroup(group1!.id, {
            title: 'Work Task 1',
            completed: false,
            priority: 'high'
        });

        const task2 = await dataProvider.addTaskToGroup(group1!.id, {
            title: 'Work Task 2',
            completed: true,
            priority: 'medium'
        });

        expect(task2!.completed).toBe(true);

        const task3 = await dataProvider.addTaskToGroup(group2!.id, {
            title: 'Personal Task 1',
            completed: false,
            priority: 'low'
        });

        expect(task3!.completed).toBe(false);

        // Move task between groups
        await dataProvider.moveTaskBetweenGroups(
            task1!.id,
            group1!.id,
            group2!.id,
            1
        );

        // Verify final structure
        const group1Tasks = await dataProvider.getTasksByGroup(group1!.id);
        const group2Tasks = await dataProvider.getTasksByGroup(group2!.id);

        expect(group1Tasks).toHaveLength(1);
        expect(group1Tasks[0].title).toBe('Work Task 2');

        expect(group2Tasks).toHaveLength(2);
        expect(group2Tasks[0].title).toBe('Personal Task 1');
        expect(group2Tasks[1].title).toBe('Work Task 1');

        // Verify order is maintained
        expect(group2Tasks.map(t => t.order)).toEqual([0, 1]);
    });

    test('should maintain data integrity during concurrent operations', async () => {
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Concurrent Test'
        });

        const group = await dataProvider.addGroupToTodo(todo.id, {
            title: 'Test Group'
        });

        // Simulate concurrent task additions
        const taskPromises = Array.from({ length: 5 }, (_, i) =>
            dataProvider.addTaskToGroup(group!.id, {
                title: `Concurrent Task ${i + 1}`,
                completed: false
            })
        );

        const tasks = await Promise.all(taskPromises);

        // Verify all tasks were created
        expect(tasks).toHaveLength(5);
        expect(tasks.every(task => task !== null)).toBe(true);

        // Verify ordering is maintained
        const groupTasks = await dataProvider.getTasksByGroup(group!.id);
        expect(groupTasks).toHaveLength(5);
        expect(groupTasks.map(t => t.order)).toEqual([0, 1, 2, 3, 4]);
    });

    test('should handle complex reordering scenarios', async () => {
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Reorder Test'
        });

        // Create multiple groups
        const groups = await Promise.all([
            dataProvider.addGroupToTodo(todo.id, { title: 'Group A' }),
            dataProvider.addGroupToTodo(todo.id, { title: 'Group B' }),
            dataProvider.addGroupToTodo(todo.id, { title: 'Group C' }),
            dataProvider.addGroupToTodo(todo.id, { title: 'Group D' })
        ]);

        const [groupA, groupB, groupC, groupD] = groups;

        // Add tasks to each group
        await Promise.all([
            dataProvider.addTaskToGroup(groupA!.id, { title: 'A1', completed: false }),
            dataProvider.addTaskToGroup(groupA!.id, { title: 'A2', completed: false }),
            dataProvider.addTaskToGroup(groupB!.id, { title: 'B1', completed: false }),
            dataProvider.addTaskToGroup(groupC!.id, { title: 'C1', completed: false }),
            dataProvider.addTaskToGroup(groupC!.id, { title: 'C2', completed: false }),
            dataProvider.addTaskToGroup(groupC!.id, { title: 'C3', completed: false })
        ]);

        // Reorder groups: D, B, A, C
        await dataProvider.reorderGroupsInTodo(todo.id, [
            groupD!.id,
            groupB!.id,
            groupA!.id,
            groupC!.id
        ]);

        // Verify group order
        const reorderedGroups = await dataProvider.getGroupsByTodo(todo.id);
        expect(reorderedGroups.map(g => g.title)).toEqual(['Group D', 'Group B', 'Group A', 'Group C']);
        expect(reorderedGroups.map(g => g.order)).toEqual([0, 1, 2, 3]);

        // Verify tasks are still properly associated
        const groupATasks = await dataProvider.getTasksByGroup(groupA!.id);
        const groupCTasks = await dataProvider.getTasksByGroup(groupC!.id);

        expect(groupATasks.map(t => t.title)).toEqual(['A1', 'A2']);
        expect(groupCTasks.map(t => t.title)).toEqual(['C1', 'C2', 'C3']);
    });

    test('should handle error scenarios gracefully', async () => {
        // Test moving task to non-existent group
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Error Test'
        });

        const group = await dataProvider.addGroupToTodo(todo.id, {
            title: 'Test Group'
        });

        const task = await dataProvider.addTaskToGroup(group!.id, {
            title: 'Test Task',
            completed: false
        });

        // Try to move task to non-existent group
        const moveResult = await dataProvider.moveTaskBetweenGroups(
            task!.id,
            group!.id,
            'non-existent-group',
            0
        );

        expect(moveResult).toBeNull();

        // Verify task is still in original group
        const groupTasks = await dataProvider.getTasksByGroup(group!.id);
        expect(groupTasks).toHaveLength(1);
        expect(groupTasks[0].id).toBe(task!.id);
    });

    test('should validate complex model relationships', async () => {
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Validation Test'
        });

        const group = await dataProvider.addGroupToTodo(todo.id, {
            title: 'Test Group'
        });

        // Add multiple tasks
        const tasks = await Promise.all([
            dataProvider.addTaskToGroup(group!.id, { title: 'Task 1', completed: false }),
            dataProvider.addTaskToGroup(group!.id, { title: 'Task 2', completed: true }),
            dataProvider.addTaskToGroup(group!.id, { title: 'Task 3', completed: false })
        ]);

        expect(tasks).toHaveLength(3);

        // Validate the complete structure
        const validationResult = await dataProvider.validateAndFixTodo(todo.id);

        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toEqual([]);

        // Verify all relationships are correct
        const fullTodo = await dataProvider.getTodo(todo.id);
        expect(fullTodo).toBeDefined();

        const todoGroups = await dataProvider.getGroupsByTodo(todo.id);
        expect(todoGroups).toHaveLength(1);
        expect(todoGroups[0].todoId).toBe(todo.id);

        const groupTasks = await dataProvider.getTasksByGroup(group!.id);
        expect(groupTasks).toHaveLength(3);
        expect(groupTasks.every(task => task.groupId === group!.id)).toBe(true);
        expect(groupTasks.map(task => task.order)).toEqual([0, 1, 2]);
    });

    test('should handle localStorage size limits gracefully', async () => {
        // Mock localStorage to throw quota exceeded error
        const originalSetItem = mockLocalStorage.setItem;
        let shouldThrow = false;

        mockLocalStorage.setItem = vi.fn((key: string, value: string) => {
            if (shouldThrow) {
                const error = new Error('QuotaExceededError');
                error.name = 'QuotaExceededError';
                throw error;
            }
            return originalSetItem(key, value);
        });

        // Create initial data
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Quota Test'
        });

        // Enable quota error
        shouldThrow = true;

        // Try to create more data and expect it to fail
        await expect(dataProvider.createGroup({
            title: 'Test Group',
            todoId: todo.id,
            order: 0
        })).rejects.toThrow();

        // Restore original function
        shouldThrow = false;
        mockLocalStorage.setItem = originalSetItem;
    });

    test('should handle transaction rollbacks correctly', async () => {
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Transaction Test'
        });

        const group1 = await dataProvider.addGroupToTodo(todo.id, {
            title: 'Group 1'
        });

        const group2 = await dataProvider.addGroupToTodo(todo.id, {
            title: 'Group 2'
        });

        const task = await dataProvider.addTaskToGroup(group1!.id, {
            title: 'Test Task',
            completed: false
        });

        // Mock provider to fail during transaction
        const originalUpdate = dataProvider['provider'].update as any;
        let shouldFail = false;

        dataProvider['provider'].update = vi.fn(async (...args) => {
            if (shouldFail) {
                throw new Error('Simulated failure');
            }
            return originalUpdate.apply(dataProvider['provider'], args);
        });

        // Enable failure
        shouldFail = true;

        // Try to move task between groups (should fail and rollback)
        await expect(dataProvider.moveTaskBetweenGroups(
            task!.id,
            group1!.id,
            group2!.id,
            0
        )).rejects.toThrow('Simulated failure');

        // Verify task is still in original group (rollback worked)
        const group1Tasks = await dataProvider.getTasksByGroup(group1!.id);
        const group2Tasks = await dataProvider.getTasksByGroup(group2!.id);

        expect(group1Tasks).toHaveLength(1);
        expect(group2Tasks).toHaveLength(0);
        expect(group1Tasks[0].id).toBe(task!.id);

        // Restore original function
        dataProvider['provider'].update = originalUpdate;
    });

    test('should maintain performance with large datasets', async () => {
        const startTime = Date.now();

        // Create a large todo structure
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Performance Test'
        });

        // Create multiple groups
        const groupPromises = Array.from({ length: 20 }, (_, i) =>
            dataProvider.addGroupToTodo(todo.id, {
                title: `Group ${i + 1}`,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
            })
        );

        const groups = await Promise.all(groupPromises);

        // Create many tasks across groups
        const taskPromises: Promise<Task | null>[] = [];
        groups.forEach((group, groupIndex) => {
            for (let i = 0; i < 50; i++) {
                taskPromises.push(
                    dataProvider.addTaskToGroup(group!.id, {
                        title: `Group ${groupIndex + 1} Task ${i + 1}`,
                        completed: Math.random() > 0.5,
                        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
                        tags: [`tag${i % 5}`, `group${groupIndex}`]
                    })
                );
            }
        });

        await Promise.all(taskPromises);

        const endTime = Date.now();
        const creationTime = endTime - startTime;

        // Should complete creation in reasonable time (adjust threshold as needed)
        expect(creationTime).toBeLessThan(10000); // 10 seconds

        // Test search performance
        const searchStart = Date.now();
        const searchResults = await dataProvider.searchTasks('Task');
        const searchEnd = Date.now();

        expect(searchResults.length).toBeGreaterThan(0);
        expect(searchEnd - searchStart).toBeLessThan(1000); // 1 second

        // Test reordering performance
        const reorderStart = Date.now();
        const firstGroup = groups[0]!;
        const groupTasks = await dataProvider.getTasksByGroup(firstGroup.id);
        const shuffledTaskIds = [...groupTasks.map(t => t.id)].reverse();

        await dataProvider.reorderTasksInGroup(firstGroup.id, shuffledTaskIds);
        const reorderEnd = Date.now();

        expect(reorderEnd - reorderStart).toBeLessThan(2000); // 2 seconds
    });
});

// Helper test utilities
export const testHelpers = {
    createSampleTodo: async (dataProvider: ModelDataProvider) => {
        const todo = await dataProvider.createTodo({
            date: '2024-01-15',
            title: 'Sample Todo'
        });

        const group = await dataProvider.addGroupToTodo(todo.id, {
            title: 'Sample Group',
            color: '#ff0000'
        });

        const task = await dataProvider.addTaskToGroup(group!.id, {
            title: 'Sample Task',
            completed: false,
            priority: 'medium',
            tags: ['sample']
        });

        return { todo, group: group!, task: task! };
    },

    expectValidTodoStructure: async (dataProvider: ModelDataProvider, todoId: string) => {
        const todo = await dataProvider.getTodo(todoId);
        expect(todo).toBeDefined();

        const groups = await dataProvider.getGroupsByTodo(todoId);
        expect(groups.every(g => g.todoId === todoId)).toBe(true);
        expect(groups.map(g => g.order)).toEqual(groups.map((_, i) => i));

        for (const group of groups) {
            const tasks = await dataProvider.getTasksByGroup(group.id);
            expect(tasks.every(t => t.groupId === group.id)).toBe(true);
            expect(tasks.map(t => t.order)).toEqual(tasks.map((_, i) => i));
        }
    }
};
