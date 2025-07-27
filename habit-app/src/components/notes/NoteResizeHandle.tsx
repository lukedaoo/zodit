import { useResize } from './hooks/useResize';

interface NoteResizeHandleProps {
    onResize: (width: number, height: number) => void;
    currentWidth: number;
    currentHeight: number;
}

export const NoteResizeHandle = ({
    onResize,
    currentWidth,
    currentHeight,
}: NoteResizeHandleProps) => {
    const { handleMouseDown } = useResize({ onResize, currentWidth, currentHeight });

    return (
        <div
            className="absolute -right-1 -bottom-1 w-6 h-6 cursor-se-resize z-20 group"
            onMouseDown={handleMouseDown}
            title="Drag to resize"
        >
            <div className="absolute right-0 bottom-0 w-0 h-0 border-l-6 border-b-6 border-l-transparent border-b-gray-400 group-hover:border-b-gray-600 transition-colors" />
            <div className="absolute right-1 bottom-1 flex flex-col gap-0.5">
                <div className="flex gap-0.5">
                    <div className="w-0.5 h-0.5 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors" />
                    <div className="w-0.5 h-0.5 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors" />
                </div>
                <div className="flex gap-0.5">
                    <div className="w-0.5 h-0.5 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors" />
                </div>
            </div>
            <div className="absolute -right-2 -bottom-2 w-8 h-8" />
        </div>
    );
};

