import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';

interface SwitchThemeProps {
    onChange?: (theme: 'dark' | 'light') => void;
}

export const SwitchTheme = ({ onChange }: SwitchThemeProps) => {
    const { theme, toggleTheme } = useTheme();

    const handleClick = () => {
        toggleTheme();
        onChange?.(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="flex justify-between items-center">
            <button
                onClick={handleClick}
                className="btn btn-outline btn-md border-none bg-transparent active:bg-transparent"
            >
                {theme === 'dark' ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-black" />}
            </button>
        </div>
    );
};
