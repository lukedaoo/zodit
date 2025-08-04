import { useCallback } from 'react';
import type { Note } from '../types';

interface UseDragAndDropProps {
    notes: Note[];
    updateNotePosition: (id: string, x: number, y: number) => void;
    bringNoteToFront: (id: string) => void;
}

export const useDragAndDrop = ({
    notes,
    updateNotePosition,
    bringNoteToFront,
}: UseDragAndDropProps) => {
    const handleDragEnd = useCallback((event: any) => {
        const { active, delta } = event;
        const id = active.id as string;
        const note = notes.find((n) => n.id === id);
        if (!note) return;

        const newX = Math.max(0, note.position.x + delta.x);
        const newY = Math.max(0, note.position.y + delta.y);

        if (newX === note.position.x && newY === note.position.y) return;

        updateNotePosition(id, newX, newY);
        bringNoteToFront(id);
    }, [notes, updateNotePosition, bringNoteToFront]);

    return { handleDragEnd };
};
