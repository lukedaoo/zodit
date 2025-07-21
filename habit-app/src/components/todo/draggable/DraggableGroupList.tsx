import {
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import type { Group } from '../types';
import { SortableGroupItem } from './SortableGroupItem';
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

export const DraggableGroupList = ({
    groups,
    onUpdateGroupName,
    onDeleteGroup,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
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
            <SortableContext
                items={visibleGroups.map((g) => g.id)}
                strategy={verticalListSortingStrategy}
            >
                {visibleGroups.map((group) => (
                    <SortableGroupItem
                        key={group.id}
                        group={group}
                        onUpdateName={(name) => onUpdateGroupName(group.id, name)}
                        onDelete={() => onDeleteGroup(group.id)}
                        onUpdateTask={(taskId, task) => onUpdateTask(group.id, taskId, task)}
                        onDeleteTask={(taskId) => onDeleteTask(group.id, taskId)}
                        onAddTask={() => onAddTask(group.id)}
                    />
                ))}
            </SortableContext>
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
