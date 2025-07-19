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
