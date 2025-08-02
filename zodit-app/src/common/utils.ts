// utils.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const convertDate = (newDate: Date) => {
    return dayjs(newDate).tz(getTimezone()).startOf('day').toDate();
};

export const toDate = (date: Date | string) => {
    return dayjs(date).toDate();
}

export const convertDateFromString = (newDate: string) => {
    return dayjs.tz(newDate, getTimezone()).startOf('day').toDate();
};

export const getPeriodOfDayNow = () => {
    const hour = dayjs().tz(getTimezone()).hour();
    if (hour >= 17) return 'everning';
    if (hour >= 12) return 'afternoon';
    return 'morning';
};

export const getZonedDayjs = (date?: Date) => {
    return dayjs(date).tz(getTimezone());
};

export const getTimezone = () => {
    return dayjs.tz.guess();
}

export const getToday = (): string => {
    return dayjs().format('YYYY-MM-DD');
}

export const now = (): Date => {
    return dayjs().toDate();
}

export const convert = (date: Date | null | undefined, format: string = 'YYYY-MM-DD'): string => {
    if (!date) {
        return 'Invalid Date';
    }
    return dayjs(date).format(format);
};

// for display date and time for tasks
export const formatDate = (dateString?: string): string => {
    if (!dateString) return '';

    const timeDateMatch = dateString.match(/^(\d{2}:\d{2})\s(\d{4}-\d{2}-\d{2})$/);
    const parseDate = (input: string): Date => {
        if (/^\d+$/.test(input)) return new Date(parseInt(input, 10));
        return new Date(input);
    };

    const format = (date: Date): string =>
        date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
        });

    if (timeDateMatch) {
        const [, time, datePart] = timeDateMatch;
        const date = parseDate(datePart);
        return isNaN(date.getTime()) ? dateString : `${time} ${format(date)}`;
    }

    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return dateString;

    const utcMidnight = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ));

    return format(utcMidnight);
};

export const formatTime = (timeString?: string): string => {
    if (!timeString) return '';

    const normalized = timeString.replace(/(\d)([aApP][mM])$/, '$1 $2').trim();

    const date = new Date();
    const parsed = Date.parse(`1970-01-01T${normalized}`);

    if (!isNaN(parsed)) {
        date.setTime(parsed);
        return date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    const regex = /^(\d{1,2}):(\d{2})\s*([aApP][mM])?$/;
    const match = normalized.match(regex);

    if (!match) return timeString;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const ampm = match[3]?.toLowerCase();

    if (isNaN(hour) || isNaN(minute)) return timeString;

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    date.setHours(hour, minute, 0);

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
};
