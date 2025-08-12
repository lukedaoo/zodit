import React, { useState } from 'react';
import { TodoActionButton } from '../common/TodoActionButton';
import { X, Copy, FileDown } from 'lucide-react';
import { TYPE_UTILS as tu, type Todo } from '../../types';
import { JsonEditorDialog } from '@components/gadget/JsonEditorDialog';

interface TemplateToolProps {
    todo?: Todo | undefined;
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

    // Custom lock nodes function for this use case
    const customLockNodes = ({ path, key, value }: any) => {
        if (value === undefined) return false;
        if (key === 'id' || key === 'date') return true;
        if (path.join('.') === 'date') return true;
        return false;
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
                    initialData={todo ? tu.trimTodoMetadata(todo) : {}}
                    title="Edit your todo as JSON"
                    description="Edit your todo below. You can add, remove, or modify groups and tasks."
                    rootName="todo"
                    lockNodes={customLockNodes}
                    buttonSize="lg"
                    actions={[
                        {
                            label: "Merge",
                            variant: "primary",
                            onClick: (data) => handleJsonConfirm(data, 'merge')
                        },
                        {
                            label: "Overwrite",
                            variant: "danger",
                            onClick: (data) => handleJsonConfirm(data, 'overwrite')
                        }
                    ]}
                    onCancel={handleJsonCancel}
                />
            )}
        </div>
    );
};
