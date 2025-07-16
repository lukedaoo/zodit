import { X } from 'lucide-react';
import { textToTask } from './taskUtils';
import { useState, useEffect, useRef } from 'react';
import type { Task } from './types';
import { presets } from './types';
import { getUserSeparator } from '../../template/textTemplateProcessor';

interface Props {
    task: Task;
    onDelete: () => void;
    isEditing: boolean;
    onSubmit: (task: Partial<Task>) => void;
    onDoubleClick: () => void;
}

const DeleteButton = ({ onDelete, className = "" }: { onDelete: () => void; className?: string }) => (
    <button
        onClick={onDelete}
        className={`hover:text-red-500 transition-colors ${className}`}
    >
        <X size={18} />
    </button>
);

const TaskHeader = ({ title, onDelete }: { title: string; onDelete: () => void }) => (
    <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-lg break-words">{title}</h4>
        <DeleteButton onDelete={onDelete} className="text-red-500 hover:text-red-700 shrink-0" />
    </div>
);

const TaskDescription = ({ description }: { description?: string }) => {
    if (!description) return null;

    return (
        <p className="text-sm text-muted-foreground leading-snug">
            {description}
        </p>
    );
};

const Badge = ({ children, variant = "primary" }:
    { children: React.ReactNode; variant?: "primary" | "success" | "warning" }) => (
    <span className={`badge badge-${variant}`}>
        {children}
    </span>
);

const TaskMetadata = ({ startTime, startDate, endDate }: {
    startTime?: string;
    startDate?: string;
    endDate?: string;
}) => {
    const hasMetadata = startTime || startDate || endDate;

    if (!hasMetadata) return null;

    return (
        <div className="text-xs flex flex-wrap gap-2 justify-end">
            {startTime && (
                <Badge variant="primary">@{startTime}PM</Badge>
            )}
            {startDate && (
                <Badge variant="success">Start: {startDate}</Badge>
            )}
            {endDate && (
                <Badge variant="warning">End: {endDate}</Badge>
            )}
        </div>
    );
};

const TaskInput = ({
    inputValue,
    onInputChange,
    onKeyDown,
    onDelete,
    inputRef
}: {
    inputValue: string;
    onInputChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onDelete: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}) => (
    <div className="relative">
        <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value.replace(/^\s+/, ''))}
            onKeyDown={onKeyDown}
            placeholder='title:Math 270/desc:.../startTime:...'
            className="w-full p-4 rounded-lg border-2 bg-transparent focus:outline-none focus:ring-2"
            style={{
                borderColor: 'var(--color-primary-500)',
                color: 'var(--color-foreground)',
                backgroundColor: 'var(--color-background)',
                ['--tw-ring-color' as any]: 'var(--color-primary-500)',
            }}
        />
        <DeleteButton
            onDelete={onDelete}
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
        />
    </div>
);

// Task Display Component
const TaskDisplay = ({
    task,
    onDelete,
    onDoubleClick
}: {
    task: Task;
    onDelete: () => void;
    onDoubleClick: () => void;
}) => {
    const parsed = textToTask(task.title, presets.scheduled);

    return (
        <div
            className="p-4 rounded-lg border-2 relative space-y-2 cursor-pointer hover:bg-accent/10"
            style={{
                borderColor: 'var(--color-primary-500)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
            }}
            onDoubleClick={onDoubleClick}
        >
            <TaskHeader title={parsed.title + ""} onDelete={onDelete} />
            <TaskDescription description={parsed.description} />
            <TaskMetadata
                startTime={parsed.startTime}
                startDate={parsed.startDate}
                endDate={parsed.endDate}
            />
        </div>
    );
};

// Custom Hook for Task Editing Logic
const useTaskEditing = (
    task: Task,
    onSubmit: (task: any) => void,
    isEditing: boolean
) => {
    const [inputValue, setInputValue] = useState(task.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            try {
                const parsed = textToTask(inputValue.trim(), presets.scheduled);
                onSubmit(parsed);
            } catch (err) {
                console.log(err);
            }
            return;
        }

        if (e.key === 'Tab') {
            try {
                e.preventDefault();
                const input = inputRef.current;
                if (!input) return;

                const seperator = getUserSeparator() ?? ";";

                const pairs = inputValue.trim().split(seperator).filter(pair => pair.trim() !== '');

                let currentIndex = parseInt(input.dataset.index || '-1');
                currentIndex = (currentIndex + 1) % pairs.length;
                input.dataset.index = currentIndex.toString();

                const currentPair = pairs[currentIndex];
                // currentPair contains the ignorecased word: "date"
                // then show small calendar below it
                const valuePart = currentPair.split(':')[1] || '';

                const startPos = inputValue.indexOf(currentPair) + currentPair.indexOf(':') + 1;
                const endPos = startPos + valuePart.length;

                input.setSelectionRange(startPos, endPos);
                input.focus();
            } catch (err) {
                console.error(err);
            }
            return;
        }
    };

    return {
        inputValue,
        setInputValue,
        inputRef,
        handleKeyDown
    };
};

const TaskItem = ({
    task,
    onDelete,
    isEditing,
    onSubmit,
    onDoubleClick
}: Props) => {
    const { inputValue, setInputValue, inputRef, handleKeyDown } = useTaskEditing(
        task,
        onSubmit,
        isEditing
    );

    if (isEditing) {
        return (
            <TaskInput
                inputValue={inputValue}
                onInputChange={setInputValue}
                onKeyDown={handleKeyDown}
                onDelete={onDelete}
                inputRef={inputRef}
            />
        );
    }

    return (
        <TaskDisplay
            task={task}
            onDelete={onDelete}
            onDoubleClick={onDoubleClick}
        />
    );
};

export default TaskItem;
