import { Plus } from 'lucide-react';

export const AddGroupButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full mb-6 p-4 focus:border-primary-500 focus:border-3 focus:outline-none rounded-lg border-1 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
            e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-foreground)';
        }}
    >
        <Plus size={20} />
        Add new group
    </button>
);

export const AddTaskButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full mb-6 p-4 border-dashed focus:border-primary-500 focus:border-2 focus:outline-none rounded-lg border-1 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
            e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-foreground)';
        }}
    >
        <Plus size={16} />
        Add task
    </button>
);

export default AddTaskButton;

