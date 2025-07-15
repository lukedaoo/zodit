import { useState } from 'react';
import TaskItem from './TaskItem';
import AddTaskButton from './AddTaskButton';
import type { Task } from './types';

interface Props {
    tasks: Task[];
    groupId: string;
    onUpdateTitle: (taskId: string, newTitle: string) => void;
    onDelete: (taskId: string) => void;
    onAdd: () => void;
}

const TaskLists = ({ tasks, groupId, onUpdateTitle, onDelete, onAdd }: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <div className="ml-8 space-y-3">
            {tasks.map((task) => (
                <TaskItem
                    key={`${groupId}/${task.id}`}
                    value={task.title}
                    onChange={(newTitle) => onUpdateTitle(task.id, newTitle)}
                    onDelete={() => onDelete(task.id)}
                    isEditing={editingId === task.id || task.title.trim() === ''}
                    onSubmit={(parsed) => {
                        const composed = [
                            `header:${parsed.title}`,
                            parsed.description ? `desc:${parsed.description}` : null,
                            parsed.startTime ? `startTime:${parsed.startTime}` : null,
                            parsed.startDate ? `startDate:${parsed.startDate}` : null,
                            parsed.endDate ? `endDate:${parsed.endDate}` : null,
                        ]
                            .filter(Boolean)
                            .join('/');

                        onUpdateTitle(task.id, composed);
                        setEditingId(null);
                    }}
                />
            ))}

            <AddTaskButton
                onClick={() => {
                    onAdd();
                    const newTask = tasks[tasks.length - 1];
                    if (newTask) {
                        setEditingId(newTask.id);
                    }
                }}
            />
        </div>
    );
};

export default TaskLists;
