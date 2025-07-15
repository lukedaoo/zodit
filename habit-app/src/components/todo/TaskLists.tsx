import TaskItem from './TaskItem';
import AddTaskButton from './AddTaskButton';
import type { Task } from './types';

interface Props {
    tasks: Task[];
    groupId: string;
    onUpdateTitle: (taskId: string, newTitle: string) => void;
    onDelete: (taskId: string) => void;
    onAdd: () => void;
}

const TaskLists = ({ tasks, groupId, onUpdateTitle, onDelete, onAdd }: Props) => (
    <div className="ml-8 space-y-3">
        {tasks.map((task) => (
            <TaskItem
                key={groupId + "/" + task.id}
                value={task.title}
                onChange={(newTitle) => onUpdateTitle(task.id, newTitle)}
                onDelete={() => onDelete(task.id)}
            />
        ))}
        <AddTaskButton onClick={onAdd} />
    </div>
);

export default TaskLists;
