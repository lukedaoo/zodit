import { useCallback } from 'react';

interface UseResizeProps {
    onResize: (width: number, height: number) => void;
    currentWidth: number;
    currentHeight: number;
}

export const useResize = ({ onResize, currentWidth, currentHeight }: UseResizeProps) => {
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = currentWidth;
        const startHeight = currentHeight;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(120, startWidth + (moveEvent.clientX - startX));
            const newHeight = Math.max(100, startHeight + (moveEvent.clientY - startY));
            onResize(newWidth, newHeight);
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [onResize, currentWidth, currentHeight]);

    return { handleMouseDown };
};
