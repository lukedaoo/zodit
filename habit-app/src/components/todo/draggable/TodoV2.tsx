import React from 'react';
import { AddGroupButton } from '../AddButtonComponents';
import { DraggableGroupList } from './DraggableGroupList';
import { useTodo } from '../useTodo';

const Todo: React.FC = () => {
    const {
        groups,
        addGroup,
        updateGroupName,
        deleteGroup,
        addTask,
        updateTask,
        deleteTask,
        reorderTask,
        reorderGroup
    } = useTodo();

    return (
        <div className="min-h-screen p-8 space-y-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <AddGroupButton onClick={addGroup} />

                <DraggableGroupList
                    groups={groups}
                    onUpdateGroupName={updateGroupName}
                    onUpdateTask={updateTask}
                    onDeleteGroup={deleteGroup}
                    onDeleteTask={deleteTask}
                    onAddTask={addTask}
                    onReorderTask={reorderTask}
                    onReorderGroup={reorderGroup}
                />
            </div>
        </div>
    );
};

export default Todo;
