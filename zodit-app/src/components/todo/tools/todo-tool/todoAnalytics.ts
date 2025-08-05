import type { Task, Group } from '@components/todo/types';
import { TYPE_UTILS as tu, presets } from '@components/todo/types';

export interface TaskAnalytics {
    hasTasks: boolean;
    totalTasks: number;
    completedTasks: number;
    emptyTasksCount: number;
    nonEmptyTasksCount: number;
    shouldMarkIncomplete: boolean;
}

export interface EmptyTasksInfo {
    hasEmptyTasks: boolean;
    emptyTasksCount: number;
    totalTasks: number;
}

export interface GroupSummary {
    totalGroups: number;
    expandedGroups: number;
    collapsedGroups: number;
    totalTasks: number;
    completedTasks: number;
}

export class TodoAnalytics {
    static getTaskAnalytics(groups: Group[]): TaskAnalytics {
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
    }

    static getEmptyTasksInfo(groups: Group[]): EmptyTasksInfo {
        const allTasks = groups.flatMap(g => g.tasks);
        const emptyTasks = allTasks.filter(task => tu.isEmpty(task, presets.minimal));

        return {
            hasEmptyTasks: emptyTasks.length > 0,
            emptyTasksCount: emptyTasks.length,
            totalTasks: allTasks.length
        };
    }

    static getGroupSummary(groups: Group[]): GroupSummary {
        const expandedGroups = groups.filter(group => !group.collapsed);
        const collapsedGroups = groups.filter(group => group.collapsed);
        const totalTasks = groups.reduce((sum, group) => sum + group.tasks.length, 0);
        const completedTasks = groups.reduce((sum, group) =>
            sum + group.tasks.filter(task => task.completed).length, 0
        );

        return {
            totalGroups: groups.length,
            expandedGroups: expandedGroups.length,
            collapsedGroups: collapsedGroups.length,
            totalTasks,
            completedTasks
        };
    }

    static shouldCollapseAll(groups: Group[]): boolean {
        const expandedGroups = groups.filter(group => !group.collapsed);
        const collapsedGroups = groups.filter(group => group.collapsed);
        return expandedGroups.length >= collapsedGroups.length;
    }
}
