import { useState, useEffect } from 'react';
import type { Group } from './types';

export const useTodo = () => {

    let GROUP_DATABASE: Group[] = [];
    // [
    //     {
    //         id: '1',
    //         name: 'Group 1',
    //         tasks: [{
    //             id: '1', title: 'Task 1', completed: false,
    //             startDate: {
    //                 alias: 'today',
    //                 resolved: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    //             } as any
    //         },
    //         {
    //             id: '2', title: 'Task 2', completed: false,
    //             startDate: {
    //                 alias: 'tmr',
    //                 resolved: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    //             } as any
    //         }]
    //     }
    // ];

    const [groups, setGroups] = useState<Group[]>(GROUP_DATABASE);

    const generateId = (prefix: string) => {
        return prefix + ":id#" +
            Math.floor(Math.random() * 8 ** 6).toString(8).padStart(6, '0');
    };

    useEffect(() => {
        console.log('groups.tasks', groups);
    }, [groups]);



    const addGroup = () => {
        const newGroup: Group = {
            id: generateId('group'),
            name: `Group ${groups.length + 1}`,
            tasks: []
        };
        setGroups([...groups, newGroup]);
    };

    const updateGroupName = (groupId: string, newName: string) => {
        setGroups((prev) =>
            prev.map((g) => (g.id === groupId ? { ...g, name: newName } : g))
        );
    };

    const deleteGroup = (groupId: string) => {
        setGroups(groups.filter((g) => g.id !== groupId));
    };

    const addTask = (groupId: string) => {
        setGroups(groups.map((group) =>
            group.id === groupId
                ? {
                    ...group,
                    tasks: [
                        ...group.tasks,
                        {
                            id: generateId('task'),
                            title: '',
                            completed: false
                        }
                    ]
                }
                : group
        ));
    };

    const updateTask = (groupId: string, taskId: string, updates: any) => {
        const updatedGroups = groups.map(group => {
            if (group.id !== groupId) return group;

            const updatedTasks = group.tasks.map(task =>
                task.id === taskId ? { ...updates, id: taskId } : task
            );

            return { ...group, tasks: updatedTasks };
        });

        setGroups(updatedGroups);
    };

    const deleteTask = (groupId: string, taskId: string) => {
        setGroups(groups.map((group) =>
            group.id === groupId
                ? {
                    ...group,
                    tasks: group.tasks.filter((task) => task.id !== taskId)
                }
                : group
        ));
    };

    const reorderTask = (groupId: string, newOrder: string[]) => {
        setGroups((prevGroups) =>
            prevGroups.map((group) => {
                if (group.id !== groupId) return group;

                const taskMap = new Map(group.tasks.map((task) => [task.id, task]));
                const reorderedTasks = newOrder.map((id) => taskMap.get(id)).filter(Boolean) as any;

                return {
                    ...group,
                    tasks: reorderedTasks,
                };
            })
        );
    };

    const reorderGroup = (newOrder: string[]) => {
        setGroups((prevGroups) => {
            const groupMap = Object.fromEntries(prevGroups.map((group) => [group.id, group]));
            return newOrder
                .map((id) => groupMap[id])
                .filter((group): group is Group => Boolean(group));
        });
    };

    const moveTaskBetweenGroups = (
        sourceGroupId: string,
        targetGroupId: string,
        taskId: string,
        targetTaskId: string | null
    ) => {
        setGroups((prevGroups) => {
            const sourceGroupIndex = prevGroups.findIndex(g => g.id === sourceGroupId);
            const targetGroupIndex = prevGroups.findIndex(g => g.id === targetGroupId);

            if (sourceGroupIndex === -1 || targetGroupIndex === -1) return prevGroups;

            const sourceGroup = prevGroups[sourceGroupIndex];
            const targetGroup = prevGroups[targetGroupIndex];

            const taskIndex = sourceGroup.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return prevGroups;

            const task = sourceGroup.tasks[taskIndex];

            let targetIndex = targetGroup.tasks.length;
            if (targetTaskId) {
                const foundIndex = targetGroup.tasks.findIndex(t => t.id === targetTaskId);
                if (foundIndex !== -1) targetIndex = foundIndex;
            }

            const newGroups = [...prevGroups];

            newGroups[sourceGroupIndex] = {
                ...sourceGroup,
                tasks: [
                    ...sourceGroup.tasks.slice(0, taskIndex),
                    ...sourceGroup.tasks.slice(taskIndex + 1)
                ]
            };

            newGroups[targetGroupIndex] = {
                ...targetGroup,
                tasks: [
                    ...targetGroup.tasks.slice(0, targetIndex),
                    task,
                    ...targetGroup.tasks.slice(targetIndex)
                ]
            };

            return newGroups;
        });
    };

    return {
        groups,
        addGroup,
        updateGroupName,
        deleteGroup,
        addTask,
        updateTask,
        deleteTask,
        reorderTask,
        reorderGroup,
        moveTaskBetweenGroups
    };
};
