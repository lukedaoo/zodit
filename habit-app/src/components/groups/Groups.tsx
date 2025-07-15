import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    completed: boolean;
}

interface Group {
    id: string;
    name: string;
    tasks: Task[];
}

const Groups: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([
        {
            id: '1',
            name: 'Group 1',
            tasks: [
                { id: '1', title: 'Task 1', completed: false },
                { id: '2', title: '', completed: false }
            ]
        },
        {
            id: '2',
            name: 'Group 2',
            tasks: [{ id: '3', title: 'Task 3', completed: false }]
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

    const deleteGroup = (groupId: string) => {
        setGroups(groups.filter((group) => group.id !== groupId));
    };

    const addTask = (groupId: string) => {
        setGroups(
            groups.map((group) =>
                group.id === groupId
                    ? {
                        ...group,
                        tasks: [
                            ...group.tasks,
                            {
                                id: Date.now().toString(),
                                title: `Task ${group.tasks.length + 1}`,
                                completed: false
                            }
                        ]
                    }
                    : group
            )
        );
    };

    const updateGroupName = (groupId: string, newName: string) => {
        setGroups(
            groups.map((group) =>
                group.id === groupId ? { ...group, name: newName } : group
            )
        );
    };

    const updateTaskTitle = (
        groupId: string,
        taskId: string,
        newTitle: string
    ) => {
        setGroups(
            groups.map((group) =>
                group.id === groupId
                    ? {
                        ...group,
                        tasks: group.tasks.map((task) =>
                            task.id === taskId ? { ...task, title: newTitle } : task
                        )
                    }
                    : group
            )
        );
    };

    const deleteTask = (groupId: string, taskId: string) => {
        setGroups(
            groups.map((group) =>
                group.id === groupId
                    ? {
                        ...group,
                        tasks: group.tasks.filter((task) => task.id !== taskId)
                    }
                    : group
            )
        );
    };

    return (
        <div className="min-h-screen p-8 space-y-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center text-sm text-muted-foreground">
                    To move canvas, hold mouse wheel or spacebar while dragging, or use the hand tool.
                </div>

                {/* Add Group Button */}
                <button onClick={addGroup} className="w-full mb-6 p-4 rounded-lg border-2 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
                    style={{
                        borderColor: 'var(--color-primary-500)',
                        color: 'var(--color-foreground)',
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-foreground)';
                    }}
                >
                    <Plus size={20} />
                    Add new group
                </button>

                {/* Groups List */}
                <div className="space-y-6">
                    {groups.map((group) => (
                        <div key={group.id} className="space-y-3">
                            {/* Group Header */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={group.name}
                                    onChange={(e) => updateGroupName(group.id, e.target.value)}
                                    className="w-full p-4 rounded-lg border-2 bg-transparent font-medium text-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: 'var(--color-primary-500)',
                                        color: 'var(--color-foreground)',
                                        backgroundColor: 'var(--color-background)',
                                        '--tw-ring-color': 'var(--color-primary-500)'
                                    }}
                                />
                                <button
                                    onClick={() => deleteGroup(group.id)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-red-500 transition-colors"
                                    style={{ color: 'var(--color-foreground)' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tasks */}
                            <div className="ml-8 space-y-3">
                                {group.tasks.map((task) => (
                                    <div key={task.id} className="relative">
                                        <input
                                            type="text"
                                            value={task.title}
                                            onChange={(e) => updateTaskTitle(group.id, task.id, e.target.value)}
                                            placeholder="Enter task..."
                                            className="w-full p-4 rounded-lg border-2 bg-transparent focus:outline-none focus:ring-2"
                                            style={{
                                                borderColor: 'var(--color-primary-500)',
                                                color: 'var(--color-foreground)',
                                                backgroundColor: 'var(--color-background)',
                                                '--tw-ring-color': 'var(--color-primary-500)'
                                            }}
                                        />
                                        <button
                                            onClick={() => deleteTask(group.id, task.id)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-red-500 transition-colors"
                                            style={{ color: 'var(--color-foreground)' }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}

                                {/* Add Task Button */}
                                <button
                                    onClick={() => addTask(group.id)}
                                    className="w-full p-4 rounded-lg border-2 border-dashed hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 opacity-70 hover:opacity-100"
                                    style={{
                                        borderColor: 'var(--color-primary-500)',
                                        color: 'var(--color-foreground)',
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--color-foreground)';
                                    }}
                                >
                                    <Plus size={16} />
                                    Add task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Groups;
