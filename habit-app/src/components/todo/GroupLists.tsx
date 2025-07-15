import type { Group } from './types';
import GroupItem from './GroupItem';

interface Props {
    groups: Group[];
    onUpdateGroupName: (groupId: string, newName: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onUpdateTaskTitle: (groupId: string, taskId: string, newTitle: string) => void;
    onDeleteTask: (groupId: string, taskId: string) => void;
    onAddTask: (groupId: string) => void;
}

const GroupLists = ({
    groups,
    onUpdateGroupName,
    onDeleteGroup,
    onUpdateTaskTitle,
    onDeleteTask,
    onAddTask
}: Props) => (
    <div className="space-y-6">
        {groups.map((group) => (
            <GroupItem
                key={group.id}
                group={group}
                onUpdateName={(name) => onUpdateGroupName(group.id, name)}
                onDelete={() => onDeleteGroup(group.id)}
                onUpdateTaskTitle={(taskId, title) => onUpdateTaskTitle(group.id, taskId, title)}
                onDeleteTask={(taskId) => onDeleteTask(group.id, taskId)}
                onAddTask={() => onAddTask(group.id)}
            />
        ))}
    </div>
);

export default GroupLists;
