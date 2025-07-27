import React, { useState, useMemo } from 'react';
import { AddGroupButton } from '../AddButtonComponents';
import { DraggableGroupList } from './DraggableGroupList';
import { useTodo } from '../useTodo';

import { GreetingNav } from '@components/gadget/GreetingNav';

import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';

const Todo: React.FC = () => {
    const {
        createTodo,
        getTodoByDate,
        loadTodo,
        groups,
        addGroup,
        updateGroupName,
        deleteGroup,
        addTask,
        updateTask,
        deleteTask,
        reorderTask,
        reorderGroup,
        moveTaskBetweenGroups,
        buildHeatMapFromTaskDates
    } = useTodo();

    const [activeId, setActiveId] = useState<any>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());


    const heatmapData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const monthString = `${year}-${month.toString().padStart(2, '0')}`;
        return buildHeatMapFromTaskDates(monthString);
    }, [currentDate, buildHeatMapFromTaskDates]);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const groupIds = new Set(groups.map(g => g.id));

        // Handle group reordering
        if (groupIds.has(activeId)) {
            const oldIndex = groups.findIndex(g => g.id === activeId);
            const newIndex = groups.findIndex(g => g.id === overId);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const newOrder = arrayMove(groups.map(g => g.id), oldIndex, newIndex);
                reorderGroup(newOrder);
            }
            setActiveId(null);
            return;
        }

        // Handle task reordering/moving
        const [activeGroupId, activeTaskId] = activeId.split('/');
        const isOverTask = overId.includes('/');
        const [overGroupId, overTaskId] = isOverTask ? overId.split('/') : [overId, null];

        // Same group reordering
        if (activeGroupId === overGroupId && overTaskId) {
            const group = groups.find(g => g.id === activeGroupId);
            if (!group) {
                setActiveId(null);
                return;
            }

            const oldIndex = group.tasks.findIndex(t => t.id === activeTaskId);
            const newIndex = group.tasks.findIndex(t => t.id === overTaskId);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const newOrder = arrayMove(group.tasks.map(t => t.id), oldIndex, newIndex);
                reorderTask(activeGroupId, newOrder);
            }
        } else if (activeGroupId !== overGroupId) {
            // Cross-group movement
            moveTaskBetweenGroups(activeGroupId, overGroupId, activeTaskId, overTaskId);
        }

        setActiveId(null);
    };

    const activeGroup = groups.find(g => g.id === activeId);
    const activeTask = !activeGroup
        ? groups.flatMap(g => g.tasks.map(t => ({ ...t, groupId: g.id })))
            .find(t => `${t.groupId}/${t.id}` === activeId)
        : null;

    const activeItem = activeGroup ?? activeTask ?? null;

    const handleDateChange = (date: Date) => {
        // Update current date state to trigger heatmap regeneration
        setCurrentDate(date);

        const dateAsString = date.toISOString().split('T')[0];
        const existingTodo = getTodoByDate(dateAsString);
        if (existingTodo) {
            loadTodo(existingTodo);
        } else {
            const newTodo = createTodo(dateAsString);
            loadTodo(newTodo);
        }
    };

    return (
        <div className="space-y-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <GreetingNav onChangeDate={handleDateChange} heatmapData={heatmapData} />                <AddGroupButton onClick={addGroup} />

                <DndContext
                    collisionDetection={rectIntersection}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >

                    <SortableContext
                        items={groups.map(g => g.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <DraggableGroupList
                            groups={groups}
                            onUpdateGroupName={updateGroupName}
                            onUpdateTask={updateTask}
                            onDeleteGroup={deleteGroup}
                            onDeleteTask={deleteTask}
                            onAddTask={addTask}
                        />
                    </SortableContext>

                    <DragOverlay>
                        {activeItem && (() => {
                            let displayText = '';
                            if ('title' in activeItem && activeItem.title) {
                                displayText = activeItem.title;
                            } else {
                                displayText = activeItem.id;
                            }

                            return (
                                <div
                                    className="opacity-90 p-4 rounded-lg border-1"
                                    style={{
                                        borderColor: 'var(--color-primary-500)',
                                        backgroundColor: 'var(--color-background)',
                                    }}
                                >
                                    <span>{displayText}</span>
                                </div>
                            );
                        })()}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
};

export default Todo;
