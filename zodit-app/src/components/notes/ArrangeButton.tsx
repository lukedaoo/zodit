import { useState } from 'react';
import { Grid3X3, AlignLeft, Circle, Shuffle } from 'lucide-react';

interface ArrangeButtonProps {
    onArrangeGrid: () => void;
    onArrangeStack: () => void;
    onArrangeCircle: () => void;
    onArrangeRandom: () => void;
}

export const ArrangeButton = ({
    onArrangeGrid,
    onArrangeStack,
    onArrangeCircle,
    onArrangeRandom,
}: ArrangeButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const arrangements = [
        { icon: Grid3X3, label: 'Grid', action: onArrangeGrid },
        { icon: AlignLeft, label: 'Stack', action: onArrangeStack },
        { icon: Circle, label: 'Circle', action: onArrangeCircle },
        { icon: Shuffle, label: 'Random', action: onArrangeRandom },
    ];

    const handleArrange = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 left-6 z-50" style={{ transform: 'translateY(-60px)' }}>
            <div className="relative">
                {/* Arrangement options - show when open */}
                {isOpen && (
                    <div
                        className="absolute bottom-16 left-0 rounded-lg shadow-lg border py-2 min-w-32"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                        }}
                    >
                        {arrangements.map(({ icon: Icon, label, action }) => (
                            <button
                                key={label}
                                onClick={() => handleArrange(action)}
                                className="w-full px-3 py-2 text-left hover:opacity-80 flex items-center gap-2 text-sm transition-opacity"
                                style={{
                                    color: 'var(--color-foreground)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main arrange button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    onMouseEnter={(e) => {
                        if (!isOpen) {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                            e.currentTarget.style.color = 'white';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isOpen) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-foreground)';
                        }
                    }}
                    className={`w-11 h-11 btn rounded-full flex items-center justify-center transition-all duration-200 ${isOpen
                        ? 'bg-blue-500 text-white'
                        : 'hover:scale-105'
                        }`}
                    style={{
                        backgroundColor: isOpen ? 'var(--color-primary-500)' : 'transparent',
                        color: isOpen ? 'white' : 'var(--color-foreground)',
                    }}
                    title="Arrange notes"
                >
                    <Grid3X3 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
