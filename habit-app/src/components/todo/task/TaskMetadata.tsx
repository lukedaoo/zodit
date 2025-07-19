import { Badge } from './TaskUIComponents';
import { formatDate, formatTime } from '@common/utils';
import { resolveTaskWithMetadata, resolveTaskForDisplay } from './taskUtils';
import type { Task } from '../types';

interface TaskMetadataProps {
    task: Task;
}

export const TaskMetadata = ({
    task
}: TaskMetadataProps) => {
    const _task = resolveTaskWithMetadata(task);
    const displayTask = resolveTaskForDisplay(_task);

    const hasMetadata = displayTask.startTime || displayTask.startDate || displayTask.endDate;
    if (!hasMetadata) return null;

    return (
        <div className="text-xs flex flex-wrap gap-2 justify-end">
            {displayTask.startTime && (
                <Badge variant="primary">@ {formatTime(displayTask.startTime)}</Badge>
            )}
            {displayTask.startDate && (
                <Badge variant="success">Start: {formatDate(displayTask.startDate)}</Badge>
            )}
            {displayTask.endDate && (
                <Badge variant="warning">End: {formatDate(displayTask.endDate)}</Badge>
            )}
        </div>
    );
};
