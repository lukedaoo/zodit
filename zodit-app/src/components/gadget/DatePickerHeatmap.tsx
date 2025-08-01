import { DatePicker } from '@mantine/dates';
import { Tooltip } from '@mantine/core';
import { useHeatmapColors } from '@hooks/useHeatmapColors';
import dayjs from 'dayjs';

interface DatePickerHeatmapProps {
    currentDate: Date;
    onChange: (date: string | null) => void;
    data: Record<string, number>;
    presets?: Array<{ value: string; label: string }>;
    highlightToday?: boolean;
    customTheme?: {
        lightPrimary?: string;
        lightBackground?: string;
        darkPrimary?: string;
        darkBackground?: string;
        lightTextDark?: string;
        lightTextLight?: string;
        darkTextDark?: string;
        darkTextLight?: string;
    };
}

export const DatePickerHeatmap = ({
    currentDate,
    onChange,
    data,
    presets = [
        { value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), label: 'Yesterday' },
        { value: dayjs().format('YYYY-MM-DD'), label: 'Today' },
        { value: dayjs().add(1, 'day').format('YYYY-MM-DD'), label: 'Tomorrow' },
        { value: dayjs().add(1, 'month').format('YYYY-MM-DD'), label: 'Next month' },
        { value: dayjs().add(1, 'year').format('YYYY-MM-DD'), label: 'Next year' },
        { value: dayjs().subtract(1, 'month').format('YYYY-MM-DD'), label: 'Last month' },
        { value: dayjs().subtract(1, 'year').format('YYYY-MM-DD'), label: 'Last year' },
    ],
    highlightToday = false,
    customTheme
}: DatePickerHeatmapProps) => {
    const {
        computeIntensity,
        getColors,
        getTextColor,
        isDarkTheme
    } = useHeatmapColors(customTheme);
    const intensityMap = computeIntensity(data);

    const handleDateChange = (value: any) => {
        if (value instanceof Date) {
            const dateString = dayjs(value).format('YYYY-MM-DD');
            onChange(dateString);
        } else if (typeof value === 'string') {
            onChange(value);
        } else {
            onChange(null);
        }
    };


    return (
        <DatePicker
            key={dayjs(currentDate).format('YYYY-MM-DD')}
            presets={presets}
            value={currentDate}
            onChange={handleDateChange}
            renderDay={(date) => {
                const day = dayjs(date);
                const dateStr = day.format('YYYY-MM-DD');
                const intensity = intensityMap[dateStr] ?? -1;

                const colors = getColors();
                const bg = intensity >= 0 ? colors[intensity] : 'transparent';
                const textColor = intensity >= 0 ? getTextColor(intensity, isDarkTheme) : 'var(--color-foreground)';

                const isToday = day.isSame(dayjs(), 'day');
                const label = `${isToday ? 'Today' : day.format('dddd, MMMM D')} — ${data[dateStr] || 0} tasks`;

                return (
                    <Tooltip label={label} withArrow>
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
            highlightToday={highlightToday}
            defaultDate={currentDate}
        />
    );
};
