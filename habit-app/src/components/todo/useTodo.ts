import { useState, useEffect } from 'react';
import type { Group } from './types';

export const useTodo = () => {
    const [groups, setGroups] = useState<Group[]>([]);

    const generateId = () => {
        return "id#" + Math.random().toString(16).slice(2);
    };

    useEffect(() => {
        console.log('updated groups', groups);
    }, [groups]);



    const addGroup = () => {
        const newGroup: Group = {
            id: Date.now().toString(),
            name: `Group ${groups.length + 1}`,
            tasks: []
        };
        setGroups([...groups, newGroup]);
    };

    const updateGroupName = (groupId: string, newName: string) => {
        setGroups(groups.map((g) => (g.id === groupId ? { ...g, name: newName } : g)));
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
                            id: generateId(),
                            title: '',
                            completed: false
                        }
                    ]
                }
                : group
        ));
    };

    const updateTask = (groupId: string, taskId: string, updates: Partial<any>) => {
        const updatedGroups = [];
        for (let group of groups) {
            if (group.id === groupId) {
                const updatedTasks = [];
                for (let task of group.tasks) {
                    if (task.id === taskId) {
                        console.log('the fuck is this', { ...task, ...updates });
                        updatedTasks.push({ ...task, ...updates });
                    } else {
                        updatedTasks.push(task);
                    }
                }
                updatedGroups.push({ ...group, tasks: updatedTasks });
            } else {
                updatedGroups.push(group);
            }
        }
        setGroups(updatedGroups);
        // setGroups(groups.map((group) =>
        //     group.id === groupId
        //         ? {
        //             ...group,
        //             tasks: group.tasks.map((task) => {
        //                 console.log('the fuck is this', { ...task, ...updates });
        //                 return task.id === taskId ? { ...task, ...updates } : task
        //             })
        //         }
        //         : group
        // ));
        console.log('updated task', { groupId, taskId, updates });
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

    return {
        groups,
        addGroup,
        updateGroupName,
        deleteGroup,
        addTask,
        updateTask,
        deleteTask
    };
};
