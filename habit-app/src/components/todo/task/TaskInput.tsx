import { useEffect, useRef } from 'react';
import { DeleteButton, TASK_STYLES } from './TaskUIComponents';
import { presets, TYPE_UTILS as tu, DEFAULT_TASK } from '../types';
import type { Task } from '../types';
import { taskToText } from './taskUtils';

import {
    USE_TEMPLATE_WHEN_ADDING_TASK,
    SEPARATOR_PREF_KEY
} from '@user-prefs/const';

import { useUserSettings } from '@hooks/useUserSettings';

interface TaskInputProps {
    task: Task;
    inputValue: string;
    onInputChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onDelete: () => void;
    inputRef: React.RefObject<HTMLDivElement | null>;
}

export const TaskInput = ({
    task,
    inputValue,
    onInputChange,
    onKeyDown,
    onDelete,
    inputRef
}: TaskInputProps) => {
    const { get } = useUserSettings();
    const useTemplate = get<boolean>(USE_TEMPLATE_WHEN_ADDING_TASK);
    const separator = get<string>(SEPARATOR_PREF_KEY);

    const getTextValue = (_task: Task): string => {
        const isEmptyTask = tu.isEmpty(_task, presets.scheduled);

        let text;
        if (isEmptyTask && useTemplate) {
            text = taskToText(DEFAULT_TASK, presets.scheduled);
        } else {
            text = taskToText(_task, presets.scheduled);
        }
        return text;
    }

    const internalRef = useRef<HTMLDivElement>(null);
    const divRef = inputRef ?? internalRef;

    const placeholder = taskToText(DEFAULT_TASK, presets.scheduled);

    const renderStyledHTML = (task: Task): string => {
        const text = getTextValue(task);
        const pairs = text.split(separator).filter(Boolean);
        return pairs
            .map(pair => {
                const trimmedPair = pair.trim();
                if (!trimmedPair) return '';

                const [key, val] = trimmedPair.split(':');
                if (key?.trim()) {
                    const keySpan = `<span class="task-key">${key.trim()}</span>`;
                    const valueSpan = val?.trim() ? `<span class="task-value">${val.trim()}</span>` : '';
                    return `<span class="badge badge-outline">${keySpan}:${valueSpan}</span>`;
                }
                return '';
            })
            .filter(Boolean)
            .join('<span class="task-separator">;</span>');
    }
    useEffect(() => {
        if (divRef.current && document.activeElement !== divRef.current) {
            divRef.current.innerHTML = renderStyledHTML(task);
            inputValue = getTextValue(task);
        }
        if (inputValue.trim().length === 0 && divRef.current) {
            divRef.current.innerHTML = '';
            divRef.current?.setAttribute('data-placeholder', placeholder);
        }
    }, [inputValue]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const raw = e.currentTarget.innerText;
        const flattened = raw.replace(/[\r\n]+/g, ''); // remove newlines characters
        onInputChange(flattened);
    };

    return (
        <div className="relative">
            <div
                ref={divRef as React.RefObject<HTMLDivElement>}
                contentEditable
                onInput={handleInput}
                onKeyDown={onKeyDown}
                className="w-full p-4 rounded-lg border-1 bg-transparent focus:outline-none focus:ring-2 whitespace-pre-wrap break-words"
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
