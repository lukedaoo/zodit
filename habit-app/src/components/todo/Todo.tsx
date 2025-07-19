import React from 'react';
import { AddGroupButton } from './AddButtonComponents';
import GroupLists from './GroupLists';
import { useTodo } from './useTodo';


const Todo: React.FC = () => {
    const {
        groups,
        addGroup,
        updateGroupName,
        deleteGroup,
        addTask,
        updateTask,
        deleteTask
    } = useTodo();

    return (
        <div className="min-h-screen p-8 space-y-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/*
                    <div className="text-center text-sm text-muted-foreground">
                        To move canvas, hold mouse wheel or spacebar while dragging.
                    </div>
                */}

                <AddGroupButton onClick={addGroup} />

                <GroupLists
                    groups={groups}
                    onUpdateGroupName={updateGroupName}
                    onUpdateTask={updateTask}
                    onDeleteGroup={deleteGroup}
                    onDeleteTask={deleteTask}
                    onAddTask={addTask}
                />
            </div>
        </div>
    );
};

export default Todo;
