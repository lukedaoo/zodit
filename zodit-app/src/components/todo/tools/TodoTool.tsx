import { useState } from 'react';
import type { Task } from '../types';
import { TYPE_UTILS as tu, presets } from '../types';
import { X, FoldVertical, UnfoldVertical, Trash2, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';

interface TodoToolProps {
    onClose: () => void;
    groups?: Array<{ id: string; title: string; collapsed: boolean; tasks: Array<{ id: string; completed: boolean }> }>;
    onCollapseAllGroups?: () => void;
    onExpandAllGroups?: () => void;
    onDeleteAllGroups?: () => void;
    onToggleAllTasks?: (shouldMarkIncomplete: boolean) => void;
    onRemoveEmptyTasks?: () => void;
}

const TodoToolHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
            Todo Actions
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

const TodoGroupInfo: React.FC<{ groups: Array<{ id: string; title: string; collapsed: boolean; tasks: Array<{ id: string; completed: boolean }> }> }> = ({ groups }) => {
    const expandedGroups = groups.filter(group => !group.collapsed);
    const collapsedGroups = groups.filter(group => group.collapsed);
    const totalTasks = groups.reduce((sum, group) => sum + group.tasks.length, 0);
    const completedTasks = groups.reduce((sum, group) => sum + group.tasks.filter(task => task.completed).length, 0);

    return (
        <div className="text-xs mb-3" style={{ color: 'var(--color-muted-foreground)' }}>
            {groups.length > 0
                ? `${groups.length} groups (${expandedGroups.length} expanded, ${collapsedGroups.length} collapsed), ${totalTasks} tasks (${completedTasks} completed)`
                : 'No groups in current todo'}
        </div>
    );
};

const ToggleCollapseButton: React.FC<{
    groups: Array<{ id: string; title: string; collapsed: boolean; tasks: Array<{ id: string; completed: boolean }> }>;
    onToggle: () => void
}> = ({ groups, onToggle }) => {
    const hasGroups = groups.length > 0;
    const expandedGroups = groups.filter(group => !group.collapsed);
    const collapsedGroups = groups.filter(group => group.collapsed);
    const shouldCollapseAll = expandedGroups.length >= collapsedGroups.length;

    return (
        <button
            onClick={onToggle}
            disabled={!hasGroups}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all duration-200 ${hasGroups
                ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
                }`}
            style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: hasGroups ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
            }}
            title={hasGroups
                ? shouldCollapseAll
                    ? `Collapse tasks in ${expandedGroups.length} expanded groups`
                    : `Expand tasks in ${collapsedGroups.length} collapsed groups`
                : 'No groups to toggle'
            }
        >
            {shouldCollapseAll ? (
                <FoldVertical className="w-4 h-4 flex-shrink-0" />
            ) : (
                <UnfoldVertical className="w-4 h-4 flex-shrink-0" />
            )}
            <div className="flex-1 text-left">
                <div className="text-sm font-medium">
                    {shouldCollapseAll ? 'Collapse All Tasks in Groups' : 'Expand All Tasks in Groups'}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    {hasGroups
                        ? shouldCollapseAll
                            ? `All Tasks in ${expandedGroups.length} groups will be collapsed`
                            : `All Tasks in ${collapsedGroups.length} groups will be expanded`
                        : 'No groups available'
                    }
                </div>
            </div>
        </button>
    );
};

const getShouldMarkIncomplete = (groups: Array<{ id: string; title: string; collapsed: boolean; tasks: Array<{ id: string; title: string; completed: boolean }> }>) => {
    const allTasks = groups.flatMap(g => g.tasks);

    const emptyTasks: Task[] = [];
    const nonEmptyTasks: Task[] = [];

    for (const task of allTasks) {
        if (tu.isEmpty(task, presets.minimal)) {
            emptyTasks.push(task);
        } else {
            nonEmptyTasks.push(task);
        }
    }

    const total = nonEmptyTasks.length;
    const completed = nonEmptyTasks.filter(t => t.completed).length;
    const hasTasks = total > 0;
    const shouldMarkIncomplete = completed >= total / 2;

    return {
        hasTasks,
        totalTasks: total,
        completedTasks: completed,
        emptyTasksCount: emptyTasks.length,
        nonEmptyTasksCount: nonEmptyTasks.length,
        shouldMarkIncomplete
    };
};

const getEmptyTasksInfo = (groups: Array<{ id: string; title: string; collapsed: boolean; tasks: Array<{ id: string; title: string; completed: boolean }> }>) => {
    const allTasks = groups.flatMap(g => g.tasks);
    const emptyTasks = allTasks.filter(task => tu.isEmpty(task, presets.minimal));
    return {
        hasEmptyTasks: emptyTasks.length > 0,
        emptyTasksCount: emptyTasks.length,
        totalTasks: allTasks.length
    };
};

const ToggleTasksButton: React.FC<{
    groups: Array<{
        id: string;
        title: string;
        collapsed: boolean;
        tasks: Array<{ id: string; title: string; completed: boolean }>;
    }>;
    onToggle: (shouldMarkIncomplete: boolean) => void;
}> = ({ groups, onToggle }) => {
    const {
        hasTasks,
        completedTasks,
        shouldMarkIncomplete,
        nonEmptyTasksCount,
        emptyTasksCount
    } = getShouldMarkIncomplete(groups);

    const mainLabel = shouldMarkIncomplete
        ? 'Mark All Tasks Incomplete'
        : 'Mark All Tasks Complete';

    const subLabel = !hasTasks
        ? 'No tasks available'
        : shouldMarkIncomplete
            ? `${completedTasks} of ${nonEmptyTasksCount} tasks will be marked incomplete`
            : `${nonEmptyTasksCount - completedTasks} of ${nonEmptyTasksCount} tasks will be marked complete`;

    const tooltip = !hasTasks
        ? 'No tasks to toggle'
        : shouldMarkIncomplete
            ? `Mark ${nonEmptyTasksCount} tasks as incomplete`
            : `Mark ${nonEmptyTasksCount} tasks as complete`;

    return (
        <button
            onClick={() => onToggle(shouldMarkIncomplete)}
            disabled={!hasTasks}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all duration-200 ${hasTasks
                ? 'hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer hover:border-green-200 dark:hover:border-green-800'
                : 'opacity-50 cursor-not-allowed'
                }`}
            style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: hasTasks ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
            }}
            title={tooltip}
        >
            <CheckCircle2
                className={`w-4 h-4 flex-shrink-0 ${hasTasks ? 'text-green-500' : ''}`}
            />
            <div className="flex-1 text-left">
                <div className="text-sm font-medium">{mainLabel}</div>
                <div
                    className="text-xs"
                    style={{ color: 'var(--color-muted-foreground)' }}
                >
                    {subLabel}
                    {emptyTasksCount > 0 && ` • ${emptyTasksCount} empty task${emptyTasksCount > 1 ? 's' : ''} ignored`}
                </div>
            </div>
        </button>
    );
};

const RemoveEmptyTasksButton: React.FC<{
    groups: Array<{ id: string; title: string; collapsed: boolean; tasks: Array<{ id: string; title: string; completed: boolean }> }>;
    onRemove: () => void;
}> = ({ groups, onRemove }) => {
    const { hasEmptyTasks, emptyTasksCount, totalTasks } = getEmptyTasksInfo(groups);

    return (
        <button
            onClick={onRemove}
            disabled={!hasEmptyTasks}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all duration-200 ${hasEmptyTasks
                ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer hover:border-orange-200 dark:hover:border-orange-800'
                : 'opacity-50 cursor-not-allowed'
                }`}
            style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: hasEmptyTasks ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
            }}
            title={hasEmptyTasks
                ? `Remove ${emptyTasksCount} empty task${emptyTasksCount > 1 ? 's' : ''}`
                : 'No empty tasks to remove'
            }
        >
            <Filter className={`w-4 h-4 flex-shrink-0 ${hasEmptyTasks ? 'text-orange-500' : ''}`} />
            <div className="flex-1 text-left">
                <div className="text-sm font-medium">Remove Empty Tasks</div>
                <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    {hasEmptyTasks
                        ? `Remove ${emptyTasksCount} empty task${emptyTasksCount > 1 ? 's' : ''} of ${totalTasks} tasks`
                        : 'No empty tasks to remove'
                    }
                </div>
            </div>
        </button>
    );
};

const DeleteAllButton: React.FC<{
    groups: Array<{ id: string; title: string; collapsed: boolean; tasks: Array<{ id: string; completed: boolean }> }>;
    onDelete: () => void
}> = ({ groups, onDelete }) => {
    const hasGroups = groups.length > 0;

    return (
        <button
            onClick={onDelete}
            disabled={!hasGroups}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all duration-200 ${hasGroups
                ? 'hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer hover:border-red-200 dark:hover:border-red-800'
                : 'opacity-50 cursor-not-allowed'
                }`}
            style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: hasGroups ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
            }}
            title={hasGroups ? `Delete all ${groups.length} groups` : 'No groups to delete'}
        >
            <Trash2 className="w-4 h-4 flex-shrink-0 text-red-500" />
            <div className="flex-1 text-left">
                <div className="text-sm font-medium">Delete All Groups</div>
                <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    {hasGroups
                        ? `Permanently remove ${groups.length} groups and all tasks`
                        : 'No groups to delete'
                    }
                </div>
            </div>
        </button>
    );
};

const DeleteConfirmDialog: React.FC<{
    groups: Array<{ id: string; title: string; collapsed: boolean; tasks: Array<{ id: string; completed: boolean }> }>;
    onConfirm: () => void;
    onCancel: () => void
}> = ({ groups, onConfirm, onCancel }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
                <div className="text-sm font-medium text-red-700 dark:text-red-300">
                    Confirm Deletion
                </div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    This will permanently delete all {groups.length} groups and their tasks. This action cannot be undone.
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={onCancel}
                className="flex-1 px-3 py-2 text-sm rounded-md border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)'
                }}
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="flex-1 px-3 py-2 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
                Delete All
            </button>
        </div>
    </div>
);

export const TodoTool: React.FC<TodoToolProps> = ({
    onClose,
    groups = [],
    onCollapseAllGroups,
    onExpandAllGroups,
    onDeleteAllGroups,
    onToggleAllTasks,
    onRemoveEmptyTasks,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleToggleCollapse = () => {
        const expandedGroups = groups.filter(group => !group.collapsed);
        const collapsedGroups = groups.filter(group => group.collapsed);
        const shouldCollapseAll = expandedGroups.length >= collapsedGroups.length;
        if (shouldCollapseAll && onCollapseAllGroups) {
            onCollapseAllGroups();
        } else if (!shouldCollapseAll && onExpandAllGroups) {
            onExpandAllGroups();
        }
    };

    const handleToggleTasks = (shouldMarkIncomplete: boolean) => {
        if (onToggleAllTasks) {
            onToggleAllTasks(shouldMarkIncomplete);
        }
    };

    const handleRemoveEmptyTasks = () => {
        if (onRemoveEmptyTasks) {
            onRemoveEmptyTasks();
        }
    };

    const handleDeleteAll = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteAll = () => {
        if (onDeleteAllGroups) {
            onDeleteAllGroups();
        }
        setShowDeleteConfirm(false);
        onClose();
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <div className="p-4 max-w-80">
            <TodoToolHeader onClose={onClose} />
            {!showDeleteConfirm ? (
                <div className="space-y-3">
                    <TodoGroupInfo groups={groups} />
                    <div className="space-y-2">
                        <ToggleTasksButton groups={groups as any} onToggle={handleToggleTasks} />
                        <ToggleCollapseButton groups={groups} onToggle={handleToggleCollapse} />
                        <RemoveEmptyTasksButton groups={groups as any} onRemove={handleRemoveEmptyTasks} />
                        <DeleteAllButton groups={groups} onDelete={handleDeleteAll} />
                    </div>
                </div>
            ) : (
                <DeleteConfirmDialog
                    groups={groups}
                    onConfirm={confirmDeleteAll}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
};
