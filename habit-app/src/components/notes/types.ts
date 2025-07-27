export interface Note {
    id: string;
    text: string;
    color: string;
    position: { x: number; y: number };
    width?: number;
    height?: number;
}

export interface NoteState {
    notes: Note[];
    topNoteId: string | null;
    editingId: string | null;
    resizingId: string | null;
}

export const NOTE_COLORS = {
    light: [
        'bg-yellow-200 border-yellow-300 text-yellow-900',
        'bg-pink-200 border-pink-300 text-pink-900',
        'bg-blue-200 border-blue-300 text-blue-900',
        'bg-green-200 border-green-300 text-green-900',
        'bg-purple-200 border-purple-300 text-purple-900',
        'bg-orange-200 border-orange-300 text-orange-900',
    ],
    dark: [
        'bg-gray-800 border-gray-700 text-gray-100',
        'bg-slate-800 border-slate-700 text-slate-100',
        'bg-zinc-800 border-zinc-700 text-zinc-100',
        'bg-neutral-800 border-neutral-700 text-neutral-100',
        'bg-stone-800 border-stone-700 text-stone-100',
        'bg-red-900 border-red-800 text-red-100',
        'bg-emerald-800 border-emerald-700 text-emerald-100',
        'bg-indigo-800 border-indigo-700 text-indigo-100',
        'bg-violet-800 border-violet-700 text-violet-100',
        'bg-teal-800 border-teal-700 text-teal-100',
    ]
};
