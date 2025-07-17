import { TaskInput } from './task/TaskInputV2';
import { TaskDisplay } from './task/TaskDisplay';
import { useTaskEditing } from './task/useTaskEditing';
import type { Task } from './types';

interface TaskItemProps {
    task: Task;
    onDelete: () => void;
    isEditing: boolean;
    onSubmit: (task: Partial<Task>) => void;
    onDoubleClick: () => void;
}

const TaskItem = ({
    task,
    onDelete,
    isEditing,
    onSubmit,
    onDoubleClick
}: TaskItemProps) => {
    const { inputValue, setInputValue, inputRef, handleKeyDown } = useTaskEditing(
        onSubmit,
        isEditing
    );

    if (isEditing) {
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
            onDelete={onDelete}
            onDoubleClick={onDoubleClick}
        />
    );
};

export default TaskItem;
