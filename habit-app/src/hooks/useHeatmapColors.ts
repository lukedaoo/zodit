import { useTheme } from '@hooks/useTheme';

interface HeatmapTheme {
    lightPrimary: string;
    lightBackground: string;
    darkPrimary: string;
    darkBackground: string;
    lightTextDark: string;
    lightTextLight: string;
    darkTextDark: string;
    darkTextLight: string;
}

const DEFAULT_THEME: HeatmapTheme = {
    lightPrimary: '#5F2EEA',
    lightBackground: '#FAF6FD',
    darkPrimary: '#BCA4FF',
    darkBackground: '#121114',
    lightTextDark: '#121114',
    lightTextLight: '#ffffff',
    darkTextDark: '#121114',
    darkTextLight: '#ffffff',
};

export const useHeatmapColors = (customTheme?: Partial<HeatmapTheme>) => {
    const { isDarkTheme } = useTheme();
    const theme = { ...DEFAULT_THEME, ...customTheme };

    const computeIntensity = (data: Record<string, number>): Record<string, number> => {
        const values = Object.values(data);
        if (values.length === 0) return {};

        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max === min ? 1 : max - min;

        const result: Record<string, number> = {};
        for (const [date, count] of Object.entries(data)) {
            const intensity = Math.round(((count - min) / range) * 4);
            result[date] = intensity;
        }
        return result;
    };

    const getLightThemeColors = () => [
        `color-mix(in oklab, ${theme.lightPrimary} 0%, ${theme.lightBackground})`,   // 0%
        `color-mix(in oklab, ${theme.lightPrimary} 25%, ${theme.lightBackground})`,  // 25%
        `color-mix(in oklab, ${theme.lightPrimary} 50%, ${theme.lightBackground})`,  // 50%
        `color-mix(in oklab, ${theme.lightPrimary} 75%, ${theme.lightBackground})`,  // 75%
        `color-mix(in oklab, ${theme.lightPrimary} 100%, ${theme.lightBackground})`  // 100%
    ];

    const getDarkThemeColors = () => [
        `color-mix(in oklab, ${theme.darkPrimary} 0%, ${theme.darkBackground})`,   // 0%
        `color-mix(in oklab, ${theme.darkPrimary} 25%, ${theme.darkBackground})`,  // 25%
        `color-mix(in oklab, ${theme.darkPrimary} 50%, ${theme.darkBackground})`,  // 50%
        `color-mix(in oklab, ${theme.darkPrimary} 75%, ${theme.darkBackground})`,  // 75%
        `color-mix(in oklab, ${theme.darkPrimary} 100%, ${theme.darkBackground})`  // 100%
    ];

    const getTextColor = (intensity: number, isDark = false) => {
        if (isDark) {
            return intensity >= 3 ? theme.darkTextDark : theme.darkTextLight;
        } else {
            return intensity >= 3 ? theme.lightTextLight : theme.lightTextDark;
        }
    };

    const getColors = () => {
        return isDarkTheme() ? getDarkThemeColors() : getLightThemeColors();
    };

    return {
        computeIntensity,
        getLightThemeColors,
        getDarkThemeColors,
        getTextColor,
        getColors,
        isDarkTheme: isDarkTheme(),
        theme,
    };
};
