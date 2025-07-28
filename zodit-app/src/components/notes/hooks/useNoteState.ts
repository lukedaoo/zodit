import { useState, useCallback } from 'react';
import type { Note, NoteState } from '../types';

export const useNoteState = (initialNotes?: Note[]) => {
    const [state, setState] = useState<NoteState>({
        notes: initialNotes || [],
        topNoteId: null,
        editingId: null,
        resizingId: null,
    });

    const updateNotes = useCallback((updater: (notes: Note[]) => Note[]) => {
        setState(prev => ({ ...prev, notes: updater(prev.notes) }));
    }, []);

    const setTopNoteId = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, topNoteId: id }));
    }, []);

    const setEditingId = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, editingId: id }));
    }, []);

    const setResizingId = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, resizingId: id }));
    }, []);

    return {
        ...state,
        updateNotes,
        setTopNoteId,
        setEditingId,
        setResizingId,
    };
};
