import { useState, useMemo } from 'react';
import { convertDate, convertDateFromString, getZonedDayjs } from '@common/utils';

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const useDate = (controlledDate?: Date) => {
    const [internalDate, setInternalDate] = useState<Date>(convertDate(new Date()));
    const currentDate = controlledDate || internalDate;

    const dateObj = useMemo(() => getZonedDayjs(currentDate), [currentDate]);
    const month = monthNames[dateObj.month()];
    const date = dateObj.date();
    const year = dateObj.year();

    const goToPreviousDay = (onChange?: (date: Date) => void) => {
        const newDate = getZonedDayjs(currentDate).subtract(1, 'day').startOf('day').toDate();
        if (onChange) {
            onChange(newDate);
        } else {
            setInternalDate(newDate);
        }
    };

    const goToNextDay = (onChange?: (date: Date) => void) => {
        const newDate = getZonedDayjs(currentDate).add(1, 'day').startOf('day').toDate();
        if (onChange) {
            onChange(newDate);
        } else {
            setInternalDate(newDate);
        }
    };

    const setDate = (newDate: Date, onChange?: (date: Date) => void) => {
        const convertedDate = convertDate(newDate);
        if (onChange) {
            onChange(convertedDate);
        } else {
            setInternalDate(convertedDate);
        }
    };

    const setDateFromString = (newDate: string, onChange?: (date: Date) => void) => {
        const convertedDate = convertDateFromString(newDate);
        if (onChange) {
            console.log('useDate: Setting date from string', newDate);
            onChange(convertedDate);
        } else {
            setInternalDate(convertedDate);
        }
    };

    return {
        currentDate,
        month,
        date,
        year,
        goToPreviousDay,
        goToNextDay,
        setDate,
        setDateFromString
    };
};
