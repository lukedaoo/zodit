import { useState, useEffect } from 'react';
import { SortableTaskItem } from './SortableTaskItem.tsx';
import { AddTaskButton } from '../AddButtonComponents';
import type { Task } from '../types';

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
}

export const SortableTaskLists = ({
    tasks,
    groupId,
    onUpdate,
    onDelete,
    onAdd,
}: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [taskOrder, setTaskOrder] = useState<string[]>([]);

    useEffect(() => {
        // Reset order whenever tasks change
        setTaskOrder(tasks.map((t) => t.id));
    }, [tasks]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = taskOrder.indexOf(active.id as string);
        const newIndex = taskOrder.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(taskOrder, oldIndex, newIndex);
            setTaskOrder(newOrder);
        }
    };

    const orderedTasks = taskOrder
        .map((id) => tasks.find((t) => t.id === id))
        .filter(Boolean) as Task[];

    return (
        <div className="ml-8 space-y-3">
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

            <AddTaskButton onClick={onAdd} />
        </div>
    );
};
