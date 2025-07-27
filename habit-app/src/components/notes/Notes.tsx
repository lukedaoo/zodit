import React, { useState } from 'react';
import { Plus, X, Edit3, Palette, Maximize2 } from 'lucide-react';
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
    width?: number;
    height?: number;
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
    isResizing: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdateText: (id: string, text: string) => void;
    onChangeColor: (id: string) => void;
    onToggleResize: (id: string) => void;
    onResize: (id: string, width: number, height: number) => void;
    topNoteId: string | null;
    bringNoteToFront: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
    note,
    isEditing,
    isResizing,
    onEdit,
    onDelete,
    onUpdateText,
    onChangeColor,
    onToggleResize,
    onResize,
    topNoteId,
    bringNoteToFront,
}) => {
    const draggable = useDraggable({ id: note.id });
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
    } = isResizing ? {
        attributes: {},
        listeners: {},
        setNodeRef: () => { },
        transform: null,
    } : draggable;

    const style = {
        left: `${note.position.x}px`,
        top: `${note.position.y}px`,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'none',
        zIndex: note.id === topNoteId ? 999 : 10,
        width: note.width || 192,
        height: note.height || 160,
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className={`absolute p-3 border-2 shadow-lg ${note.color} cursor-move will-change-transform`}
            onMouseDown={() => bringNoteToFront(note.id)}
            onClick={(e) => e.stopPropagation()} // Prevent background click when clicking on note
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
                        onToggleResize(note.id);
                    }}
                    className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${isResizing
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-600'
                        }`}
                    title="Resize"
                >
                    <Maximize2 className="w-3 h-3" />
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

            {/* Improved Resize handle */}
            {isResizing && (
                <div
                    className="absolute -right-1 -bottom-1 w-6 h-6 cursor-se-resize z-20 group"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = note.width || 192;
                        const startHeight = note.height || 160;

                        const onMouseMove = (moveEvent: MouseEvent) => {
                            const newWidth = Math.max(120, startWidth + (moveEvent.clientX - startX));
                            const newHeight = Math.max(100, startHeight + (moveEvent.clientY - startY));
                            onResize(note.id, newWidth, newHeight);
                        };

                        const onMouseUp = () => {
                            window.removeEventListener('mousemove', onMouseMove);
                            window.removeEventListener('mouseup', onMouseUp);
                        };

                        window.addEventListener('mousemove', onMouseMove);
                        window.addEventListener('mouseup', onMouseUp);
                    }}
                    title="Drag to resize"
                >
                    {/* Triangular resize indicator */}
                    <div className="absolute right-0 bottom-0 w-0 h-0 border-l-6 border-b-6 border-l-transparent border-b-gray-400 group-hover:border-b-gray-600 transition-colors" />

                    {/* Grip lines */}
                    <div className="absolute right-1 bottom-1 flex flex-col gap-0.5">
                        <div className="flex gap-0.5">
                            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors" />
                            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors" />
                        </div>
                        <div className="flex gap-0.5">
                            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors" />
                        </div>
                    </div>

                    {/* Invisible larger hit area */}
                    <div className="absolute -right-2 -bottom-2 w-8 h-8" />
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
            width: 192,
            height: 160,
        };
        NOTES.push(note);
    }

    const [notes, setNotes] = useState<Note[]>(NOTES);
    const [topNoteId, setTopNoteId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);

    // Handle clicks outside notes to disable resize mode
    const handleBackgroundClick = () => {
        if (resizingId) {
            setResizingId(null);
        }
    };

    const bringNoteToFront = (id: string) => {
        setTopNoteId(id);
    };

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
            width: 192,
            height: 160,
        };
        setNotes((prev) => [...prev, newNote]);
        setEditingId(newNote.id);
    };

    const changeNoteColor = (id: string) => {
        setNotes(prev =>
            prev.map(note => {
                if (note.id === id) {
                    const isCurrentlyLight = NOTE_COLORS.light.includes(note.color);
                    const newTheme = isCurrentlyLight ? NOTE_COLORS.dark : NOTE_COLORS.light;
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
        setTopNoteId(id);
    };

    const handleResizeToggle = (id: string) => {
        setResizingId((prev) => (prev === id ? null : id));
        setTopNoteId(id);
    };

    const updateNoteSize = (id: string, width: number, height: number) => {
        setNotes((prev) =>
            prev.map((note) =>
                note.id === id ? { ...note, width, height } : note
            )
        );
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
                    ? { ...n, position: { x: newX, y: newY } }
                    : n
            )
        );
        setTopNoteId(id);
    };

    return (
        <div className="fixed inset-0 top-16 w-screen h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)', margin: 0, padding: 0 }}>
            <div className="fixed bottom-6 left-6 z-50">
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

            <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
                <div
                    className="relative h-full overflow-hidden"
                    onClick={handleBackgroundClick}
                >
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            isEditing={editingId === note.id}
                            isResizing={resizingId === note.id}
                            onEdit={handleEdit}
                            onDelete={deleteNote}
                            onUpdateText={updateNoteText}
                            onChangeColor={changeNoteColor}
                            onToggleResize={handleResizeToggle}
                            onResize={updateNoteSize}
                            topNoteId={topNoteId}
                            bringNoteToFront={bringNoteToFront}
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
