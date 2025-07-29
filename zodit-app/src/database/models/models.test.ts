import { describe, it, expect, beforeEach } from 'vitest';
import { ModelFactory } from './index';
import { Task, Group, Todo, Note } from './index';
import type { TaskData, GroupData, TodoData, NoteData } from './index';

describe('ModelFactory', () => {
    describe('createFromJSON', () => {
        it('should create Task from JSON', () => {
            const taskData = {
                id: 'task-1',
                title: 'Test Task',
                completed: false,
                groupId: 'group-1',
                order: 0,
                customFields: { url: 'https://example.com' },
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            };

            const task = ModelFactory.createFromJSON(Task, taskData) as Task;

            expect(task).toBeInstanceOf(Task);
            expect(task.id).toBe('task-1');
            expect(task.title).toBe('Test Task');
            expect(task.customFields.url).toBe('https://example.com');
            expect(task.createdAt).toBeInstanceOf(Date);
        });

        it('should create Group from JSON', () => {
            const groupData = {
                id: 'group-1',
                title: 'Test Group',
                todoId: 'todo-1',
                order: 0,
                tasks: [],
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            };

            const group = ModelFactory.createFromJSON(Group, groupData) as Group;

            expect(group).toBeInstanceOf(Group);
            expect(group.id).toBe('group-1');
            expect(group.title).toBe('Test Group');
            expect(group.tasks).toEqual([]);
        });
    });

    describe('createTask', () => {
        it('should create a basic task', () => {
            const taskData: TaskData = {
                title: 'New Task',
                completed: false,
                groupId: 'group-1',
                order: 0
            };

            const task = ModelFactory.createTask(taskData);

            expect(task).toBeInstanceOf(Task);
            expect(task.title).toBe('New Task');
            expect(task.completed).toBe(false);
            expect(task.groupId).toBe('group-1');
            expect(task.order).toBe(0);
            expect(task.id).toMatch(/^task:/);
        });

        it('should create task with custom fields', () => {
            const taskData: TaskData = {
                title: 'Task with Custom Fields',
                completed: false,
                groupId: 'group-1',
                order: 0,
                customFields: {
                    url: 'https://example.com',
                    helpfulUrls: ['https://docs.com', 'https://github.com'],
                    priority_score: 85
                }
            };

            const task = ModelFactory.createTask(taskData);

            expect(task.customFields.url).toBe('https://example.com');
            expect(task.customFields.helpfulUrls).toEqual(['https://docs.com', 'https://github.com']);
            expect(task.customFields.priority_score).toBe(85);
        });
    });

    describe('createGroup', () => {
        it('should create a basic group', () => {
            const groupData: GroupData = {
                title: 'New Group',
                todoId: 'todo-1',
                order: 0
            };

            const group = ModelFactory.createGroup(groupData);

            expect(group).toBeInstanceOf(Group);
            expect(group.title).toBe('New Group');
            expect(group.todoId).toBe('todo-1');
            expect(group.order).toBe(0);
            expect(group.tasks).toEqual([]);
            expect(group.id).toMatch(/^group:/);
        });

        it('should create group with tasks and fix ordering', () => {
            const groupData: GroupData = {
                title: 'Group with Tasks',
                todoId: 'todo-1',
                order: 0,
                tasks: [
                    { title: 'Task 1', completed: false, groupId: '', order: 2 },
                    { title: 'Task 2', completed: true, groupId: '', order: 5 },
                    { title: 'Task 3', completed: false, groupId: '', order: 1 }
                ] as Task[]
            };

            const group = ModelFactory.createGroup(groupData);

            expect(group.tasks).toHaveLength(3);

            // Should fix task ordering to be sequential (0, 1, 2)
            expect(group.tasks[0].order).toBe(0);
            expect(group.tasks[1].order).toBe(1);
            expect(group.tasks[2].order).toBe(2);

            // Should assign correct groupId to all tasks
            group.tasks.forEach(task => {
                expect(task.groupId).toBe(group.id);
            });
        });
    });

    describe('createTodo', () => {
        it('should create a basic todo', () => {
            const todoData: TodoData = {
                date: '2025-07-27'
            };

            const todo = ModelFactory.createTodo(todoData);

            expect(todo).toBeInstanceOf(Todo);
            expect(todo.date).toBe('2025-07-27');
            expect(todo.title).toBe('Todo for 2025-07-27');
            expect(todo.groups).toEqual([]);
            expect(todo.id).toMatch(/^todo:/);
        });

        it('should create todo with groups and tasks, fixing all ordering', () => {
            const todoData: TodoData = {
                date: '2025-07-27',
                title: 'Complex Todo',
                groups: [
                    {
                        title: 'Group 1',
                        todoId: '',
                        order: 1,
                        tasks: [
                            { title: 'Task 1.1', completed: false, groupId: '', order: 0 },
                            { title: 'Task 1.2', completed: true, groupId: '', order: 1 }
                        ] as Task[]
                    } as Group,
                    {
                        title: 'Group 2',
                        todoId: '',
                        order: 0,
                        tasks: [
                            { title: 'Task 2.1', completed: false, groupId: '', order: 0 }
                        ] as Task[]
                    } as Group
                ]
            };

            const todo = ModelFactory.createTodo(todoData);

            expect(todo.groups).toHaveLength(2);

            // Should fix group ordering
            expect(todo.groups[0].order).toBe(0);
            expect(todo.groups[1].order).toBe(1);

            // Should assign correct todoId to all groups
            todo.groups.forEach(group => {
                expect(group.todoId).toBe(todo.id);
            });

            // Should assign correct groupId to all tasks and fix ordering
            todo.groups.forEach(group => {
                group.tasks.forEach((task, index) => {
                    expect(task.groupId).toBe(group.id);
                    expect(task.order).toBe(index);
                });
            });
        });
    });

    describe('createNote', () => {
        it('should create a basic note', () => {
            const noteData: NoteData = {
                text: 'Test note',
                color: 'bg-yellow-200',
                position: { x: 100, y: 200 }
            };

            const note = ModelFactory.createNote(noteData);

            expect(note).toBeInstanceOf(Note);
            expect(note.text).toBe('Test note');
            expect(note.color).toBe('bg-yellow-200');
            expect(note.position).toEqual({ x: 100, y: 200 });
            expect(note.width).toBe(220); // default
            expect(note.height).toBe(180); // default
            expect(note.id).toMatch(/^note:/);
        });
    });

    describe('buildTodoFromFlatData', () => {
        let todo: Todo;
        let groups: Group[];
        let tasks: Task[];

        beforeEach(() => {
            todo = new Todo({ date: '2025-07-27' });

            groups = [
                new Group({ title: 'Group 1', todoId: todo.id, order: 0 }),
                new Group({ title: 'Group 2', todoId: todo.id, order: 1 }),
                new Group({ title: 'Other Todo Group', todoId: 'other-todo', order: 0 }) // Should be filtered out
            ];

            tasks = [
                new Task({ title: 'Task 1.1', completed: false, groupId: groups[0].id, order: 1 }),
                new Task({ title: 'Task 1.2', completed: true, groupId: groups[0].id, order: 0 }),
                new Task({ title: 'Task 2.1', completed: false, groupId: groups[1].id, order: 0 }),
                new Task({ title: 'Other Group Task', completed: false, groupId: groups[2].id, order: 0 }) // Should be filtered out
            ];
        });

        it('should build todo from flat data correctly', () => {
            const result = ModelFactory.buildTodoFromFlatData(todo, groups, tasks);

            expect(result).toBe(todo); // Same instance
            expect(result.groups).toHaveLength(2); // Only groups for this todo

            // Check group ordering
            expect(result.groups[0].title).toBe('Group 1');
            expect(result.groups[1].title).toBe('Group 2');

            // Check tasks are properly attached and ordered
            expect(result.groups[0].tasks).toHaveLength(2);
            expect(result.groups[0].tasks[0].title).toBe('Task 1.2'); // order 0
            expect(result.groups[0].tasks[1].title).toBe('Task 1.1'); // order 1

            expect(result.groups[1].tasks).toHaveLength(1);
            expect(result.groups[1].tasks[0].title).toBe('Task 2.1');

            // Verify ordering was fixed
            result.groups.forEach((group, groupIndex) => {
                expect(group.order).toBe(groupIndex);
                group.tasks.forEach((task, taskIndex) => {
                    expect(task.order).toBe(taskIndex);
                });
            });
        });
    });

    describe('validateAndFix', () => {
        it('should validate and fix todo ordering', () => {
            const todo = new Todo({ date: '2025-07-27' });

            // Create groups with wrong ordering
            const group1 = new Group({ title: 'Group 1', todoId: todo.id, order: 2 });
            const group2 = new Group({ title: 'Group 2', todoId: todo.id, order: 1 });

            // Add tasks with wrong ordering
            group1.tasks = [
                new Task({ title: 'Task 1', completed: false, groupId: group1.id, order: 3 }),
                new Task({ title: 'Task 2', completed: false, groupId: group1.id, order: 1 })
            ];

            todo.groups = [group1, group2];

            const result = ModelFactory.validateAndFix(todo);

            expect(result.isValid).toBe(true);
            expect(todo.groups[0].order).toBe(0);
            expect(todo.groups[1].order).toBe(1);
            expect(todo.groups[1].tasks[0].order).toBe(0);
            expect(todo.groups[1].tasks[1].order).toBe(1);
        });

        it('should validate and fix group ordering', () => {
            const group = new Group({ title: 'Test Group', todoId: 'todo-1', order: 0 });

            // Add tasks with wrong ordering
            group.tasks = [
                new Task({ title: 'Task 1', completed: false, groupId: group.id, order: 5 }),
                new Task({ title: 'Task 2', completed: false, groupId: group.id, order: 2 }),
                new Task({ title: 'Task 3', completed: false, groupId: group.id, order: 8 })
            ];

            const result = ModelFactory.validateAndFix(group);

            expect(result.isValid).toBe(true);
            expect(group.tasks[0].order).toBe(0);
            expect(group.tasks[1].order).toBe(1);
            expect(group.tasks[2].order).toBe(2);
        });
    });

    describe('createCompleteTodo', () => {
        it('should create a complete todo structure', () => {
            const data = {
                date: '2025-07-27',
                title: 'Work Day',
                groups: [
                    {
                        title: 'Morning Tasks',
                        color: 'blue',
                        tasks: [
                            {
                                title: 'Standup Meeting',
                                priority: 'high' as const,
                                customFields: { url: 'https://zoom.us/meeting' }
                            },
                            {
                                title: 'Review PRs',
                                completed: true,
                                tags: ['development', 'review']
                            }
                        ]
                    },
                    {
                        title: 'Afternoon Tasks',
                        tasks: [
                            {
                                title: 'Client Meeting',
                                description: 'Quarterly review',
                                startTime: '14:00',
                                endDate: '2025-07-27'
                            }
                        ]
                    }
                ]
            };

            const todo = ModelFactory.createCompleteTodo(data);

            expect(todo.date).toBe('2025-07-27');
            expect(todo.title).toBe('Work Day');
            expect(todo.groups).toHaveLength(2);

            // Check first group
            const morningGroup = todo.groups[0];
            expect(morningGroup.title).toBe('Morning Tasks');
            expect(morningGroup.color).toBe('blue');
            expect(morningGroup.order).toBe(0);
            expect(morningGroup.tasks).toHaveLength(2);

            // Check first task
            const standupTask = morningGroup.tasks[0];
            expect(standupTask.title).toBe('Standup Meeting');
            expect(standupTask.priority).toBe('high');
            expect(standupTask.customFields.url).toBe('https://zoom.us/meeting');
            expect(standupTask.order).toBe(0);
            expect(standupTask.groupId).toBe(morningGroup.id);

            // Check second task
            const reviewTask = morningGroup.tasks[1];
            expect(reviewTask.title).toBe('Review PRs');
            expect(reviewTask.completed).toBe(true);
            expect(reviewTask.tags).toEqual(['development', 'review']);

            // Check second group
            const afternoonGroup = todo.groups[1];
            expect(afternoonGroup.title).toBe('Afternoon Tasks');
            expect(afternoonGroup.order).toBe(1);

            // Check client meeting task
            const clientTask = afternoonGroup.tasks[0];
            expect(clientTask.title).toBe('Client Meeting');
            expect(clientTask.description).toBe('Quarterly review');
            expect(clientTask.startTime).toBe('14:00');
            expect(clientTask.endDate).toBe('2025-07-27');
        });
    });

    describe('cloneTodo', () => {
        let originalTodo: Todo;

        beforeEach(() => {
            originalTodo = ModelFactory.createCompleteTodo({
                date: '2025-07-27',
                title: 'Original Todo',
                groups: [
                    {
                        title: 'Work',
                        tasks: [
                            {
                                title: 'Task 1',
                                completed: true,
                                customFields: { url: 'https://example.com' }
                            }
                        ]
                    }
                ]
            });
        });

        it('should clone todo with same date', () => {
            const cloned = ModelFactory.cloneTodo(originalTodo);

            expect(cloned.id).not.toBe(originalTodo.id);
            expect(cloned.date).toBe(originalTodo.date);
            expect(cloned.title).toBe(originalTodo.title);
            expect(cloned.groups).toHaveLength(1);
            expect(cloned.groups[0].id).not.toBe(originalTodo.groups[0].id);
            expect(cloned.groups[0].title).toBe(originalTodo.groups[0].title);
            expect(cloned.groups[0].tasks[0].id).not.toBe(originalTodo.groups[0].tasks[0].id);
            expect(cloned.groups[0].tasks[0].title).toBe(originalTodo.groups[0].tasks[0].title);
        });

        it('should clone todo with new date', () => {
            const newDate = '2025-07-28';
            const cloned = ModelFactory.cloneTodo(originalTodo, newDate);

            expect(cloned.date).toBe(newDate);
            expect(cloned.title).toBe(originalTodo.title);
        });

        it('should preserve custom fields in cloned tasks', () => {
            const cloned = ModelFactory.cloneTodo(originalTodo);

            expect(cloned.groups[0].tasks[0].customFields.url).toBe('https://example.com');
        });
    });

    describe('mergeTodos', () => {
        it('should merge template into base todo', () => {
            const baseTodo = ModelFactory.createCompleteTodo({
                date: '2025-07-27',
                groups: [
                    {
                        title: 'Existing Group',
                        tasks: [{ title: 'Existing Task', completed: false }]
                    }
                ]
            });

            const templateTodo = ModelFactory.createCompleteTodo({
                date: '2025-07-27',
                groups: [
                    {
                        title: 'Existing Group', // Same name - should merge
                        tasks: [{ title: 'Template Task 1', completed: false }]
                    },
                    {
                        title: 'New Group', // Different name - should add
                        tasks: [{ title: 'Template Task 2', completed: false }]
                    }
                ]
            });

            const merged = ModelFactory.mergeTodos(baseTodo, templateTodo);

            expect(merged.groups).toHaveLength(2);

            // Check existing group was merged
            const existingGroup = merged.groups.find(g => g.title === 'Existing Group');
            expect(existingGroup).toBeDefined();
            expect(existingGroup!.tasks).toHaveLength(2);
            expect(existingGroup!.tasks[0].title).toBe('Existing Task');
            expect(existingGroup!.tasks[1].title).toBe('Template Task 1');

            // Check new group was added
            const newGroup = merged.groups.find(g => g.title === 'New Group');
            expect(newGroup).toBeDefined();
            expect(newGroup!.tasks).toHaveLength(1);
            expect(newGroup!.tasks[0].title).toBe('Template Task 2');
        });
    });

    describe('createTemplate', () => {
        it('should create template from todo', () => {
            const originalTodo = ModelFactory.createCompleteTodo({
                date: '2025-07-27',
                title: 'Personal Day',
                groups: [
                    {
                        title: 'Work',
                        tasks: [
                            {
                                title: 'Important Meeting: Q4 Planning',
                                description: 'Discuss quarterly goals',
                                completed: true,
                                startDate: '2025-07-27',
                                endDate: '2025-07-28',
                                startTime: '10:00'
                            },
                            {
                                title: 'Simple Task',
                                completed: false
                            }
                        ]
                    }
                ]
            });

            const template = ModelFactory.createTemplate(originalTodo, 'Daily Template');

            expect(template.title).toBe('Daily Template');
            expect(template.id).not.toBe(originalTodo.id);

            const templateTask1 = template.groups[0].tasks[0];
            expect(templateTask1.title).toBe('Important Meeting: [TODO]'); // Colon-separated title
            expect(templateTask1.description).toBe('[Description]'); // Generic description
            expect(templateTask1.completed).toBe(false); // Reset completion
            expect(templateTask1.startDate).toBeUndefined(); // Remove dates
            expect(templateTask1.endDate).toBeUndefined();
            expect(templateTask1.startTime).toBeUndefined();

            const templateTask2 = template.groups[0].tasks[1];
            expect(templateTask2.title).toBe('[TODO]'); // No colon, simple replacement
            expect(templateTask2.completed).toBe(false);
        });
    });

    describe('error handling', () => {
        it('should handle invalid task data gracefully', () => {
            // Create task with invalid data - should create but validation should fail
            const task = ModelFactory.createTask({
                title: '',
                completed: false,
                groupId: '', // Empty groupId
                order: -1 // Negative order
            });

            const validation = task.validate();
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        it('should handle validation errors in createCompleteTodo', () => {
            const invalidTodo = ModelFactory.createCompleteTodo({
                date: 'invalid-date-format', // Should cause validation error
                groups: []
            });

            const validation = invalidTodo.validate();
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some(error => error.includes('date'))).toBe(true);
        });

        it('should handle custom field validation errors', () => {
            const task = ModelFactory.createTask({
                title: 'Test Task',
                completed: false,
                groupId: 'group-1',
                order: 0,
                customFields: {
                    circularRef: {} // We'll create a circular reference
                }
            });

            // Create circular reference
            (task.customFields.circularRef as any).self = task.customFields.circularRef;

            expect(() => {
                task.setCustomField('newField', 'value'); // This should trigger validation
            }).toThrow();
        });
    });

    describe('real-world workflow scenarios', () => {
        describe('complete todo workflow', () => {
            let todo: Todo;
            let workGroup: Group;
            let personalGroup: Group;
            let meetingTask: Task;
            let emailTask: Task;
            let exerciseTask: Task;

            beforeEach(() => {
                // 1. Create todo
                todo = new Todo({ date: '2025-07-27', title: 'My Daily Todo' });
                expect(todo.groups).toHaveLength(0);
                expect(todo.getTotalTasksCount()).toBe(0);
            });

            it('should handle complete workflow: create todo, add groups, add tasks, reorder, move tasks', () => {
                // 2. Add groups
                workGroup = new Group({ title: 'Work Tasks', todoId: todo.id, order: 0 });
                personalGroup = new Group({ title: 'Personal Tasks', todoId: todo.id, order: 1 });

                todo.addGroup(workGroup);
                todo.addGroup(personalGroup);

                expect(todo.groups).toHaveLength(2);
                expect(todo.groups[0].title).toBe('Work Tasks');
                expect(todo.groups[1].title).toBe('Personal Tasks');
                expect(todo.groups[0].order).toBe(0);
                expect(todo.groups[1].order).toBe(1);

                // 3. Add tasks to work group
                meetingTask = new Task({
                    title: 'Team Standup',
                    completed: false,
                    groupId: workGroup.id,
                    order: 0,
                    priority: 'high',
                    customFields: { url: 'https://zoom.us/meeting/123' }
                });

                emailTask = new Task({
                    title: 'Answer emails',
                    completed: false,
                    groupId: workGroup.id,
                    order: 1,
                    priority: 'medium'
                });

                workGroup.addTask(meetingTask);
                workGroup.addTask(emailTask);

                expect(workGroup.tasks).toHaveLength(2);
                expect(workGroup.tasks[0].title).toBe('Team Standup');
                expect(workGroup.tasks[1].title).toBe('Answer emails');
                expect(workGroup.tasks[0].order).toBe(0);
                expect(workGroup.tasks[1].order).toBe(1);

                // Add task to personal group
                exerciseTask = new Task({
                    title: 'Morning Exercise',
                    completed: false,
                    groupId: personalGroup.id,
                    order: 0,
                    tags: ['health', 'routine']
                });

                personalGroup.addTask(exerciseTask);

                expect(personalGroup.tasks).toHaveLength(1);
                expect(todo.getTotalTasksCount()).toBe(3);

                // 4. Change task order within work group (swap meeting and email)
                const success = workGroup.moveTask(meetingTask.id, 1);
                expect(success).toBe(true);

                // Check new order
                expect(workGroup.tasks[0].title).toBe('Answer emails');
                expect(workGroup.tasks[1].title).toBe('Team Standup');
                expect(workGroup.tasks[0].order).toBe(0);
                expect(workGroup.tasks[1].order).toBe(1);

                // 5. Move task from work group to personal group
                const moveSuccess = todo.moveTaskBetweenGroups(emailTask.id, personalGroup.id, 0);
                expect(moveSuccess).toBe(true);

                // Check work group only has meeting task now
                expect(workGroup.tasks).toHaveLength(1);
                expect(workGroup.tasks[0].title).toBe('Team Standup');
                expect(workGroup.tasks[0].order).toBe(0); // Should be reordered to 0

                // Check personal group has both tasks now
                expect(personalGroup.tasks).toHaveLength(2);
                expect(personalGroup.tasks[0].title).toBe('Answer emails'); // Moved to index 0
                expect(personalGroup.tasks[1].title).toBe('Morning Exercise'); // Shifted to index 1
                expect(personalGroup.tasks[0].order).toBe(0);
                expect(personalGroup.tasks[1].order).toBe(1);

                // Verify task belongs to correct group
                expect(emailTask.groupId).toBe(personalGroup.id);

                // Final verification
                expect(todo.getTotalTasksCount()).toBe(3);
                expect(todo.getCompletedTasksCount()).toBe(0);
            });

            it('should handle task reordering with string array', () => {
                // Setup: Add tasks to work group
                const task1 = new Task({ title: 'Task 1', completed: false, groupId: workGroup.id, order: 0 });
                const task2 = new Task({ title: 'Task 2', completed: false, groupId: workGroup.id, order: 1 });
                const task3 = new Task({ title: 'Task 3', completed: false, groupId: workGroup.id, order: 2 });

                workGroup = new Group({ title: 'Work Tasks', todoId: todo.id, order: 0 });
                todo.addGroup(workGroup);

                workGroup.addTask(task1);
                workGroup.addTask(task2);
                workGroup.addTask(task3);

                // Reorder: [task1, task2, task3] -> [task3, task1, task2]
                const newOrder = [task3.id, task1.id, task2.id];
                workGroup.reorderTasks(newOrder);

                // Check new order
                expect(workGroup.tasks[0].title).toBe('Task 3');
                expect(workGroup.tasks[1].title).toBe('Task 1');
                expect(workGroup.tasks[2].title).toBe('Task 2');

                // Check order values are sequential
                expect(workGroup.tasks[0].order).toBe(0);
                expect(workGroup.tasks[1].order).toBe(1);
                expect(workGroup.tasks[2].order).toBe(2);
            });

            it('should handle group reordering', () => {
                workGroup = new Group({ title: 'Work Tasks', todoId: todo.id, order: 0 });
                personalGroup = new Group({ title: 'Personal Tasks', todoId: todo.id, order: 1 });
                const urgentGroup = new Group({ title: 'Urgent Tasks', todoId: todo.id, order: 2 });

                todo.addGroup(workGroup);
                todo.addGroup(personalGroup);
                todo.addGroup(urgentGroup);

                // Reorder groups: [work, personal, urgent] -> [urgent, work, personal]
                const newOrder = [urgentGroup.id, workGroup.id, personalGroup.id];
                todo.reorderGroups(newOrder);

                // Check new order
                expect(todo.groups[0].title).toBe('Urgent Tasks');
                expect(todo.groups[1].title).toBe('Work Tasks');
                expect(todo.groups[2].title).toBe('Personal Tasks');

                // Check order values are sequential
                expect(todo.groups[0].order).toBe(0);
                expect(todo.groups[1].order).toBe(1);
                expect(todo.groups[2].order).toBe(2);
            });

            it('should handle complex cross-group movements', () => {
                workGroup = new Group({ title: 'Work', todoId: todo.id, order: 0 });
                personalGroup = new Group({ title: 'Personal', todoId: todo.id, order: 1 });
                const shoppingGroup = new Group({ title: 'Shopping', todoId: todo.id, order: 2 });

                todo.addGroup(workGroup);
                todo.addGroup(personalGroup);
                todo.addGroup(shoppingGroup);

                // Add multiple tasks to each group
                const workTasks = [
                    new Task({ title: 'Meeting', completed: false, groupId: workGroup.id, order: 0 }),
                    new Task({ title: 'Code Review', completed: false, groupId: workGroup.id, order: 1 }),
                    new Task({ title: 'Documentation', completed: false, groupId: workGroup.id, order: 2 })
                ];

                const personalTasks = [
                    new Task({ title: 'Exercise', completed: false, groupId: personalGroup.id, order: 0 }),
                    new Task({ title: 'Read Book', completed: false, groupId: personalGroup.id, order: 1 })
                ];

                workTasks.forEach(task => workGroup.addTask(task));
                personalTasks.forEach(task => personalGroup.addTask(task));

                // Initial state verification
                expect(workGroup.tasks).toHaveLength(3);
                expect(personalGroup.tasks).toHaveLength(2);
                expect(shoppingGroup.tasks).toHaveLength(0);

                // Move middle task from work to end of personal
                const moveSuccess1 = todo.moveTaskBetweenGroups(workTasks[1].id, personalGroup.id);
                expect(moveSuccess1).toBe(true);

                expect(workGroup.tasks).toHaveLength(2);
                expect(personalGroup.tasks).toHaveLength(3);
                expect(personalGroup.tasks[2].title).toBe('Code Review');

                // Move first task from personal to specific position in shopping
                const moveSuccess2 = todo.moveTaskBetweenGroups(personalTasks[0].id, shoppingGroup.id, 0);
                expect(moveSuccess2).toBe(true);

                expect(personalGroup.tasks).toHaveLength(2);
                expect(shoppingGroup.tasks).toHaveLength(1);
                expect(shoppingGroup.tasks[0].title).toBe('Exercise');

                // Verify all orders are still sequential
                [workGroup, personalGroup, shoppingGroup].forEach(group => {
                    group.tasks.forEach((task, index) => {
                        expect(task.order).toBe(index);
                        expect(task.groupId).toBe(group.id);
                    });
                });
            });

            it('should maintain task custom fields during movements', () => {
                workGroup = new Group({ title: 'Work', todoId: todo.id, order: 0 });
                personalGroup = new Group({ title: 'Personal', todoId: todo.id, order: 1 });

                todo.addGroup(workGroup);
                todo.addGroup(personalGroup);

                // Create task with custom fields
                const taskWithCustomFields = new Task({
                    title: 'Important Meeting',
                    completed: false,
                    groupId: workGroup.id,
                    order: 0,
                    customFields: {
                        url: 'https://zoom.us/meeting/123',
                        attendees: ['john@example.com', 'jane@example.com'],
                        priority_score: 95,
                        metadata: { department: 'engineering', budget: 1000 }
                    }
                });

                workGroup.addTask(taskWithCustomFields);

                // Move task to personal group
                const success = todo.moveTaskBetweenGroups(taskWithCustomFields.id, personalGroup.id);
                expect(success).toBe(true);

                // Verify custom fields are preserved
                const movedTask = personalGroup.tasks[0];
                expect(movedTask.customFields.url).toBe('https://zoom.us/meeting/123');
                expect(movedTask.customFields.attendees).toEqual(['john@example.com', 'jane@example.com']);
                expect(movedTask.customFields.priority_score).toBe(95);
                expect(movedTask.customFields.metadata).toEqual({ department: 'engineering', budget: 1000 });

                // Verify task properties are correct
                expect(movedTask.groupId).toBe(personalGroup.id);
                expect(movedTask.order).toBe(0);
                expect(movedTask.title).toBe('Important Meeting');
            });

            it('should handle edge cases in task movement', () => {
                workGroup = new Group({ title: 'Work', todoId: todo.id, order: 0 });
                personalGroup = new Group({ title: 'Personal', todoId: todo.id, order: 1 });

                todo.addGroup(workGroup);
                todo.addGroup(personalGroup);

                const task = new Task({ title: 'Test Task', completed: false, groupId: workGroup.id, order: 0 });
                workGroup.addTask(task);

                // Try to move non-existent task
                const failMove1 = todo.moveTaskBetweenGroups('non-existent-task', personalGroup.id);
                expect(failMove1).toBe(false);

                // Try to move to non-existent group
                const failMove2 = todo.moveTaskBetweenGroups(task.id, 'non-existent-group');
                expect(failMove2).toBe(false);

                // Try to move task within same group (should work)
                const successMove = todo.moveTaskBetweenGroups(task.id, workGroup.id);
                expect(successMove).toBe(true);
                expect(workGroup.tasks).toHaveLength(1);
                expect(task.groupId).toBe(workGroup.id);
            });
        });
    });
});
