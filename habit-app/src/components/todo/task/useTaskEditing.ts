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
                e.preventDefault();
                const walker = document.createTreeWalker(input, NodeFilter.SHOW_ELEMENT, {
                    acceptNode: (node) => {
                        if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node as HTMLElement).classList.contains('badge')
                        ) return NodeFilter.FILTER_ACCEPT;
                        return NodeFilter.FILTER_SKIP;
                    }
                });

                const valuePositions: { node: Text, startOffset: number, endOffset: number }[] = [];

                while (walker.nextNode()) {
                    const badge = walker.currentNode as HTMLElement;
                    const children = Array.from(badge.childNodes);
                    for (let i = 0; i < children.length; i++) {
                        const node = children[i];

                        if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes(':')) {
                            const text = node.textContent;
                            const colonIndex = text.indexOf(':');
                            if (colonIndex !== -1 && colonIndex + 1 < text.length) {
                                valuePositions.push({
                                    node: node as Text,
                                    startOffset: colonIndex + 1,
                                    endOffset: text.length
                                });
                            }
                        } else if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node as HTMLElement).classList.contains('task-key')
                        ) {
                            const next = node.nextSibling;
                            if (next?.nodeType === Node.TEXT_NODE) {
                                const text = next.textContent || '';
                                if (text.startsWith(':')) {
                                    valuePositions.push({
                                        node: next as Text,
                                        startOffset: 1,
                                        endOffset: text.length
                                    });
                                }
                            }
                        }
                    }
                }

                const selection = window.getSelection();
                if (!selection || valuePositions.length === 0) return;

                const currentRange = selection.getRangeAt(0);
                const caretNode = currentRange.startContainer;
                const caretOffset = currentRange.startOffset;

                let nextPos = 0;
                for (let i = 0; i < valuePositions.length; i++) {
                    const pos = valuePositions[i];
                    if (pos.node === caretNode && caretOffset >= pos.startOffset) {
                        nextPos = (i + 1) % valuePositions.length;
                    }
                }

                const target = valuePositions[nextPos];
                const range = document.createRange();
                range.setStart(target.node, target.startOffset);
                range.setEnd(target.node, target.endOffset);
                selection.removeAllRanges();
                selection.addRange(range);
                input.focus();

                setTimeout(() => {
                    const rect = range.getBoundingClientRect();
                    const containerRect = input.getBoundingClientRect();
                    const scrollLeft = input.scrollLeft + (rect.left - containerRect.left) - input.clientWidth / 2;
                    input.scrollLeft = scrollLeft;
                }, 0);
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
