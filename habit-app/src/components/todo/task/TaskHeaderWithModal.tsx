// import { TaskModal } from './TaskModal';
import { TaskHeader } from './TaskUIComponents';
import type { Task } from '../types';
import { TYPE_UTILS as tu, presets } from '../types';
import { useState } from 'react';

export const TaskHeaderWithModal = ({
    task,
    // onSave,
    onDelete,
}: {
    task: Task;
    onSave?: (updated: Task) => void;
    onDelete: () => void;
}) => {
    const [shouldOpenModal, setShouldOpenModal] = useState(false);
    const isEmptyTask = tu.isEmpty(task, presets.scheduled);
    return (
        <>
            <TaskHeader
                header={task.title}
                isEmptyTask={isEmptyTask}
                onDelete={onDelete}
                onExpand={() => setShouldOpenModal(!shouldOpenModal)}
            />
            {/** shouldOpenModal &&
                <TaskModal
                    task={task}
                    isOpen={shouldOpenModal}
                    onClose={() => setShouldOpenModal(!shouldOpenModal)}
                    onSave={onSave}
                    onDelete={onDelete}
                />
           **/}
        </>
    );
};

