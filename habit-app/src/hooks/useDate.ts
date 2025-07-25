import { useState, useMemo } from 'react';
import { convertDate, convertDateFromString, getZonedDayjs, getPeriodOfDayNow } from '@common/utils';

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const useDate = () => {
    const [currentDate, setCurrentDate] = useState<Date>(convertDate(new Date()));

    const dateObj = useMemo(() => getZonedDayjs(currentDate), [currentDate]);
    const month = monthNames[dateObj.month()];
    const date = dateObj.date();
    const year = dateObj.year();


    const getGreeting = () => {
        const periodOfDay = getPeriodOfDayNow();
        if (periodOfDay === 'morning') return 'Good Morning';
        if (periodOfDay === 'afternoon') return 'Good Afternoon';
        return 'Good Evening';
    };
    const greeting = useMemo(() => getGreeting(), []);

    const goToPreviousDay = () => {
        setCurrentDate(prev => getZonedDayjs(prev).subtract(1, 'day').startOf('day').toDate());
    };

    const goToNextDay = () => {
        setCurrentDate(prev => getZonedDayjs(prev).add(1, 'day').startOf('day').toDate());
    };

    const setDate = (newDate: Date) => {
        setCurrentDate(convertDate(newDate));
    };

    const setDateFromString = (newDate: string) => {
        setCurrentDate(convertDateFromString(newDate));
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
        setDateFromString
    };
};
