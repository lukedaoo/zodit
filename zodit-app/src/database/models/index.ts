export * from './BaseModel';
export * from './Task';
export * from './Group';
export * from './Todo';
export * from './Note';

import { BaseModel } from './BaseModel';
import { Task } from './Task';
import { Group } from './Group';
import { Todo } from './Todo';
import { Note } from './Note';

import type { ValidationResult } from './BaseModel';
import type { TaskData } from './Task';
import type { GroupData } from './Group';
import type { TodoData } from './Todo';
import type { NoteData } from './Note';

interface BaseModelConstructor<T extends BaseModel> {
    new(data: any): T;
    fromJSON(data: Record<string, any>): T;
}

export class ModelFactory {
    static createFromJSON<T extends BaseModel>(
        ModelClass: BaseModelConstructor<T>,
        data: Record<string, any>
    ): T {
        return ModelClass.fromJSON(data);
    }

    static createTask(data: TaskData): Task {
        return new Task(data);
    }

    static createGroup(data: GroupData): Group {
        const group = new Group(data);
        group.tasks.forEach(task => {
            task.groupId = group.id;
        });
        group.fixTaskOrdering();
        return group;
    }

    static createTodo(data: TodoData): Todo {
        const todo = new Todo(data);
        todo.groups.forEach(group => {
            group.todoId = todo.id;
            group.tasks.forEach(task => {
                task.groupId = group.id;
            });
            group.fixTaskOrdering();
        });
        todo.fixGroupOrdering();
        return todo;
    }

    static createNote(data: NoteData): Note {
        return new Note(data);
    }

    static buildTodoFromFlatData(
        todo: Todo,
        groups: Group[],
        tasks: Task[]
    ): Todo {
        const tasksByGroup = tasks.reduce((acc, task) => {
            if (!acc[task.groupId]) acc[task.groupId] = [];
            acc[task.groupId].push(task);
            return acc;
        }, {} as Record<string, Task[]>);

        const populatedGroups = groups
            .filter(g => g.todoId === todo.id)
            .map(group => {
                const groupTasks = tasksByGroup[group.id] || [];
                group.tasks = groupTasks.sort((a, b) => a.order - b.order);
                group.fixTaskOrdering();
                return group;
            })
            .sort((a, b) => a.order - b.order);

        todo.groups = populatedGroups;
        todo.fixGroupOrdering();
        return todo;
    }

    static validateAndFix(model: BaseModel): ValidationResult {
        if (model instanceof Todo) {
            model.fixGroupOrdering();
            model.groups.forEach(group => group.fixTaskOrdering());
        } else if (model instanceof Group) {
            model.fixTaskOrdering();
        }

        return model.validate();
    }

    static createCompleteTodo(data: {
        date: string;
        title?: string;
        groups: {
            title: string;
            color?: string;
            tasks: {
                title: string;
                completed?: boolean;
                description?: string;
                startTime?: string;
                startDate?: string;
                endDate?: string;
                priority?: 'low' | 'medium' | 'high';
                tags?: string[];
                customFields?: Record<string, any>;
            }[];
        }[];
    }): Todo {
        const todo = new Todo({
            date: data.date,
            title: data.title
        });

        data.groups.forEach((groupData, groupIndex) => {
            const group = new Group({
                title: groupData.title,
                todoId: todo.id,
                order: groupIndex,
                color: groupData.color
            });

            groupData.tasks.forEach((taskData, taskIndex) => {
                const task = new Task({
                    title: taskData.title,
                    completed: taskData.completed || false,
                    description: taskData.description,
                    startTime: taskData.startTime,
                    startDate: taskData.startDate,
                    endDate: taskData.endDate,
                    priority: taskData.priority || 'medium',
                    tags: taskData.tags || [],
                    customFields: taskData.customFields || {},
                    groupId: group.id,
                    order: taskIndex
                });

                group.addTask(task);
            });

            todo.addGroup(group);
        });

        return todo;
    }

    static cloneTodo(todo: Todo, newDate?: string): Todo {
        const clonedData = todo.toJSON();
        clonedData.date = newDate || todo.date;
        delete clonedData.id;
        delete clonedData.createdAt;
        delete clonedData.updatedAt;

        clonedData.groups.forEach((group: any) => {
            delete group.id;
            delete group.createdAt;
            delete group.updatedAt;
            group.tasks.forEach((task: any) => {
                delete task.id;
                delete task.createdAt;
                delete task.updatedAt;
            });
        });

        return ModelFactory.createTodo(clonedData as TodoData);
    }

    static mergeTodos(baseTodo: Todo, templateTodo: Todo): Todo {
        const merged = ModelFactory.cloneTodo(baseTodo);

        templateTodo.groups.forEach(templateGroup => {
            const existingGroup = merged.groups.find(g => g.title === templateGroup.title);

            if (existingGroup) {
                templateGroup.tasks.forEach(templateTask => {
                    const clonedTask = new Task({
                        ...templateTask.toJSON(),
                        id: undefined,
                        groupId: existingGroup.id,
                        order: existingGroup.tasks.length
                    } as TaskData);
                    existingGroup.addTask(clonedTask);
                });
            } else {
                const clonedGroup = new Group({
                    ...templateGroup.toJSON(),
                    id: undefined,
                    todoId: merged.id,
                    order: merged.groups.length
                } as GroupData);

                clonedGroup.tasks = templateGroup.tasks.map(task => new Task({
                    ...task.toJSON(),
                    id: undefined,
                    groupId: clonedGroup.id
                } as TaskData));

                merged.addGroup(clonedGroup);
            }
        });

        return merged;
    }

    static createTemplate(todo: Todo, templateName: string): Todo {
        const template = ModelFactory.cloneTodo(todo);
        template.title = templateName;

        template.groups.forEach(group => {
            group.tasks.forEach(task => {
                if (task.title.trim()) {
                    task.title = task.title.includes(':') ?
                        task.title.split(':')[0] + ': [TODO]' :
                        '[TODO]';
                }
                task.description = task.description ? '[Description]' : undefined;
                task.completed = false;
                task.startDate = undefined;
                task.endDate = undefined;
                task.startTime = undefined;
            });
        });

        return template;
    }
}
