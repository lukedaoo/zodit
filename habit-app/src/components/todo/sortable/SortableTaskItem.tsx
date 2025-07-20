import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TaskInput } from '../task/TaskInput';
import { TaskDisplay } from '../task/TaskDisplay';
import { useTaskEditing } from '../task/useTaskEditing';
import type { Task } from '../types';

interface TaskItemProps {
    task: Task;
    onDelete: () => void;
    isEditing: boolean;
    onSubmit: (task: Partial<Task>) => void;
    onDoubleClick: () => void;
}

export const SortableTaskItem = ({
    task,
    onDelete,
    isEditing,
    onSubmit,
    onDoubleClick
}: TaskItemProps) => {
    const { inputValue, setInputValue, inputRef, handleKeyDown } = useTaskEditing(
        onSubmit,
        isEditing,
        task
    );

    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'manipulation',
    };

    return (
        <div ref={setNodeRef} style={style} {...(!isEditing ? attributes : {})}>
            <div className="flex items-center space-x-2">
                <button
                    ref={!isEditing ? setActivatorNodeRef : undefined}
                    {...(!isEditing ? listeners : {})}
                    className={`p-1 ${isEditing
                        ? 'cursor-default opacity-50'
                        : 'cursor-grab active:cursor-grabbing'
                        }`}
                    aria-label="Drag handle"
                    disabled={isEditing}
                >
                    <GripVertical size={16} />
                </button>
                <div className="flex-1">
                    {isEditing ? (
                        <TaskInput
                            task={task}
                            inputValue={inputValue}
                            onInputChange={setInputValue}
                            onKeyDown={handleKeyDown}
                            onDelete={onDelete}
                            inputRef={inputRef}
                        />
                    ) : (
                        <TaskDisplay
                            task={task}
                            onChangeStatus={(status) => onSubmit({ ...task, completed: status })}
                            onDelete={onDelete}
                            onDoubleClick={onDoubleClick}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
