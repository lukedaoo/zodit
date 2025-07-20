import {
    DndContext,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';

import type { DragEndEvent } from '@dnd-kit/core';

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

    onReorderTask: (groupId: string, newOrder: string[]) => void;
}

export const DraggableGroupList = ({
    groups,
    onUpdateGroupName,
    onDeleteGroup,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
    onReorderTask,
}: Props) => {
    const { get } = useUserSettings();
    const threshold = get(GROUP_COLLAPSE_THRESHOLD);

    const {
        visibleItems: visibleGroups,
        expanded: showAllGroups,
        shouldCollapse,
        toggle
    } = useCollapsibleList(groups, threshold);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = visibleGroups.findIndex(g => g.id === active.id);
        const newIndex = visibleGroups.findIndex(g => g.id === over.id);

        const newOrder = arrayMove(visibleGroups.map(g => g.id), oldIndex, newIndex);
        // Parent must implement group reordering
        // E.g. pass this handler as onReorderGroup
        console.log('Reorder groups:', newOrder);
        // onReorderGroup(newOrder); // <-- implement in parent if needed
    };

    return (
        <div className="space-y-6">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                            onReorderTask={(newOrder) => onReorderTask(group.id, newOrder)}
                        />
                    ))}
                </SortableContext>
            </DndContext>

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

