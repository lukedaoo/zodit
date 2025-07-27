import type { Note } from './types';
import { NOTE_COLORS } from './types';

export const DEFAULT_DIMENSIONS = {
    width: 192,
    height: 160
}

export const notesOverlap = (note1: Note, note2: Note): boolean => {
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

export const getOverlappingGroups = (notes: Note[]): Note[][] => {
    const processed = new Set<string>();
    const groups: Note[][] = [];

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


export const createNewNote = (): Note => {
    const allColors = [...NOTE_COLORS.light, ...NOTE_COLORS.dark];
    return {
        id: Date.now().toString(),
        text: 'New note...',
        color: allColors[Math.floor(Math.random() * allColors.length)],
        position: {
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 100,
        },
        width: DEFAULT_DIMENSIONS.width,
        height: DEFAULT_DIMENSIONS.height
    };
};

export const generateSampleNotes = (): Note[] => {
    const notes: Note[] = [];
    for (let i = 0; i < 5; i++) {
        notes.push(createNewNote());
    }
    return notes;
};
