import { TaskHeader } from './TaskUIComponents';
import type { Task } from '../types';
import { useState } from 'react';

export const TaskHeaderWithModal = ({
    task,
    onChangeStatus,
    onDelete,
}: {
    task: Task;
    onChangeStatus: (value: boolean) => void;
    onSave?: (updated: Task) => void;
    onDelete: () => void;
}) => {
    const [shouldOpenModal, setShouldOpenModal] = useState(false);
    return (
        <>
            <TaskHeader
                task={task}
                onDelete={onDelete}
                onUpdate={onChangeStatus}
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

