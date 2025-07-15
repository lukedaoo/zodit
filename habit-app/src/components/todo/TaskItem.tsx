import { X } from 'lucide-react';

interface Props {
    value: string;
    onChange: (newTitle: string) => void;
    onDelete: () => void;
}

const TaskItem = ({ value, onChange, onDelete }: Props) => (
    <div className="relative">
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter task..."
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

export default TaskItem;
