import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LocalStorageDataProvider } from './localStorageDataProvider';
import { Group, Task } from '../models';
import type { TodoData, NoteData, TaskData, } from '../models';

describe('LocalStorageDataProvider - Extended Tests', () => {
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

    describe('Advanced Todo Operations', () => {
        it('should handle todos with empty groups array', () => {

            const todoData: TodoData = {
                date: '2025-07-30',
                title: 'Empty Groups Todo',
                groups: []
            };

            const todo = provider.createTodo(todoData);
            expect(todo.groups).toEqual([]);

            const retrieved = provider.getTodo(todo.id);
            expect(retrieved?.groups).toEqual([]);
        });

        it('should handle todos with null/undefined optional fields', () => {
            const todoData: TodoData = {
                date: '2025-07-30',
                title: 'Minimal Todo'
            };

            const todo = provider.createTodo(todoData);
            expect(todo.title).toBe('Minimal Todo');
            expect(todo.date).toBe('2025-07-30');
            expect(todo.groups).toBeDefined();
        });

        it('should update todos with partial data', () => {
            const todo = provider.createTodo({
                date: '2025-07-30',
                title: 'Original Title',
                groups: [new Group({ title: 'Group 1', todoId: '', order: 0 })]
            });

            // Update only title
            provider.updateTodo(todo.id, { title: 'New Title' });
            let updated = provider.getTodo(todo.id);
            expect(updated?.title).toBe('New Title');
            expect(updated?.date).toBe('2025-07-30');
            expect(updated?.groups).toHaveLength(1);

            // Update only date
            provider.updateTodo(todo.id, { date: '2025-08-01' });
            updated = provider.getTodo(todo.id);
            expect(updated?.title).toBe('New Title');
            expect(updated?.date).toBe('2025-08-01');
        });

        it('should handle complex filtering with multiple criteria', () => {
            provider.createTodo({
                date: '2025-07-30',
                title: 'Work Tasks',
                groups: [new Group({ title: 'Urgent', todoId: '', order: 0 })]
            });
            provider.createTodo({
                date: '2025-07-31',
                title: 'Personal Tasks',
                groups: [new Group({ title: 'Leisure', todoId: '', order: 0 })]
            });
            provider.createTodo({
                date: '2025-07-30',
                title: 'Work Meeting',
                groups: []
            });

            const filtered = provider.getTodos({
                filters: {
                    date: '2025-07-30',
                    title: 'Work'
                }
            });

            expect(filtered).toHaveLength(2);
            expect(filtered.every(t => t.date === '2025-07-30' && t.title.includes('Work'))).toBe(true);
        });

        it('should handle ordering by different fields', () => {
            const todo1 = provider.createTodo({ date: '2025-07-30', title: 'B Task' });
            const todo2 = provider.createTodo({ date: '2025-07-29', title: 'A Task' });
            const todo3 = provider.createTodo({ date: '2025-07-31', title: 'C Task' });

            expect([todo1, todo2, todo3]).toHaveLength(3);

            // Order by title ascending
            let ordered = provider.getTodos({
                orderBy: 'title',
                orderDirection: 'asc'
            });
            expect(ordered.map(t => t.title)).toEqual(['A Task', 'B Task', 'C Task']);

            // Order by date descending
            ordered = provider.getTodos({
                orderBy: 'date',
                orderDirection: 'desc'
            });
            expect(ordered.map(t => t.date)).toEqual(['2025-07-31', '2025-07-30', '2025-07-29']);
        });

        it('should respect limit parameter', () => {
            for (let i = 0; i < 5; i++) {
                provider.createTodo({
                    date: '2025-07-30',
                    title: `Todo ${i}`
                });
            }

            const limited = provider.getTodos({ limit: 3 });
            expect(limited).toHaveLength(3);
        });

        it('should return null for non-existent todo', () => {
            const nonExistent = provider.getTodo('non-existent-id');
            expect(nonExistent).toBeNull();
        });

        it('should throw error when updating non-existent todo', () => {
            expect(() => {
                provider.updateTodo('non-existent-id', { title: 'New Title' });
            }).toThrow();
        });

        it('should handle deleting non-existent todo gracefully', () => {
            expect(() => {
                provider.deleteTodo('non-existent-id');
            }).not.toThrow();
        });
    });

    describe('Advanced Note Operations', () => {
        it('should handle notes with all optional fields', () => {
            const noteData: NoteData = {
                text: 'Full Note',
                color: '#ff0000',
                position: { x: 150, y: 250 },
                tags: ['work', 'important'],
                width: 200,
                height: 100
            };

            const note = provider.createNote(noteData);
            expect(note.text).toBe('Full Note');
            expect(note.color).toBe('#ff0000');
            expect(note.position).toEqual({ x: 150, y: 250 });
            expect(note.tags).toEqual(['work', 'important']);
            expect(note.width).toBe(200);
            expect(note.height).toBe(100);
        });

        it('should handle notes with minimal required fields', () => {
            const noteData: NoteData = {
                text: 'Simple Note',
                color: '#ffffff',
                position: { x: 0, y: 0 }
            };

            const note = provider.createNote(noteData);
            expect(note.text).toBe('Simple Note');
            expect(note.color).toBe('#ffffff');
            expect(note.position).toEqual({ x: 0, y: 0 });
        });

        it('should filter notes by tags', () => {
            provider.createNote({
                text: 'Work Note',
                color: '#ffffff',
                position: { x: 0, y: 0 },
                tags: ['work', 'urgent']
            });
            provider.createNote({
                text: 'Personal Note',
                color: '#ffffff',
                position: { x: 0, y: 0 },
                tags: ['personal']
            });
            provider.createNote({
                text: 'Work Meeting',
                color: '#ffffff',
                position: { x: 0, y: 0 },
                tags: ['work', 'meeting']
            });

            const workNotes = provider.getNotes({
                filters: { tags: ['work'] }
            });

            expect(workNotes).toHaveLength(2);
            expect(workNotes.every(n => n.tags?.includes('work'))).toBe(true);
        });

        it('should filter notes by multiple tags', () => {
            provider.createNote({
                text: 'Urgent Work',
                color: '#ffffff',
                position: { x: 0, y: 0 },
                tags: ['work', 'urgent']
            });
            provider.createNote({
                text: 'Regular Work',
                color: '#ffffff',
                position: { x: 0, y: 0 },
                tags: ['work']
            });

            const urgentWorkNotes = provider.getNotes({
                filters: { tags: ['work', 'urgent'] }
            });

            expect(urgentWorkNotes).toHaveLength(1);
            expect(urgentWorkNotes[0].text).toBe('Urgent Work');
        });

        it('should filter notes by color', () => {
            provider.createNote({
                text: 'Red Note',
                color: '#ff0000',
                position: { x: 0, y: 0 }
            });
            provider.createNote({
                text: 'Blue Note',
                color: '#0000ff',
                position: { x: 0, y: 0 }
            });

            const redNotes = provider.getNotes({
                filters: { color: '#ff0000' }
            });

            expect(redNotes).toHaveLength(1);
            expect(redNotes[0].text).toBe('Red Note');
        });

        it('should update note position', () => {
            const note = provider.createNote({
                text: 'Movable Note',
                color: '#ffffff',
                position: { x: 100, y: 100 }
            });

            provider.updateNote(note.id, {
                position: { x: 200, y: 300 }
            });

            const updated = provider.getNote(note.id);
            expect(updated?.position).toEqual({ x: 200, y: 300 });
        });

        it('should return null for non-existent note', () => {
            const nonExistent = provider.getNote('non-existent-id');
            expect(nonExistent).toBeNull();
        });

        it('should throw error when updating non-existent note', () => {
            expect(() => {
                provider.updateNote('non-existent-id', { text: 'New Text' });
            }).toThrow();
        });
    });

    describe('Complex Group and Task Operations', () => {
        it('should handle moving task to same group at different position', () => {
            const todo = provider.createTodo({
                date: '2025-07-30',
                title: 'Test Todo',
                groups: [
                    new Group({
                        title: 'Group 1',
                        todoId: '',
                        order: 0,
                        tasks: [
                            new Task({ title: 'Task 1', groupId: '', order: 0 } as TaskData),
                            new Task({ title: 'Task 2', groupId: '', order: 1 } as TaskData),
                            new Task({ title: 'Task 3', groupId: '', order: 2 } as TaskData)
                        ]
                    })
                ]
            });

            const group = todo.groups[0];
            const task2 = group.tasks[1];

            // Move Task 2 to position 0 (beginning of same group)
            const result = provider.moveTaskBetweenGroups(todo.id, task2.id, group.id, 0);
            expect(result).toBe(true);

            const updated = provider.getTodo(todo.id);
            expect(updated).not.toBeNull(); // Ensure todo exists

            const updatedGroup = updated?.groups[0];
            expect(updatedGroup).toBeDefined(); // Ensure group exists

            // Verify task titles and order
            expect(updatedGroup?.tasks).toHaveLength(3);
            expect(updatedGroup?.tasks[0].title).toBe('Task 2');
            expect(updatedGroup?.tasks[0].order).toBe(0);
            expect(updatedGroup?.tasks[1].title).toBe('Task 1');
            expect(updatedGroup?.tasks[1].order).toBe(1);
            expect(updatedGroup?.tasks[2].title).toBe('Task 3');
            expect(updatedGroup?.tasks[2].order).toBe(2);
        });

        it('should handle moving task to end of target group', () => {
            const todo = provider.createTodo({
                date: '2025-07-30',
                title: 'Test Todo',
                groups: [
                    new Group({
                        title: 'Source',
                        todoId: '',
                        order: 0,
                        tasks: [
                            new Task({ title: 'Task A', groupId: '', order: 0 } as TaskData)
                        ]
                    }),
                    new Group({
                        title: 'Target',
                        todoId: '',
                        order: 1,
                        tasks: [
                            new Task({ title: 'Task B', groupId: '', order: 0 } as TaskData),
                            new Task({ title: 'Task C', groupId: '', order: 1 } as TaskData)
                        ]
                    })
                ]
            });

            const sourceGroup = todo.groups[0];
            const targetGroup = todo.groups[1];
            const taskA = sourceGroup.tasks[0];

            // Move to end of target group
            provider.moveTaskBetweenGroups(todo.id, taskA.id, targetGroup.id, 2);

            const updated = provider.getTodo(todo.id);
            expect(updated?.groups[0].tasks).toHaveLength(0);
            expect(updated?.groups[1].tasks).toHaveLength(3);
            expect(updated?.groups[1].tasks[2].title).toBe('Task A');
        });

        it('should return false when moving non-existent task', () => {
            const todo = provider.createTodo({
                date: '2025-07-30',
                title: 'Test Todo',
                groups: [
                    new Group({ title: 'Group 1', todoId: '', order: 0 }),
                    new Group({ title: 'Group 2', todoId: '', order: 1 })
                ]
            });

            const result = provider.moveTaskBetweenGroups(
                todo.id,
                'non-existent-task-id',
                todo.groups[1].id,
                0
            );

            expect(result).toBe(false);
        });

        it('should return false when moving task to non-existent group', () => {
            const todo = provider.createTodo({
                date: '2025-07-30',
                title: 'Test Todo',
                groups: [
                    new Group({
                        title: 'Group 1',
                        todoId: '',
                        order: 0,
                        tasks: [
                            new Task({ title: 'Task 1', groupId: '', order: 0 } as TaskData)
                        ]
                    })
                ]
            });

            const task = todo.groups[0].tasks[0];
            const result = provider.moveTaskBetweenGroups(
                todo.id,
                task.id,
                'non-existent-group-id',
                0
            );

            expect(result).toBe(false);
        });

        it('should handle reordering with invalid task IDs', () => {
            const todo = provider.createTodo({
                date: '2025-07-30',
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
            const originalTaskIds = group.tasks.map(t => t.id);

            // Try to reorder with some invalid IDs
            const invalidTaskIds = [...originalTaskIds, 'invalid-id'];

            provider.reorderTasksInGroup(todo.id, group.id, invalidTaskIds);

            // Should maintain original order since reordering failed
            const updated = provider.getTodo(todo.id);
            const updatedTaskIds = updated?.groups[0].tasks.map(t => t.id);
            expect(updatedTaskIds).toEqual(originalTaskIds);
        });

        it('should handle reordering groups with invalid IDs', () => {
            const todo = provider.createTodo({
                date: '2025-07-30',
                title: 'Test Todo',
                groups: [
                    new Group({ title: 'Group 1', todoId: '', order: 0 }),
                    new Group({ title: 'Group 2', todoId: '', order: 1 })
                ]
            });

            const originalGroupIds = todo.groups.map(g => g.id);
            const invalidGroupIds = [...originalGroupIds, 'invalid-id'];

            provider.reorderGroupsInTodo(todo.id, invalidGroupIds);

            // Should maintain original order
            const updated = provider.getTodo(todo.id);
            const updatedGroupIds = updated?.groups.map(g => g.id);
            expect(updatedGroupIds).toEqual(originalGroupIds);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty localStorage gracefully', () => {
            // Ensure localStorage is empty
            localStorage.clear();

            expect(provider.getTodos()).toEqual([]);
            expect(provider.getNotes()).toEqual([]);
            expect(provider.getAllData()).toEqual({ todos: [], notes: [] });
        });

        it('should handle operations on disconnected provider', () => {
            provider.disconnect();

            expect(() => provider.getTodo('any-id')).toThrow('Data provider is not connected');
            expect(() => provider.updateTodo('any-id', {})).toThrow('Data provider is not connected');
            expect(() => provider.deleteTodo('any-id')).toThrow('Data provider is not connected');
            expect(() => provider.getNote('any-id')).toThrow('Data provider is not connected');
            expect(() => provider.createNote({
                text: 'test',
                color: '#ffffff',
                position: { x: 0, y: 0 }
            })).toThrow('Data provider is not connected');
            expect(() => provider.updateNote('any-id', {})).toThrow('Data provider is not connected');
            expect(() => provider.deleteNote('any-id')).toThrow('Data provider is not connected');
            expect(() => provider.moveTaskBetweenGroups('todo-id', 'task-id', 'group-id', 0))
                .toThrow('Data provider is not connected');
            expect(() => provider.reorderTasksInGroup('todo-id', 'group-id', []))
                .toThrow('Data provider is not connected');
            expect(() => provider.reorderGroupsInTodo('todo-id', []))
                .toThrow('Data provider is not connected');
        });

        it('should handle null/undefined parameters gracefully', () => {
            expect(() => {
                provider.createTodo(null as any);
            }).toThrow();

            expect(() => {
                provider.createNote(null as any);
            }).toThrow();

            expect(() => {
                provider.updateTodo('valid-id', null as any);
            }).toThrow();
        });
    });

    describe('Data Persistence and Integrity', () => {
        it('should persist data across provider reconnections', () => {
            // Create some data
            const todo = provider.createTodo({
                date: '2025-07-30',
                title: 'Persistent Todo'
            });
            const note = provider.createNote({
                text: 'Persistent Note',
                color: '#ffffff',
                position: { x: 100, y: 100 }
            });

            // Disconnect and reconnect
            provider.disconnect();
            expect(provider.isConnected()).toBe(false);

            provider.connect();
            expect(provider.isConnected()).toBe(true);

            // Verify data is still there
            const retrievedTodo = provider.getTodo(todo.id);
            const retrievedNote = provider.getNote(note.id);

            expect(retrievedTodo?.title).toBe('Persistent Todo');
            expect(retrievedNote?.text).toBe('Persistent Note');
        });

        it('should maintain data integrity after multiple operations', () => {
            const todo = provider.createTodo({
                date: '2025-07-30',
                title: 'Complex Todo',
                groups: [
                    new Group({
                        title: 'Group A',
                        todoId: '',
                        order: 0,
                        tasks: [
                            new Task({ title: 'Task 1', groupId: '', order: 0 } as TaskData),
                            new Task({ title: 'Task 2', groupId: '', order: 1 } as TaskData)
                        ]
                    }),
                    new Group({
                        title: 'Group B',
                        todoId: '',
                        order: 1,
                        tasks: []
                    })
                ]
            });

            const originalTodoId = todo.id;
            const originalGroupAId = todo.groups[0].id;
            const originalGroupBId = todo.groups[1].id;
            const originalTask1Id = todo.groups[0].tasks[0].id;
            const originalTask2Id = todo.groups[0].tasks[1].id;

            // Perform multiple operations
            provider.moveTaskBetweenGroups(todo.id, originalTask1Id, originalGroupBId, 0);
            provider.updateTodo(todo.id, { title: 'Updated Complex Todo' });
            provider.reorderGroupsInTodo(todo.id, [originalGroupBId, originalGroupAId]);

            // Verify final state
            const final = provider.getTodo(todo.id);
            expect(final?.id).toBe(originalTodoId);
            expect(final?.title).toBe('Updated Complex Todo');
            expect(final?.groups[0].id).toBe(originalGroupBId);
            expect(final?.groups[1].id).toBe(originalGroupAId);
            expect(final?.groups[0].tasks[0].id).toBe(originalTask1Id);
            expect(final?.groups[1].tasks[0].id).toBe(originalTask2Id);
        });

        describe('Performance and Limits', () => {
            it('should handle large numbers of todos efficiently', () => {
                const startTime = Date.now();

                // Create 100 todos
                for (let i = 0; i < 100; i++) {
                    provider.createTodo({
                        date: '2025-07-30',
                        title: `Todo ${i}`,
                        groups: [
                            new Group({
                                title: `Group ${i}`,
                                todoId: '',
                                order: 0,
                                tasks: [
                                    new Task({ title: `Task ${i}`, groupId: '', order: 0 } as TaskData)
                                ]
                            })
                        ]
                    });
                }

                const createTime = Date.now() - startTime;

                // Retrieve all todos
                const retrieveStart = Date.now();
                const todos = provider.getTodos();
                const retrieveTime = Date.now() - retrieveStart;

                expect(todos).toHaveLength(100);
                expect(createTime).toBeLessThan(1000); // Should create 100 todos in under 1 second
                expect(retrieveTime).toBeLessThan(100); // Should retrieve in under 100ms
            });

            it('should handle large numbers of notes efficiently', () => {
                const startTime = Date.now();

                // Create 100 notes
                for (let i = 0; i < 100; i++) {
                    provider.createNote({
                        text: `Note ${i}`,
                        color: `#${i.toString(16).padStart(6, '0')}`,
                        position: { x: i * 10, y: i * 5 },
                        tags: [`tag${i % 5}`]
                    });
                }

                const createTime = Date.now() - startTime;

                // Filter notes
                const filterStart = Date.now();
                const filteredNotes = provider.getNotes({
                    filters: { tags: ['tag0'] }
                });
                const filterTime = Date.now() - filterStart;

                expect(filteredNotes).toHaveLength(20); // Every 5th note should have tag0
                expect(createTime).toBeLessThan(1000);
                expect(filterTime).toBeLessThan(100);
            });
        });
    });
});
