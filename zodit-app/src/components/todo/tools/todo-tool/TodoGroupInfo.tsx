import React from 'react';
import type { Group } from '@components/todo/types';
import { TodoAnalytics } from './todoAnalytics';

interface TodoGroupInfoProps {
    groups: Group[];
    className?: string;
    style?: React.CSSProperties;
    emptyMessage?: string;
}

export const TodoGroupInfo: React.FC<TodoGroupInfoProps> = ({
    groups,
    className = "text-xs mb-3",
    style = { color: 'var(--color-muted-foreground)' },
    emptyMessage = 'No groups in current todo'
}) => {
    const summary = TodoAnalytics.getGroupSummary(groups);

    return (
        <div className={className} style={style}>
            {summary.totalGroups > 0
                ? `${summary.totalGroups} groups (${summary.expandedGroups} expanded, ${summary.collapsedGroups} collapsed), ${summary.totalTasks} tasks (${summary.completedTasks} completed)`
                : emptyMessage}
        </div>
    );
};
