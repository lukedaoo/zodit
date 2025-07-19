import { Badge } from './TaskUIComponents';
import { formatDate, formatTime } from '@common/utils';
import type { Task } from '../types';

interface TaskMetadataProps {
    task: Task;
}

export const TaskMetadata = ({
    task
}: TaskMetadataProps) => {
    if (!task) return null;
    const hasMetadata = task.startTime || task.startDate || task.endDate;
    if (!hasMetadata) return null;

    return (
        <div className="text-xs flex flex-wrap gap-2 justify-end">
            {task.startTime && (
                <Badge variant="primary">@ {formatTime(task.startTime)}</Badge>
            )}
            {task.startDate && (
                <Badge variant="success">Start: {formatDate(task.startDate)}</Badge>
            )}
            {task.endDate && (
                <Badge variant="warning">End: {formatDate(task.endDate)}</Badge>
            )}
        </div>
    );
};
