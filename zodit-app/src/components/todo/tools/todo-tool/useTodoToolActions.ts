import { useCallback } from 'react';
import { getYesterday } from '@common/utils';
import { TYPE_UTILS as tu, presets } from '@components/todo/types';
import type { Group } from '@components/todo/types';

interface TodoToolActionsOptions {
    groups: Group[];
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean | null>>;
    bulkUpdateGroupCollapse: (collapse: boolean) => void;
    bulkDeleteGroups: () => void;
    bulkDeleteTasks: (task: any) => void;
    bulkToggleTasks: (complete: boolean) => void;

    copyTodoAndLoad: (date: string) => void;
}

export const useTodoToolActions = ({
    groups,
    setIsCollapsed,
    bulkUpdateGroupCollapse,
    bulkDeleteGroups,
    bulkDeleteTasks,
    bulkToggleTasks,
    copyTodoAndLoad
}: TodoToolActionsOptions) => {
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
        toggleAllTasks, deleteEmptyTasks, copyTodoFromYesterday
    };
};
