import {
    DndContext,
    closestCenter,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { GripVertical } from 'lucide-react';
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
    onReorderGroup: (newOrder: string[]) => void;
}

export const DraggableGroupList = ({
    groups,
    onUpdateGroupName,
    onDeleteGroup,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
    onReorderTask,
    onReorderGroup
}: Props) => {
    const { get } = useUserSettings();
    const threshold = get(GROUP_COLLAPSE_THRESHOLD);
    const [activeId, setActiveId] = useState<string | null>(null);

    const {
        visibleItems: visibleGroups,
        expanded: showAllGroups,
        shouldCollapse,
        toggle
    } = useCollapsibleList(groups, threshold);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveId(null);

        if (!over || active.id === over.id) return;

        const oldIndex = visibleGroups.findIndex(g => g.id === active.id);
        const newIndex = visibleGroups.findIndex(g => g.id === over.id);

        const newOrder = arrayMove(visibleGroups.map(g => g.id), oldIndex, newIndex);

        onReorderGroup(newOrder);
    };

    const activeGroup = activeId ? visibleGroups.find(g => g.id === activeId) : null;

    return (
        <div className="space-y-6">
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
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

                <DragOverlay>
                    {activeGroup ? (
                        <div className="opacity-90">
                            <div className="flex items-center gap-2 p-4 rounded-lg border-1"
                                style={{
                                    borderColor: 'var(--color-primary-500)',
                                    backgroundColor: 'var(--color-background)',
                                }}>
                                <GripVertical size={16} />
                                <span>{activeGroup.name}</span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
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
