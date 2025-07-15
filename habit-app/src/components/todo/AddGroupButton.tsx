import { Plus } from 'lucide-react';

const AddGroupButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full mb-6 p-4 rounded-lg border-2 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
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
        <Plus size={20} />
        Add new group
    </button>
);

export default AddGroupButton;

