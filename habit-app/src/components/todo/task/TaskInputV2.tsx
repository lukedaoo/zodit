import { useEffect, useRef } from 'react';
import { DeleteButton, TASK_STYLES } from './TaskUIComponents';
import { presets, DEFAULT_TASK } from '../types';
import { taskToText } from './taskUtils';

interface TaskInputProps {
    inputValue: string;
    onInputChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onDelete: () => void;
    inputRef: React.RefObject<HTMLDivElement | null>;
}

export const TaskInput = ({
    inputValue,
    onInputChange,
    onKeyDown,
    onDelete,
    inputRef
}: TaskInputProps) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const divRef = inputRef ?? internalRef;

    const placeholder = taskToText(DEFAULT_TASK, presets.scheduled);

    const renderStyledHTML = (text: string) => {
        const pairs = text.split(';').filter(Boolean);
        return pairs.map(pair => {
            const [key, val = ''] = pair.split(':');
            return `<span class="badge badge-outline"><span class="task-key">${key.trim()}</span>:<span class="task-value">${val.trim()}</span></span>`;
        }).join('<span class="task-separator">;</span>');
    };

    useEffect(() => {
        if (divRef.current && document.activeElement !== divRef.current) {
            divRef.current.innerHTML = renderStyledHTML(inputValue);
        }
    }, [inputValue]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const text = e.currentTarget.innerText;
        onInputChange(text);
    };

    return (
        <div className="relative">
            <div
                ref={divRef as React.RefObject<HTMLDivElement>}
                contentEditable
                onInput={handleInput}
                onKeyDown={onKeyDown}
                className="w-full p-4 rounded-lg border-2 bg-transparent focus:outline-none focus:ring-2 whitespace-pre-wrap break-words"
                style={{
                    borderColor: TASK_STYLES.border,
                    color: TASK_STYLES.textMuted,
                    backgroundColor: TASK_STYLES.background,
                    ['--tw-ring-color' as any]: TASK_STYLES.ring,
                    minHeight: '44px'
                }}
                data-placeholder={placeholder}
            />
            <DeleteButton
                onDelete={onDelete}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
            />
        </div>
    );
};
