import React, { useEffect, useState } from 'react';
import { githubDarkTheme, JsonEditor } from 'json-edit-react';
import { X, FileDown } from 'lucide-react';

interface JsonEditorDialogProps {
    // Core data
    initialData?: any;

    // Customization options
    title?: string;
    description?: string;
    rootName?: string;

    // Styling
    width?: string;
    height?: string;
    maxWidth?: string;

    // Editor configuration
    theme?: any[];
    restrictTypeSelection?: boolean;
    lockNodes?: (props: { path: any; key: any; value: any }) => boolean;

    // Action buttons configuration
    actions?: Array<{
        label: string;
        variant: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'destructive';
        onClick: (data: any) => void;
    }>;
    buttonSize?: 'sm' | 'md' | 'lg';

    // Callbacks
    onCancel: () => void;
    onDataChange?: (data: any) => void;
}

export const JsonEditorDialog: React.FC<JsonEditorDialogProps> = ({
    initialData = {},
    title = "Edit JSON",
    description = "Edit the JSON data below.",
    rootName = "data",
    width = "4/5",
    height = "calc(100vh-8rem)",
    maxWidth = "4xl",
    theme,
    restrictTypeSelection = true,
    lockNodes,
    buttonSize = 'md',
    actions = [
        {
            label: "Save",
            variant: "primary",
            onClick: () => { }
        }
    ],
    onCancel,
    onDataChange
}) => {
    const [jsonData, setJsonData] = useState<any>(initialData);

    useEffect(() => {
        console.log('JSON Data:', jsonData);
        if (onDataChange) {
            onDataChange(jsonData);
        }
    }, [jsonData, onDataChange]);

    const customGithubDarkTheme = theme || [
        githubDarkTheme,
        {
            input: {
                color: '#ffffff',
                backgroundColor: '#21262d',
                border: '1px solid #30363d',
                borderRadius: '3px',
                padding: '2px 6px'
            },
            inputHighlight: '#264f78'
        }
    ];

    const defaultLockNodes = ({ path, key, value }: any) => {
        if (value === undefined) return false;
        if (key === 'id' || key === 'date') return true;
        if (path.join('.') === 'date') return true;
        return false;
    };

    const getButtonClasses = (variant: string, size: string = 'md') => {
        const baseClasses = `btn btn-${size}`;

        switch (variant) {
            case 'primary':
                return `${baseClasses} btn-primary`;
            case 'secondary':
                return `${baseClasses} btn-secondary`;
            case 'accent':
                return `${baseClasses} btn-accent`;
            case 'outline':
                return `${baseClasses} btn-outline`;
            case 'ghost':
                return `${baseClasses} btn-ghost`;
            case 'danger':
            case 'destructive':
                return `${baseClasses} btn-destructive`;
            default:
                return `${baseClasses} btn-primary`;
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black bg-opacity-50 pt-16"
            onClick={handleBackdropClick}
        >
            <div
                className={`w-${width} h-[${height}] max-w-${maxWidth} mx-4 rounded-lg shadow-2xl flex flex-col border`}
                style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-3">
                        <FileDown className="w-5 h-5" style={{ color: 'var(--color-muted-foreground)' }} />
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        style={{ color: 'var(--color-muted-foreground)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-hidden">
                    <div className="h-full flex flex-col space-y-4">
                        <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                            {description}
                        </div>

                        <div className="flex-1 min-h-0">
                            <div
                                className="border rounded-md p-4 h-full overflow-auto"
                                style={{
                                    backgroundColor: 'var(--color-muted)',
                                    borderColor: 'var(--color-border)'
                                }}
                            >
                                <JsonEditor
                                    data={jsonData}
                                    rootName={rootName}
                                    theme={customGithubDarkTheme}
                                    restrictTypeSelection={restrictTypeSelection}
                                    setData={setJsonData}
                                    restrictEdit={lockNodes || defaultLockNodes}
                                    restrictAdd={lockNodes || defaultLockNodes}
                                    restrictDelete={lockNodes || defaultLockNodes}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--color-border)' }}>
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => action.onClick(jsonData)}
                            className={getButtonClasses(action.variant, buttonSize)}
                        >
                            {action.label}
                        </button>
                    ))}
                    <button
                        onClick={onCancel}
                        className={`btn btn-${buttonSize} btn-outline`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
