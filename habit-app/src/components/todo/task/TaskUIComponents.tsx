import { X, Wrench } from 'lucide-react';

interface DeleteButtonProps {
    onDelete: () => void;
    className?: string;
}

interface ExpandButtonProps {
    onExpand: () => void;
    className?: string;
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning';
}

interface TaskHeaderProps {
    header: string;
    isEmptyTask: boolean;
    onExpand: () => void;
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

export const ExpandButton = ({ onExpand, className = "" }: ExpandButtonProps) => (
    <button
        onClick={onExpand}
        className={`hover:text-red-500 transition-colors ${className}`}
        aria-label="More detail task"
    >
        <Wrench size={18} />
    </button>
)

export const Badge = ({ children, variant = "primary" }: BadgeProps) => (
    <span className={`badge badge-${variant}`}>
        {children}
    </span>
);

export const TaskHeader = ({ header, isEmptyTask, onDelete, onExpand }: TaskHeaderProps) => (

    <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
            <h4
                className={`font-semibold text-sm break-words ${isEmptyTask ? 'italic text-gray-500' : ''
                    }`}
            >
                {isEmptyTask ? 'Double click to update task' : header}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
                <ExpandButton
                    onExpand={onExpand}
                    className="text-violet-500 hover:text-violet-700"
                />
                <DeleteButton
                    onDelete={onDelete}
                    className="text-red-500 hover:text-red-700"
                />
            </div>
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
