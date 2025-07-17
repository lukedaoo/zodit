// import { TaskInput } from './task/TaskInput';
import { TaskInput } from './task/TaskInputV2';
import { TaskDisplay } from './task/TaskDisplay';
import { useTaskEditing } from './task/useTaskEditing';
import type { Task } from './types';

import { presets, DEFAULT_TASK } from './types';
import { taskToText } from './task/taskUtils';
import { USE_TEMPLATE_WHEN_ADDING_TASK } from '../../user-prefs/const';
import { useUserSettings } from '../../hooks/useUserSettings';

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
        task,
        onSubmit,
        isEditing
    );


    const { get } = useUserSettings();
    const useTemplate = get<boolean>(USE_TEMPLATE_WHEN_ADDING_TASK);
    console.log(isEditing, inputValue, useTemplate);
    if (isEditing) {
        if (inputValue.length === 0 && useTemplate) {
            setInputValue(taskToText(DEFAULT_TASK, presets.scheduled));
        }
        return (
            <TaskInput
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
