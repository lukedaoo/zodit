import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface TodoActionButtonProps {
    onClick: () => void;
    disabled?: boolean;
    icon: LucideIcon;
    title: string;
    subtitle: string;
    tooltip?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    className?: string;
}

const variantStyles = {
    default: {
        hover: 'hover:bg-gray-50 dark:hover:bg-gray-800',
        border: 'hover:border-gray-200 dark:hover:border-gray-700',
        iconColor: ''
    },
    success: {
        hover: 'hover:bg-green-50 dark:hover:bg-green-900/20',
        border: 'hover:border-green-200 dark:hover:border-green-800',
        iconColor: 'text-green-500'
    },
    warning: {
        hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
        border: 'hover:border-orange-200 dark:hover:border-orange-800',
        iconColor: 'text-orange-500'
    },
    danger: {
        hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
        border: 'hover:border-red-200 dark:hover:border-red-800',
        iconColor: 'text-red-500'
    }
};

export const TodoActionButton: React.FC<TodoActionButtonProps> = ({
    onClick,
    disabled = false,
    icon: Icon,
    title,
    subtitle,
    tooltip,
    variant = 'default',
    className = ''
}) => {
    const styles = variantStyles[variant];

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all duration-200 ${!disabled
                ? `${styles.hover} ${styles.border} cursor-pointer`
                : 'opacity-50 cursor-not-allowed'
                } ${className}`}
            style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: !disabled ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
            }}
            title={tooltip}
        >
            <Icon className={`w-4 h-4 flex-shrink-0 ${!disabled ? styles.iconColor : ''}`} />
            <div className="flex-1 text-left">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    {subtitle}
                </div>
            </div>
        </button>
    );
};
