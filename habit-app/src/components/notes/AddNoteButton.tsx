import { Plus } from 'lucide-react';

interface AddNoteButtonProps {
    onAddNote: () => void;
}

export const AddNoteButton = ({ onAddNote }: AddNoteButtonProps) => {
    return (
        <div className="fixed bottom-6 left-6 z-50">
            <button
                onClick={onAddNote}
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
    );
};
