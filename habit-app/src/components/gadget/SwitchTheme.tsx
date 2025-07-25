import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';

interface SwitchThemeProps {
    onChange?: (theme: 'dark' | 'light') => void;
}

export const SwitchTheme = ({ onChange }: SwitchThemeProps) => {
    const { toggleTheme, isDarkTheme } = useTheme();

    const handleClick = () => {
        const newTheme = toggleTheme();
        if (newTheme === 'dark' || newTheme === 'light') {
            onChange?.(newTheme);
        }
    };

    return (
        <div className="flex justify-between items-center">
            <button
                onClick={handleClick}
                className="btn btn-md bg-transparent border-none shadow-none outline-none 
                focus:ring-0 focus:outline-none active:shadow-none active:outline-none"
            >
                {isDarkTheme() ? (
                    <Sun size={20} className="text-white" />
                ) : (
                    <Moon size={20} className="text-black" />
                )}
            </button>
        </div >
    );
};
