import { X } from 'lucide-react';
import TaskLists from './TaskLists';
import type { Group } from './types';

interface Props {
    group: Group;
    onDelete: () => void;
    onUpdateName: (newName: string) => void;
    onUpdateTask: (taskId: string, task: Partial<any>) => void;
    onDeleteTask: (taskId: string) => void;
    onAddTask: () => void;
}

const GroupItem = ({
    group,
    onDelete,
    onUpdateName,
    onUpdateTask,
    onDeleteTask,
    onAddTask
}: Props) => {
    return (
        <div className="space-y-3">
            <div className="relative">
                <input
                    type="text"
                    value={group.name}
                    onChange={(e) => onUpdateName(e.target.value)}
                    className="w-full p-4 rounded-lg border-1 bg-transparent focus:outline-none focus:ring-2"
                    style={{
                        borderColor: 'var(--color-primary-500)',
                        color: 'var(--color-foreground)',
                        backgroundColor: 'var(--color-background)',
                        ['--tw-ring-color' as any]: 'var(--color-primary-500)',
                    }}
                />
                <button
                    onClick={onDelete}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-red-500 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <TaskLists
                tasks={group.tasks}
                groupId={group.id}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onAdd={onAddTask}
            />
        </div>
    );

}

export default GroupItem;
