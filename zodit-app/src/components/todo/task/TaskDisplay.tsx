import { TaskDescription, TASK_STYLES } from './TaskUIComponents';
import { TaskHeaderWithModal } from './TaskHeaderWithModal';
import { TaskMetadata } from './TaskMetadata';
import { resolveTaskForDisplay, getTaskBorderColor } from './taskUtils';
import type { Task } from '../types';

interface TaskDisplayProps {
    task: Task;
    onDelete: () => void;
    onChangeStatus: (value: boolean) => void;
    onDoubleClick: () => void;
}

export const TaskDisplay = ({
    task,
    onChangeStatus,
    onDelete,
    onDoubleClick
}: TaskDisplayProps) => {
    const displayTask = resolveTaskForDisplay(task);
    const borderColor = getTaskBorderColor(displayTask);

    return (
        <div
            className="p-4 rounded-lg border-2 relative space-y-2 cursor-pointer hover:bg-accent/10"
            style={{
                borderColor: borderColor,
                backgroundColor: TASK_STYLES.background,
                color: TASK_STYLES.text,
            }}
            onDoubleClick={onDoubleClick}>

            <TaskHeaderWithModal
                task={task}
                onChangeStatus={onChangeStatus}
                onDelete={onDelete}
            />
            <TaskDescription description={displayTask.description} />
            <TaskMetadata task={displayTask} />
        </div >
    );
};
