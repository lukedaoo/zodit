import type { Note as DisplayNote } from './types';
import { NOTE_COLORS } from './types';
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
    | { type: 'CHANGE_NOTE_COLOR'; payload: { id: string } } // Removed dataProvider
    | { type: 'TOGGLE_NOTE_PIN'; payload: { id: string } } // Removed dataProvider
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
): State {
    switch (action.type) {
        case 'SET_NOTES':
            setAction('init');
            return { ...state, notes: action.payload };

        case 'SET_TOP_NOTE_ID':
            setAction('bring_note_to_front');
            return { ...state, topNoteId: action.payload };

        case 'SET_EDITING_ID':
            return { ...state, editingId: action.payload };

        case 'SET_RESIZING_ID':
            return { ...state, resizingId: action.payload };

        case 'ADD_NOTE': {
            const newNote = createNewNote();
            const newNotes = [...state.notes, newNote];
            setAction('add_note');
            setError(null);
            return {
                ...state,
                notes: newNotes,
                editingId: newNote.id,
            };
        }

        case 'DELETE_NOTE': {
            try {
                const newNotes = state.notes.filter(note => note.id !== action.payload.id);
                setAction('delete_note');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to delete note: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'UPDATE_NOTE_TEXT': {
            try {
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id ? { ...note, text: action.payload.text } : note
                );
                setAction('update_note_text');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to update note text: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'UPDATE_NOTE_POSITION': {
            try {
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id
                        ? { ...note, position: { x: action.payload.x, y: action.payload.y } }
                        : note
                );
                setAction('update_note_position');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to update note position: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'UPDATE_NOTE_SIZE': {
            try {
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id
                        ? { ...note, width: action.payload.width, height: action.payload.height, date: new Date() }
                        : note
                );
                setAction('update_note_size');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to update note size: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'CHANGE_NOTE_COLOR': {
            try {
                const note = state.notes.find(note => note.id === action.payload.id);
                if (!note) {
                    setError(`Note with id ${action.payload.id} not found`);
                    return state;
                }
                const isCurrentlyLight = NOTE_COLORS.light.includes(note.color);
                const newTheme = isCurrentlyLight ? NOTE_COLORS.dark : NOTE_COLORS.light;
                const newColor = newTheme[Math.floor(Math.random() * newTheme.length)];
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id ? { ...note, color: newColor, date: new Date() } : note
                );
                setAction('change_note_color');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to change note color: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'TOGGLE_NOTE_PIN': {
            try {
                const note = state.notes.find(note => note.id === action.payload.id);
                if (!note) {
                    setError(`Note with id ${action.payload.id} not found`);
                    return state;
                }
                const isPinned = !note.isPinned;
                const newNotes = state.notes.map(note =>
                    note.id === action.payload.id ? { ...note, isPinned, date: new Date() } : note
                );
                setAction('toggle_note_pin');
                setError(null);
                return { ...state, notes: newNotes };
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
            try {
                const arrangedNotes = arrangeNotesInGrid(state.notes).map(note => ({ ...note, date: new Date() }));
                const newNotes = arrangedNotes.sort((a, b) => {
                    if (a.isPinned === b.isPinned) return 0;
                    return a.isPinned ? -1 : 1;
                });
                setAction('arrange_in_grid');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to arrange notes in grid: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'ARRANGE_IN_STACK': {
            try {
                const arrangedNotes = stackNotesVertically(state.notes).map(note => ({ ...note, date: new Date() }));
                const newNotes = arrangedNotes.sort((a, b) => {
                    if (a.isPinned === b.isPinned) return 0;
                    return a.isPinned ? -1 : 1;
                });
                setAction('arrange_in_stack');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to arrange notes in stack: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'ARRANGE_IN_CIRCLE': {
            try {
                const arrangedNotes = arrangeNotesInCircle(state.notes).map(note => ({ ...note, date: new Date() }));
                const newNotes = arrangedNotes.sort((a, b) => {
                    if (a.isPinned === b.isPinned) return 0;
                    return a.isPinned ? -1 : 1;
                });
                setAction('arrange_in_circle');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to arrange notes in circle: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        case 'ARRANGE_RANDOMLY': {
            try {
                const arrangedNotes = spreadNotesRandomly(state.notes).map(note => ({ ...note, date: new Date() }));
                const newNotes = arrangedNotes.sort((a, b) => {
                    if (a.isPinned === b.isPinned) return 0;
                    return a.isPinned ? -1 : 1;
                });
                setAction('arrange_randomly');
                setError(null);
                return { ...state, notes: newNotes };
            } catch (err) {
                setError(`Failed to arrange notes randomly: ${err instanceof Error ? err.message : 'Unknown error'}`);
                return state;
            }
        }

        default:
            return state;
    }
}
