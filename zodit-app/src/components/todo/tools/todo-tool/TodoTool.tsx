import { useState } from 'react';
import type { Group } from '@components/todo/types';
import { TodoAnalytics } from './todoAnalytics';
import { TodoGroupInfo } from './TodoGroupInfo';
import { TodoActionButton } from './TodoActionButton';
import { X, FoldVertical, UnfoldVertical, Trash2, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';

interface TodoToolProps {
    onClose: () => void;
    groups?: Group[];
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

const DeleteConfirmDialog: React.FC<{
    groups: Group[];
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

    // Use the analytics utility
    const taskAnalytics = TodoAnalytics.getTaskAnalytics(groups);
    const emptyTasksInfo = TodoAnalytics.getEmptyTasksInfo(groups);
    const shouldCollapseAll = TodoAnalytics.shouldCollapseAll(groups);

    const handleToggleCollapse = () => {
        if (shouldCollapseAll && onCollapseAllGroups) {
            onCollapseAllGroups();
        } else if (!shouldCollapseAll && onExpandAllGroups) {
            onExpandAllGroups();
        }
    };

    const handleToggleTasks = () => {
        if (onToggleAllTasks) {
            onToggleAllTasks(taskAnalytics.shouldMarkIncomplete);
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

    // Prepare button configurations
    const toggleTasksConfig = {
        title: taskAnalytics.shouldMarkIncomplete ? 'Mark All Tasks Incomplete' : 'Mark All Tasks Complete',
        subtitle: !taskAnalytics.hasTasks
            ? 'No tasks available'
            : taskAnalytics.shouldMarkIncomplete
                ? `${taskAnalytics.completedTasks} of ${taskAnalytics.nonEmptyTasksCount} tasks will be marked incomplete`
                : `${taskAnalytics.nonEmptyTasksCount - taskAnalytics.completedTasks} of ${taskAnalytics.nonEmptyTasksCount} tasks will be marked complete`,
        tooltip: !taskAnalytics.hasTasks
            ? 'No tasks to toggle'
            : taskAnalytics.shouldMarkIncomplete
                ? `Mark ${taskAnalytics.nonEmptyTasksCount} tasks as incomplete`
                : `Mark ${taskAnalytics.nonEmptyTasksCount} tasks as complete`
    };

    if (taskAnalytics.emptyTasksCount > 0) {
        toggleTasksConfig.subtitle += ` • ${taskAnalytics.emptyTasksCount} empty task${taskAnalytics.emptyTasksCount > 1 ? 's' : ''} ignored`;
    }

    const collapseConfig = {
        title: shouldCollapseAll ? 'Collapse All Tasks in Groups' : 'Expand All Tasks in Groups',
        subtitle: groups.length === 0
            ? 'No groups available'
            : shouldCollapseAll
                ? `All Tasks in ${groups.filter(g => !g.collapsed).length} groups will be collapsed`
                : `All Tasks in ${groups.filter(g => g.collapsed).length} groups will be expanded`,
        tooltip: groups.length === 0
            ? 'No groups to toggle'
            : shouldCollapseAll
                ? `Collapse tasks in ${groups.filter(g => !g.collapsed).length} expanded groups`
                : `Expand tasks in ${groups.filter(g => g.collapsed).length} collapsed groups`
    };

    return (
        <div className="p-4 min-w-80 max-w-96">
            <TodoToolHeader onClose={onClose} />
            {!showDeleteConfirm ? (
                <div className="space-y-3">
                    <TodoGroupInfo groups={groups} />
                    <div className="space-y-2">
                        <TodoActionButton
                            onClick={handleToggleTasks}
                            disabled={!taskAnalytics.hasTasks}
                            icon={CheckCircle2}
                            title={toggleTasksConfig.title}
                            subtitle={toggleTasksConfig.subtitle}
                            tooltip={toggleTasksConfig.tooltip}
                            variant="success"
                        />

                        <TodoActionButton
                            onClick={handleToggleCollapse}
                            disabled={groups.length === 0}
                            icon={shouldCollapseAll ? FoldVertical : UnfoldVertical}
                            title={collapseConfig.title}
                            subtitle={collapseConfig.subtitle}
                            tooltip={collapseConfig.tooltip}
                        />

                        <TodoActionButton
                            onClick={handleRemoveEmptyTasks}
                            disabled={!emptyTasksInfo.hasEmptyTasks}
                            icon={Filter}
                            title="Remove Empty Tasks"
                            subtitle={emptyTasksInfo.hasEmptyTasks
                                ? `Remove ${emptyTasksInfo.emptyTasksCount} empty task${emptyTasksInfo.emptyTasksCount > 1 ? 's' : ''} of ${emptyTasksInfo.totalTasks} tasks`
                                : 'No empty tasks to remove'
                            }
                            tooltip={emptyTasksInfo.hasEmptyTasks
                                ? `Remove ${emptyTasksInfo.emptyTasksCount} empty task${emptyTasksInfo.emptyTasksCount > 1 ? 's' : ''}`
                                : 'No empty tasks to remove'
                            }
                            variant="warning"
                        />

                        <TodoActionButton
                            onClick={handleDeleteAll}
                            disabled={groups.length === 0}
                            icon={Trash2}
                            title="Delete All Groups"
                            subtitle={groups.length > 0
                                ? `Permanently remove ${groups.length} groups and all tasks`
                                : 'No groups to delete'
                            }
                            tooltip={groups.length > 0 ? `Delete all ${groups.length} groups` : 'No groups to delete'}
                            variant="danger"
                        />
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
