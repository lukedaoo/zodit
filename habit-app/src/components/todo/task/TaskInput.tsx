import { DeleteButton, TASK_STYLES } from './TaskUIComponents';
import { taskToText } from './taskUtils';
import { presets, DEFAULT_TASK } from '../types';

interface TaskInputProps {
    inputValue: string;
    onInputChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onDelete: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

export const TaskInput = ({
    inputValue,
    onInputChange,
    onKeyDown,
    onDelete,
    inputRef
}: TaskInputProps) => {
    const placeholder = taskToText(DEFAULT_TASK, presets.scheduled);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value.replace(/^\s+/, ''))}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className="w-full p-4 rounded-lg border-2 bg-transparent focus:outline-none focus:ring-2"
                style={{
                    borderColor: TASK_STYLES.border,
                    color: TASK_STYLES.textMuted,
                    backgroundColor: TASK_STYLES.background,
                    ['--tw-ring-color' as any]: TASK_STYLES.ring,
                }}
            />
            <DeleteButton
                onDelete={onDelete}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
            />
        </div>
    );
};
