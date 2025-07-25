import React, { useState } from 'react';
import { Plus, X, Edit3 } from 'lucide-react';

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
    return (
        <div
            style={{
                left: `${note.position.x}px`,
                top: `${note.position.y}px`,
            }}
            className={`absolute w-48 h-40 p-3 border-2 shadow-lg transition-all duration-200 ${note.color} z-10`}
        >
            {/* Note Controls */}
            <div className="absolute -top-2 -right-2 flex gap-1">
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

            {/* Note Content */}
            {isEditing ? (
                <textarea
                    value={note.text}
                    onChange={(e) => onUpdateText(note.id, e.target.value)}
                    onBlur={() => onEdit(note.id)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            onEdit(note.id);
                        }
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

            {/* Tape Effect */}
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
        setNotes([...notes, newNote]);
        setEditingId(newNote.id);
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter((note) => note.id !== id));
    };

    const updateNoteText = (id: string, text: string) => {
        setNotes(
            notes.map((note) => (note.id === id ? { ...note, text } : note))
        );
    };

    const handleEdit = (id: string) => {
        setEditingId(editingId === id ? null : id);
    };

    return (
        <div className="fixed inset-0 top-16 w-screen h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)', margin: 0, padding: 0 }}>
            {/* Floating Add Button */}
            <button
                onClick={addNewNote}
                className="fixed bottom-6 left-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 group"
            >
                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* Notes Board */}
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

                {/* Empty State */}
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
        </div>
    );
};

export default Notes;
