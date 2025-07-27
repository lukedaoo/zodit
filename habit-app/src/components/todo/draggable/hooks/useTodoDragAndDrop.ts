import { useState, useCallback, useMemo } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Group } from '../../types';

interface DragItem {
    id: string;
    type: 'group' | 'task';
    title?: string;
    groupId?: string;
}

interface UseTodoDragAndDropProps {
    groups: Group[];
    reorderGroup: (newOrder: string[]) => void;
    reorderTask: (groupId: string, newOrder: string[]) => void;
    moveTaskBetweenGroups: (
        sourceGroupId: string,
        targetGroupId: string,
        taskId: string,
        targetTaskId: string | null
    ) => void;
}

export const useTodoDragAndDrop = ({
    groups,
    reorderGroup,
    reorderTask,
    moveTaskBetweenGroups
}: UseTodoDragAndDropProps) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    // Memoize group IDs for performance
    const groupIds = useMemo(() => new Set(groups.map(g => g.id)), [groups]);

    // Utility function to parse drag IDs
    const parseDragId = useCallback((id: string): { groupId?: string; taskId?: string; isTask: boolean } => {
        if (id.includes('/')) {
            const [groupId, taskId] = id.split('/');
            return { groupId, taskId, isTask: true };
        }
        return { groupId: id, isTask: false };
    }, []);

    // Get active drag item with proper typing
    const getActiveDragItem = useCallback((activeId: string): DragItem | null => {
        if (!activeId) return null;

        const { groupId, taskId, isTask } = parseDragId(activeId);

        if (isTask && groupId && taskId) {
            const group = groups.find(g => g.id === groupId);
            const task = group?.tasks.find(t => t.id === taskId);
            return task ? {
                id: activeId,
                type: 'task',
                title: task.title,
                groupId
            } : null;
        } else if (!isTask && groupId) {
            const group = groups.find(g => g.id === groupId);
            return group ? {
                id: activeId,
                type: 'group',
                title: group.title
            } : null;
        }

        return null;
    }, [groups, parseDragId]);

    const activeDragItem = useMemo(() =>
        activeId ? getActiveDragItem(activeId) : null,
        [activeId, getActiveDragItem]
    );

    // Handle drag start
    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    // Handle group reordering
    const handleGroupReorder = useCallback((activeId: string, overId: string) => {
        const oldIndex = groups.findIndex(g => g.id === activeId);
        const newIndex = groups.findIndex(g => g.id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newOrder = arrayMove(groups.map(g => g.id), oldIndex, newIndex);
            reorderGroup(newOrder);
        }
    }, [groups, reorderGroup]);

    // Handle task reordering within same group
    const handleTaskReorder = useCallback((
        groupId: string,
        activeTaskId: string,
        overTaskId: string
    ) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const oldIndex = group.tasks.findIndex(t => t.id === activeTaskId);
        const newIndex = group.tasks.findIndex(t => t.id === overTaskId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newOrder = arrayMove(group.tasks.map(t => t.id), oldIndex, newIndex);
            reorderTask(groupId, newOrder);
        }
    }, [groups, reorderTask]);

    // Handle drag end with improved logic
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            setActiveId(null);
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        try {
            // Handle group reordering
            if (groupIds.has(activeId)) {
                handleGroupReorder(activeId, overId);
                setActiveId(null);
                return;
            }

            // Handle task operations
            const { groupId: activeGroupId, taskId: activeTaskId } = parseDragId(activeId);
            const { groupId: overGroupId, taskId: overTaskId } = parseDragId(overId);

            if (!activeGroupId || !activeTaskId) {
                setActiveId(null);
                return;
            }

            // Same group reordering
            if (activeGroupId === overGroupId && overTaskId) {
                handleTaskReorder(activeGroupId, activeTaskId, overTaskId);
            }
            // Cross-group movement
            else if (activeGroupId !== overGroupId && overGroupId) {
                moveTaskBetweenGroups(activeGroupId, overGroupId, activeTaskId, overTaskId || null);
            }
        } catch (error) {
            console.error('Error handling drag end:', error);
        } finally {
            setActiveId(null);
        }
    }, [groupIds, parseDragId, handleGroupReorder, handleTaskReorder, moveTaskBetweenGroups]);

    return {
        activeId,
        activeDragItem,
        groupIds,
        handleDragStart,
        handleDragEnd
    };
};
