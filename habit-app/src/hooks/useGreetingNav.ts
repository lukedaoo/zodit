import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIME_ZONE = 'America/Los_Angeles';
const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const useGreetingDate = () => {
    const [currentDate, setCurrentDate] = useState<Date>(dayjs().tz(TIME_ZONE).toDate());

    const dateObj = useMemo(() => dayjs(currentDate).tz(TIME_ZONE), [currentDate]);
    const month = monthNames[dateObj.month()];
    const date = dateObj.date();
    const year = dateObj.year();

    const greeting = useMemo(() => {
        const hour = dayjs().tz(TIME_ZONE).hour();
        if (hour >= 17) return 'Good evening';
        if (hour >= 12) return 'Good afternoon';
        return 'Good morning';
    }, []);

    const goToPreviousDay = () => {
        setCurrentDate((prev) => dayjs(prev).tz(TIME_ZONE).subtract(1, 'day').toDate());
    };

    const goToNextDay = () => {
        setCurrentDate((prev) => dayjs(prev).tz(TIME_ZONE).add(1, 'day').toDate());
    };

    const setDate = (newDate: Date) => {
        const zoned = dayjs(newDate).tz(TIME_ZONE).startOf('day').toDate();
        setCurrentDate(zoned);
    };

    return {
        currentDate,
        month,
        date,
        year,
        greeting,
        goToPreviousDay,
        goToNextDay,
        setDate,
    };
};

