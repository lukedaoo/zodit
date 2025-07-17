import { useState } from 'react';
import type { Group } from './types';
import GroupItem from './GroupItem';

interface Props {
    groups: Group[];
    onUpdateGroupName: (groupId: string, newName: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onUpdateTask: (groupId: string, taskId: string, updates: Partial<any>) => void;
    onDeleteTask: (groupId: string, taskId: string) => void;
    onAddTask: (groupId: string) => void;
}

const GROUP_COLLAPSE_THRESHOLD = 3;

const GroupLists = ({
    groups,
    onUpdateGroupName,
    onDeleteGroup,
    onUpdateTask,
    onDeleteTask,
    onAddTask
}: Props) => {
    const [showAllGroups, setShowAllGroups] = useState(false);

    const shouldCollapseGroups = groups.length > GROUP_COLLAPSE_THRESHOLD;
    const visibleGroups = showAllGroups || !shouldCollapseGroups
        ? groups
        : groups.slice(0, GROUP_COLLAPSE_THRESHOLD);

    return (
        <div className="space-y-6">
            {visibleGroups.map((group) => (
                <GroupItem
                    key={group.id}
                    group={group}
                    // onToggleCollapse={() => { }}
                    // isCollapsed={false}
                    onUpdateName={(name) => onUpdateGroupName(group.id, name)}
                    onUpdateTask={(taskId, task) => onUpdateTask(group.id, taskId, task)}
                    onDelete={() => onDeleteGroup(group.id)}
                    onDeleteTask={(taskId) => onDeleteTask(group.id, taskId)}
                    onAddTask={() => onAddTask(group.id)}
                />
            ))}

            {shouldCollapseGroups && (
                <button
                    onClick={() => setShowAllGroups(!showAllGroups)}
                    className="text-sm text-blue-500 hover:underline mt-2"
                >
                    {showAllGroups
                        ? 'Show Less Groups'
                        : `Show All Groups (${groups.length})`}
                </button>
            )}
        </div>
    );
};

export default GroupLists;
