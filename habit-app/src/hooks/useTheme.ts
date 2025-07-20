import { useEffect, useState } from 'react';
import { USER_THEME } from '@user-prefs/const';
import { useUserSettings } from './useUserSettings';

type Theme = 'light' | 'dark';

export const useTheme = () => {
    const { get, set } = useUserSettings();

    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = get(USER_THEME) as Theme | null;
        return saved || 'dark';
    });

    const applyTheme = (_theme: Theme) => {
        if (_theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    const setTheme = (newTheme: Theme) => {
        set(USER_THEME, newTheme);
        setThemeState(newTheme);
        applyTheme(newTheme);
    };

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    return {
        theme,
        setTheme,
        toggleTheme,
    };
};
