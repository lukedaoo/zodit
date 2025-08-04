import { useMemo, useReducer, useEffect, useState } from 'react';
import type { Note as DisplayNote } from './types';
import { getOverlappingGroups, toDisplayNote } from './noteUtils';
import { useNoteInteractions } from './hooks/useNoteInteractions';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { noteReducer } from './noteReducer';
import type { State, Action, ActionType } from './noteReducer';
import { useDataProvider } from '@context/DataProviderContext';

import { debounce } from '@lib/debounce';
import { createLogger } from "@lib/logger";

const logger = createLogger("Note");

const loggingReducer = (
    state: State,
    action: Action,
    setError: (error: string | null) => void,
    setAction: (action: ActionType) => void,
    debouncedSaveToStorage: (key: string, data: any) => void,
    debouncedUpdateNote: (id: string, updates: Partial<any>) => void,
    debouncedDeleteNote: (id: string) => void
) => {
    logger.group(`[Note Action] ${action.type}`);

    if (process.env.NODE_ENV === 'development') {
        logger.log('Prev State:', 'color: #9CA3AF; font-weight: bold;', state);
        logger.log('Action:', 'color: #03A9F4; font-weight: bold;', action);

        const nextState = noteReducer(state, action, setError, setAction, debouncedSaveToStorage, debouncedUpdateNote, debouncedDeleteNote);

        logger.log('Next State:', 'color: #9CA3AF; font-weight: bold;', nextState);
        logger.groupEnd();

        return nextState;
    } else {
        const nextState = noteReducer(state, action, setError, setAction, debouncedSaveToStorage, debouncedUpdateNote, debouncedDeleteNote);
        logger.groupEnd();
        return nextState;
    }
};

export const useNotes = (initialNotes?: DisplayNote[]) => {
    const dataProvider = useDataProvider();
    const initialState: State = {
        notes: initialNotes || [],
        topNoteId: null,
        editingId: null,
        resizingId: null,
    };

    const [action, setAction] = useState<ActionType>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // Debounced dataProvider methods
    const delay = 400;
    const debouncedSaveToStorage = useMemo(
        () => debounce((key: string, data: any) => {
            dataProvider.saveToStorage(key, data);
        }, delay),
        [dataProvider]
    );

    const debouncedUpdateNote = useMemo(
        () => debounce((id: string, updates: Partial<any>) => {
            dataProvider.updateNote(id, updates);
        }, delay),
        [dataProvider]
    );

    const debouncedDeleteNote = useMemo(
        () => debounce((id: string) => {
            dataProvider.deleteNote(id);
        }, delay),
        [dataProvider]
    );

    const [state, dispatch] = useReducer(
        (state: State, action: Action) =>
            loggingReducer(state, action, setError, setAction,
                debouncedSaveToStorage,
                debouncedUpdateNote,
                debouncedDeleteNote),
        initialState
    );

    const { notes, topNoteId, editingId, resizingId } = state;

    useEffect(() => {
        const connectAndLoad = async () => {
            try {
                if (!dataProvider.isConnected()) {
                    dataProvider.connect();
                }
                const storedNotes = dataProvider.getNotes().map(toDisplayNote);
                dispatch({ type: 'SET_NOTES', payload: initialNotes || storedNotes });
                setAction('init');
                setError(null);
            } catch (err) {
                setError('Failed to load notes: ' + (err instanceof Error ? err.message : 'Unknown error'));
            } finally {
                setIsInitialized(true);
            }
        };
        connectAndLoad();
    }, []);

    const addNote = () => dispatch({ type: 'ADD_NOTE' });
    const deleteNote = (id: string) => dispatch({ type: 'DELETE_NOTE', payload: { id } });
    const updateNoteText = (id: string, text: string) =>
        dispatch({ type: 'UPDATE_NOTE_TEXT', payload: { id, text } });
    const updateNotePosition = (id: string, x: number, y: number) =>
        dispatch({ type: 'UPDATE_NOTE_POSITION', payload: { id, x, y } });
    const updateNoteSize = (id: string, width: number, height: number) =>
        dispatch({ type: 'UPDATE_NOTE_SIZE', payload: { id, width, height } });
    const changeNoteColor = (id: string) => dispatch({ type: 'CHANGE_NOTE_COLOR', payload: { id } });
    const toggleNotePin = (id: string) => dispatch({ type: 'TOGGLE_NOTE_PIN', payload: { id } });
    const bringNoteToFront = (id: string) => dispatch({ type: 'BRING_NOTE_TO_FRONT', payload: { id } });
    const arrangeInGrid = () => dispatch({ type: 'ARRANGE_IN_GRID' });
    const arrangeInStack = () => dispatch({ type: 'ARRANGE_IN_STACK' });
    const arrangeInCircle = () => dispatch({ type: 'ARRANGE_IN_CIRCLE' });
    const arrangeRandomly = () => dispatch({ type: 'ARRANGE_RANDOMLY' });

    const { toggleEdit, toggleResize, handleBackgroundClick } = useNoteInteractions({
        editingId,
        resizingId,
        setEditingId: (id: string | null) => dispatch({ type: 'SET_EDITING_ID', payload: id }),
        setResizingId: (id: string | null) => dispatch({ type: 'SET_RESIZING_ID', payload: id }),
        setTopNoteId: (id: string | null) => dispatch({ type: 'SET_TOP_NOTE_ID', payload: id }),
    });

    const { handleDragEnd } = useDragAndDrop({
        notes,
        updateNotePosition,
        bringNoteToFront,
    });

    const overlappingGroups = useMemo(() => getOverlappingGroups(notes), [notes]);

    return {
        // State
        notes,
        topNoteId,
        editingId,
        resizingId,
        action,
        overlappingGroups,
        isInitialized,
        error,

        // Actions
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

        // Interactions
        toggleEdit,
        toggleResize,
        handleBackgroundClick,
        handleDragEnd,
    };
};
