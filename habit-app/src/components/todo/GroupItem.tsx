import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Group } from './types';
import TaskLists from './TaskLists';

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
    onAddTask,
}: Props) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (group.name.length === 0) {
            onUpdateName('Untitled');
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <input
                    type="text"
                    value={group.name}
                    onChange={(e) => onUpdateName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setIsEditing(false);
                        }
                    }}
                    onDoubleClick={handleDoubleClick}
                    onBlur={handleBlur}
                    className={`w-full p-4 rounded-lg border-1 bg-transparent focus:outline-none ${isEditing ? 'focus:ring-2' : ''
                        } ${!isEditing ? 'cursor-pointer' : ''}`}
                    readOnly={!isEditing}
                    style={{
                        borderColor: 'var(--color-primary-500)',
                        color: 'var(--color-foreground)',
                        backgroundColor: 'var(--color-background)',
                        ['--tw-ring-color' as any]: 'var(--color-primary-500)',
                    }}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2 items-center">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hover:text-green-500 transition-colors">
                        {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </button>
                    <button
                        onClick={onDelete}
                        className="hover:text-red-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {!collapsed && (
                <TaskLists
                    tasks={group.tasks}
                    groupId={group.id}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onAdd={onAddTask}
                />
            )}
        </div>
    );

}

export default GroupItem;
