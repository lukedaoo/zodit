import React, { useState } from 'react';
import { Plus, X, Edit3 } from 'lucide-react';
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

const NOTE_COLORS = [
    'bg-yellow-200 border-yellow-300 text-yellow-900',
    'bg-pink-200 border-pink-300 text-pink-900',
    'bg-blue-200 border-blue-300 text-blue-900',
    'bg-green-200 border-green-300 text-green-900',
    'bg-purple-200 border-purple-300 text-purple-900',
    'bg-orange-200 border-orange-300 text-orange-900',
];

interface NoteCardProps {
    note: Note;
    isEditing: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdateText: (id: string, text: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
    note,
    isEditing,
    onEdit,
    onDelete,
    onUpdateText,
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
    const [notes, setNotes] = useState<Note[]>([
        {
            id: '1',
            text: 'Remember to call mom',
            color: NOTE_COLORS[0],
            position: { x: 50, y: 100 },
        },
        {
            id: '2',
            text: 'Buy groceries\n- Milk\n- Bread\n- Eggs',
            color: NOTE_COLORS[1],
            position: { x: 300, y: 150 },
        },
        {
            id: '3',
            text: 'Meeting at 2 PM',
            color: NOTE_COLORS[2],
            position: { x: 200, y: 300 },
        },
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);

    const addNewNote = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            text: 'New note...',
            color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
            position: {
                x: Math.random() * 400 + 50,
                y: Math.random() * 300 + 100,
            },
        };
        setNotes((prev) => [...prev, newNote]);
        setEditingId(newNote.id);
    };

    const deleteNote = (id: string) => {
        console.log("delete note");
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
                className="fixed bottom-6 left-6 w-11 h-11 btn rounded-full flex items-center justify-center z-50 group"
            >
                <Plus className="w-5 h-5" />
            </button>

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
                        />
                    ))}

                    {notes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-purple-200/70">
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
