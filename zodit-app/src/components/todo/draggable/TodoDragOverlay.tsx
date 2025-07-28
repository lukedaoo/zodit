interface DragItem {
    id: string;
    type: 'group' | 'task';
    title?: string;
    groupId?: string;
}

interface TodoDragOverlayProps {
    activeDragItem: DragItem | null;
    activeId: string | null;
}

export const TodoDragOverlay = ({ activeDragItem, activeId }: TodoDragOverlayProps) => {
    if (!activeDragItem) return null;

    const displayText = activeDragItem.title || activeDragItem.id;
    const isDragging = Boolean(activeId);

    return (
        <div
            className={`
                p-4 rounded-lg border transition-all duration-200 pointer-events-none
                ${isDragging ? 'opacity-90 shadow-lg scale-105' : 'opacity-90'}
            `}
            style={{
                borderColor: 'var(--color-primary-500)',
                backgroundColor: 'var(--color-background)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            }}
        >
            <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                    {activeDragItem.type}
                </span>
                <span className="font-medium">{displayText}</span>
            </div>
        </div>
    );
};

