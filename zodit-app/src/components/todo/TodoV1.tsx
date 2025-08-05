import React, { useCallback, useMemo } from 'react';
import { AddGroupButton } from './AddButtonComponents';
import { DraggableGroupList } from './draggable/DraggableGroupList';
import { useTodo } from './useTodo';
import { useTodoDate } from './hooks/useTodoDate';
import { useTodoDragAndDrop } from './hooks/useTodoDragAndDrop';
import { TodoDragOverlay } from './draggable/TodoDragOverlay';

import { GreetingNav } from '@components/gadget/GreetingNav';
import { StatusMessage } from '@components/gadget/StatusMessage';

import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { convert } from '@common/utils';

interface TodoProps {
    onNavigateToNotes?: () => void;
}

import { Pin, CheckSquare } from 'lucide-react';
import { ToolboxBar } from '@components/gadget/ToolBoxBar';
import type { Toolbox } from '@components/gadget/ToolBoxBar';
import { PinnedNotesTool } from './tools/PinnedNotesTools';
import { TodoTool } from './tools/TodoTool';
import { useSharedNotes } from '@hooks/useSharedNotes';

const Todo: React.FC<TodoProps> = ({ onNavigateToNotes }) => {
    const {
        error,
        createTodo,
        getTodoByDate,
        loadTodo,
        groups,
        addGroup,
        updateGroupName,
        updateGroupCollapseStatus,
        bulkUpdateGroupCollapse,
        deleteGroup,
        bulkDeleteGroups,
        addTask,
        updateTask,
        deleteTask,
        reorderTask,
        reorderGroup,
        moveTaskBetweenGroups,
        buildHeatMapFromTaskDates,
        bulkToggleTasks,
        todos,
        isInitialized,
        isLoading
    } = useTodo();

    const {
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

    const { pinnedNotes } = useSharedNotes();

    // Todo tool handlers
    const handleCollapseAllGroups = useCallback(() => {
        bulkUpdateGroupCollapse(true);
    }, [bulkUpdateGroupCollapse]);

    const handleExpandAllGroups = useCallback(() => {
        bulkUpdateGroupCollapse(false);
    }, [bulkUpdateGroupCollapse]);

    const handleDeleteAllGroups = useCallback(() => {
        bulkDeleteGroups();
    }, [groups, bulkDeleteGroups]);

    const handleToggleAllTasks = useCallback(() => {
        const totalTasks = groups.reduce((sum, group) => sum + group.tasks.length, 0);
        const completedTasks = groups.reduce((sum, group) => sum + group.tasks.filter(task => task.completed).length, 0);
        const shouldMarkIncomplete = completedTasks >= totalTasks / 2;
        bulkToggleTasks(!shouldMarkIncomplete);
    }, [groups, bulkToggleTasks]);

    const toolboxTools = useMemo((): Toolbox[] => {
        const tools: Toolbox[] = [];
        if (groups.length > 0) {
            tools.push({
                id: 'todo-actions',
                icon: CheckSquare,
                label: 'Todo Actions',
                count: groups.length,
                available: true,
                component: TodoTool,
                componentProps: {
                    groups,
                    onCollapseAllGroups: handleCollapseAllGroups,
                    onExpandAllGroups: handleExpandAllGroups,
                    onDeleteAllGroups: handleDeleteAllGroups,
                    onToggleAllTasks: handleToggleAllTasks,
                },
            });
        }
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
                        createdAt: new Date().toISOString(),
                        isPinned: note.isPinned
                    })),
                    onNavigateToNotes
                }
            });
        }
        return tools;
    }, [
        groups, // Simplify dependency
        pinnedNotes,
        onNavigateToNotes,
        handleCollapseAllGroups,
        handleDeleteAllGroups
    ]);

    const handleToolAction = (toolId: string, action: string, data?: any) => {
        console.log(`Tool ${toolId} ${action}`, data);
        // Handle tool actions here if needed
        // For example, you could track analytics or perform additional operations
    };

    const handleAddGroup = () => {
        if (isInitialized && !isLoading) {
            const dateAsString = convert(currentDate);
            let todo = getTodoByDate(dateAsString);
            if (!todo) {
                todo = createTodo(dateAsString);
                if (todo) {
                    loadTodo(todo);
                }
            }
            if (todo) {
                addGroup();
            }
        }
    };

    const handleDateChangeWrapper = useCallback((date: Date) => {
        if (isInitialized && !isLoading) {
            handleDateChange(date);
        }
    }, [isInitialized, isLoading, handleDateChange]);

    return (
        <>
            <StatusMessage isLoading={isLoading} error={error} />

            {/* Toolbox Bar - only show when there are tools available */}
            {toolboxTools.length > 0 && (
                <ToolboxBar
                    key={`toolbox-${groups.length}-${groups.filter(g => !g.collapsed).length}`}
                    tools={toolboxTools}
                    onToolAction={handleToolAction}
                />
            )}
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
                                key={`draggable-group-list-${groups.map(g => g.collapsed).join(',')}`}
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
