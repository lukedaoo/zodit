import { PlainNoteCard } from '@components/notes/PlainNoteCard';
import type { Note } from '@components/notes/types';
import { X, ExternalLink } from 'lucide-react';

interface QuickNote {
    id: string;
    text: string;
    createdAt?: string;
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
        <div className="p-4 max-w-96 max-h-96 overflow-y-auto">
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
                        <PlainNoteCard key={note.id} note={note as Note} />
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
