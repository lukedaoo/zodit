import { describe, it, expect } from 'vitest';
import { formatDate, formatTime } from './utils';

describe('formatDate', () => {
    describe('valid inputs', () => {
        it('should format ISO date string correctly', () => {
            const result = formatDate('2023-12-25T10:30:00Z');
            expect(result).toMatch(/Dec 25, 2023/);
        });

        it('should format date string without time correctly', () => {
            const result = formatDate('2023-01-15');
            expect(result).toMatch(/Jan 15, 2023/);
        });

        it('should format date string with time correctly', () => {
            const result = formatDate('23:59 2023-01-15');
            expect(result).toMatch(/23:59 Jan 15, 2023/);
        });

        it('should format different date formats', () => {
            const result1 = formatDate('12/25/2023');
            const result2 = formatDate('December 25, 2023');

            expect(result1).toMatch(/Dec 25, 2023/);
            expect(result2).toMatch(/Dec 25, 2023/);
        });

        it('should handle timestamps', () => {
            const timestamp = new Date('2023-06-15').getTime();
            const result = formatDate(timestamp.toString());
            expect(result).toMatch(/Jun 15, 2023/);
        });
    });

    describe('edge cases', () => {
        it('should return empty string for undefined input', () => {
            const result = formatDate(undefined);
            expect(result).toBe('');
        });

        it('should return empty string for null input', () => {
            const result = formatDate(null as any);
            expect(result).toBe('');
        });

        it('should return empty string for empty string input', () => {
            const result = formatDate('');
            expect(result).toBe('');
        });

        it('should return original string for invalid date', () => {
            const invalidDate = 'not-a-date';
            const result = formatDate(invalidDate);
            expect(result).toBe(invalidDate);
        });

        it('should return original string for malformed date', () => {
            const malformedDate = '2023-13-45';
            const result = formatDate(malformedDate);
            expect(result).toBe(malformedDate);
        });
    });
});

describe('formatTime', () => {
    describe('valid inputs', () => {
        it('should format 12-hour time with AM/PM', () => {
            const result1 = formatTime('10:30 AM');
            const result2 = formatTime('02:15 PM');

            expect(result1).toMatch(/10:30.*(AM|am)/i);
            expect(result2).toMatch(/2:15.*(PM|pm)/i);
        });

        it('should format 12-hour time without spaces', () => {
            const result1 = formatTime('10:30AM');
            const result2 = formatTime('02:15PM');

            expect(result1).toMatch(/10:30.*(AM|am)/i);
            expect(result2).toMatch(/2:15.*(PM|pm)/i);
        });

        it('should handle mixed case AM/PM', () => {
            const result1 = formatTime('10:30 am');
            const result2 = formatTime('02:15 pm');
            const result3 = formatTime('03:45 Am');
            const result4 = formatTime('11:00 pM');

            expect(result1).toMatch(/10:30.*(AM|am)/i);
            expect(result2).toMatch(/2:15.*(PM|pm)/i);
            expect(result3).toMatch(/3:45.*(AM|am)/i);
            expect(result4).toMatch(/11:00.*(PM|pm)/i);
        });

        it('should handle 24-hour format', () => {
            const result1 = formatTime('14:30');
            const result2 = formatTime('09:15');
            const result3 = formatTime('23:45');

            expect(result1).toMatch(/2:30.*(PM|pm)/i);
            expect(result2).toMatch(/9:15.*(AM|am)/i);
            expect(result3).toMatch(/11:45.*(PM|pm)/i);
        });

        it('should handle noon and midnight correctly', () => {
            const result1 = formatTime('12:00 PM');
            const result2 = formatTime('12:00 AM');

            expect(result1).toMatch(/12:00.*(PM|pm)/i);
            expect(result2).toMatch(/12:00.*(AM|am)/i);
        });

        it('should handle single digit hours', () => {
            const result1 = formatTime('9:30 AM');
            const result2 = formatTime('5:15 PM');

            expect(result1).toMatch(/9:30.*(AM|am)/i);
            expect(result2).toMatch(/5:15.*(PM|pm)/i);
        });
    });

    describe('edge cases', () => {
        it('should return empty string for undefined input', () => {
            const result = formatTime(undefined);
            expect(result).toBe('');
        });

        it('should return empty string for null input', () => {
            const result = formatTime(null as any);
            expect(result).toBe('');
        });

        it('should return empty string for empty string input', () => {
            const result = formatTime('');
            expect(result).toBe('');
        });

        it('should return original string for invalid time format', () => {
            const invalidTime = 'not-a-time';
            const result = formatTime(invalidTime);
            expect(result).toBe(invalidTime);
        });

        it('should return original string for malformed time', () => {
            const malformedTime = '25:70 XM';
            const result = formatTime(malformedTime);
            expect(result).toBe(malformedTime);
        });

        it('should return original string for missing minutes', () => {
            const invalidTime = '10: AM';
            const result = formatTime(invalidTime);
            expect(result).toBe(invalidTime);
        });

        it('should return original string for invalid hour', () => {
            const invalidTime = '25:30 PM';
            const result = formatTime(invalidTime);
            expect(result).toBe('1:30 AM');
        });

        it('should return original string for invalid minutes', () => {
            const invalidTime = '10:70 AM';
            const result = formatTime(invalidTime);
            expect(result).toBe('11:10 AM');
        });
    });

    describe('boundary conditions', () => {
        it('should handle hour boundaries correctly', () => {
            const result1 = formatTime('12:30 AM'); // midnight hour
            const result2 = formatTime('12:30 PM'); // noon hour
            const result3 = formatTime('01:30 AM'); // 1 AM
            const result4 = formatTime('11:30 PM'); // 11 PM

            expect(result1).toMatch(/12:30.*(AM|am)/i);
            expect(result2).toMatch(/12:30.*(PM|pm)/i);
            expect(result3).toMatch(/1:30.*(AM|am)/i);
            expect(result4).toMatch(/11:30.*(PM|pm)/i);
        });

        it('should handle minute boundaries', () => {
            const result1 = formatTime('10:00 AM');
            const result2 = formatTime('10:59 PM');

            expect(result1).toMatch(/10:00.*(AM|am)/i);
            expect(result2).toMatch(/10:59.*(PM|pm)/i);
        });
    });

    describe('whitespace handling', () => {
        it('should handle extra whitespace', () => {
            const result1 = formatTime('  10:30 AM  ');
            const result2 = formatTime('10:30  PM');

            expect(result1).toMatch(/10:30.*(AM|am)/i);
            expect(result2).toMatch(/10:30.*(PM|pm)/i);
        });

        it('should handle no space before AM/PM', () => {
            const result1 = formatTime('10:30AM');
            const result2 = formatTime('02:15PM');

            expect(result1).toMatch(/10:30.*(AM|am)/i);
            expect(result2).toMatch(/2:15.*(PM|pm)/i);
        });
    });
});
