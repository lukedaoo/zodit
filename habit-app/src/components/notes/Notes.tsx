import React, { useState } from 'react';
import { Plus, X, Edit3, Palette } from 'lucide-react';
import {
    DndContext,
    useDraggable,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';


interface Note {
    id: string;
    text: string;
    color: string;
    position: { x: number; y: number };
}

const NOTE_COLORS = {
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

interface NoteCardProps {
    note: Note;
    isEditing: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdateText: (id: string, text: string) => void;
    onChangeColor: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
    note,
    isEditing,
    onEdit,
    onDelete,
    onUpdateText,
    onChangeColor,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({ id: note.id });

    const style = {
        left: `${note.position.x}px`,
        top: `${note.position.y}px`,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'none',
        zIndex: isDragging ? 50 : 10,
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className={`absolute w-48 h-40 p-3 border-2 shadow-lg ${note.color} cursor-move will-change-transform`}
        >
            {/* Controls */}
            <div className="absolute -top-2 -right-2 flex gap-1 z-10"
                onPointerDown={(e) => e.stopPropagation()}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onChangeColor(note.id);
                    }}
                    className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Change color theme"
                >
                    <Palette className="w-3 h-3 text-gray-600" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(note.id);
                    }}
                    className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <Edit3 className="w-3 h-3 text-gray-600" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                    }}
                    className="w-6 h-6 bg-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                    <X className="w-3 h-3 text-white" />
                </button>
            </div>

            {/* Content */}
            {isEditing ? (
                <textarea
                    value={note.text}
                    onChange={(e) => onUpdateText(note.id, e.target.value)}
                    onBlur={() => onEdit(note.id)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) onEdit(note.id);
                    }}
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-sm font-medium placeholder-current/50"
                    placeholder="Write your note..."
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <div className="w-full h-full overflow-hidden">
                    <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                        {note.text}
                    </p>
                </div>
            )}

            {/* Drag handle visual */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-white/60 border border-gray-200 rounded-sm shadow-sm"></div>
        </div>
    );
};

const Notes: React.FC = () => {
    const NOTES: Note[] = [];
    for (let i = 0; i < NOTE_COLORS.dark.length; i++) {
        const color = NOTE_COLORS.dark[i];
        const note: Note = {
            id: i.toString(),
            text: 'Remember to call mom',
            color: color,
            position: {
                x: Math.random() * 400 + 50,
                y: Math.random() * 300 + 100,
            },
        };
        NOTES.push(note);
    }
    const [notes, setNotes] = useState<Note[]>(NOTES);

    const [editingId, setEditingId] = useState<string | null>(null);

    const addNewNote = () => {
        const allColors = [...NOTE_COLORS.light, ...NOTE_COLORS.dark];
        const newNote: Note = {
            id: Date.now().toString(),
            text: 'New note...',
            color: allColors[Math.floor(Math.random() * allColors.length)],
            position: {
                x: Math.random() * 400 + 50,
                y: Math.random() * 300 + 100,
            },
        };
        setNotes((prev) => [...prev, newNote]);
        setEditingId(newNote.id);
    };

    const changeNoteColor = (id: string) => {
        setNotes(prev =>
            prev.map(note => {
                if (note.id === id) {
                    // Determine current theme
                    const isCurrentlyLight = NOTE_COLORS.light.includes(note.color);
                    const newTheme = isCurrentlyLight ? NOTE_COLORS.dark : NOTE_COLORS.light;

                    // Get a random color from the opposite theme
                    const newColor = newTheme[Math.floor(Math.random() * newTheme.length)];

                    return { ...note, color: newColor };
                }
                return note;
            })
        );
    };

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const updateNoteText = (id: string, text: string) => {
        setNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, text } : note))
        );
    };

    const handleEdit = (id: string) => {
        setEditingId((prev) => (prev === id ? null : id));
    };

    const handleDragEnd = (event: any) => {
        const { active, delta } = event;
        const id = active.id as string;
        const note = notes.find((n) => n.id === id);
        if (!note) return;

        const newX = Math.max(0, note.position.x + delta.x);
        const newY = Math.max(0, note.position.y + delta.y);

        setNotes((prev) =>
            prev.map((n) =>
                n.id === id
                    ? {
                        ...n,
                        position: {
                            x: newX,
                            y: newY,
                        },
                    }
                    : n
            )
        );
    };

    return (
        <div className="fixed inset-0 top-16 w-screen h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)', margin: 0, padding: 0 }}>
            {/* Control Buttons */}
            <div className="fixed bottom-6 left-6 z-50">
                {/* Add Button */}
                <button
                    onClick={addNewNote}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-foreground)';
                    }}
                    className="w-11 h-11 btn rounded-full flex items-center justify-center group"
                    title="Add new note"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Empty state */}

            <DndContext onDragEnd={handleDragEnd}
                modifiers={[restrictToParentElement]}>
                <div className="relative h-full overflow-hidden">
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            isEditing={editingId === note.id}
                            onEdit={handleEdit}
                            onDelete={deleteNote}
                            onUpdateText={updateNoteText}
                            onChangeColor={changeNoteColor}
                        />
                    ))}

                    {notes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center" style={{ color: 'var(--color-foreground)' }}>
                                <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg mb-2">No notes yet!</p>
                                <p className="text-sm">Click the floating button to create your first sticky note</p>
                            </div>
                        </div>
                    )}
                </div>
            </DndContext>
        </div>
    );
};

export default Notes;
