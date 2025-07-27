import type { Note } from './types';

interface OverlappingDisplayProps {
    overlappingGroups: Note[][];
}

export const OverlappingDisplay = ({ overlappingGroups }: OverlappingDisplayProps) => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed top-20 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs max-w-sm z-50">
            <div className="font-bold mb-2 text-sm">Overlapping Groups:</div>
            {overlappingGroups.length === 0 ? (
                <div className="text-gray-300 italic">No overlapping notes</div>
            ) : (
                overlappingGroups.map((group, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                        <div className="font-medium text-yellow-300">
                            Group {idx + 1}: {group.length} notes
                        </div>
                        <div className="text-gray-300 text-xs mt-1 space-y-1">
                            {group.map(note => (
                                <div key={note.id} className="flex items-center gap-2">
                                    <span className="font-mono text-blue-300">
                                        {note.id.length > 8 ? `${note.id.slice(0, 8)}...` : note.id}
                                    </span>
                                    <span className="text-gray-400">
                                        "{note.text.length > 15 ? `${note.text.slice(0, 15)}...` : note.text}"
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

