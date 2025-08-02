import { useMemo, useEffect } from 'react';
import type { Note as DisplayNote } from '../types';
import { getOverlappingGroups } from '../noteUtils';
import { useNoteState } from './useNoteState';
import { useNoteActions } from './useNoteActions';
import { useNoteInteractions } from './useNoteInteractions';
import { useDragAndDrop } from './useDragAndDrop';

export const useNotes = (initialNotes?: DisplayNote[]) => {
    const {
        notes,
        topNoteId,
        editingId,
        resizingId,
        action,
        updateNotes,
        setTopNoteId,
        setEditingId,
        setResizingId,
        setAction,
        isInitialized,
        error,
        setError, 
    } = useNoteState(initialNotes);

    useEffect(() => {
        console.log('Notes updated:', notes);
        console.log('Current action:', action);
        if (error) {
            console.error('Notes error:', error);
        }
    }, [notes, action, error]);

    const {
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
    } = useNoteActions({
        updateNotes,
        setEditingId,
        setTopNoteId,
        setAction,
        setError, // Pass setError directly
    });

    const { toggleEdit, toggleResize, handleBackgroundClick } = useNoteInteractions({
        editingId,
        resizingId,
        setEditingId,
        setResizingId,
        setTopNoteId,
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
