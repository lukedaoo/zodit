import { useState } from 'react';
import TaskItem from './TaskItem';
import AddTaskButton from './AddTaskButton';
import type { Task } from './types';
import { taskToText } from './taskUtils';

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
                    task={task}
                    isEditing={editingId === task.id || task.title === ''}
                    onDelete={() => onDelete(task.id)}
                    onSubmit={(parsed) => {
                        const composed = taskToText(parsed, '');
                        onUpdateTitle(task.id, composed);
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
