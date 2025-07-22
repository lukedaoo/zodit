import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DatePicker } from '@mantine/dates';
import { Popover, Tooltip } from '@mantine/core';
import { useGreetingDate } from '@hooks/useGreetingNav';
import './DatePicker.css';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
    onChangeDate: (date: Date) => void;
}

const taskData: Record<string, number> = {
    '2025-07-17': 5,
    '2025-07-18': 2,
    '2025-07-20': 0,
};

function computeIntensity(data: Record<string, number>): Record<string, number> {
    const values = Object.values(data);
    if (values.length === 0) return {};

    const max = Math.max(...values);
    const min = Math.min(...values);

    // avoid division by 0
    const range = max === min ? 1 : max - min;

    const result: Record<string, number> = {};
    for (const [date, count] of Object.entries(data)) {
        // Scale to 0-4 range (5 degrees: 0%, 25%, 50%, 75%, 100%)
        const intensity = Math.round(((count - min) / range) * 4);
        result[date] = intensity;
    }

    return result;
}

const intensityMap = computeIntensity(taskData);

// Theme-aware color schemes using color-mix approach
const getLightThemeColors = () => [
    '#FAF6FD', // 0% - color-mix(in oklab, #5F2EEA 0%, #FAF6FD)
    '#D4C2F7', // 25% - approximate color-mix(in oklab, #5F2EEA 25%, #FAF6FD)
    '#A888F1', // 50% - approximate color-mix(in oklab, #5F2EEA 50%, #FAF6FD)
    '#7C4EEB', // 75% - approximate color-mix(in oklab, #5F2EEA 75%, #FAF6FD)
    '#5F2EEA'  // 100% - color-mix(in oklab, #5F2EEA 100%, #FAF6FD)
];

const getDarkThemeColors = () => [
    '#121114', // 0% - color-mix(in oklab, #BCA4FF 0%, #121114)
    '#3A2F57', // 25% - approximate color-mix(in oklab, #BCA4FF 25%, #121114)
    '#624D9A', // 50% - approximate color-mix(in oklab, #BCA4FF 50%, #121114)
    '#8A6BDC', // 75% - approximate color-mix(in oklab, #BCA4FF 75%, #121114)
    '#BCA4FF'  // 100% - color-mix(in oklab, #BCA4FF 100%, #121114)
];

// Detect theme
const isDarkTheme = () => {
    return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Dynamic text color based on theme AND intensity
const getTextColor = (intensity: number, isDark = false) => {
    if (isDark) {
        // In dark theme, lighter backgrounds (higher intensity) need dark text
        return intensity >= 3 ? '#121114' : '#ffffff';
    } else {
        // In light theme, darker backgrounds (higher intensity) need light text
        return intensity >= 3 ? '#ffffff' : '#121114';
    }
};

export const GreetingNav = ({ onChangeDate }: Props) => {
    const {
        currentDate,
        month,
        date,
        year,
        greeting,
        goToPreviousDay,
        goToNextDay,
        setDateFromString
    } = useGreetingDate();

    const [opened, setOpened] = useState(false);

    useEffect(() => {
        onChangeDate(currentDate);
    }, [currentDate]);

    return (
        <div className="mantine border border-primary rounded-lg p-4 mb-4 flex items-center gap-6" style={{ color: 'var(--color-card-foreground)', borderColor: 'var(--color-border)' }}>
            <Popover opened={opened} onChange={setOpened} width={300} position="bottom" shadow="md">
                <Popover.Target>
                    <div onClick={() => setOpened((o) => !o)} className="mantine flex items-center gap-3 cursor-pointer">
                        <Tooltip label="Previous day" withArrow>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPreviousDay();
                                }}
                                className="mantine w-8 h-8 flex items-center justify-center rounded-md transition-colors"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--color-foreground)';
                                }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </Tooltip>

                        <div className="mantine flex flex-col items-center text-center min-w-[60px]">
                            <div className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>{month}</div>
                            <div className="text-2xl font-bold leading-none" style={{ color: 'var(--color-foreground)' }}>{date}</div>
                            <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{year}</div>
                        </div>

                        <Tooltip label="Next day" withArrow>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNextDay();
                                }}
                                className="mantine w-8 h-8 flex items-center justify-center rounded-md transition-colors"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--color-foreground)';
                                }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </Tooltip>
                    </div>
                </Popover.Target>
                <Popover.Dropdown>
                    <DatePicker
                        presets={[
                            { value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), label: 'Yesterday' },
                            { value: dayjs().format('YYYY-MM-DD'), label: 'Today' },
                            { value: dayjs().add(1, 'day').format('YYYY-MM-DD'), label: 'Tomorrow' },
                            { value: dayjs().add(1, 'month').format('YYYY-MM-DD'), label: 'Next month' },
                            { value: dayjs().add(1, 'year').format('YYYY-MM-DD'), label: 'Next year' },
                            { value: dayjs().subtract(1, 'month').format('YYYY-MM-DD'), label: 'Last month' },
                            { value: dayjs().subtract(1, 'year').format('YYYY-MM-DD'), label: 'Last year' },
                        ]}
                        key={currentDate.toISOString()}
                        value={currentDate}
                        onChange={(newDate) => {
                            if (newDate) {
                                setDateFromString(newDate);
                                setOpened(false);
                            }
                        }}
                        renderDay={(date) => {
                            const day = dayjs(date);
                            const dateStr = day.format('YYYY-MM-DD');
                            const intensity = intensityMap[dateStr] ?? -1;
                            const isDark = isDarkTheme();

                            const colors = isDark ? getDarkThemeColors() : getLightThemeColors();
                            const bg = intensity >= 0 ? colors[intensity] : 'transparent';
                            const textColor = intensity >= 0 ? getTextColor(intensity, isDark) : 'var(--color-foreground)';

                            return (
                                <Tooltip label={`${day.format('dddd, MMMM D')} — ${taskData[dateStr] || 0} tasks`} withArrow>
                                    <div
                                        style={{
                                            backgroundColor: bg,
                                            color: textColor,
                                            borderRadius: '100%',
                                            padding: '4px',
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {day.date()}
                                    </div>
                                </Tooltip>
                            );
                        }}
                        highlightToday={false}
                        defaultDate={currentDate}
                    />
                </Popover.Dropdown>
            </Popover>

            <div className="mantine w-px h-12" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="mantine flex-1 flex items-center gap-4">
                <div>
                    <div className="text-xl font-medium" style={{ color: 'var(--color-foreground)' }}>
                        {greeting}!
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                        Ready to tackle your tasks today?
                    </div>
                </div>
                <div className="mantine ml-auto flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl">☀️</div>
                </div>
            </div>
        </div >
    );
};
