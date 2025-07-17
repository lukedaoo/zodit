import { useState, useEffect, useRef } from 'react';
import { textToTask } from './taskUtils';
import { getUserSeparator } from '../../../lib/template/textTemplateProcessor';
import type { Task } from '../types';
import { presets } from '../types';


export const useTaskEditing = (
    task: Task,
    onSubmit: (task: any) => void,
    isEditing: boolean
) => {
    const [inputValue, setInputValue] = useState(task.title);
    const inputRef = useRef<HTMLInputElement | HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    // useEffect(() => {
    //     console.log('Effect running, inputValue:', inputValue, 'useTemplate:', useTemplate);
    //     const setTemplate = inputValue.trim().length === 0 && useTemplate;
    //     if (setTemplate) {
    //         const defaultText = taskToText(DEFAULT_TASK, presets.scheduled);
    //         console.log('Setting default text:', defaultText);
    //         // setJustInitialized(true);
    //         setInputValue(defaultText);
    //     }
    // }, [inputValue, useTemplate]);
    //
    const handleSubmit = (value: string) => {
        try {
            const parsed = textToTask(value.trim(), presets.scheduled);
            onSubmit(parsed);
        } catch (err) {
            console.error('Error parsing task:', err);
        }
    };

    const handleTabNavigation = (e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>) => {
        try {
            e.preventDefault();
            const input = inputRef.current;
            if (!input) return;

            const separator = getUserSeparator() ?? ";";
            const pairs = inputValue.trim().split(separator).filter(pair => pair.trim() !== '');

            let currentIndex = parseInt(input.dataset.index || '-1', 10);
            currentIndex = (currentIndex + 1) % pairs.length;
            input.dataset.index = currentIndex.toString();

            const currentPair = pairs[currentIndex].trim();
            const valuePart = currentPair.split(':')[1] || '';

            console.log('Current index:', currentIndex, 'Current pair:', currentPair, 'Value part:', valuePart);

            // --- Branch 1: Plain <input type="text">
            if (input instanceof HTMLInputElement) {
                const startPos = inputValue.indexOf(currentPair) + currentPair.indexOf(':') + 1;
                const endPos = startPos + valuePart.length;

                input.setSelectionRange(startPos, endPos);
                input.focus();

                const charWidth = 8;
                const inputWidth = input.clientWidth;
                const scrollPosition = Math.max(0, (startPos * charWidth) - (inputWidth / 2));
                input.scrollLeft = scrollPosition;

                // --- Branch 2: contentEditable <div>
            } else if (input instanceof HTMLDivElement && input.isContentEditable) {
                const fullText = input.textContent || '';
                const pairIndex = fullText.indexOf(currentPair);
                const caretPos = pairIndex + currentPair.indexOf(':') + 1;

                const range = document.createRange();
                const selection = window.getSelection();
                if (!selection) return;

                let charIndex = 0;
                let caretNode: Text | null = null;
                let caretOffset = 0;

                const walker = document.createTreeWalker(input, NodeFilter.SHOW_TEXT, null);
                while (walker.nextNode()) {
                    const node = walker.currentNode as Text;
                    const len = node.textContent?.length || 0;

                    if (charIndex + len >= caretPos) {
                        caretNode = node;
                        caretOffset = caretPos - charIndex;
                        break;
                    }

                    charIndex += len;
                }

                if (caretNode) {
                    range.setStart(caretNode, caretOffset);
                    range.setEnd(caretNode, caretOffset);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    setTimeout(() => {
                        const selRect = range.getBoundingClientRect();
                        const containerRect = input.getBoundingClientRect();
                        const scrollLeft = input.scrollLeft + (selRect.left - containerRect.left) - input.clientWidth / 2;
                        input.scrollLeft = scrollLeft;
                    }, 0);
                }
            }
        } catch (err) {
            console.error('Error handling tab navigation:', err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
