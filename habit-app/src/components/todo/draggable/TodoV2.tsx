import React from 'react';
import { AddGroupButton } from '../AddButtonComponents';
import { DraggableGroupList } from './DraggableGroupList';
import { useTodo } from '../useTodo';
import { useTodoDate } from './hooks/useTodoDate';
import { useTodoDragAndDrop } from './hooks/useTodoDragAndDrop';
import { TodoDragOverlay } from './TodoDragOverlay';

import { GreetingNav } from '@components/gadget/GreetingNav';

import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

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
        buildHeatMapFromTaskDates,
        todos
    } = useTodo();

    // Date management hook
    const {
        isLoading,
        heatmapData,
        handleDateChange
    } = useTodoDate({
        getTodoByDate,
        loadTodo,
        createTodo,
        buildHeatMapFromTaskDates,
        todos
    });

    // Drag and drop hook
    const {
        activeId,
        activeDragItem,
        handleDragStart,
        handleDragEnd
    } = useTodoDragAndDrop({
        groups,
        reorderGroup,
        reorderTask,
        moveTaskBetweenGroups
    });


    return (
        <div className="space-y-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <GreetingNav
                    onChangeDate={handleDateChange}
                    heatmapData={heatmapData}
                />
                <AddGroupButton onClick={addGroup} />

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
                        <TodoDragOverlay activeDragItem={activeDragItem} activeId={activeId} />
                    </DragOverlay>
                </DndContext>

                {groups.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg mb-2">No groups yet</p>
                        <p className="text-sm">Create your first group to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Todo;
