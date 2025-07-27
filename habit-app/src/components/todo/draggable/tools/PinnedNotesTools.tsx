import { Pin, X, ExternalLink } from 'lucide-react';

interface QuickNote {
    id: string;
    text: string;
    createdAt: string;
    isPinned?: boolean;
}

interface PinnedNotesToolProps {
    onClose: () => void;
    onNavigateToNotes?: () => void;
    notes?: QuickNote[];
}

export const PinnedNotesTool = ({
    onClose,
    onNavigateToNotes,
    notes = []
}: PinnedNotesToolProps) => {
    const pinnedNotes = notes.filter(note => note.isPinned);

    const handleNavigateToNotes = () => {
        onClose();
        if (onNavigateToNotes) {
            onNavigateToNotes();
        }
    };

    return (
        <div className="p-4 min-w-80 max-w-96 max-h-96 overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
                    Pinned Notes ({pinnedNotes.length})
                </h3>
                <div className="flex items-center gap-2">
                    {onNavigateToNotes && (
                        <button
                            onClick={handleNavigateToNotes}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            style={{ color: 'var(--color-foreground)' }}
                            title="Go to Notes tab"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        style={{ color: 'var(--color-foreground)' }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {pinnedNotes.length > 0 ? (
                <div className="space-y-3">
                    {pinnedNotes.map((note) => (
                        <div
                            key={note.id}
                            className="group cursor-pointer hover:opacity-80 transition-opacity border rounded-lg p-3"
                            style={{
                                backgroundColor: 'var(--color-muted)',
                                borderColor: 'var(--color-border)',
                            }}
                            onClick={handleNavigateToNotes}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Pin className="w-3 h-3 text-amber-500 rotate-45" />
                                    <span className="text-xs font-mono text-gray-500">
                                        {note.id.length > 8 ? `${note.id.slice(0, 8)}...` : note.id}
                                    </span>
                                </div>

                                <div className="text-sm font-medium line-clamp-2" style={{ color: 'var(--color-foreground)' }}>
                                    {note.text || 'Empty note...'}
                                </div>

                                {note.text && note.text.length > 50 && (
                                    <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                        {note.text.length} characters
                                    </div>
                                )}
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 text-xs flex items-center gap-1" style={{ color: 'var(--color-muted-foreground)' }}>
                                <ExternalLink className="w-3 h-3" />
                                Click to go to Notes tab
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                    No pinned notes yet
                </div>
            )}
        </div>
    );
};
