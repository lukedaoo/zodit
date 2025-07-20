import { useState, useEffect } from 'react';
import { SortableTaskItem } from './SortableTaskItem.tsx';
import { AddTaskButton } from '../AddButtonComponents';
import type { Task } from '../types';

import { TASK_COLLAPSE_THRESHOLD } from '@user-prefs/const';
import { useCollapsibleList } from '@hooks/useCollapsibleList';
import { useUserSettings } from '@hooks/useUserSettings';

import {
    DndContext,
    closestCenter,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Props {
    tasks: Task[];
    groupId: string;
    onUpdate: (taskId: string, updates: Partial<any>) => void;
    onDelete: (taskId: string) => void;
    onAdd: () => void;
    onReorderTask: (newOrder: string[]) => void;
}

export const DraggableTaskList = ({
    tasks,
    groupId,
    onUpdate,
    onDelete,
    onAdd,
    onReorderTask,
}: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null);

    const { get } = useUserSettings();
    const threshold = get(TASK_COLLAPSE_THRESHOLD);

    const {
        visibleItems: visibleTasks,
        expanded: showAllTasks,
        shouldCollapse,
        toggle
    } = useCollapsibleList(tasks, threshold);

    const [taskOrder, setTaskOrder] = useState<string[]>([]);

    useEffect(() => {
        setTaskOrder(visibleTasks.map((t) => t.id));
    }, [visibleTasks]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = taskOrder.indexOf(active.id as string);
        const newIndex = taskOrder.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(taskOrder, oldIndex, newIndex);
            setTaskOrder(newOrder);
            onReorderTask(newOrder);
        }
    };

    const orderedTasks = taskOrder
        .map((id) => visibleTasks.find((t) => t.id === id))
        .filter(Boolean) as Task[];

    return (
        <div className="ml-6 space-y-3">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={orderedTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {orderedTasks.map((task) => (
                        <SortableTaskItem
                            key={`${groupId}/${task.id}`}
                            task={task}
                            isEditing={editingId === task.id}
                            onDelete={() => onDelete(task.id)}
                            onSubmit={(parsed) => {
                                parsed.id = task.id;
                                onUpdate(parsed.id, parsed);
                                setEditingId(null);
                            }}
                            onDoubleClick={() => setEditingId(task.id)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            {shouldCollapse && (
                <div className="flex items-center space-x-2">
                    <div className="w-6"></div>
                    <div className="flex-1">
                        <button
                            className="text-sm text-blue-500 hover:underline"
                            onClick={toggle}
                        >
                            {showAllTasks
                                ? 'Show Less'
                                : `Show All (${tasks.length})`}
                        </button>
                    </div>
                </div>
            )}
            <div className="flex items-center space-x-2">
                <div className="w-6"></div>
                <div className="flex-1">
                    <AddTaskButton onClick={() => {
                        onAdd();
                    }} />
                </div>
            </div>

        </div>
    );
};
