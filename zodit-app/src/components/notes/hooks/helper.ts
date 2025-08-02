import { Note } from '@database/models';
import type { Note as DisplayNote } from '../types';

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

export const toDisplayNote = (dataNote: Note): DisplayNote => ({
    id: dataNote.id,
    text: dataNote.text,
    color: dataNote.color,
    position: dataNote.position,
    width: dataNote.width,
    height: dataNote.height,
    isPinned: dataNote.isPinned,
    tags: dataNote.tags,
    createdAt: dataNote.createdAt,
    updatedAt: dataNote.updatedAt
});

export const toDataNote = (displayNote: DisplayNote): Note => {
    return new Note({
        id: displayNote.id,
        text: displayNote.text,
        color: displayNote.color,
        position: displayNote.position,
        width: displayNote.width,
        height: displayNote.height,
        isPinned: displayNote.isPinned,
        tags: displayNote.tags,
        createdAt: displayNote.createdAt,
        updatedAt: displayNote.updatedAt
    });
};
