import { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { AddTaskButton } from './AddButtonComponents.tsx';
import type { Task } from './types';
// import { taskToText } from './task/taskUtils';

interface Props {
    tasks: Task[];
    groupId: string;
    onUpdate: (taskId: string, updates: Partial<any>) => void;
    onDelete: (taskId: string) => void;
    onAdd: () => void;
}

const TaskLists = ({ tasks, groupId, onUpdate, onDelete, onAdd }: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    // const [hasEditedIds, setHasEditedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        console.log('Effect running, tasks:', tasks);
    }, [tasks]);

    return (
        <div className="ml-8 space-y-3">
            {tasks.map((task) => (
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

            <AddTaskButton
                onClick={() => {
                    onAdd();
                }}
            />
        </div>
    );
};

export default TaskLists;
