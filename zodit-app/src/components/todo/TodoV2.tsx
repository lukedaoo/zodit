import React, { useState } from 'react';
import { AddGroupButton } from './AddButtonComponents';
import { DraggableGroupList } from './draggable/DraggableGroupList';
import { TodoDragOverlay } from './draggable/TodoDragOverlay';

import { useTodo } from './useTodo_nodate';
import { useTodoDragAndDrop } from './hooks/useTodoDragAndDrop';
import { useSharedNotes } from '@hooks/useSharedNotes';
import { useTodoToolActions } from './tools/todo-tool/useTodoToolActions';
import { useTodoToolBar } from './tools/useToolBar_Todo';
//
import { StatusMessage } from '@components/gadget/StatusMessage';
import { ToolboxBar } from '@components/gadget/ToolBoxBar';

import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export interface TodoProps {
    onNavigateToNotes?: () => void;
}

const Todo: React.FC<TodoProps> = ({ onNavigateToNotes }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);

    const todo = useTodo();

    const drag = useTodoDragAndDrop({
        groups: todo.groups,
        reorderGroup: todo.reorderGroup,
        reorderTask: todo.reorderTask,
        moveTaskBetweenGroups: todo.moveTaskBetweenGroups
    });

    const { pinnedNotes } = useSharedNotes();

    // Updated to use the new single todo structure
    const actions = useTodoToolActions({
        groups: todo.groups,
        setIsCollapsed,
        bulkUpdateGroupCollapse: todo.bulkUpdateGroupCollapse,
        bulkDeleteGroups: todo.bulkDeleteGroups,
        bulkDeleteTasks: todo.bulkDeleteTasksWithFilter,
        bulkToggleTasks: todo.bulkToggleTasks,
        copyTodoAndLoad: todo.copyTodoAndLoad,
        importTodoData: todo.importTodoData
    });
    // //
    const toolboxTools = useTodoToolBar({
        activeTodo: todo.todos[0],
        groups: todo.groups,
        pinnedNotes,
        onNavigateToNotes,
        actions
    });
    //
    const handleToolAction = (toolId: string, action: string, data?: unknown) => {
        console.log(`Tool ${toolId} ${action}`, data);
    };

    const handleAddGroup = () => {
        if (!todo.isInitialized || todo.isLoading) return;
        if (todo.todo) {
            todo.addGroup();
        }
    };

    return (
        <>
            <StatusMessage isLoading={todo.isLoading} error={todo.error} />

            {toolboxTools.length > 0 && (
                <ToolboxBar
                    tools={toolboxTools}
                    onToolAction={handleToolAction}
                />
            )}
            <div className="space-y-6">
                <div className="max-w-3xl mx-auto space-y-20">

                    <AddGroupButton onClick={handleAddGroup} />

                    <DndContext
                        collisionDetection={rectIntersection}
                        onDragStart={drag.handleDragStart}
                        onDragEnd={drag.handleDragEnd}
                    >
                        <SortableContext
                            items={todo.groups.map(g => g.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <DraggableGroupList
                                key={`draggable-group-list-collapsed#${isCollapsed}`}
                                groups={todo.groups}
                                onUpdateGroupName={todo.updateGroupName}
                                onUpdateTask={todo.updateTask}
                                onDeleteGroup={todo.deleteGroup}
                                onDeleteTask={todo.deleteTask}
                                onAddTask={todo.addTask}
                                onGroupCollapseStatusChange={todo.updateGroupCollapseStatus}
                            />
                        </SortableContext>

                        <DragOverlay>
                            <TodoDragOverlay activeDragItem={drag.activeDragItem} activeId={drag.activeId} />
                        </DragOverlay>
                    </DndContext>

                    {todo.groups.length === 0 && !todo.isLoading && (
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
