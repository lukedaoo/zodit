import { useMemo } from 'react';
import type { Toolbox } from '@components/gadget/ToolBoxBar';
import { Pin, CheckSquare } from 'lucide-react';
import { PinnedNotesTool } from '../tools/PinnedNotesTools';
import { TodoTool } from '../tools/todo-tool/TodoTool';
import type { Group } from '../types';

interface UseTodoToolsOptions {
    groups: Group[];
    pinnedNotes: any[];
    onNavigateToNotes?: () => void;
    actions: {
        collapseAll: () => void;
        expandAll: () => void;
        deleteAll: () => void;
        deleteEmptyTasks: () => void;
        toggleAllTasks: (shouldMarkIncomplete: boolean) => void;
    };
}

export const useTodoToolBar = ({
    groups,
    pinnedNotes,
    onNavigateToNotes,
    actions
}: UseTodoToolsOptions): Toolbox[] => {
    return useMemo(() => {
        const tools: Toolbox[] = [];

        if (groups.length > 0) {
            tools.push({
                id: 'todo-actions',
                icon: CheckSquare,
                label: 'Todo Actions',
                count: groups.length,
                available: true,
                component: TodoTool,
                componentProps: {
                    groups,
                    onCollapseAllGroups: actions.collapseAll,
                    onExpandAllGroups: actions.expandAll,
                    onDeleteAllGroups: actions.deleteAll,
                    onRemoveEmptyTasks: actions.deleteEmptyTasks,
                    onToggleAllTasks: actions.toggleAllTasks
                }
            });
        }

        if (pinnedNotes.length > 0) {
            tools.push({
                id: 'pinned-notes',
                icon: Pin,
                label: 'Pinned Notes',
                count: pinnedNotes.length,
                available: true,
                component: PinnedNotesTool,
                componentProps: {
                    notes: pinnedNotes.map(note => ({
                        id: note.id,
                        text: note.text,
                        createdAt: new Date().toISOString(),
                        isPinned: note.isPinned
                    })),
                    onNavigateToNotes
                }
            });
        }

        return tools;
    }, [groups, pinnedNotes, onNavigateToNotes, actions]);
};

