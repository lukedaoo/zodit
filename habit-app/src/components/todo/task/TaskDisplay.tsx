import { useState } from 'react';
import { TaskDescription, TASK_STYLES } from './TaskUIComponents';
import { TaskHeaderWithModal } from './TaskHeaderWithModal';
import { TaskMetadata } from './TaskMetadata';
import type { Task } from '../types';

interface TaskDisplayProps {
    task: Task;
    onDelete: () => void;
    onDoubleClick: () => void;
}

export const TaskDisplay = ({
    task,
    onDelete,
    onDoubleClick
}: TaskDisplayProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const parsed = task;

    return (
        <div
            className="p-4 rounded-lg border-2 relative space-y-2 cursor-pointer hover:bg-accent/10"
            style={{
                borderColor: TASK_STYLES.border,
                backgroundColor: TASK_STYLES.background,
                color: TASK_STYLES.text,
            }}
            onDoubleClick={() => {
                if (!isModalOpen) {
                    onDoubleClick();
                }
            }}>
            <TaskHeaderWithModal task={task}
                onSave={(updatedTask) => { console.log(updatedTask) }}
                onModalToggle={setIsModalOpen}
                onDelete={onDelete} />
            <TaskDescription description={parsed.description} />
            <TaskMetadata
                startTime={parsed.startTime}
                startDate={parsed.startDate}
                endDate={parsed.endDate}
            />
        </div>
    );
};
