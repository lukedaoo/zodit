import React, { useState } from 'react';
import AddGroupButton from './AddGroupButton';
import GroupLists from './GroupLists';
import type { Group } from './types';



const Todo: React.FC = () => {
    const generateId = () => {
        return "id#" + Math.random().toString(16).slice(2)
    }
    const [groups, setGroups] = useState<Group[]>([
        {
            id: '1',
            name: 'Group 1',
            tasks: [
                {
                    id: generateId(),
                    title: 'Task 1',
                    completed: false
                },
                {
                    id: generateId(),
                    title: 'Task 2',
                    completed: false
                }
            ]
        },
        {
            id: '2',
            name: 'Group 2',
            tasks: []
        }
    ]);

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
                    tasks: [...group.tasks, {
                        id: generateId(),
                        title: '',
                        completed: false
                    }]
                }
                : group
        ));
    };

    const updateTaskTitle = (groupId: string, taskId: string, newTitle: string) => {
        setGroups(groups.map((group) =>
            group.id === groupId
                ? {
                    ...group,
                    tasks: group.tasks.map((task) =>
                        task.id === taskId ? { ...task, title: newTitle } : task
                    )
                }
                : group
        ));
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
                    onUpdateTaskTitle={updateTaskTitle}
                    onDeleteGroup={deleteGroup}
                    onDeleteTask={deleteTask}
                    onAddTask={addTask}
                />
            </div>
        </div>
    );
};

export default Todo;
