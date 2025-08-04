import React, { useCallback } from 'react';
import { AddGroupButton } from '../AddButtonComponents';
import { DraggableGroupList } from './DraggableGroupList';
import { useTodo } from '../useTodo';
import { useTodoDate } from './hooks/useTodoDate';
import { useTodoDragAndDrop } from './hooks/useTodoDragAndDrop';
import { TodoDragOverlay } from './TodoDragOverlay';

import { GreetingNav } from '@components/gadget/GreetingNav';

import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface TodoProps {
    // onNavigateToNotes?: () => void;
}


// import { Pin } from 'lucide-react';
// import { ToolboxBar } from '@components/gadget/ToolBoxBar';
// import type { Toolbox } from '@components/gadget/ToolBoxBar';
// import { PinnedNotesTool } from './tools/PinnedNotesTools';
// import { useSharedNotes } from '@hooks/useSharedNotes';

const Todo: React.FC<TodoProps> = () => {
    const {
        createTodo,
        getTodoByDate,
        loadTodo,
        groups,
        addGroup,
        updateGroupName,
        updateGroupCollapseStatus,
        deleteGroup,
        addTask,
        updateTask,
        deleteTask,
        reorderTask,
        reorderGroup,
        moveTaskBetweenGroups,
        buildHeatMapFromTaskDates,
        todos,
        isInitialized
    } = useTodo();

    const {
        isLoading,
        heatmapData,
        handleDateChange,
        currentDate
    } = useTodoDate({
        getTodoByDate,
        loadTodo,
        createTodo,
        buildHeatMapFromTaskDates,
        todos,
        isInitialized
    });

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

    /* const { pinnedNotes } = useSharedNotes();

    const toolboxTools = useMemo((): Toolbox[] => {
        const tools: Toolbox[] = [];

        if (pinnedNotes.length > 0) {
            tools.push({
                id: 'pinned-notes',
                icon: Pin,
                label: 'Pinned Notes',
                count: pinnedNotes.length,
                available: true,
                component: PinnedNotesTool,
                componentProps: {
                    notes: pinnedNotes.map(note => ({
                        id: note.id,
                        text: note.text,
                        createdAt: new Date().toISOString(), // Notes don't have createdAt, using current time
                        isPinned: note.isPinned
                    })),
                    onNavigateToNotes
                }
            });
        }

        for (let i = 0; i < 5; i++) {
            tools.push({
                id: `tool-${i}`,
                icon: Pin,
                label: `Tool ${i}`,
                available: true,
                component: PinnedNotesTool,
                componentProps: {
                    notes: pinnedNotes.map(note => ({
                        id: note.id,
                        text: note.text,
                        createdAt: new Date().toISOString(), // Notes don't have createdAt, using current time
                        isPinned: note.isPinned
                    })),
                    onNavigateToNotes
                }
            });
        }

        return tools;
    }, [pinnedNotes, onNavigateToNotes]); */

    // const handleToolAction = (toolId: string, action: string, data?: any) => {
    //     console.log(`Tool ${toolId} ${action}`, data);
    //     // Handle tool actions here
    // };
    // <ToolboxBar
    //     tools={toolboxTools}
    //     onToolAction={handleToolAction}
    // />

    const handleAddGroup = () => {
        if (isInitialized && !isLoading) {
            addGroup();
        }
    };

    const handleDateChangeWrapper = useCallback((date: Date) => {
        if (isInitialized && !isLoading) {
            handleDateChange(date);
        }
    }, [isInitialized, isLoading, handleDateChange]);

    return (
        <>
            {/* Toolbox Bar */}

            <div className="space-y-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    <GreetingNav
                        onChangeDate={handleDateChangeWrapper}
                        heatmapData={heatmapData}
                        currentDate={currentDate}
                    />

                    <AddGroupButton
                        onClick={handleAddGroup}
                    />

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
                                onGroupCollapseStatusChange={updateGroupCollapseStatus}
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
        </>
    );
};

export default Todo;
