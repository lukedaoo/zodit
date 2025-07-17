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
    const header = (() => {
        if (parsed.title && parsed.description) {
            return `${parsed.title} - ${parsed.description}`;
        }
        return parsed.title || parsed.description || '';
    })();

    // <TaskDescription description={parsed.description} />

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
            <TaskHeader header={header} isEmptyTask={isEmptyTask} onDelete={onDelete} />
            <TaskMetadata
                startTime={parsed.startTime}
                startDate={parsed.startDate}
                endDate={parsed.endDate}
            />
        </div>
    );
};
