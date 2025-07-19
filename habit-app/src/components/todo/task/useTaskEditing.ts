import { useState, useEffect, useRef } from 'react';
import { textToTask, resolveTaskWithMetadata } from './taskUtils';
import { presets } from '../types';

export const useTaskEditing = (
    onSubmit: (task: any) => void,
    isEditing: boolean
) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement | HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSubmit = (value: string) => {
        try {
            let config = presets.scheduled;
            const parsed = textToTask(value.trim(), config);
            onSubmit(resolveTaskWithMetadata(parsed));
        } catch (err) {
            console.error('Error parsing task:', err);
        }
    };

    const handleTabNavigation = (e: React.KeyboardEvent<HTMLDivElement>) => {
        try {
            e.preventDefault();

            const divRef = inputRef.current as HTMLDivElement | null;
            if (!divRef || !(divRef instanceof HTMLDivElement)) return;

            const badgeSpans = divRef.querySelectorAll('.badge');
            if (badgeSpans.length === 0) return;

            const selection = window.getSelection();
            if (!selection) return;

            let currentIndex = -1;
            badgeSpans.forEach((badge, index) => {
                if (selection.containsNode(badge, true)) {
                    currentIndex = index;
                }
            });

            let nextIndex;
            if (e.shiftKey) {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : badgeSpans.length - 1;
            } else {
                nextIndex = currentIndex < badgeSpans.length - 1 ? currentIndex + 1 : 0;
            }

            const nextBadge = badgeSpans[nextIndex] as HTMLElement;
            if (!nextBadge) return;
            const valueSpan = nextBadge.querySelector('.task-value');
            const range = document.createRange();
            selection.removeAllRanges();

            if (valueSpan) {
                range.selectNodeContents(valueSpan);
                selection.addRange(range);
            } else {
                const keySpan = nextBadge.querySelector('.task-key');
                if (keySpan && keySpan.nextSibling) {
                    const colonNode = keySpan.nextSibling;
                    if (colonNode.nodeType === Node.TEXT_NODE && colonNode.textContent?.includes(':')) {
                        range.setStart(colonNode, 1);
                        range.setEnd(colonNode, 1);
                        selection.addRange(range);
                    }
                }
            }

            divRef.focus();

            // Scroll to make the selected area visible
            setTimeout(() => {
                const target = valueSpan || nextBadge;
                const rect = target.getBoundingClientRect();
                const containerRect = divRef.getBoundingClientRect();
                const scrollLeft =
                    divRef.scrollLeft +
                    (rect.left - containerRect.left) -
                    divRef.clientWidth / 2;
                divRef.scrollLeft = Math.max(0, scrollLeft);
            }, 0);
        } catch (err) {
            console.error('Error handling tab navigation:', err);
        }
    }

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
