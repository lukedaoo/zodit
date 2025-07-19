import { Badge } from './TaskUIComponents';
import { formatDate, formatTime } from '@common/utils';
import { resolveTaskAsTask } from './taskUtils';
import type { Task } from '../types';

interface TaskMetadataProps {
    task: Task;
}

export const TaskMetadata = ({
    task
}: TaskMetadataProps) => {
    console.log('original, task', task);
    const _task = resolveTaskAsTask(task);
    console.log('showing metadata', _task);
    const resolvedStartTime = _task.startTime;
    const resolvedStartDate = _task.startDate;
    const resolvedEndDate = _task.endDate;

    const hasMetadata = resolvedStartTime || resolvedStartDate || resolvedEndDate;
    if (!hasMetadata) return null;

    return (
        <div className="text-xs flex flex-wrap gap-2 justify-end">
            {resolvedStartTime && (
                <Badge variant="primary">@ {formatTime(resolvedStartTime)}</Badge>
            )}
            {resolvedStartDate && (
                <Badge variant="success">Start: {formatDate(resolvedStartDate)}</Badge>
            )}
            {resolvedEndDate && (
                <Badge variant="warning">End: {formatDate(resolvedEndDate)}</Badge>
            )}
        </div>
    );
};
