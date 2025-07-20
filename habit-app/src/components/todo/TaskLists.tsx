import { useState } from 'react';
import TaskItem from './TaskItem';
import { AddTaskButton } from './AddButtonComponents.tsx';
import type { Task } from './types';

import { TASK_COLLAPSE_THRESHOLD } from '@user-prefs/const';
import { useCollapsibleList } from '@hooks/useCollapsibleList';
import { useUserSettings } from '@hooks/useUserSettings';

interface Props {
    tasks: Task[];
    groupId: string;
    onUpdate: (taskId: string, updates: Partial<any>) => void;
    onDelete: (taskId: string) => void;
    onAdd: () => void;
}

const TaskLists = ({ tasks, groupId, onUpdate, onDelete, onAdd }: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null);

    const { get } = useUserSettings();
    const threshold = get(TASK_COLLAPSE_THRESHOLD);

    const {
        visibleItems: visibleTasks,
        expanded: showAllTasks,
        shouldCollapse,
        toggle
    } = useCollapsibleList(tasks, threshold);

    return (
        <div className="ml-8 space-y-3">
            {visibleTasks
                .map((task) => (
                    <TaskItem
                        key={`${groupId}/${task.id}`}
                        task={task}
                        isEditing={editingId === task.id}
                        onDelete={() => onDelete(task.id)}
                        onSubmit={(parsed) => {
                            parsed.id = task.id;
                            onUpdate(parsed.id, parsed);
                            setEditingId(null);
                        }}
                        onDoubleClick={() => setEditingId(task.id)}
                    />
                ))}

            {shouldCollapse && (
                <button
                    className="text-sm text-blue-500 hover:underline"
                    onClick={toggle}
                >
                    {showAllTasks
                        ? 'Show Less'
                        : `Show All (${tasks.length})`}
                </button>
            )}

            <AddTaskButton onClick={onAdd} />
        </div>
    );
};

export default TaskLists;
