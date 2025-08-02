import { useCallback } from 'react';
import type { Note as DisplayNote } from '../types';
import { NOTE_COLORS } from '../types';
import { createNewNote } from '../noteUtils';
import {
    arrangeNotesInGrid,
    stackNotesVertically,
    arrangeNotesInCircle,
    spreadNotesRandomly,
} from '../noteUtils';
import { useDataProvider } from '@context/DataProviderContext';
import { toDataNote } from './helper';
import type { ActionType } from './helper';

interface UseNoteActionsProps {
    updateNotes: (updater: (notes: DisplayNote[]) => DisplayNote[]) => void;
    setEditingId: (id: string | null) => void;
    setTopNoteId: (id: string | null) => void;
    setAction: (action: ActionType) => void;
    setError: (error: string | null) => void;
}

export const useNoteActions = ({
    updateNotes,
    setEditingId,
    setTopNoteId,
    setAction,
    setError,
}: UseNoteActionsProps) => {
    const dataProvider = useDataProvider();

    const syncNotes = useCallback(
        (updater: (prev: DisplayNote[]) => DisplayNote[], actionType: ActionType) => {
            try {
                updateNotes((prev) => {
                    const newNotes = updater(prev);
                    dataProvider.saveToStorage(
                        'notes',
                        newNotes.map((n) => toDataNote(n))
                    );
                    return newNotes;
                });
                setAction(actionType);
                setError(null);
            } catch (err) {
                setError(
                    `Failed to ${actionType}: ` +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [updateNotes, dataProvider, setAction, setError]
    );

    const addNote = useCallback(() => {
        try {
            const displayNote = createNewNote();
            const newNote = toDataNote(displayNote);
            syncNotes((prev) => [...prev, displayNote], 'add_note');
            setEditingId(newNote.id);
        } catch (err) {
            setError(
                'Failed to add note: ' +
                (err instanceof Error ? err.message : 'Unknown error')
            );
        }
    }, [syncNotes, setEditingId]);

    const deleteNote = useCallback(
        (id: string) => {
            try {
                dataProvider.deleteNote(id);
                syncNotes(
                    (prev) => prev.filter((note) => note.id !== id),
                    'delete_note'
                );
            } catch (err) {
                setError(
                    'Failed to delete note: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [syncNotes, dataProvider]
    );

    const updateNoteText = useCallback(
        (id: string, text: string) => {
            try {
                dataProvider.updateNote(id, { text });
                syncNotes(
                    (prev) =>
                        prev.map((note) =>
                            note.id === id ? { ...note, text } : note
                        ),
                    'update_note_text'
                );
            } catch (err) {
                setError(
                    'Failed to update note text: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [syncNotes, dataProvider]
    );

    const updateNotePosition = useCallback(
        (id: string, x: number, y: number) => {
            try {
                dataProvider.updateNote(id, { position: { x, y } });
                syncNotes(
                    (prev) =>
                        prev.map((note) =>
                            note.id === id
                                ? { ...note, position: { x, y } }
                                : note
                        ),
                    'update_note_position'
                );
            } catch (err) {
                setError(
                    'Failed to update note position: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [syncNotes, dataProvider]
    );

    const updateNoteSize = useCallback(
        (id: string, width: number, height: number) => {
            try {
                dataProvider.updateNote(id, { width, height });
                syncNotes(
                    (prev) =>
                        prev.map((note) =>
                            note.id === id
                                ? { ...note, width, height, date: new Date() }
                                : note
                        ),
                    'update_note_size'
                );
            } catch (err) {
                setError(
                    'Failed to update note size: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [syncNotes, dataProvider]
    );

    const toggleNotePin = useCallback(
        (id: string) => {
            try {
                const note = dataProvider.getNote(id);
                if (note) {
                    const isPinned = !note.isPinned;
                    dataProvider.updateNote(id, { isPinned });
                    syncNotes(
                        (prev) =>
                            prev.map((note) =>
                                note.id === id
                                    ? { ...note, isPinned, date: new Date() }
                                    : note
                            ),
                        'toggle_note_pin'
                    );
                }
            } catch (err) {
                setError(
                    'Failed to toggle note pin: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [syncNotes, dataProvider]
    );

    const changeNoteColor = useCallback(
        (id: string) => {
            try {
                const note = dataProvider.getNote(id);
                if (note) {
                    const isCurrentlyLight = NOTE_COLORS.light.includes(note.color);
                    const newTheme = isCurrentlyLight
                        ? NOTE_COLORS.dark
                        : NOTE_COLORS.light;
                    const newColor =
                        newTheme[Math.floor(Math.random() * newTheme.length)];
                    dataProvider.updateNote(id, { color: newColor });
                    syncNotes(
                        (prev) =>
                            prev.map((note) =>
                                note.id === id
                                    ? { ...note, color: newColor, date: new Date() }
                                    : note
                            ),
                        'change_note_color'
                    );
                }
            } catch (err) {
                setError(
                    'Failed to change note color: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [syncNotes, dataProvider]
    );

    const bringNoteToFront = useCallback(
        (id: string) => {
            try {
                setTopNoteId(id);
                setAction('bring_note_to_front');
                setError(null);
            } catch (err) {
                setError(
                    'Failed to bring note to front: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [setTopNoteId, setAction]
    );

    const arrangeInGrid = useCallback(() => {
        try {
            syncNotes(
                (prev) => {
                    const pinnedNotes = prev.filter(
                        (note) => note.isPinned === true
                    );
                    const unpinnedNotes = prev.filter(
                        (note) => note.isPinned === false || note.isPinned === undefined
                    );
                    return [
                        ...pinnedNotes,
                        ...arrangeNotesInGrid(unpinnedNotes).map((note) => ({
                            ...note,
                            date: new Date(),
                        })),
                    ];
                },
                'arrange_in_grid'
            );
        } catch (err) {
            setError(
                'Failed to arrange notes in grid: ' +
                (err instanceof Error ? err.message : 'Unknown error')
            );
        }
    }, [syncNotes]);

    const arrangeInStack = useCallback(() => {
        try {
            syncNotes(
                (prev) => {
                    const pinnedNotes = prev.filter(
                        (note) => note.isPinned === true
                    );
                    const unpinnedNotes = prev.filter(
                        (note) => note.isPinned === false || note.isPinned === undefined
                    );
                    return [
                        ...pinnedNotes,
                        ...stackNotesVertically(unpinnedNotes).map((note) => ({
                            ...note,
                            date: new Date(),
                        })),
                    ];
                },
                'arrange_in_stack'
            );
        } catch (err) {
            setError(
                'Failed to arrange notes in stack: ' +
                (err instanceof Error ? err.message : 'Unknown error')
            );
        }
    }, [syncNotes]);

    const arrangeInCircle = useCallback(() => {
        try {
            syncNotes(
                (prev) => {
                    const pinnedNotes = prev.filter(
                        (note) => note.isPinned === true
                    );
                    const unpinnedNotes = prev.filter(
                        (note) => note.isPinned === false || note.isPinned === undefined
                    );
                    return [
                        ...pinnedNotes,
                        ...arrangeNotesInCircle(unpinnedNotes).map((note) => ({
                            ...note,
                            date: new Date(),
                        })),
                    ];
                },
                'arrange_in_circle'
            );
        } catch (err) {
            setError(
                'Failed to arrange notes in circle: ' +
                (err instanceof Error ? err.message : 'Unknown error')
            );
        }
    }, [syncNotes]);

    const arrangeRandomly = useCallback(() => {
        try {
            syncNotes(
                (prev) => {
                    const pinnedNotes = prev.filter(
                        (note) => note.isPinned === true
                    );
                    const unpinnedNotes = prev.filter(
                        (note) => note.isPinned === false || note.isPinned === undefined
                    );
                    return [
                        ...pinnedNotes,
                        ...spreadNotesRandomly(unpinnedNotes).map((note) => ({
                            ...note,
                            date: new Date(),
                        })),
                    ];
                },
                'arrange_randomly'
            );
        } catch (err) {
            setError(
                'Failed to arrange notes randomly: ' +
                (err instanceof Error ? err.message : 'Unknown error')
            );
        }
    }, [syncNotes]);

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
