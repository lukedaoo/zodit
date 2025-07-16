import { useState, useEffect, useRef } from 'react';
import { textToTask } from '../taskUtils';
import { presets } from '../types';
import { getUserSeparator } from '../../../lib/template/textTemplateProcessor';
import type { Task } from '../types';

export const useTaskEditing = (
    task: Task,
    onSubmit: (task: any) => void,
    isEditing: boolean
) => {
    const [inputValue, setInputValue] = useState(task.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSubmit = (value: string) => {
        try {
            const parsed = textToTask(value.trim(), presets.scheduled);
            onSubmit(parsed);
        } catch (err) {
            console.error('Error parsing task:', err);
        }
    };

    const handleTabNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
        try {
            e.preventDefault();
            const input = inputRef.current;
            if (!input) return;

            const separator = getUserSeparator() ?? ";";
            const pairs = inputValue.trim().split(separator).filter(pair => pair.trim() !== '');

            let currentIndex = parseInt(input.dataset.index || '-1');
            currentIndex = (currentIndex + 1) % pairs.length;
            input.dataset.index = currentIndex.toString();

            const currentPair = pairs[currentIndex];
            const valuePart = currentPair.split(':')[1] || '';

            const startPos = inputValue.indexOf(currentPair) + currentPair.indexOf(':') + 1;
            const endPos = startPos + valuePart.length;

            input.setSelectionRange(startPos, endPos);
            input.focus();
        } catch (err) {
            console.error('Error handling tab navigation:', err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                handleSubmit(inputValue);
                break;
            case 'Tab':
                handleTabNavigation(e);
                break;
            default:
                break;
        }
    };

    return {
        inputValue,
        setInputValue,
        inputRef,
        handleKeyDown
    };
};
