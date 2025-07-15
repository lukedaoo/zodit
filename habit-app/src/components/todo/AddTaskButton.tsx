import { Plus } from 'lucide-react';

const AddTaskButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full p-4 rounded-lg border-2 border-dashed hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 opacity-70 hover:opacity-100"
        style={{
            borderColor: 'var(--color-primary-500)',
            color: 'var(--color-foreground)',
            backgroundColor: 'transparent'
        }}
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
