import { useState } from 'react';

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

export const ToolboxBar = ({ tools = [], onToolAction }: ToolboxBarProps) => {
    const [openTool, setOpenTool] = useState<string | null>(null);

    const toggleTool = (toolId: string, available: boolean) => {
        if (!available) return;

        const newOpenTool = openTool === toolId ? null : toolId;
        setOpenTool(newOpenTool);

        if (onToolAction) {
            onToolAction(toolId, newOpenTool ? 'open' : 'close');
        }
    };

    const handleClosePopup = () => {
        setOpenTool(null);
    };

    // Don't render if no tools
    if (tools.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-20 right-0 left-0 z-40 pb-4">
            <div className="flex justify-end pr-6">
                <div
                    className="flex items-center gap-1 px-3 py-2 rounded-lg shadow-lg border"
                    style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    {tools.map((tool) => {
                        const IconComponent = tool.icon;
                        const isActive = openTool === tool.id;
                        const hasCount = (tool.count || 0) > 0;

                        return (
                            <div key={tool.id} className="relative">
                                <button
                                    onClick={() => toggleTool(tool.id, tool.available)}
                                    disabled={!tool.available}
                                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 relative ${tool.available
                                        ? isActive
                                            ? 'bg-primary-500 text-white'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        : 'opacity-50 cursor-not-allowed'
                                        }`}
                                    style={{
                                        backgroundColor: isActive ? 'var(--color-primary-500)' : 'transparent',
                                        color: isActive ? 'white' : 'var(--color-foreground)',
                                    }}
                                    title={tool.available ? tool.label : `${tool.label} (Coming Soon)`}
                                >
                                    <IconComponent className="w-4 h-4 transition-transform duration-200" />

                                    {/* Count badge */}
                                    {hasCount && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {tool.count! > 9 ? '9+' : tool.count}
                                        </span>
                                    )}
                                </button>

                                {/* Dynamic popup content */}
                                {isActive && tool.component && (
                                    <div
                                        className="absolute top-12 right-0 rounded-lg shadow-lg border"
                                        style={{
                                            backgroundColor: 'var(--color-background)',
                                            borderColor: 'var(--color-border)',
                                        }}
                                    >
                                        <tool.component
                                            onClose={handleClosePopup}
                                            {...(tool.componentProps || {})}
                                        />
                                    </div>
                                )}

                                {/* Default placeholder popup for tools without components */}
                                {isActive && !tool.component && tool.available && (
                                    <div
                                        className="absolute top-12 right-0 rounded-lg shadow-lg border p-4 min-w-48"
                                        style={{
                                            backgroundColor: 'var(--color-background)',
                                            borderColor: 'var(--color-border)',
                                        }}
                                    >
                                        <div className="text-center">
                                            <IconComponent className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-muted-foreground)' }} />
                                            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-foreground)' }}>
                                                {tool.label}
                                            </h3>
                                            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                                Tool loaded successfully
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
