import { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { AddTaskButton } from './AddButtonComponents.tsx';
import type { Task } from './types';

interface Props {
    tasks: Task[];
    groupId: string;
    onUpdate: (taskId: string, updates: Partial<any>) => void;
    onDelete: (taskId: string) => void;
    onAdd: () => void;
}

const COLLAPSE_THRESHOLD = 5;

const TaskLists = ({ tasks, groupId, onUpdate, onDelete, onAdd }: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(true);

    const shouldCollapse = tasks.length > COLLAPSE_THRESHOLD;
    const visibleTasks = collapsed && shouldCollapse
        ? tasks.slice(0, COLLAPSE_THRESHOLD)
        : tasks;

    useEffect(() => {
        console.log('Effect running, tasks:', tasks);
    }, [tasks]);

    return (
        <div className="ml-8 space-y-3">
            {visibleTasks.map((task) => (
                <TaskItem
                    key={`${groupId}/${task.id}`}
                    task={task}
                    isEditing={editingId === task.id}
                    onDelete={() => onDelete(task.id)}
                    onSubmit={(parsed) => {
                        parsed.id = task.id;
                        onUpdate(parsed.id, parsed);
                        setEditingId(null);
                    }}
                    onDoubleClick={() => setEditingId(task.id)}
                />
            ))}

            {shouldCollapse && (
                <button
                    className="text-sm text-blue-500 hover:underline"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? `Show All (${tasks.length})` : 'Show Less'}
                </button>
            )}

            <AddTaskButton onClick={onAdd} />
        </div>
    );
};

export default TaskLists;
