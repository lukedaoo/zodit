import React, { useState } from 'react';
import { AddGroupButton } from './AddButtonComponents';
import GroupLists from './GroupLists';
import type { Group } from './types';


const Todo: React.FC = () => {
    const generateId = () => {
        return "id#" + Math.random().toString(16).slice(2)
    }
    const [groups, setGroups] = useState<Group[]>([]);

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
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].id === groupId) {
                groups[i].tasks.push({
                    id: generateId(),
                    title: '',
                    completed: false
                });
            }
        }
        setGroups([...groups]);
    };

    const updateTask = (groupId: string, taskId: string, updates: Partial<any>) => {
        const newGroups = [];

        for (const group of groups) {
            if (group.id === groupId) {
                const updatedTasks = [];

                for (const task of group.tasks) {
                    if (task.id === taskId) {
                        updatedTasks.push({ ...task, ...updates });
                    } else {
                        updatedTasks.push(task);
                    }
                }

                newGroups.push({
                    ...group,
                    tasks: updatedTasks
                });
            } else {
                newGroups.push(group);
            }
        }

        setGroups(newGroups);
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

    return (
        <div className="min-h-screen p-8 space-y-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/*
                    <div className="text-center text-sm text-muted-foreground">
                        To move canvas, hold mouse wheel or spacebar while dragging.
                    </div>
                */}

                <AddGroupButton onClick={addGroup} />

                <GroupLists
                    groups={groups}
                    onUpdateGroupName={updateGroupName}
                    onUpdateTask={updateTask}
                    onDeleteGroup={deleteGroup}
                    onDeleteTask={deleteTask}
                    onAddTask={addTask}
                />
            </div>
        </div>
    );
};

export default Todo;
