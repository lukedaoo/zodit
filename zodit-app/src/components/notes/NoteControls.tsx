import { X, Palette, Maximize2, RulerDimensionLine, Pin } from 'lucide-react';

interface NoteControlsProps {
    isResizing: boolean;
    isPinned?: boolean;
    onDelete: () => void;
    onChangeColor: () => void;
    onToggleResize: () => void;
    onResetSize: () => void;
    onTogglePin: () => void;
    // isEditing?: boolean;
    // onEdit?: () => void;
}

export const NoteControls = ({
    isResizing,
    isPinned = false,
    onDelete,
    onChangeColor,
    onToggleResize,
    onResetSize,
    onTogglePin,
    // isEditing,
    // onEdit,
}: NoteControlsProps) => {
    return (
        <>
            {/* Vertical controls on the right */}
            <div className="absolute -right-2 top-2 flex flex-col gap-1 z-10"
                onPointerDown={(e) => e.stopPropagation()}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin();
                    }}
                    className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${isPinned
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-600'
                        }`}
                    title={isPinned ? "Unpin note" : "Pin note"}
                >
                    <Pin className={`w-3 h-3 ${isPinned ? 'rotate-45' : ''} transition-transform duration-200`} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleResize();
                    }}
                    className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${isResizing
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-600'
                        }`}
                    title="Resize"
                >
                    <Maximize2 className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onResetSize();
                    }}
                    className="w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 bg-white hover:bg-gray-50 text-gray-600"
                    title="Reset size"
                >
                    <RulerDimensionLine className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onChangeColor();
                    }}
                    className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Change color theme"
                >
                    <Palette className="w-3 h-3 text-gray-600" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="w-6 h-6 bg-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Delete note"
                >
                    <X className="w-3 h-3 text-white" />
                </button>
            </div>
        </>
    );
};
