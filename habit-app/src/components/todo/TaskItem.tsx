import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Task {
    title: string;
    description?: string;
    startTime?: string;
    startDate?: string;
    endDate?: string;
}

interface Props {
    value: string;
    onChange: (newValue: string) => void;
    onDelete: () => void;
    isEditing: boolean;
    onSubmit: (task: Task) => void;
}

const parseTaskInput = (input: string): Task => {
    const parts = input.split('/');
    const task: Partial<Task> = {};

    for (const part of parts) {
        const [key, ...rest] = part.split(':');
        const value = rest.join(':').trim();

        switch (key.trim().toLowerCase()) {
            case 'header':
                task.title = value;
                break;
            case 'desc':
                task.description = value;
                break;
            case 'starttime':
                task.startTime = value;
                break;
            case 'startdate':
                task.startDate = value;
                break;
            case 'enddate':
                task.endDate = value;
                break;
        }
    }

    if (!task.title) {
        throw new Error('Missing required field: header');
    }

    return task as Task;
};

const TaskItem = ({ value, onChange, onDelete, isEditing, onSubmit }: Props) => {
    const [parsed, setParsed] = useState<Task | null>(null);

    useEffect(() => {
        if (!isEditing && value) {
            try {
                const task = parseTaskInput(value);
                setParsed(task);
            } catch (err) {
                console.error(err);
            }
        }
    }, [isEditing, value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            try {
                const task = parseTaskInput(value);
                setParsed(task);
                onSubmit(task);
            } catch (err) {
                alert('Invalid format. Must include at least "header:..."');
            }
        }
    };

    if (isEditing) {
        return (
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='header:Math 270/desc:.../startTime:...'
                    className="w-full p-4 rounded-lg border-2 bg-transparent focus:outline-none focus:ring-2"
                    style={{
                        borderColor: 'var(--color-primary-500)',
                        color: 'var(--color-foreground)',
                        backgroundColor: 'var(--color-background)',
                        ['--tw-ring-color' as any]: 'var(--color-primary-500)',
                    }}
                />
                <button
                    onClick={onDelete}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-red-500 transition-colors"
                    style={{ color: 'var(--color-foreground)' }}
                >
                    <X size={18} />
                </button>
            </div>
        );
    }

    if (parsed) {
        return (
            <div
                className="p-4 rounded-lg border-2 relative space-y-2"
                style={{
                    borderColor: 'var(--color-primary-500)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-foreground)',
                }}
            >
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-lg">{parsed.title}</h4>
                    <button
                        onClick={onDelete}
                        className="text-red-500 hover:text-red-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                {parsed.description && (
                    <p className="text-sm text-muted-foreground">{parsed.description}</p>
                )}
                <div className="text-xs flex flex-wrap gap-3 text-muted-foreground">
                    {parsed.startTime && <span>{parsed.startTime}</span>}
                    {parsed.startDate && <span>{parsed.startDate}</span>}
                    {parsed.endDate && <span>{parsed.endDate}</span>}
                </div>
            </div>
        );
    }

    return null;
};

export default TaskItem;
