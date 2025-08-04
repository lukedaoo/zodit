import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { DraggableTaskList } from './DraggableTaskList';
import type { Group } from '../types';

interface Props {
    group: Group;
    onDelete: () => void;
    onUpdateName: (newName: string) => void;
    onUpdateTask: (taskId: string, task: Partial<any>) => void;
    onDeleteTask: (taskId: string) => void;
    onAddTask: () => void;
    onCollapseGroup: (collapsed: boolean) => void;
}

export const SortableGroupItem = ({
    group,
    onDelete,
    onUpdateName,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
    onCollapseGroup,
}: Props) => {
    const [collapsed, setCollapsed] = useState(group.collapsed);
    const [isEditing, setIsEditing] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        isDragging,
    } = useSortable({
        id: group.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        touchAction: 'manipulation',
    };

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (group.title.length === 0) {
            onUpdateName('Untitled');
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="space-y-3">
                <div className="flex items-center">
                    <button
                        ref={setActivatorNodeRef}
                        {...listeners}
                        className={`p-1 ${isEditing
                            ? 'cursor-default opacity-50'
                            : 'cursor-grab active:cursor-grabbing'
                            }`}
                        aria-label="Drag handle"
                        disabled={isEditing}
                    >
                        <GripVertical size={16} />
                    </button>

                    <div className="relative w-full">
                        <input
                            type="text"
                            value={group.title}
                            onChange={(e) => onUpdateName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setIsEditing(false);
                                }
                            }}
                            onDoubleClick={handleDoubleClick}
                            onBlur={handleBlur}
                            className={`w-full p-4 rounded-lg border-1 bg-transparent focus:outline-none ${isEditing ? 'focus:ring-2' : ''
                                } ${!isEditing ? 'cursor-pointer' : ''}`}
                            readOnly={!isEditing}
                            style={{
                                borderColor: 'var(--color-primary-500)',
                                color: 'var(--color-foreground)',
                                backgroundColor: 'var(--color-background)',
                                ['--tw-ring-color' as any]: 'var(--color-primary-500)',
                            }}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2 items-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCollapsed(!collapsed);
                                    onCollapseGroup(!collapsed);
                                }}
                                className="hover:text-green-500 transition-colors"
                            >
                                {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {!collapsed && !isDragging && (
                    <DraggableTaskList
                        tasks={group.tasks}
                        groupId={group.id}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                        onAdd={onAddTask}
                    />
                )}
            </div>
        </div>
    );
};
