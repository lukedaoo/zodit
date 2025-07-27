import { Edit3 } from 'lucide-react';

export const EmptyState = () => {
    return (
        <div className="fixed inset-16 flex items-center justify-center z-30 pointer-events-none">
            <div className="text-center" style={{ color: 'var(--color-foreground)' }}>
                <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No notes yet!</p>
                <p className="text-sm">Click the floating button to create your first sticky note</p>
            </div>
        </div>
    );
};

