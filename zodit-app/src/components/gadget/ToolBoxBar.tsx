import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';

export interface Toolbox {
    id: string;
    icon: any;
    label: string;
    count?: number;
    available: boolean;
    component?: React.ComponentType<{ onClose: () => void;[key: string]: any }>;
    componentProps?: Record<string, any>;
}

interface ToolboxBarProps {
    tools: Toolbox[];
    onToolAction?: (toolId: string, action: string, data?: any) => void;
}

interface ToolButtonProps {
    tool: Toolbox;
    isInSlider: boolean;
    isActive: boolean;
    onToggle: (id: string, available: boolean) => void;
    onClose: () => void;
    gap?: number;
}

const ToolButton = ({ tool, isInSlider, isActive, onToggle, onClose, gap = 4 }: ToolButtonProps) => {
    const IconComponent = tool.icon;
    const hasCount = (tool.count || 0) > 0;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                isActive &&
                popupRef.current &&
                !popupRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        if (isActive && !isInSlider) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isActive, isInSlider, onClose]);

    const gapClass = {
        2: 'mt-2',
        3: 'mt-3',
        4: 'mt-4',
        5: 'mt-5',
        6: 'mt-6'
    }[gap] || 'mt-4';

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => onToggle(tool.id, tool.available)}
                disabled={!tool.available}
                className={`${isInSlider ? 'w-full h-12 px-4 justify-start gap-3' : 'w-8 h-8 justify-center'} rounded-md flex items-center transition-all duration-200 relative ${tool.available
                    ? isActive
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'opacity-50 cursor-not-allowed'
                    }`}
                style={{
                    backgroundColor: isActive ? 'var(--color-primary-500)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-foreground)',
                }}
                title={tool.available ? tool.label : `${tool.label} (Coming Soon)`}
            >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {isInSlider && (
                    <span className="text-sm font-medium flex-1 text-left">{tool.label}</span>
                )}
                {hasCount && (
                    <span className={`${isInSlider ? 'relative ml-auto' : 'absolute -top-1 -right-1'} w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center`}>
                        {tool.count! > 9 ? '9+' : tool.count}
                    </span>
                )}
            </button>

            {/* Inline popup for desktop toolbar */}
            {isActive && !isInSlider && (
                <div
                    ref={popupRef}
                    className={`absolute top-full ${gapClass} right-0 z-50 rounded-lg shadow-lg border p-4 min-w-[240px]`}
                    style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    {tool.component ? (
                        <tool.component
                            onClose={onClose}
                            {...(tool.componentProps || {})}
                        />
                    ) : (
                        <div className="text-center">
                            <IconComponent className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-muted-foreground)' }} />
                            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                                {tool.label} loaded successfully
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Slider inline popup */}
            {isActive && isInSlider && (
                <div
                    className="mt-2 rounded-lg border p-3"
                    style={{
                        backgroundColor: 'var(--color-muted)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    {tool.component ? (
                        <tool.component
                            onClose={onClose}
                            {...(tool.componentProps || {})}
                        />
                    ) : (
                        <div className="text-center">
                            <IconComponent className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--color-muted-foreground)' }} />
                            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                {tool.label} loaded successfully
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const ToolboxBar = ({ tools = [], onToolAction }: ToolboxBarProps) => {
    const [openTool, setOpenTool] = useState<string | null>(null);
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [shouldUseSlider, setShouldUseSlider] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setShouldUseSlider(window.innerWidth <= 1024);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleTool = (toolId: string, available: boolean) => {
        if (!available) return;
        const newOpenTool = openTool === toolId ? null : toolId;
        setOpenTool(newOpenTool);
        onToolAction?.(toolId, newOpenTool ? 'open' : 'close');
    };

    const handleClosePopup = () => setOpenTool(null);

    if (tools.length === 0) return null;

    return (
        <>
            {shouldUseSlider ? (
                // Slider mode
                <>
                    {!isSliderOpen && (
                        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
                            <button
                                onClick={() => {
                                    setIsSliderOpen(!isSliderOpen);
                                    if (openTool) setOpenTool(null);
                                }}
                                className={`w-8 h-16 rounded-l-lg shadow-lg border-l border-t border-b flex items-center justify-center transition-all duration-300 ${isSliderOpen ? '-translate-x-80' : 'translate-x-0'}`}
                                style={{
                                    backgroundColor: 'var(--color-background)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-foreground)',
                                }}
                            >
                                <ChevronRight className="w-4 h-4 transition-transform duration-300 rotate-180" />
                            </button>
                        </div>
                    )}
                    <div
                        className={`fixed right-0 top-0 h-full w-90 shadow-lg border-l z-40 transition-transform duration-300 overflow-y-auto ${isSliderOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        style={{
                            backgroundColor: 'var(--color-background)',
                            borderColor: 'var(--color-border)',
                        }}
                    >
                        <div
                            className="p-4 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <h3 className="font-semibold text-lg" style={{ color: 'var(--color-foreground)' }}>
                                Tools
                            </h3>
                            <button
                                onClick={() => setIsSliderOpen(false)}
                                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                                style={{ color: 'var(--color-foreground)' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-2 space-y-1">
                            {tools.map(tool => (
                                <ToolButton
                                    key={tool.id}
                                    tool={tool}
                                    isInSlider={true}
                                    isActive={openTool === tool.id}
                                    onToggle={toggleTool}
                                    onClose={handleClosePopup}
                                />
                            ))}
                        </div>
                    </div>
                    {isSliderOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-20 z-30"
                            onClick={() => setIsSliderOpen(false)}
                        />
                    )}
                </>
            ) : (
                // Toolbar mode
                <div className="fixed top-20 right-0 left-0 z-40 pb-4">
                    <div className="flex justify-end pr-6">
                        <div
                            className="relative flex items-center justify-center px-3 py-2 rounded-lg shadow-lg border max-w-full overflow-visible"
                            style={{
                                backgroundColor: 'var(--color-background)',
                                borderColor: 'var(--color-border)',
                            }}
                        >
                            {tools.map(tool => (
                                <ToolButton
                                    key={tool.id}
                                    tool={tool}
                                    isInSlider={false}
                                    isActive={openTool === tool.id}
                                    onToggle={toggleTool}
                                    onClose={handleClosePopup}
                                    gap={4}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
