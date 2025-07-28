import { TaskInput } from './TaskInput';
import { TaskDisplay } from './TaskDisplay';
import { useTaskEditing } from './useTaskEditing';
import type { Task } from '../types';

interface TaskItemProps {
    task: Task;
    onDelete: () => void;
    isEditing: boolean;
    onSubmit: (task: Partial<Task>) => void;
    onDoubleClick: () => void;
}

export const TaskItem = ({
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
    if (isEditing && isEditing == true) {
        return (
            <TaskInput
                task={task}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onKeyDown={handleKeyDown}
                onDelete={onDelete}
                inputRef={inputRef}
            />
        );
    }

    return (
        <TaskDisplay
            task={task}
            onChangeStatus={(status) => onSubmit({ ...task, completed: status })}
            onDelete={onDelete}
            onDoubleClick={onDoubleClick}
        />
    );
};
