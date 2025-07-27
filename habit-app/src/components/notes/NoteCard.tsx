import { useDraggable } from '@dnd-kit/core';
import type { Note } from './types';
import { NoteContent } from './NoteContent';
import { NoteControls } from './NoteControls';
import { NoteResizeHandle } from './NoteResizeHandle';
import { DEFAULT_DIMENSIONS } from './noteUtils';

interface NoteCardProps {
    note: Note;
    isEditing: boolean;
    isResizing: boolean;
    onToggleEdit: () => void;
    onDelete: () => void;
    onUpdateText: (text: string) => void;
    onChangeColor: () => void;
    onToggleResize: () => void;
    onResize: (width: number, height: number) => void;
    topNoteId: string | null;
    bringNoteToFront: (id: string) => void;
}

export const NoteCard = ({
    note,
    isEditing,
    isResizing,
    onToggleEdit,
    onDelete,
    onUpdateText,
    onChangeColor,
    onToggleResize,
    onResize,
    topNoteId,
    bringNoteToFront,
}: NoteCardProps) => {
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
        width: note.width || DEFAULT_DIMENSIONS.width,
        height: note.height || DEFAULT_DIMENSIONS.height
    };

    const isOnTop = note.id === topNoteId;

    return (
        <div
            ref={setNodeRef}
            {...(!isEditing && !isResizing ? listeners : {})}
            {...(!isEditing && !isResizing ? attributes : {})}
            style={style}
            className={`absolute p-3 border-2 shadow-lg ${note.color} cursor-move will-change-transform 
                    ${isOnTop ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
            onMouseDown={() => bringNoteToFront(note.id)}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isEditing && !isResizing) {
                    onToggleEdit();
                }
            }}
        >

            <NoteControls
                isEditing={isEditing}
                isResizing={isResizing}
                onEdit={onToggleEdit}
                onDelete={onDelete}
                onChangeColor={onChangeColor}
                onToggleResize={onToggleResize}
            />

            <NoteContent
                text={note.text}
                isEditing={isEditing}
                onUpdateText={onUpdateText}
                onToggleEdit={onToggleEdit}
            />

            {isResizing && (
                <NoteResizeHandle
                    onResize={onResize}
                    currentWidth={note.width || DEFAULT_DIMENSIONS.width}
                    currentHeight={note.height || DEFAULT_DIMENSIONS.height}
                />
            )}

            {/* Drag handle with ID - only show when not editing */}
            {(
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 min-w-8 h-4 px-1 bg-white/80 border border-gray-200 rounded-sm shadow-sm flex items-center justify-center">
                    <span className="text-xs font-mono text-gray-600 leading-none">
                        {note.id.length > 6 ? `${note.id.slice(0, 6)}...` : note.id}
                    </span>
                </div>
            )}
        </div>
    );
};
