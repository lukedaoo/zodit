import { useCallback } from 'react';
import { getYesterday } from '@common/utils';
import { TYPE_UTILS as tu, presets } from '@components/todo/types';
import type { Group } from '@components/todo/types';
import { makeExportData, downloadJsonFile, uploadJsonFile, validateImportData } from '@hooks/useImportExportData';


interface TodoToolActionsOptions {
    groups: Group[];
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean | null>>;
    bulkUpdateGroupCollapse: (collapse: boolean) => void;
    bulkDeleteGroups: () => void;
    bulkDeleteTasks: (task: any) => void;
    bulkToggleTasks: (complete: boolean) => void;

    copyTodoAndLoad: (date: string) => void;
    importTodoData: (data: any, mergeMode?: boolean) => void;
}

const getLocalStorageData = () => {
    try {
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        return { todos, notes };
    } catch (error) {
        console.error('Failed to read from localStorage:', error);
        return { todos: [], notes: [] };
    }
};


export const useTodoToolActions = ({
    groups,
    setIsCollapsed,
    bulkUpdateGroupCollapse,
    bulkDeleteGroups,
    bulkDeleteTasks,
    bulkToggleTasks,
    copyTodoAndLoad,

    importTodoData
}: TodoToolActionsOptions) => {

    const exportData = useCallback(() => {
        try {
            const { todos, notes } = getLocalStorageData();
            const exportData = makeExportData(todos, notes);
            const filename = `todo-export-${new Date().toISOString().split('T')[0]}.json`;
            downloadJsonFile(exportData, filename);
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error('Failed to export data');
        }
    }, []);

    const handleImportData = useCallback((importData: any, mergeMode: boolean = false) => {
        try {
            // Update localStorage directly
            if (importData.todos) {
                const currentTodos = JSON.parse(localStorage.getItem('todos') || '[]');

                let newTodos;

                if (!mergeMode || currentTodos.length === 0) {
                    // Overwrite mode - replace with first imported todo only
                    newTodos = importData.todos.length > 0 ? [importData.todos[0]] : [];
                } else {
                    // Merge into current todo (keep only 1 todo)
                    const currentTodo = currentTodos[0];
                    const importedTodo = importData.todos[0]; // Take first imported todo

                    if (!importedTodo) {
                        newTodos = currentTodos; // No change if no imported todo
                    } else {
                        // Merge groups from imported todo into current todo
                        const existingGroupIds = new Set(currentTodo.groups?.map((g: any) => g.id) || []);
                        const newGroups = importedTodo.groups?.filter((group: any) => !existingGroupIds.has(group.id)) || [];

                        // Merge tasks within existing groups
                        const mergedGroups = (currentTodo.groups || []).map((existingGroup: any) => {
                            const matchingImportedGroup = importedTodo.groups?.find((imported: any) => imported.id === existingGroup.id);

                            if (matchingImportedGroup) {
                                const existingTaskIds = new Set(existingGroup.tasks?.map((t: any) => t.id) || []);
                                const newTasks = matchingImportedGroup.tasks?.filter((task: any) => !existingTaskIds.has(task.id)) || [];

                                return {
                                    ...existingGroup,
                                    tasks: [...(existingGroup.tasks || []), ...newTasks]
                                };
                            }

                            return existingGroup;
                        });

                        const mergedTodo = {
                            ...currentTodo,
                            groups: [...mergedGroups, ...newGroups]
                        };

                        newTodos = [mergedTodo]; // Keep only 1 todo
                    }
                }

                localStorage.setItem('todos', JSON.stringify(newTodos));
            }

            if (importData.notes) {
                const currentNotes = JSON.parse(localStorage.getItem('notes') || '[]');
                const newNotes = mergeMode
                    ? [...currentNotes, ...importData.notes.filter((note: any) =>
                        !currentNotes.find((existing: any) => existing.id === note.id))]
                    : importData.notes;

                localStorage.setItem('notes', JSON.stringify(newNotes));
            }

            // Update component state
            importTodoData(importData, mergeMode);

        } catch (error) {
            console.error('Failed to import data:', error);
            throw error;
        }
    }, [importTodoData]);

    const importData = useCallback(async () => {
        try {
            const data = await uploadJsonFile();
            const validation = validateImportData(data);

            if (!validation.isValid) {
                throw new Error(`Import validation failed: ${validation.errors.join(', ')}`);
            }

            const shouldMerge = window.confirm(
                'Do you want to merge with existing data? Click OK to merge, Cancel to overwrite.'
            );

            // importTodoData(data, shouldMerge);
            handleImportData(data, shouldMerge);

        } catch (error) {
            console.error('Import failed:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to import data');
        }
    }, [importTodoData]);

    const collapseAll = useCallback(() => {
        bulkUpdateGroupCollapse(true);
        setIsCollapsed(true);
    }, [bulkUpdateGroupCollapse]);

    const expandAll = useCallback(() => {
        bulkUpdateGroupCollapse(false);
        setIsCollapsed(false);
    }, [bulkUpdateGroupCollapse]);

    const deleteAll = useCallback(() => {
        bulkDeleteGroups();
    }, [bulkDeleteGroups]);

    const toggleAllTasks = useCallback((shouldMarkIncomplete: boolean) => {
        bulkToggleTasks(!shouldMarkIncomplete);
    }, [groups, bulkToggleTasks]);

    const deleteEmptyTasks = useCallback(() => {
        bulkDeleteTasks((task: any) => tu.isEmpty(task, presets.minimal));
    }, [groups]);

    const copyTodoFromYesterday = useCallback(() => {
        const yesterday = getYesterday();
        copyTodoAndLoad(yesterday);
    }, [copyTodoAndLoad]);

    return {
        collapseAll, expandAll, deleteAll,
        toggleAllTasks, deleteEmptyTasks, copyTodoFromYesterday,

        exportData, importData
    };
};
