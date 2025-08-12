import React, { useEffect, useState } from 'react';
import { githubDarkTheme, JsonEditor } from 'json-edit-react';
import { TodoActionButton } from '../common/TodoActionButton';
import { X, Copy, FileDown } from 'lucide-react';
import { TYPE_UTILS as tu, type Todo } from '../../types';

interface TemplateToolProps {
    todo: Todo | undefined;
    onClose: () => void;
    onCopyFromYesterday?: () => void;
    onCreateJsonFile?: (jsonContent: any, action: 'overwrite' | 'merge') => void;
}

const TemplateToolHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
            Template Actions
        </h3>
        <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{ color: 'var(--color-foreground)' }}
        >
            <X className="w-4 h-4" />
        </button>
    </div>
);

const JsonEditorDialog: React.FC<{
    todo: Todo | undefined;
    onConfirm: (jsonContent: any, action: 'overwrite' | 'merge') => void;
    onCancel: () => void;
}> = ({ todo, onConfirm, onCancel }) => {
    const [jsonData, setJsonData] = useState<any>(todo ? tu.trimTodoMetadata(todo) : {});

    useEffect(() => {
        console.log('JSON Data:', jsonData);
    }, []);

    const handleOverwrite = () => {
        onConfirm(jsonData, 'overwrite');
    };

    const handleMerge = () => {
        onConfirm(jsonData, 'merge');
    };

    const customGithubDarkTheme = [
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
    ]

    const lockNodes = ({ path, key, value }: any) => {
        if (value === undefined) return false;

        if (key === 'id' || key === 'date') return true;

        if (path.join('.') === 'date') return true;

        return false;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black bg-opacity-50 pt-16">
            <div
                className="w-4/5 h-[calc(100vh-8rem)] max-w-4xl mx-4 rounded-lg shadow-2xl flex flex-col border"
                style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)'
                }}
            >
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-3">
                        <FileDown className="w-5 h-5" style={{ color: 'var(--color-muted-foreground)' }} />
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
                            Edit your todo as JSON
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

                <div className="flex-1 p-4 overflow-hidden">
                    <div className="h-full flex flex-col space-y-4">
                        <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                            Edit your todo below. You can add, remove, or modify groups and tasks.
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
                                    rootName="todo"
                                    theme={customGithubDarkTheme}
                                    setData={setJsonData}
                                    restrictEdit={lockNodes}
                                    restrictAdd={lockNodes}
                                    restrictDelete={lockNodes}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={handleMerge}
                        className="px-4 py-2 text-sm rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                        Merge
                    </button>
                    <button
                        onClick={handleOverwrite}
                        className="px-4 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                    >
                        Overwrite
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm rounded-md border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                        style={{
                            backgroundColor: 'var(--color-background)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-foreground)'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TemplateTool: React.FC<TemplateToolProps> = ({
    todo,
    onClose,
    onCopyFromYesterday,
    onCreateJsonFile,
}) => {
    const [showJsonEditor, setShowJsonEditor] = useState(false);

    const handleCopyFromYesterday = () => {
        if (onCopyFromYesterday) {
            onCopyFromYesterday();
        }
    };

    const handleCreateJsonFile = () => {
        setShowJsonEditor(true);
    };

    const handleJsonConfirm = (jsonContent: any, action: 'overwrite' | 'merge') => {
        if (onCreateJsonFile) {
            onCreateJsonFile(jsonContent, action);
        }
        setShowJsonEditor(false);
        onClose();
    };

    const handleJsonCancel = () => {
        setShowJsonEditor(false);
    };

    const hasYesterdayTodos = true;

    return (
        <div className="p-4 min-w-80 max-w-96">
            <TemplateToolHeader onClose={onClose} />
            {!showJsonEditor ? (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <TodoActionButton
                            onClick={handleCopyFromYesterday}
                            disabled={!hasYesterdayTodos}
                            icon={Copy}
                            title="Copy Todo from Yesterday"
                            subtitle={hasYesterdayTodos
                                ? "Import non-empty groups/tasks from yesterday"
                                : "No todos available from yesterday"
                            }
                            tooltip={hasYesterdayTodos
                                ? "Copy all non-empty groups/tasks from yesterday's list"
                                : "No yesterday todos to copy"
                            }
                            variant="default"
                        />

                        <TodoActionButton
                            onClick={handleCreateJsonFile}
                            disabled={false}
                            icon={FileDown}
                            title="Edit Todo as JSON"
                            subtitle="Create or import JSON todo"
                            tooltip="Open JSON editor to create or modify todo structure"
                            variant="default"
                        />

                        {/*
                        <TodoActionButton
                            disabled={true}
                            icon={Plus}
                            title="Create Custom Template"
                            subtitle="Save current todos as reusable template"
                            tooltip="Create a template from current todo structure"
                            variant="default"
                        />
                        */}
                    </div>
                </div>
            ) : null}

            {showJsonEditor && (
                <JsonEditorDialog
                    todo={todo}
                    onConfirm={handleJsonConfirm}
                    onCancel={handleJsonCancel}
                />
            )}
        </div>
    );
};
