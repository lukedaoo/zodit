import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LocalStorageDataProvider } from './localStorageDataProvider';
import { Todo, Note, Group, Task } from '../models';
import type { TodoData, NoteData, TaskData, } from '../models';

describe('LocalStorageDataProvider', () => {
    let provider: LocalStorageDataProvider;
    const mockConfig = { name: 'localStorage' };

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        provider = new LocalStorageDataProvider(mockConfig);
        provider.connect();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Connection Handling', () => {
        it('should connect successfully when localStorage is available', () => {
            expect(provider.isConnected()).toBe(true);
        });

        it('should disconnect properly', () => {
            provider.disconnect();
            expect(provider.isConnected()).toBe(false);
        });
    });

    describe('Todo Operations', () => {
        it('should create and retrieve a todo', () => {
            const todoData: TodoData = {
                date: '2025-07-29',
                title: 'Test Todo'
            };
            const todo = provider.createTodo(todoData);

            expect(todo).toBeInstanceOf(Todo);
            expect(todo.title).toBe('Test Todo');
            expect(todo.date).toBe('2025-07-29');

            const retrievedTodo = provider.getTodo(todo.id);
            expect(retrievedTodo).toMatchObject({
                id: todo.id,
                title: 'Test Todo',
                date: '2025-07-29'
            });
        });

        it('should update a todo', () => {
            const todo = provider.createTodo({
                date: '2025-07-29',
                title: 'Initial'
            });

            const updatedTodo = provider.updateTodo(todo.id, {
                title: 'Updated Title'
            });

            expect(updatedTodo.title).toBe('Updated Title');
            expect(provider.getTodo(todo.id)?.title).toBe('Updated Title');
        });

        it('should delete a todo', () => {
            const todo = provider.createTodo({
                date: '2025-07-29',
                title: 'To Delete'
            });

            provider.deleteTodo(todo.id);
            expect(provider.getTodo(todo.id)).toBeNull();
        });

        it('should get todos with query options', () => {
            provider.createTodo({ date: '2025-07-29', title: 'Todo A' });
            provider.createTodo({ date: '2025-07-29', title: 'Todo B' });

            const todos = provider.getTodos({
                filters: { title: 'Todo A' },
                orderBy: 'title',
                orderDirection: 'asc',
                limit: 1
            });

            expect(todos).toHaveLength(1);
            expect(todos[0].title).toBe('Todo A');
        });
    });

    describe('Note Operations', () => {
        it('should create and retrieve a note', () => {
            const noteData: NoteData = {
                text: 'Test Note',
                color: '#ffffff',
                position: { x: 100, y: 100 }
            };
            const note = provider.createNote(noteData);

            expect(note).toBeInstanceOf(Note);
            expect(note.text).toBe('Test Note');
            expect(note.color).toBe('#ffffff');

            const retrievedNote = provider.getNote(note.id);
            expect(retrievedNote).toMatchObject({
                id: note.id,
                text: 'Test Note',
                color: '#ffffff',
                position: { x: 100, y: 100 }
            });
        });

        it('should update a note', () => {
            const note = provider.createNote({
                text: 'Initial',
                color: '#ffffff',
                position: { x: 100, y: 100 }
            });

            const updatedNote = provider.updateNote(note.id, {
                text: 'Updated Text'
            });

            expect(updatedNote.text).toBe('Updated Text');
            expect(provider.getNote(note.id)?.text).toBe('Updated Text');
        });

        it('should delete a note', () => {
            const note = provider.createNote({
                text: 'To Delete',
                color: '#ffffff',
                position: { x: 100, y: 100 }
            });

            provider.deleteNote(note.id);
            expect(provider.getNote(note.id)).toBeNull();
        });

        it('should get notes with query options', () => {
            provider.createNote({
                text: 'Note A',
                color: '#ffffff',
                position: { x: 100, y: 100 },
                tags: ['test']
            });
            provider.createNote({
                text: 'Note B',
                color: '#000000',
                position: { x: 200, y: 200 },
                tags: ['test']
            });

            const notes = provider.getNotes({
                filters: { text: 'Note A', tags: ['test'] },
                orderBy: 'text',
                orderDirection: 'asc',
                limit: 1
            });

            expect(notes).toHaveLength(1);
            expect(notes[0].text).toBe('Note A');
        });
    });

    describe('Task and Group Operations', () => {
        it('should move task between groups', () => {
            const todo = provider.createTodo({
                date: '2025-07-29',
                title: 'Test Todo',
                groups: [
                    new Group({
                        title: 'Group 1',
                        todoId: '',
                        order: 0,
                        tasks: [new Task({
                            title: 'Task 1',
                            groupId: '',
                            order: 0
                        } as TaskData)]
                    }),
                    new Group({
                        title: 'Group 2',
                        todoId: '',
                        order: 1,
                        tasks: []
                    })
                ]
            });

            const sourceGroup = todo.groups[0];
            const targetGroup = todo.groups[1];
            const task = sourceGroup.tasks[0];

            const result = provider.moveTaskBetweenGroups(
                todo.id,
                task.id,
                targetGroup.id,
                0
            );

            expect(result).toBe(true);
            const updatedTodo = provider.getTodo(todo.id);
            expect(updatedTodo?.groups[0].tasks).toHaveLength(0);
            expect(updatedTodo?.groups[1].tasks[0].id).toBe(task.id);
        });

        it('should reorder tasks in group', () => {
            const todo = provider.createTodo({
                date: '2025-07-29',
                title: 'Test Todo',
                groups: [
                    new Group({
                        title: 'Group 1',
                        todoId: '',
                        order: 0,
                        tasks: [
                            new Task({ title: 'Task 1', groupId: '', order: 0 } as TaskData),
                            new Task({ title: 'Task 2', groupId: '', order: 1 } as TaskData)
                        ]
                    })
                ]
            });

            const group = todo.groups[0];
            const taskIds = group.tasks.map(t => t.id).reverse();

            provider.reorderTasksInGroup(todo.id, group.id, taskIds);
            const updatedTodo = provider.getTodo(todo.id);
            expect(updatedTodo?.groups[0].tasks.map(t => t.id)).toEqual(taskIds);
        });

        it('should reorder groups in todo', () => {
            const todo = provider.createTodo({
                date: '2025-07-29',
                title: 'Test Todo',
                groups: [
                    new Group({ title: 'Group 1', todoId: '', order: 0 }),
                    new Group({ title: 'Group 2', todoId: '', order: 1 })
                ]
            });

            const groupIds = todo.groups.map(g => g.id).reverse();
            provider.reorderGroupsInTodo(todo.id, groupIds);
            const updatedTodo = provider.getTodo(todo.id);
            expect(updatedTodo?.groups.map(g => g.id)).toEqual(groupIds);
        });
    });

    describe('Bulk Operations', () => {
        it('should get all data', () => {
            provider.createTodo({ date: '2025-07-29', title: 'Todo 1' });
            provider.createNote({
                text: 'Note 1',
                color: '#ffffff',
                position: { x: 100, y: 100 }
            });

            const data = provider.getAllData();
            expect(data.todos).toHaveLength(1);
            expect(data.notes).toHaveLength(1);
        });

        it('should clear all data', () => {
            provider.createTodo({ date: '2025-07-29', title: 'Todo 1' });
            provider.createNote({
                text: 'Note 1',
                color: '#ffffff',
                position: { x: 100, y: 100 }
            });

            provider.clearAllData();
            expect(provider.getAllData()).toEqual({ todos: [], notes: [] });
            expect(localStorage.getItem('todos')).toBeNull();
            expect(localStorage.getItem('notes')).toBeNull();
        });
    });

    describe('Error Handling', () => {
        it('should throw when not connected for operations', () => {
            provider.disconnect();
            expect(() => provider.getTodos()).toThrow('Data provider is not connected');
            expect(() => provider.getNotes()).toThrow('Data provider is not connected');
            expect(() => provider.createTodo({ date: '2025-07-29' })).toThrow('Data provider is not connected');
            expect(() => provider.clearAllData()).toThrow('Data provider is not connected');
        });

        it.skip('should handle invalid JSON in localStorage gracefully', () => {
            localStorage.setItem('todos', 'invalid json');
            expect(provider.getTodos()).toThrowError();
        });
    });
});

describe('LocalStorageDataProvider Scenario Test', () => {
    let provider: LocalStorageDataProvider;
    const mockConfig = { name: 'localStorage' };

    beforeEach(() => {
        localStorage.clear();
        provider = new LocalStorageDataProvider(mockConfig);
        provider.connect();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should handle todo with groups, tasks, and task movements correctly', () => {
        // Create Todo with two groups, each with one task
        const todoData: TodoData = {
            date: '2025-07-30',
            title: 'Daily Tasks',
            groups: [
                new Group({
                    title: 'Work',
                    todoId: '',
                    order: 0,
                    tasks: [
                        new Task({
                            title: 'Meeting',
                            groupId: '',
                            order: 0,
                            completed: false
                        })
                    ]
                }),
                new Group({
                    title: 'Personal',
                    todoId: '',
                    order: 1,
                    tasks: [
                        new Task({
                            title: 'Exercise',
                            groupId: '',
                            order: 0,
                            completed: false
                        })
                    ]
                })
            ]
        };

        // Save the todo
        const todo = provider.createTodo(todoData);
        expect(todo.groups).toHaveLength(2);
        expect(todo.groups[0].title).toBe('Work');
        expect(todo.groups[0].tasks).toHaveLength(1);
        expect(todo.groups[0].tasks[0].title).toBe('Meeting');
        expect(todo.groups[1].title).toBe('Personal');
        expect(todo.groups[1].tasks).toHaveLength(1);
        expect(todo.groups[1].tasks[0].title).toBe('Exercise');

        // Add new task (emailTask) to workGroup
        const workGroup = todo.groups[0];
        const emailTask = new Task({
            title: 'Send Email',
            groupId: workGroup.id,
            order: workGroup.tasks.length,
            completed: false
        });
        workGroup.addTask(emailTask);

        // Update todo
        provider.updateTodo(todo.id, {
            groups: todo.groups
        });

        // Verify emailTask was added
        let updatedTodo = provider.getTodo(todo.id);
        expect(updatedTodo?.groups[0].tasks).toHaveLength(2);
        expect(updatedTodo?.groups[0].tasks[1].title).toBe('Send Email');

        // Move emailTask from workGroup to personalGroup
        const personalGroup = todo.groups[1];
        provider.moveTaskBetweenGroups(todo.id, emailTask.id, personalGroup.id, 1);

        // Verify task movement
        updatedTodo = provider.getTodo(todo.id);
        expect(updatedTodo?.groups[0].tasks).toHaveLength(1);
        expect(updatedTodo?.groups[0].tasks[0].title).toBe('Meeting');
        expect(updatedTodo?.groups[1].tasks).toHaveLength(2);
        expect(updatedTodo?.groups[1].tasks[1].title).toBe('Send Email');

        // Toggle completion of meeting and emailTask
        const meetingTask = updatedTodo?.groups[0].tasks[0];
        const movedEmailTask = updatedTodo?.groups[1].tasks.find(t => t.title === 'Send Email');
        if (meetingTask && movedEmailTask) {
            meetingTask.toggleComplete();
            movedEmailTask.toggleComplete();

            // Update todo with modified tasks
            provider.updateTodo(todo.id, {
                groups: updatedTodo?.groups
            });
        }

        // Verify final state
        updatedTodo = provider.getTodo(todo.id);
        expect(updatedTodo?.groups[1].title).toBe('Personal');
        expect(updatedTodo?.groups[1].tasks).toHaveLength(2);
        expect(updatedTodo?.groups[1].tasks[0].title).toBe('Exercise');
        expect(updatedTodo?.groups[1].tasks[0].completed).toBe(false);
        expect(updatedTodo?.groups[1].tasks[1].title).toBe('Send Email');
        expect(updatedTodo?.groups[1].tasks[1].completed).toBe(true);
        expect(updatedTodo?.groups[0].tasks[0].title).toBe('Meeting');
        expect(updatedTodo?.groups[0].tasks[0].completed).toBe(true);
    });
});
