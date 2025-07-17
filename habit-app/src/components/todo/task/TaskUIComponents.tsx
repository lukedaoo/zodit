import { X } from 'lucide-react';

interface DeleteButtonProps {
    onDelete: () => void;
    className?: string;
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning';
}

interface TaskHeaderProps {
    header: string;
    isEmptyTask: boolean;
    onDelete: () => void;
}

interface TaskDescriptionProps {
    description?: string;
}

export const TASK_STYLES = {
    border: 'var(--color-primary-500)',
    background: 'var(--color-background)',
    text: 'var(--color-foreground)',
    textMuted: 'var(--color-text-muted)',
    ring: 'var(--color-ring)',
} as const;

export const DeleteButton = ({ onDelete, className = "" }: DeleteButtonProps) => (
    <button
        onClick={onDelete}
        className={`hover:text-red-500 transition-colors ${className}`}
        aria-label="Delete task"
    >
        <X size={18} />
    </button>
);

export const Badge = ({ children, variant = "primary" }: BadgeProps) => (
    <span className={`badge badge-${variant}`}>
        {children}
    </span>
);

export const TaskHeader = ({ header, isEmptyTask, onDelete }: TaskHeaderProps) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
            <h4
                className={`font-semibold text-sm break-words ${isEmptyTask ? 'italic text-gray-500' : ''
                    }`}
            >
                {isEmptyTask ? 'Double click to update task' : header}
            </h4>
            <DeleteButton
                onDelete={onDelete}
                className="text-red-500 hover:text-red-700 shrink-0"
            />
        </div>

        {isEmptyTask && (
            <div className="text-center text-sm text-muted-foreground">
                To move canvas, hold left click and drag
            </div>
        )}
    </div>
);

export const TaskDescription = ({ description }: TaskDescriptionProps) => {
    if (!description) return null;

    return (
        <p className="text-sm text-muted-foreground leading-snug">
            {description}
        </p>
    );
};
