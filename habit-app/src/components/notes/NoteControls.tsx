import { X, Palette, Maximize2, RulerDimensionLine } from 'lucide-react';

interface NoteControlsProps {
    isResizing: boolean;
    onDelete: () => void;
    onChangeColor: () => void;
    onToggleResize: () => void;
    onResetSize: () => void;
    // isEditing?: boolean;
    // onEdit?: () => void;
}

export const NoteControls = ({
    isResizing,
    onDelete,
    onChangeColor,
    onToggleResize,
    onResetSize,
    // isEditing,
    // onEdit,
}: NoteControlsProps) => {
    return (
        <>
            {/* Top controls */}
            <div className="absolute -top-2 -right-2 flex gap-1 z-10"
                onPointerDown={(e) => e.stopPropagation()}>
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
                    className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 bg-white hover:bg-gray-50 text-gray-600
                        }`}
                    title="Reset size"
                >
                    <RulerDimensionLine className="w-3 h-3" />
                </button>

                { /* Edit control 
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${isEditing
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-white hover:bg-gray-50 text-gray-600'
                            }`}
                    >
                        <Edit3 className="w-3 h-3" />
                    </button>
                */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="w-6 h-6 bg-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                    <X className="w-3 h-3 text-white" />
                </button>
            </div>

            {/* Color control */}
            <div className="absolute -bottom-2 -left-2 z-10"
                onPointerDown={(e) => e.stopPropagation()}>
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
            </div>
        </>
    );
};

