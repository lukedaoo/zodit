import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DatePicker } from '@mantine/dates';
import { Popover } from '@mantine/core';
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

export const GreetingNav = ({ onChangeDate }: Props) => {
    const {
        currentDate,
        month,
        date,
        year,
        greeting,
        goToPreviousDay,
        goToNextDay,
        setDate,
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
                        <div className="mantine flex flex-col items-center text-center min-w-[60px]">
                            <div className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>{month}</div>
                            <div className="text-2xl font-bold leading-none" style={{ color: 'var(--color-foreground)' }}>{date}</div>
                            <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{year}</div>
                        </div>
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
                                const parsedDate = new Date(newDate);
                                setDate(parsedDate);
                                setOpened(false);
                            }
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
        </div>
    );
};
