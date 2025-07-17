import type { Group } from './types';
import GroupItem from './GroupItem';

interface Props {
    groups: Group[];
    onUpdateGroupName: (groupId: string, newName: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onUpdateTask: (groupId: string, taskId: string, updates: Partial<any>) => void;
    onDeleteTask: (groupId: string, taskId: string) => void;
    onAddTask: (groupId: string) => void;
}

const GroupLists = ({
    groups,
    onUpdateGroupName,
    onDeleteGroup,
    onUpdateTask,
    onDeleteTask,
    onAddTask
}: Props) => (
    <div className="space-y-6">
        {groups.map((group) => (
            <GroupItem
                key={group.id}
                group={group}
                onUpdateName={(name) => onUpdateGroupName(group.id, name)}
                onUpdateTask={(taskId, task) => onUpdateTask(group.id, taskId, task)}
                onDelete={() => onDeleteGroup(group.id)}
                onDeleteTask={(taskId) => onDeleteTask(group.id, taskId)}
                onAddTask={() => onAddTask(group.id)}
            />
        ))}
    </div>
);

export default GroupLists;
