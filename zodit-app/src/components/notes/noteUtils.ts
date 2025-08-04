import { generateId } from '@common/utils';
import type { Note as DisplayNote } from './types';
import { NOTE_COLORS } from './types';

import { Note } from '@database/models';

export const DEFAULT_DIMENSIONS = {
    width: 220,
    height: 180
}

export const notesOverlap = (note1: DisplayNote, note2: DisplayNote): boolean => {
    const rect1 = {
        left: note1.position.x,
        right: note1.position.x + (note1.width || 192),
        top: note1.position.y,
        bottom: note1.position.y + (note1.height || 160)
    };

    const rect2 = {
        left: note2.position.x,
        right: note2.position.x + (note2.width || 192),
        top: note2.position.y,
        bottom: note2.position.y + (note2.height || 160)
    };

    return !(rect1.right <= rect2.left ||
        rect2.right <= rect1.left ||
        rect1.bottom <= rect2.top ||
        rect2.bottom <= rect1.top);
};

export const getOverlappingGroups = (notes: DisplayNote[]): DisplayNote[][] => {
    const processed = new Set<string>();
    const groups: DisplayNote[][] = [];

    notes.forEach(note => {
        if (processed.has(note.id)) return;

        const overlapping = notes.filter(other =>
            other.id !== note.id && notesOverlap(note, other)
        );

        if (overlapping.length > 0) {
            const group = [note, ...overlapping];
            group.forEach(n => processed.add(n.id));
            groups.push(group);
        }
    });

    return groups;
};


export const createNewNote = (): DisplayNote => {
    const allColors = [...NOTE_COLORS.light, ...NOTE_COLORS.dark];
    return {
        id: generateId('note'),
        text: 'New note...',
        color: allColors[Math.floor(Math.random() * allColors.length)],
        position: {
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 100,
        },
        width: DEFAULT_DIMENSIONS.width,
        height: DEFAULT_DIMENSIONS.height,
    };
};

export const generateSampleNotes = (): DisplayNote[] => {
    const notes: DisplayNote[] = [];
    for (let i = 0; i < 5; i++) {
        notes.push(createNewNote());
    }
    return notes;
};

export const arrangeNotesInGrid = (notes: DisplayNote[]): DisplayNote[] => {
    const GRID_SPACING_X = DEFAULT_DIMENSIONS.width + 28; // default width + 28 margin
    const GRID_SPACING_Y = DEFAULT_DIMENSIONS.height + 20; // 160 height + 20 margin
    const NOTES_PER_ROW = 6;
    const START_X = 50;
    const START_Y = 50;

    return notes.map((note, index) => {
        const row = Math.floor(index / NOTES_PER_ROW);
        const col = index % NOTES_PER_ROW;

        return {
            ...note,
            position: {
                x: START_X + (col * GRID_SPACING_X),
                y: START_Y + (row * GRID_SPACING_Y),
            },
        };
    });
};

export const stackNotesVertically = (notes: DisplayNote[]): DisplayNote[] => {
    const STACK_SPACING = 200; // Vertical spacing between notes
    const START_X = 100;
    const START_Y = 50;

    return notes.map((note, index) => ({
        ...note,
        position: {
            x: START_X,
            y: START_Y + (index * STACK_SPACING),
        },
    }));
};

export const arrangeNotesInCircle = (notes: DisplayNote[]): DisplayNote[] => {
    if (notes.length === 0) return notes;
    if (notes.length === 1) {
        return [{
            ...notes[0],
            position: { x: 400, y: 300 },
        }];
    }

    const centerX = 400;
    const centerY = 300;
    const radius = Math.max(200, notes.length * 30);
    const angleStep = (2 * Math.PI) / notes.length;

    return notes.map((note, index) => {
        const angle = index * angleStep;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        return {
            ...note,
            position: { x, y },
        };
    });
};

export const spreadNotesRandomly = (notes: DisplayNote[]): DisplayNote[] => {
    return notes.map(note => ({
        ...note,
        position: {
            x: Math.random() * 800 + 50,
            y: Math.random() * 600 + 50,
        },
    }));
};


export const toDisplayNote = (dataNote: DisplayNote): DisplayNote => ({
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

