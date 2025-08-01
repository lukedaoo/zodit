import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LocalStorageDataProvider } from './localStorageDataProvider';
import { Todo, Group, Task } from '../models';
import type { TodoData, TaskData, } from '../models';

describe('LocalStorageDataProvider - Performance Tests', () => {
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

    describe('Large Dataset Creation Performance', () => {
        it('should handle creating 50 todos with 5 groups and 10 tasks each efficiently', () => {
            const startTime = performance.now();
            const todos: Todo[] = [];

            for (let todoIndex = 0; todoIndex < 50; todoIndex++) {
                const groups: Group[] = [];

                for (let groupIndex = 0; groupIndex < 5; groupIndex++) {
                    const tasks: Task[] = [];

                    for (let taskIndex = 0; taskIndex < 10; taskIndex++) {
                        tasks.push(new Task({
                            title: `Task ${taskIndex + 1} in Group ${groupIndex + 1}`,
                            groupId: '',
                            order: taskIndex,
                            completed: taskIndex % 3 === 0, // Every 3rd task completed
                            description: `Detailed description for task ${taskIndex + 1}`,
                            priority: taskIndex % 3 === 0 ? 'high' : taskIndex % 3 === 1 ? 'medium' : 'low',
                            tags: [`category-${taskIndex % 4}`, `priority-${taskIndex % 3}`]
                        } as TaskData));
                    }

                    groups.push(new Group({
                        title: `Group ${groupIndex + 1}`,
                        todoId: '',
                        order: groupIndex,
                        tasks: tasks,
                        color: `#${(groupIndex * 50).toString(16).padStart(6, '0')}`,
                        collapsed: groupIndex % 2 === 0
                    }));
                }

                const todoData: TodoData = {
                    date: `2025-07-${(todoIndex % 31 + 1).toString().padStart(2, '0')}`,
                    title: `Complex Todo ${todoIndex + 1}`,
                    groups: groups,
                };

                todos.push(provider.createTodo(todoData));
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Created 50 todos (250 groups, 2500 tasks) in ${duration.toFixed(2)}ms`);

            expect(todos).toHaveLength(50);
            expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

            // Verify data integrity
            const retrievedTodos = provider.getTodos();
            expect(retrievedTodos).toHaveLength(50);

            const firstTodo = retrievedTodos[0];
            expect(firstTodo.groups).toHaveLength(5);
            expect(firstTodo.groups[0].tasks).toHaveLength(10);
        });

        it('should handle creating 100 simple todos quickly', () => {
            const startTime = performance.now();

            for (let i = 0; i < 100; i++) {
                provider.createTodo({
                    date: `2025-07-${(i % 31 + 1).toString().padStart(2, '0')}`,
                    title: `Simple Todo ${i + 1}`,
                    groups: []
                });
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Created 100 simple todos in ${duration.toFixed(2)}ms`);

            expect(duration).toBeLessThan(1000); // Should complete in under 1 second
            expect(provider.getTodos()).toHaveLength(100);
        });
    });

    describe('Query Performance on Large Datasets', () => {
        beforeEach(() => {
            // Create a large dataset for querying
            for (let todoIndex = 0; todoIndex < 30; todoIndex++) {
                const groups: Group[] = [];

                for (let groupIndex = 0; groupIndex < 3; groupIndex++) {
                    const tasks: Task[] = [];

                    for (let taskIndex = 0; taskIndex < 8; taskIndex++) {
                        tasks.push(new Task({
                            title: `Task ${taskIndex + 1}`,
                            groupId: '',
                            order: taskIndex,
                            completed: taskIndex % 4 === 0,
                            priority: ['low', 'medium', 'high'][taskIndex % 3]
                        } as TaskData));
                    }

                    groups.push(new Group({
                        title: `${['Work', 'Personal', 'Shopping'][groupIndex]}`,
                        todoId: '',
                        order: groupIndex,
                        tasks: tasks
                    }));
                }

                provider.createTodo({
                    date: `2025-07-${(todoIndex % 31 + 1).toString().padStart(2, '0')}`,
                    title: `${['Daily', 'Weekly', 'Monthly'][todoIndex % 3]} Tasks ${todoIndex + 1}`,
                    groups: groups,
                });
            }
        });

        it('should filter todos efficiently with complex criteria', () => {
            const startTime = performance.now();

            const filteredTodos = provider.getTodos({
                filters: {
                    title: 'Daily',
                    priority: 'high'
                },
                orderBy: 'date',
                orderDirection: 'desc',
                limit: 10
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Filtered 30 todos (90 groups, 720 tasks) in ${duration.toFixed(2)}ms`);

            expect(duration).toBeLessThan(100); // Should complete in under 100ms
            expect(filteredTodos.length).toBeGreaterThan(0);
            expect(filteredTodos.every(t => t.title.includes('Daily'))).toBe(true);
        });

        it('should retrieve all todos quickly', () => {
            const startTime = performance.now();

            const allTodos = provider.getTodos();

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Retrieved 30 todos (90 groups, 720 tasks) in ${duration.toFixed(2)}ms`);

            expect(duration).toBeLessThan(50); // Should complete in under 50ms
            expect(allTodos).toHaveLength(30);
        });

        it('should sort large todo list efficiently', () => {
            const startTime = performance.now();

            const sortedTodos = provider.getTodos({
                orderBy: 'title',
                orderDirection: 'asc'
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Sorted 30 todos by title in ${duration.toFixed(2)}ms`);

            expect(duration).toBeLessThan(100);
            expect(sortedTodos).toHaveLength(30);

            // Verify sorting
            for (let i = 1; i < sortedTodos.length; i++) {
                expect(sortedTodos[i].title >= sortedTodos[i - 1].title).toBe(true);
            }
        });
    });

    describe('Task Movement Performance', () => {
        let complexTodos: Todo[] = [];

        beforeEach(() => {
            // Create todos with many groups and tasks for movement testing
            for (let todoIndex = 0; todoIndex < 10; todoIndex++) {
                const groups: Group[] = [];

                for (let groupIndex = 0; groupIndex < 5; groupIndex++) {
                    const tasks: Task[] = [];

                    for (let taskIndex = 0; taskIndex < 15; taskIndex++) {
                        tasks.push(new Task({
                            title: `Movable Task ${taskIndex + 1}`,
                            groupId: '',
                            order: taskIndex,
                            completed: false
                        } as TaskData));
                    }

                    groups.push(new Group({
                        title: `Group ${groupIndex + 1}`,
                        todoId: '',
                        order: groupIndex,
                        tasks: tasks
                    }));
                }

                const todo = provider.createTodo({
                    date: `2025-07-${(todoIndex % 31 + 1).toString().padStart(2, '0')}`,
                    title: `Movement Test Todo ${todoIndex + 1}`,
                    groups: groups
                });

                complexTodos.push(todo);
            }
        });

        it('should handle multiple task movements efficiently', () => {
            const startTime = performance.now();
            let successfulMoves = 0;

            // Perform 50 task movements across different todos
            for (let i = 0; i < 50; i++) {
                const todoIndex = i % complexTodos.length;
                const todo = complexTodos[todoIndex];

                if (todo.groups.length >= 2) {
                    const sourceGroup = todo.groups[0];
                    const targetGroup = todo.groups[1];

                    if (sourceGroup.tasks.length > 0) {
                        const taskToMove = sourceGroup.tasks[0];
                        const success = provider.moveTaskBetweenGroups(
                            todo.id,
                            taskToMove.id,
                            targetGroup.id,
                            0
                        );

                        if (success) {
                            successfulMoves++;
                            // Update our local reference
                            const updatedTodo = provider.getTodo(todo.id);
                            if (updatedTodo) {
                                complexTodos[todoIndex] = updatedTodo;
                            }
                        }
                    }
                }
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Performed ${successfulMoves} task movements in ${duration.toFixed(2)}ms`);

            expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
            expect(successfulMoves).toBeGreaterThan(40); // Most moves should succeed
        });
    });

    describe('Update Performance', () => {
        let largeTodos: Todo[] = [];

        beforeEach(() => {
            // Create todos with substantial data for update testing
            for (let i = 0; i < 20; i++) {
                const groups: Group[] = [];

                for (let j = 0; j < 4; j++) {
                    const tasks: Task[] = [];

                    for (let k = 0; k < 12; k++) {
                        tasks.push(new Task({
                            title: `Update Task ${k + 1}`,
                            groupId: '',
                            order: k,
                            completed: k % 2 === 0,
                            description: `Task description ${k + 1}`,
                            priority: ['low', 'medium', 'high'][k % 3]
                        } as TaskData));
                    }

                    groups.push(new Group({
                        title: `Update Group ${j + 1}`,
                        todoId: '',
                        order: j,
                        tasks: tasks
                    }));
                }

                const todo = provider.createTodo({
                    date: `2025-07-${(i % 31 + 1).toString().padStart(2, '0')}`,
                    title: `Update Test Todo ${i + 1}`,
                    groups: groups,
                });

                largeTodos.push(todo);
            }
        });

        it('should handle bulk updates efficiently', () => {
            const startTime = performance.now();

            // Update all todos
            for (let i = 0; i < largeTodos.length; i++) {
                const todo = largeTodos[i];
                provider.updateTodo(todo.id, {
                    title: `Updated Todo ${i + 1}`,
                });
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Updated ${largeTodos.length} complex todos in ${duration.toFixed(2)}ms`);

            expect(duration).toBeLessThan(1000); // Should complete in under 1 second

            // Verify updates
            const updatedTodo = provider.getTodo(largeTodos[0].id);
            expect(updatedTodo?.title).toBe('Updated Todo 1');
        });
    });

    describe('Memory and Storage Performance', () => {
        it('should handle large data volumes without memory leaks', () => {
            const initialTodoCount = provider.getTodos().length;

            // Create and delete many todos to test memory management
            const createdIds: string[] = [];

            for (let cycle = 0; cycle < 5; cycle++) {
                // Create 20 todos with moderate complexity
                for (let i = 0; i < 20; i++) {
                    const groups = Array.from({ length: 3 }, (_, groupIndex) =>
                        new Group({
                            title: `Temp Group ${groupIndex}`,
                            todoId: '',
                            order: groupIndex,
                            tasks: Array.from({ length: 5 }, (_, taskIndex) =>
                                new Task({
                                    title: `Temp Task ${taskIndex}`,
                                    groupId: '',
                                    order: taskIndex
                                } as TaskData)
                            )
                        })
                    );

                    const todo = provider.createTodo({
                        date: '2025-07-30',
                        title: `Temp Todo ${cycle}-${i}`,
                        groups: groups
                    });

                    createdIds.push(todo.id);
                }

                // Delete half of them
                const toDelete = createdIds.splice(0, 10);
                for (const id of toDelete) {
                    provider.deleteTodo(id);
                }
            }

            // Clean up remaining todos
            for (const id of createdIds) {
                provider.deleteTodo(id);
            }

            const finalTodoCount = provider.getTodos().length;
            expect(finalTodoCount).toBe(initialTodoCount);
        });

        it('should handle localStorage size limits gracefully', () => {
            let createdCount = 0;
            let lastSuccessfulSize = 0;

            try {
                // Keep creating until we approach storage limits
                while (createdCount < 1000) { // Safety limit
                    const groups = Array.from({ length: 10 }, (_, groupIndex) =>
                        new Group({
                            title: `Large Group ${groupIndex} with very long title that takes up more space`,
                            todoId: '',
                            order: groupIndex,
                            tasks: Array.from({ length: 20 }, (_, taskIndex) =>
                                new Task({
                                    title: `Large Task ${taskIndex} with extensive description and metadata`,
                                    groupId: '',
                                    order: taskIndex,
                                    description: 'This is a very long description that will take up significant space in localStorage to test storage limits and performance under pressure',
                                    priority: 'high',
                                    tags: ['performance', 'test', 'large-data', 'storage-limit']
                                } as TaskData)
                            )
                        })
                    );

                    provider.createTodo({
                        date: '2025-07-30',
                        title: `Large Todo ${createdCount} with extensive metadata and long descriptions`,
                        groups: groups,
                    });

                    createdCount++;

                    // Check current storage usage
                    const currentData = provider.getAllData();
                    lastSuccessfulSize = JSON.stringify(currentData).length;
                }
            } catch (error) {
                // Expected when approaching storage limits
                console.log(`Created ${createdCount} large todos before hitting limits`);
                console.log(`Last successful storage size: ${(lastSuccessfulSize / 1024 / 1024).toFixed(2)}MB`);
            }

            expect(createdCount).toBeGreaterThan(10); // Should create at least 10 large todos
            expect(lastSuccessfulSize).toBeGreaterThan(1000000); // Should handle at least 1MB of data
        });
    });

    describe('Concurrent Operations Performance', () => {
        it('should handle rapid sequential operations efficiently', () => {
            const startTime = performance.now();
            const operations: (() => void)[] = [];

            // Prepare 200 mixed operations
            for (let i = 0; i < 200; i++) {
                if (i % 4 === 0) {
                    // Create operation
                    operations.push(() => {
                        provider.createTodo({
                            date: '2025-07-30',
                            title: `Rapid Todo ${i}`,
                            groups: [
                                new Group({
                                    title: 'Rapid Group',
                                    todoId: '',
                                    order: 0,
                                    tasks: [
                                        new Task({ title: 'Rapid Task', groupId: '', order: 0 } as TaskData)
                                    ]
                                })
                            ]
                        });
                    });
                } else if (i % 4 === 1) {
                    // Read operation
                    operations.push(() => {
                        provider.getTodos({ limit: 5 });
                    });
                } else if (i % 4 === 2) {
                    // Update operation (if todos exist)
                    operations.push(() => {
                        const todos = provider.getTodos({ limit: 1 });
                        if (todos.length > 0) {
                            provider.updateTodo(todos[0].id, { title: `Updated ${i}` });
                        }
                    });
                } else {
                    // Filter operation
                    operations.push(() => {
                        provider.getTodos({
                            filters: { title: 'Rapid' },
                            limit: 10
                        });
                    });
                }
            }

            // Execute all operations
            operations.forEach(op => op());

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Executed 200 mixed operations in ${duration.toFixed(2)}ms`);

            expect(duration).toBeLessThan(3000); // Should complete in under 3 seconds
            expect(provider.getTodos().length).toBeGreaterThan(40); // Should have created ~50 todos
        });
    });

    describe('Real-world Scenario Performance', () => {
        it('should handle a typical day planner scenario efficiently', () => {
            const startTime = performance.now();

            // Simulate a week's worth of planning data
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            for (let week = 0; week < 4; week++) { // 4 weeks of data
                for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
                    const day = days[dayIndex];
                    const isWeekend = dayIndex >= 5;

                    const groups: Group[] = [];

                    // Work group (weekdays only)
                    if (!isWeekend) {
                        const workTasks = [
                            'Check emails',
                            'Team standup',
                            'Code review',
                            'Feature development',
                            'Testing',
                            'Documentation',
                            'Client meeting'
                        ].map((title, index) => new Task({
                            title,
                            groupId: '',
                            order: index,
                            completed: Math.random() > 0.7, // 30% completion rate
                            priority: index < 3 ? 'high' : 'medium'
                        } as TaskData));

                        groups.push(new Group({
                            title: 'Work',
                            todoId: '',
                            order: 0,
                            tasks: workTasks,
                            color: '#3b82f6'
                        }));
                    }

                    // Personal group
                    const personalTasks = [
                        'Exercise',
                        'Grocery shopping',
                        'Cook dinner',
                        'Read book',
                        'Call family'
                    ].map((title, index) => new Task({
                        title,
                        groupId: '',
                        order: index,
                        completed: Math.random() > 0.6, // 40% completion rate
                        priority: 'medium'
                    } as TaskData));

                    groups.push(new Group({
                        title: 'Personal',
                        todoId: '',
                        order: 1,
                        tasks: personalTasks,
                        color: '#10b981'
                    }));

                    // Weekend projects (weekends only)
                    if (isWeekend) {
                        const projectTasks = [
                            'Home improvement',
                            'Garden work',
                            'Hobby project',
                            'Social activities'
                        ].map((title, index) => new Task({
                            title,
                            groupId: '',
                            order: index,
                            completed: Math.random() > 0.8, // 20% completion rate
                            priority: 'low'
                        } as TaskData));

                        groups.push(new Group({
                            title: 'Weekend Projects',
                            todoId: '',
                            order: 2,
                            tasks: projectTasks,
                            color: '#f59e0b'
                        }));
                    }

                    provider.createTodo({
                        date: `2025-07-${(week * 7 + dayIndex + 1).toString().padStart(2, '0')}`,
                        title: `${day} - Week ${week + 1}`,
                        groups: groups,
                    });
                }
            }

            const creationTime = performance.now() - startTime;

            // Simulate typical user interactions
            const interactionStart = performance.now();

            // Get current week's todos
            const currentWeekTodos = provider.getTodos({
                filters: { title: 'Week 1' },
                orderBy: 'date',
                orderDirection: 'asc'
            });

            // Mark some tasks as completed (simulate user interaction)
            for (const todo of currentWeekTodos.slice(0, 3)) {
                const updatedGroups = todo.groups.map(group => {
                    const updatedTasks = group.tasks.map((task, index) => {
                        if (index === 0 && !task.completed) {
                            return new Task({ ...task, completed: true } as TaskData);
                        }
                        return task;
                    });
                    return new Group({ ...group, tasks: updatedTasks });
                });

                provider.updateTodo(todo.id, { groups: updatedGroups });
            }

            // Move a task between groups
            const todoWithMultipleGroups = currentWeekTodos.find(t => t.groups.length > 1);
            if (todoWithMultipleGroups && todoWithMultipleGroups.groups[0].tasks.length > 0) {
                const taskToMove = todoWithMultipleGroups.groups[0].tasks[0];
                provider.moveTaskBetweenGroups(
                    todoWithMultipleGroups.id,
                    taskToMove.id,
                    todoWithMultipleGroups.groups[1].id,
                    0
                );
            }

            // Search for high priority tasks
            const highPriorityTodos = provider.getTodos({
                filters: { priority: 'high' }
            });

            const interactionTime = performance.now() - interactionStart;
            const totalTime = performance.now() - startTime;

            console.log(`Day planner scenario performance:`);
            console.log(`- Created 28 daily plans in ${creationTime.toFixed(2)}ms`);
            console.log(`- User interactions completed in ${interactionTime.toFixed(2)}ms`);
            console.log(`- Total scenario time: ${totalTime.toFixed(2)}ms`);

            expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
            expect(provider.getTodos()).toHaveLength(28); // 4 weeks × 7 days
            expect(currentWeekTodos).toHaveLength(7); // 7 days in week 1
            expect(highPriorityTodos.length).toBeGreaterThan(0);

            // Verify data integrity
            const allTodos = provider.getTodos();
            const totalGroups = allTodos.reduce((sum, todo) => sum + todo.groups.length, 0);
            const totalTasks = allTodos.reduce((sum, todo) =>
                sum + todo.groups.reduce((groupSum, group) => groupSum + group.tasks.length, 0), 0
            );

            console.log(`Final data: ${allTodos.length} todos, ${totalGroups} groups, ${totalTasks} tasks`);
            expect(totalGroups).toBeGreaterThan(50);
            expect(totalTasks).toBeGreaterThan(200);
        });
    });
});
