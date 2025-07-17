import { TaskHeader, TaskDescription, TASK_STYLES } from './TaskUIComponents';
import { TaskMetadata } from './TaskMetadata';
import type { Task } from '../types';
import { isEmpty, presets } from '../types';

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
    const parsed = task;
    const isEmptyTask = isEmpty(parsed, presets.scheduled);

    return (
        <div
            className="p-4 rounded-lg border-2 relative space-y-2 cursor-pointer hover:bg-accent/10"
            style={{
                borderColor: TASK_STYLES.border,
                backgroundColor: TASK_STYLES.background,
                color: TASK_STYLES.text,
            }}
            onDoubleClick={onDoubleClick}
        >
            <TaskHeader title={parsed.title + ""} isEmptyTask={isEmptyTask} onDelete={onDelete} />
            <TaskDescription description={parsed.description} />
            <TaskMetadata
                startTime={parsed.startTime}
                startDate={parsed.startDate}
                endDate={parsed.endDate}
            />
        </div>
    );
};
