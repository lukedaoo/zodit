import { useCallback } from 'react';
import type { Note } from '../types';
import { NOTE_COLORS } from '../types';
import { createNewNote } from '../noteUtils';
import {
    arrangeNotesInGrid, stackNotesVertically,
    arrangeNotesInCircle, spreadNotesRandomly
} from '../noteUtils';

interface UseNoteActionsProps {
    updateNotes: (updater: (notes: Note[]) => Note[]) => void;
    setEditingId: (id: string | null) => void;
    setTopNoteId: (id: string | null) => void;
    // setResizingId: (id: string | null) => void;
}

export const useNoteActions = ({
    updateNotes,
    setEditingId,
    setTopNoteId,
    // setResizingId,
}: UseNoteActionsProps) => {
    const addNote = useCallback(() => {
        const newNote = createNewNote();
        updateNotes(prev => [...prev, newNote]);
        // setEditingId(newNote.id); -- automatically edits the new note
    }, [updateNotes, setEditingId]);

    const deleteNote = useCallback((id: string) => {
        updateNotes(prev => prev.filter(note => note.id !== id));
    }, [updateNotes]);

    const updateNoteText = useCallback((id: string, text: string) => {
        updateNotes(prev =>
            prev.map(note => note.id === id ? { ...note, text } : note)
        );
    }, [updateNotes]);

    const updateNotePosition = useCallback((id: string, x: number, y: number) => {
        updateNotes(prev =>
            prev.map(note =>
                note.id === id ? { ...note, position: { x, y } } : note
            )
        );
    }, [updateNotes]);

    const updateNoteSize = useCallback((id: string, width: number, height: number) => {
        updateNotes(prev =>
            prev.map(note =>
                note.id === id ? { ...note, width, height } : note
            )
        );
    }, [updateNotes]);

    const toggleNotePin = useCallback((id: string) => {
        console.log('toggleNotePin', id);
        updateNotes(prev =>
            prev.map(note =>
                note.id === id ? { ...note, isPinned: !note.isPinned } : note
            )
        );
    }, [updateNotes]);

    const changeNoteColor = useCallback((id: string) => {
        updateNotes(prev =>
            prev.map(note => {
                if (note.id === id) {
                    const isCurrentlyLight = NOTE_COLORS.light.includes(note.color);
                    const newTheme = isCurrentlyLight ? NOTE_COLORS.dark : NOTE_COLORS.light;
                    const newColor = newTheme[Math.floor(Math.random() * newTheme.length)];
                    return { ...note, color: newColor };
                }
                return note;
            })
        );
    }, [updateNotes]);

    const bringNoteToFront = useCallback((id: string) => {
        setTopNoteId(id);
    }, [setTopNoteId]);

    // Arrangement functions - pinned notes appear at the front of the arrangement
    const arrangeInGrid = useCallback(() => {
        updateNotes(prev => {
            const pinnedNotes = prev.filter(note => note.isPinned);
            const unpinnedNotes = prev.filter(note => note.isPinned === false || note.isPinned === undefined);
            // Arrange all notes together, with pinned notes first
            const allNotesToArrange = [...pinnedNotes, ...unpinnedNotes];
            console.log(allNotesToArrange);
            return arrangeNotesInGrid(allNotesToArrange);
        });
    }, [updateNotes]);

    const arrangeInStack = useCallback(() => {
        updateNotes(prev => {
            const pinnedNotes = prev.filter(note => note.isPinned);
            const unpinnedNotes = prev.filter(note => note.isPinned === false || note.isPinned === undefined);
            // Arrange all notes together, with pinned notes first
            const allNotesToArrange = [...pinnedNotes, ...unpinnedNotes];
            return stackNotesVertically(allNotesToArrange);
        });
    }, [updateNotes]);

    const arrangeInCircle = useCallback(() => {
        updateNotes(prev => {
            const pinnedNotes = prev.filter(note => note.isPinned);
            const unpinnedNotes = prev.filter(note => note.isPinned === false || note.isPinned === undefined);
            // Arrange all notes together, with pinned notes first
            const allNotesToArrange = [...pinnedNotes, ...unpinnedNotes];
            return arrangeNotesInCircle(allNotesToArrange);
        });
    }, [updateNotes]);

    const arrangeRandomly = useCallback(() => {
        updateNotes(prev => {
            const pinnedNotes = prev.filter(note => note.isPinned);
            const unpinnedNotes = prev.filter(note => note.isPinned === false || note.isPinned === undefined);
            // For random, keep pinned notes in their current positions, only randomize unpinned
            const arrangedUnpinned = spreadNotesRandomly(unpinnedNotes);
            return [...pinnedNotes, ...arrangedUnpinned];
        });
    }, [updateNotes]);

    return {
        addNote,
        deleteNote,
        updateNoteText,
        updateNotePosition,
        updateNoteSize,
        changeNoteColor,
        toggleNotePin,
        bringNoteToFront,
        arrangeInGrid,
        arrangeInStack,
        arrangeInCircle,
        arrangeRandomly,
    };
};
