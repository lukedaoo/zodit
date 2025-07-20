interface ToggleSwitchProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    className?: string;
    disabled?: boolean;
}

export const ToggleSwitch = ({
    checked,
    onChange,
    className = '',
    disabled = false,
}: ToggleSwitchProps) => (
    <button
        onClick={() => !disabled && onChange(!checked)}
        onDoubleClick={(e) => e.stopPropagation()}
        disabled={disabled}
        className={`
      relative inline-flex h-4 w-8 items-center rounded-full border transition-colors
      ${checked ? 'bg-green-500 border-green-500' : 'bg-transparent'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${className}
    `}
        aria-label="Toggle"
        aria-disabled={disabled}
    >
        <span
            className={`
        inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform
        ${checked ? 'translate-x-5' : 'translate-x-1'}
      `}
        />
    </button>
);
