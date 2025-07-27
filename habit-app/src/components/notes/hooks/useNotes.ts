import { useMemo } from 'react';
import type { Note } from '../types';
import { getOverlappingGroups } from '../noteUtils';
import { useNoteState } from './useNoteState';
import { useNoteActions } from './useNoteActions';
import { useNoteInteractions } from './useNoteInteractions';
import { useDragAndDrop } from './useDragAndDrop';

export const useNotes = (initialNotes?: Note[]) => {
    const {
        notes,
        topNoteId,
        editingId,
        resizingId,
        updateNotes,
        setTopNoteId,
        setEditingId,
        setResizingId,
    } = useNoteState(initialNotes);

    const {
        addNote,
        deleteNote,
        updateNoteText,
        updateNotePosition,
        updateNoteSize,
        changeNoteColor,
        bringNoteToFront,
        arrangeInGrid,
        arrangeInStack,
        arrangeInCircle,
        arrangeRandomly,
    } = useNoteActions({
        updateNotes,
        setEditingId,
        setTopNoteId,
    });

    const {
        toggleEdit,
        toggleResize,
        handleBackgroundClick,
    } = useNoteInteractions({
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
        overlappingGroups,

        // Actions
        addNote,
        deleteNote,
        updateNoteText,
        updateNotePosition,
        updateNoteSize,
        changeNoteColor,
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
