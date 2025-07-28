interface NoteContentProps {
    text: string;
    isEditing: boolean;
    onUpdateText: (text: string) => void;
    onToggleEdit: () => void;
}

export const NoteContent = ({
    text,
    isEditing,
    onUpdateText,
    onToggleEdit,
}: NoteContentProps) => {
    if (isEditing) {
        return (
            <textarea
                value={text}
                onChange={(e) => onUpdateText(e.target.value)}
                onBlur={onToggleEdit}
                onKeyDown={(e) => {
                    e.stopPropagation();

                    if (e.key === 'Escape') {
                        onToggleEdit();
                    }

                    if (e.key === 'Enter' && e.ctrlKey) {
                        onToggleEdit();
                    }
                }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                }}
                className="w-full h-full bg-transparent border-none outline-none resize-none text-sm font-medium placeholder-current/50"
                placeholder="Write your note..."
                autoFocus
                style={{
                    position: 'relative',
                    zIndex: 20
                }}
            />
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                {text || 'Double-click to edit...'}
            </p>
        </div>
    );
};
