import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, Tooltip } from '@mantine/core';
import { getPeriodOfDayNow } from '@common/utils';
import { DatePickerHeatmap } from './DatePickerHeatmap';
import { useDate } from '@hooks/useDate';
import './DatePicker.css';

interface Props {
    onChangeDate: (date: Date) => void;
    heatmapData?: Record<string, number>;
    currentDate: Date;
}

const getGreeting = () => {
    const periodOfDay = getPeriodOfDayNow();
    if (periodOfDay === 'morning') return 'Good Morning';
    if (periodOfDay === 'afternoon') return 'Good Afternoon';
    return 'Good Evening';
};

export const GreetingNav = ({ onChangeDate, heatmapData = {}, currentDate }: Props) => {
    const { month, date, year, goToPreviousDay, goToNextDay, setDateFromString }
        = useDate(currentDate);
    const greeting = useMemo(() => getGreeting(), []);

    const [opened, setOpened] = useState(false);

    return (
        <div className="mantine border border-primary rounded-lg p-4 mb-4 flex items-center gap-6" style={{ color: 'var(--color-card-foreground)', borderColor: 'var(--color-border)' }}>
            <Popover opened={opened} onChange={setOpened} width={300} position="bottom" shadow="md">
                <Popover.Target>
                    <div onClick={() => setOpened((o) => !o)} className="mantine flex items-center gap-3 cursor-pointer">
                        <Tooltip label="Previous day" withArrow>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPreviousDay(onChangeDate);
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
                                    goToNextDay(onChangeDate);
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
                    <DatePickerHeatmap
                        currentDate={currentDate}
                        onChange={(newDate) => {
                            if (newDate) {
                                setDateFromString(newDate, onChangeDate);
                                setOpened(false);
                            }
                        }}
                        data={heatmapData}
                        highlightToday={false}
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
        </div>
    );
};
