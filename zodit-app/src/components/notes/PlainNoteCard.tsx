import type { Note } from './types';
import { DEFAULT_DIMENSIONS } from './noteUtils';

interface PlainNoteProps {
    note: Note;
    className?: string;
    style?: React.CSSProperties;
}

export const PlainNoteCard = ({
    note,
    className = "",
    style = {}
}: PlainNoteProps) => {
    if (!note) {
        return (
            <div
                className={`p-3 border-2 border-dashed border-gray-300 bg-gray-100 text-gray-500 ${className}`}
                style={{
                    width: DEFAULT_DIMENSIONS.width,
                    height: DEFAULT_DIMENSIONS.height,
                    ...style
                }}
            >
                <div className="w-full h-full flex items-center justify-center text-center">
                    <div>
                        <p className="text-sm font-medium">Note not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`p-3 border-2 shadow-lg ${note.color} ${className}`}
            style={{
                width: note.width || DEFAULT_DIMENSIONS.width,
                height: note.height || DEFAULT_DIMENSIONS.height,
                position: 'relative',
                ...style
            }}
        >
            {/* Optional pinned indicator (non-interactive) */}
            {note.isPinned && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 min-w-16 h-5 px-2 bg-gradient-to-r from-amber-400 to-amber-500 border-2 border-amber-300 rounded-md shadow-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white leading-none tracking-wide drop-shadow-sm">📌 PINNED</span>
                </div>
            )}

            {/* Note content */}
            <div className="w-full h-full overflow-auto">
                <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                    {note.text || 'Empty note...'}
                </p>
            </div>
        </div>
    );
};
