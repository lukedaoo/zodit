import { Badge } from './TaskUIComponents';
import { formatDate, formatTime } from '@common/utils';
import { DEFAULT_ALIASES, resolveAlias } from '@lib/alias/timeAliasResolver';

interface TaskMetadataProps {
    startTime?: string;
    startDate?: string;
    endDate?: string;
    aliases?: any;
}

export const TaskMetadata = ({
    startTime,
    startDate,
    endDate,
    aliases = DEFAULT_ALIASES
}: TaskMetadataProps) => {
    const resolvedStartTime = startTime ? resolveAlias(startTime, aliases) : undefined;
    const resolvedStartDate = startDate ? resolveAlias(startDate, aliases) : undefined;
    const resolvedEndDate = endDate ? resolveAlias(endDate, aliases) : undefined;

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
