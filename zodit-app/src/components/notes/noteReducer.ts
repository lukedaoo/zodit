import type { Note as DisplayNote } from './types';
import { NOTE_COLORS } from './types';
import { useDataProvider } from '@context/DataProviderContext';
import { toDataNote } from './noteUtils';
import { createNewNote, arrangeNotesInGrid, stackNotesVertically, arrangeNotesInCircle, spreadNotesRandomly } from './noteUtils';

export type ActionType =
    | 'init'
    | 'add_note'
    | 'delete_note'
    | 'update_note_text'
    | 'update_note_position'
    | 'update_note_size'
    | 'toggle_note_pin'
    | 'change_note_color'
    | 'bring_note_to_front'
    | 'arrange_in_grid'
    | 'arrange_in_stack'
    | 'arrange_in_circle'
    | 'arrange_randomly'
    | null;

export type State = {
    notes: DisplayNote[];
    topNoteId: string | null;
    editingId: string | null;
    resizingId: string | null;
};

export type Action =
    | { type: 'SET_NOTES'; payload: DisplayNote[] }
    | { type: 'SET_TOP_NOTE_ID'; payload: string | null }
    | { type: 'SET_EDITING_ID'; payload: string | null }
    | { type: 'SET_RESIZING_ID'; payload: string | null }
    | { type: 'ADD_NOTE' }
    | { type: 'DELETE_NOTE'; payload: { id: string } }
    | { type: 'UPDATE_NOTE_TEXT'; payload: { id: string; text: string } }
    | { type: 'UPDATE_NOTE_POSITION'; payload: { id: string; x: number; y: number } }
    | { type: 'UPDATE_NOTE_SIZE'; payload: { id: string; width: number; height: number } }
    | { type: 'CHANGE_NOTE_COLOR'; payload: { id: string } }
    | { type: 'TOGGLE_NOTE_PIN'; payload: { id: string } }
    | { type: 'BRING_NOTE_TO_FRONT'; payload: { id: string } }
    | { type: 'ARRANGE_IN_GRID' }
    | { type: 'ARRANGE_IN_STACK' }
    | { type: 'ARRANGE_IN_CIRCLE' }
    | { type: 'ARRANGE_RANDOMLY' };

export function noteReducer(
    state: State,
    action: Action,
    setError: (error: string | null) => void,
    setAction: (action: ActionType) => void,
    debouncedSaveToStorage: (key: string, data: any) => void,
    debouncedUpdateNote: (id: string, updates: Partial<any>) => void,
    debouncedDeleteNote: (id: string) => void
): State {
    const dataProvider = useDataProvider();

    const syncNotes = (newNotes: DisplayNote[], actionType: ActionType): State => {
        try {
            debouncedSaveToStorage('notes', newNotes.map(n => toDataNote(n).toJSON()));
            setAction(actionType);
            setError(null);
            return { ...state, notes: newNotes };
        } catch (err) {
            setError(`Failed to ${actionType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return state;
        }
    };

    switch (action.type) {
        case 'SET_NOTES':
            return { ...state, notes: action.payload };

        case 'SET_TOP_NOTE_ID':
            return { ...state, topNoteId: action.payload };

        case 'SET_EDITING_ID':
            return { ...state, editingId: action.payload };

        case 'SET_RESIZING_ID':
            return { ...state, resizingId: action.payload };

        case 'ADD_NOTE': {
            const newNote = createNewNote();
            const newNotes = [...state.notes, newNote];
            return {
                ...syncNotes(newNotes, 'add_note'),
                editingId: newNote.id,
            };
        }

        case 'DELETE_NOTE': {
            try {
                debouncedDeleteNote(action.payload.id);
                const newNotes = state.notes.filter(note => note.id !== action.payload.id);
                return syncNotes(newNotes, 'delete_note');
            } catch (err) {
                setError(`Failed to delete note: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'UPDATE_NOTE_TEXT': {
            try {
                debouncedUpdateNote(action.payload.id, { text: action.payload.text });
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id ? { ...note, text: action.payload.text } : note
                );
                return syncNotes(newNotes, 'update_note_text');
            } catch (err) {
                setError(`Failed to update note text: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'UPDATE_NOTE_POSITION': {
            try {
                debouncedUpdateNote(action.payload.id, { position: { x: action.payload.x, y: action.payload.y } });
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id
                        ? { ...note, position: { x: action.payload.x, y: action.payload.y } }
                        : note
                );
                return syncNotes(newNotes, 'update_note_position');
            } catch (err) {
                setError(`Failed to update note position: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'UPDATE_NOTE_SIZE': {
            try {
                debouncedUpdateNote(action.payload.id, { width: action.payload.width, height: action.payload.height });
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id
                        ? { ...note, width: action.payload.width, height: action.payload.height, date: new Date() }
                        : note
                );
                return syncNotes(newNotes, 'update_note_size');
            } catch (err) {
                setError(`Failed to update note size: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'CHANGE_NOTE_COLOR': {
            try {
                const note = dataProvider.getNote(action.payload.id);
                if (!note) return state;
                const isCurrentlyLight = NOTE_COLORS.light.includes(note.color);
                const newTheme = isCurrentlyLight ? NOTE_COLORS.dark : NOTE_COLORS.light;
                const newColor = newTheme[Math.floor(Math.random() * newTheme.length)];
                debouncedUpdateNote(action.payload.id, { color: newColor });
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id ? { ...note, color: newColor, date: new Date() } : note
                );
                return syncNotes(newNotes, 'change_note_color');
            } catch (err) {
                setError(`Failed to change note color: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'TOGGLE_NOTE_PIN': {
            try {
                const note = dataProvider.getNote(action.payload.id);
                if (!note) return state;
                const isPinned = !note.isPinned;
                debouncedUpdateNote(action.payload.id, { isPinned });
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id ? { ...note, isPinned, date: new Date() } : note
                );
                return syncNotes(newNotes, 'toggle_note_pin');
            } catch (err) {
                setError(`Failed to toggle note pin: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'BRING_NOTE_TO_FRONT':
            setAction('bring_note_to_front');
            setError(null);
            return { ...state, topNoteId: action.payload.id };

        case 'ARRANGE_IN_GRID': {
            const pinnedNotes = state.notes.filter(note => note.isPinned === true);
            const unpinnedNotes = state.notes.filter(note => note.isPinned === false || note.isPinned === undefined);
            const newNotes = [
                ...pinnedNotes,
                ...arrangeNotesInGrid(unpinnedNotes).map(note => ({ ...note, date: new Date() })),
            ];
            return syncNotes(newNotes, 'arrange_in_grid');
        }

        case 'ARRANGE_IN_STACK': {
            const pinnedNotes = state.notes.filter(note => note.isPinned === true);
            const unpinnedNotes = state.notes.filter(note => note.isPinned === false || note.isPinned === undefined);
            const newNotes = [
                ...pinnedNotes,
                ...stackNotesVertically(unpinnedNotes).map(note => ({ ...note, date: new Date() })),
            ];
            return syncNotes(newNotes, 'arrange_in_stack');
        }

        case 'ARRANGE_IN_CIRCLE': {
            const pinnedNotes = state.notes.filter(note => note.isPinned === true);
            const unpinnedNotes = state.notes.filter(note => note.isPinned === false || note.isPinned === undefined);
            const newNotes = [
                ...pinnedNotes,
                ...arrangeNotesInCircle(unpinnedNotes).map(note => ({ ...note, date: new Date() })),
            ];
            return syncNotes(newNotes, 'arrange_in_circle');
        }

        case 'ARRANGE_RANDOMLY': {
            const pinnedNotes = state.notes.filter(note => note.isPinned === true);
            const unpinnedNotes = state.notes.filter(note => note.isPinned === false || note.isPinned === undefined);
            const newNotes = [
                ...pinnedNotes,
                ...spreadNotesRandomly(unpinnedNotes).map(note => ({ ...note, date: new Date() })),
            ];
            return syncNotes(newNotes, 'arrange_randomly');
        }

        default:
            return state;
    }
}
