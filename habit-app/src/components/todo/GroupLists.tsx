import type { Group } from './types';
import GroupItem from './GroupItem';

import { GROUP_COLLAPSE_THRESHOLD } from '@user-prefs/const';
import { useCollapsibleList } from '@hooks/useCollapsibleList';
import { useUserSettings } from '@hooks/useUserSettings';

interface Props {
    groups: Group[];
    onUpdateGroupName: (groupId: string, newName: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onUpdateTask: (groupId: string, taskId: string, updates: Partial<any>) => void;
    onDeleteTask: (groupId: string, taskId: string) => void;
    onAddTask: (groupId: string) => void;
}

const GroupLists = ({
    groups,
    onUpdateGroupName,
    onDeleteGroup,
    onUpdateTask,
    onDeleteTask,
    onAddTask
}: Props) => {
    const { get } = useUserSettings();
    const threshold = get(GROUP_COLLAPSE_THRESHOLD);

    const {
        visibleItems: visibleGroups,
        expanded: showAllGroups,
        shouldCollapse,
        toggle
    } = useCollapsibleList(groups, threshold);

    return (
        <div className="space-y-6">
            {visibleGroups.map((group) => (
                <GroupItem
                    key={group.id}
                    group={group}
                    onUpdateName={(name) => onUpdateGroupName(group.id, name)}
                    onUpdateTask={(taskId, task) => onUpdateTask(group.id, taskId, task)}
                    onDelete={() => onDeleteGroup(group.id)}
                    onDeleteTask={(taskId) => onDeleteTask(group.id, taskId)}
                    onAddTask={() => onAddTask(group.id)}
                />
            ))}

            {shouldCollapse && (
                <button
                    onClick={toggle}
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
