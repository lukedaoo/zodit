import React, { useCallback, useState } from 'react';
import { AddGroupButton } from './AddButtonComponents';
import { DraggableGroupList } from './draggable/DraggableGroupList';
import { TodoDragOverlay } from './draggable/TodoDragOverlay';

import { useTodo } from './useTodo';
import { useTodoDate } from './hooks/useTodoDate';
import { useTodoDragAndDrop } from './hooks/useTodoDragAndDrop';
import { useSharedNotes } from '@hooks/useSharedNotes';
import { useTodoToolActions } from './tools/todo-tool/useTodoToolActions';
import { useTodoToolBar } from './tools/useToolBar_Todo';

import { GreetingNav } from '@components/gadget/GreetingNav';
import { StatusMessage } from '@components/gadget/StatusMessage';
import { ToolboxBar } from '@components/gadget/ToolBoxBar';

import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { convert } from '@common/utils';

export interface TodoProps {
    onNavigateToNotes?: () => void;
}

const Todo: React.FC<TodoProps> = ({ onNavigateToNotes }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);

    const todo = useTodo();
    const date = useTodoDate({
        getTodoByDate: todo.getTodoByDate,
        loadTodo: todo.loadTodo,
        createTodo: todo.createTodo,
        buildHeatMapFromTaskDates: todo.buildHeatMapFromTaskDates,
        todos: todo.todos,
        isInitialized: todo.isInitialized
    });

    const drag = useTodoDragAndDrop({
        groups: todo.groups,
        reorderGroup: todo.reorderGroup,
        reorderTask: todo.reorderTask,
        moveTaskBetweenGroups: todo.moveTaskBetweenGroups
    });

    const { pinnedNotes } = useSharedNotes();
    const actions = useTodoToolActions({
        groups: todo.groups,
        setIsCollapsed,
        bulkUpdateGroupCollapse: todo.bulkUpdateGroupCollapse,
        bulkDeleteGroups: todo.bulkDeleteGroups,
        bulkDeleteTasks: todo.bulkDeleteTasksWithFilter,
        bulkToggleTasks: todo.bulkToggleTasks,
        copyTodoAndLoad: todo.copyTodoAndLoad

    });

    const toolboxTools = useTodoToolBar({
        activeTodo: todo.todos.find(t => t.id === todo.activeTodoId),
        groups: todo.groups,
        pinnedNotes,
        onNavigateToNotes,
        actions
    });

    const handleToolAction = (toolId: string, action: string, data?: unknown) => {
        console.log(`Tool ${toolId} ${action}`, data);
    };

    const handleAddGroup = () => {
        if (!todo.isInitialized || todo.isLoading) return;
        const dateAsString = convert(date.currentDate);

        let targetTodo = todo.getTodoByDate(dateAsString);
        if (!targetTodo) {
            targetTodo = todo.createTodo(dateAsString);
            if (targetTodo) todo.loadTodo(targetTodo);
        }
        if (targetTodo) todo.addGroup();
    };

    const handleDateChangeWrapper = useCallback(
        (newDate: Date) => {
            if (todo.isInitialized && !todo.isLoading) date.handleDateChange(newDate);
        },
        [todo.isInitialized, todo.isLoading, date.handleDateChange]
    );

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
                <div className="max-w-3xl mx-auto space-y-8">
                    <GreetingNav
                        onChangeDate={handleDateChangeWrapper}
                        heatmapData={date.heatmapData}
                        currentDate={date.currentDate}
                    />

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
