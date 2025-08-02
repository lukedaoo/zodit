import { useState, useCallback, useEffect } from 'react';
import type { Note as DisplayNote, NoteState } from '../types';
import { useDataProvider } from '@context/DataProviderContext';
import type { ActionType } from './helper';
import { toDisplayNote, toDataNote } from './helper';

export const useNoteState = (initialNotes?: DisplayNote[]) => {
    const dataProvider = useDataProvider();
    const [state, setState] = useState<NoteState>({
        notes: initialNotes || [],
        topNoteId: null,
        editingId: null,
        resizingId: null,
    });
    const [action, setAction] = useState<ActionType>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const connectAndLoad = async () => {
            try {
                if (!dataProvider.isConnected()) {
                    dataProvider.connect();
                }
                const storedNotes = dataProvider.getNotes().map(toDisplayNote);
                setState((prev) => ({
                    ...prev,
                    notes: initialNotes || storedNotes,
                }));
                setAction('init');
                setError(null);
            } catch (err) {
                setError(
                    'Failed to load notes: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            } finally {
                setIsInitialized(true);
            }
        };
        connectAndLoad();
    }, []);

    const updateNotes = useCallback(
        (updater: (notes: DisplayNote[]) => DisplayNote[]) => {
            try {
                setState((prev) => {
                    const newNotes = updater(prev.notes);
                    dataProvider.saveToStorage(
                        'notes',
                        newNotes.map((n) => toDataNote(n).toJSON())
                    );
                    return { ...prev, notes: newNotes };
                });
                setError(null);
            } catch (err) {
                setError(
                    'Failed to save notes: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
                );
            }
        },
        [dataProvider]
    );

    const setTopNoteId = useCallback((id: string | null) => {
        setState((prev) => ({ ...prev, topNoteId: id }));
    }, []);

    const setEditingId = useCallback((id: string | null) => {
        setState((prev) => ({ ...prev, editingId: id }));
    }, []);

    const setResizingId = useCallback((id: string | null) => {
        setState((prev) => ({ ...prev, resizingId: id }));
    }, []);

    return {
        ...state,
        action,
        updateNotes,
        setTopNoteId,
        setEditingId,
        setResizingId,
        setAction,
        isInitialized,
        error,
        setError,
    };
};
