import { useState, useEffect } from 'react';
import { TaskModal } from './TaskModal';
import { TaskHeader } from './TaskUIComponents';
import type { Task } from '../types';
import { isEmpty, presets } from '../types';

export const TaskHeaderWithModal = ({
    task,
    onSave,
    onDelete,
    onModalToggle,
}: {
    task: Task;
    onSave: (updated: Task) => void;
    onDelete: () => void;
    onModalToggle?: (isOpen: boolean) => void;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isEmptyTask = isEmpty(task, presets.scheduled);

    useEffect(() => {
        if (onModalToggle) {
            onModalToggle(isModalOpen);
        }
    }, [isModalOpen, onModalToggle]);


    return (
        <>
            <TaskHeader
                header={task.title}
                isEmptyTask={isEmptyTask}
                onDelete={onDelete}
                onExpand={() => setIsModalOpen(true)}
            />
            <TaskModal
                task={task}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSave}
                onDelete={onDelete}
            />
        </>
    );
};

