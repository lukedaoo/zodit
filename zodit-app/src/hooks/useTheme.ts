import { useEffect, useState } from 'react';
import { USER_THEME } from '@user-prefs/const';
import { useUserSettings } from './useUserSettings';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
    const { get, set } = useUserSettings();

    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = get(USER_THEME) as Theme | null;
        return saved || 'system';
    });

    const getSystemTheme = () => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (_theme: Theme) => {
        const effectiveTheme = _theme === 'system' ? getSystemTheme() : _theme;

        if (effectiveTheme === 'light') {
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

    const toggleTheme = (): Theme => {
        let newTheme: Theme;

        if (theme === 'system') {
            newTheme = getSystemTheme() === 'dark' ? 'light' : 'dark';
        } else {
            newTheme = theme === 'dark' ? 'light' : 'dark';
        }

        setTheme(newTheme);
        return newTheme;
    };

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        media.addEventListener('change', handleChange);
        return () => {
            media.removeEventListener('change', handleChange);
        };
    }, [theme]);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const isDarkTheme = () => {
        if (theme === 'system') {
            return getSystemTheme() === 'dark';
        }
        return theme === 'dark';
    };

    return {
        theme,
        setTheme,
        toggleTheme,
        isDarkTheme,
    };
};
