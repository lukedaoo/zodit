import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveAlias, unwrapAlias, validateAlias } from './timeAliasResolver';

describe('resolveAlias', () => {
    it('returns undefined for empty input', () => {
        expect(resolveAlias('')).toBeUndefined();
        expect(resolveAlias('   ')).toBeUndefined();
    });

    it('returns resolved date for "today"', () => {
        const result = resolveAlias('today');
        const today = new Date().toISOString().split('T')[0];
        expect(result).toEqual({ alias: 'today', resolved: today });
    });

    it('returns resolved date for "tomorrow" and "tmr"', () => {
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const expected = tomorrowDate.toISOString().split('T')[0];

        expect(resolveAlias('tomorrow')).toEqual({ alias: 'tomorrow', resolved: expected });
        expect(resolveAlias('tmr')).toEqual({ alias: 'tmr', resolved: expected });
    });

    it('returns resolved time for "now"', () => {
        const result = resolveAlias('now') as { alias: string; resolved: any; };
        expect(result?.alias).toBe('now');
        expect(typeof result?.resolved).toBe('string');
        // Should be something like "14:30"
        expect(result?.resolved).toMatch(/\d{2}:\d{2}/);
    });

    it('returns resolved object for "eod"', () => {
        const today = new Date().toISOString().split('T')[0];
        expect(resolveAlias('eod')).toEqual({
            alias: 'eod',
            resolved: { at: '23:59', date: today },
        });
    });

    it('returns alias string if not found', () => {
        const input = 'randomalias';
        expect(resolveAlias(input)).toEqual(input);
    });

    it('is case insensitive', () => {
        const todayResult = resolveAlias('TODAY') as { alias: string; resolved: any };
        expect(todayResult.alias).toBe('TODAY'.toLowerCase());

        const nowResult = resolveAlias('NOW') as { alias: string; resolved: any };
        expect(nowResult.alias).toBe('NOW'.toLowerCase());
    });
});

describe('unwrapAlias', () => {
    it('should unwrap simple primitive values', () => {
        const input = {
            title: 'Work',
            start: {
                alias: 'startTime',
                resolved: '2025-07-19',
            },
        };

        const result = unwrapAlias(input, [{ field: 'start' }]);

        expect(result.start).toBe('2025-07-19');
        expect(result.title).toBe('Work'); // untouched
    });

    it('should unwrap object with default resolver', () => {
        const input = {
            end: {
                alias: 'eod',
                resolved: { at: '23:59', date: '2025-07-19' },
            },
        };

        const result = unwrapAlias(input, [{ field: 'end' }]);
        console.log(result);

        expect(result.end).toBe('23:59 2025-07-19');
    });

    it('should unwrap object with custom resolver', () => {
        const input = {
            endDate: {
                alias: 'eod',
                resolved: { at: '23:59', date: '2025-07-19' },
            },
        };

        const result = unwrapAlias(input, [
            {
                field: 'endDate',
                resolver: (data) => `${data.date}T${data.at}`,
            },
        ]);

        expect(result.endDate).toBe('2025-07-19T23:59');
    });

    it('should leave non-alias fields as-is', () => {
        const input = {
            title: 'Meeting',
            location: 'Room 101',
        };

        const result = unwrapAlias(input, []);

        expect(result).toEqual(input);
    });

    it('should fallback to original value if not an alias object', () => {
        const input = {
            note: { text: 'Hi' }, // not alias-wrapped
        };

        const result = unwrapAlias(input, [{ field: 'note' }]);

        expect(result.note).toEqual({ text: 'Hi' });
    });
});

describe('validateAlias', () => {
    beforeEach(() => {
        // Mock Date for consistent testing
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-07-19T10:30:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('alias not found', () => {
        it('should return face value when alias definition not found', () => {
            const input = { alias: 'unknown', resolved: 'some-value' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'unknown',
                resolved: 'some-value'
            });
        });

        it('should return original object values when alias not found', () => {
            const input = { alias: 'unknown', resolved: { date: '2024-07-19', time: '10:30' } };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'unknown',
                resolved: { date: '2024-07-19', time: '10:30' }
            });
        });
    });

    describe('static aliases (still valid)', () => {
        it('should return current resolved value for midnight', () => {
            const input = { alias: 'midnight', resolved: '00:00' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'midnight',
                resolved: '00:00'
            });
        });

        it('should return current resolved value for noon', () => {
            const input = { alias: 'noon', resolved: '12:00' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'noon',
                resolved: '12:00'
            });
        });

        it('should handle case insensitive aliases', () => {
            const input = { alias: 'MIDNIGHT', resolved: '00:00' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'MIDNIGHT',
                resolved: '00:00'
            });
        });
    });

    describe('static aliases (outdated)', () => {
        it('should return face value when static alias value is wrong', () => {
            const input = { alias: 'midnight', resolved: '01:00' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'midnight',
                resolved: '01:00'
            });
        });

        it('should return face value when noon alias value is wrong', () => {
            const input = { alias: 'noon', resolved: '11:30' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'noon',
                resolved: '11:30'
            });
        });
    });

    describe('TODAY alias', () => {
        it('should return current resolved value when TODAY is still valid', () => {
            const input = { alias: 'today', resolved: '2024-07-19' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'today',
                resolved: '2024-07-19'
            });
        });

        it('should return face value when TODAY is outdated', () => {
            const input = { alias: 'today', resolved: '2024-07-18' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'today',
                resolved: '2024-07-18'
            });
        });
    });

    describe('TOMORROW alias', () => {
        it('should return current resolved value when TOMORROW is still valid', () => {
            const input = { alias: 'tomorrow', resolved: '2024-07-20' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'tomorrow',
                resolved: '2024-07-20'
            });
        });

        it('should return face value when TOMORROW is outdated', () => {
            const input = { alias: 'tmr', resolved: '2024-07-19' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'tmr',
                resolved: '2024-07-19'
            });
        });
    });

    describe('NOW alias', () => {
        it('should return current resolved value when NOW matches current time', () => {
            const currentTime = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
            });
            const input = { alias: 'now', resolved: currentTime };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'now',
                resolved: currentTime
            });
        });

        it('should return face value when NOW is outdated', () => {
            const input = { alias: 'now', resolved: '09:15' };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'now',
                resolved: '09:15'
            });
        });
    });

    describe('EOD alias', () => {
        it('should return current resolved value when EOD is still valid', () => {
            const input = {
                alias: 'eod',
                resolved: { at: '23:59', date: '2024-07-19' }
            };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'eod',
                resolved: { at: '23:59', date: '2024-07-19' }
            });
        });

        it('should return face value when EOD date is outdated', () => {
            const input = {
                alias: 'eod',
                resolved: { at: '23:59', date: '2024-07-18' }
            };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'eod',
                resolved: { at: '23:59', date: '2024-07-18' }
            });
        });

        it('should return face value when EOD time is different', () => {
            const input = {
                alias: 'eod',
                resolved: { at: '18:00', date: '2024-07-19' }
            };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'eod',
                resolved: { at: '18:00', date: '2024-07-19' }
            });
        });
    });

    describe('custom aliases', () => {
        const customAliases = [
            { id: '1', alias: 'custom', value: 'CUSTOM_VALUE', type: 'date' as const },
            { id: '2', alias: 'special', value: 'TODAY', type: 'date' as const }
        ];

        it('should work with custom static aliases', () => {
            const input = { alias: 'custom', resolved: 'CUSTOM_VALUE' };
            const result = validateAlias(input, customAliases);

            expect(result).toEqual({
                isAligned: true,
                alias: 'custom',
                resolved: 'CUSTOM_VALUE'
            });
        });

        it('should work with custom aliases that use special values', () => {
            const input = { alias: 'special', resolved: '2024-07-19' };
            const result = validateAlias(input, customAliases);

            expect(result).toEqual({
                isAligned: true,
                alias: 'special',
                resolved: '2024-07-19'
            });
        });

        it('should work with custom aliases that use special values but not align the date', () => {
            const input = { alias: 'special', resolved: '2024-07-20' };
            const result = validateAlias(input, customAliases);

            expect(result).toEqual({
                isAligned: false,
                alias: 'special',
                resolved: '2024-07-20'
            });
        });


        it('should return face value for unknown custom alias', () => {
            const input = { alias: 'unknown', resolved: 'some-value' };
            const result = validateAlias(input, customAliases);

            expect(result).toEqual({
                isAligned: true,
                alias: 'unknown',
                resolved: 'some-value'
            });
        });
    });

    describe('edge cases', () => {
        it('should handle null resolved values', () => {
            const input = { alias: 'today', resolved: null };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'today',
                resolved: null
            });
        });

        it('should handle undefined resolved values', () => {
            const input = { alias: 'today', resolved: undefined };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'today',
                resolved: undefined
            });
        });

        it('should handle number resolved values', () => {
            const input = { alias: 'today', resolved: 123 };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'today',
                resolved: 123
            });
        });

        it('should handle boolean resolved values', () => {
            const input = { alias: 'today', resolved: false };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'today',
                resolved: false
            });
        });

        it('should handle empty aliases array', () => {
            const input = { alias: 'today', resolved: '2024-07-19' };
            const result = validateAlias(input, []);

            expect(result).toEqual({
                isAligned: true,
                alias: 'today',
                resolved: '2024-07-19'
            });
        });

        it('should handle complex nested objects', () => {
            const complexObject = {
                nested: {
                    deep: 'value',
                    array: [1, 2, 3]
                }
            };
            const input = {
                alias: 'unknown',
                resolved: complexObject
            };
            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: true,
                alias: 'unknown',
                resolved: complexObject
            });
        });
    });

    describe('time changes during validation', () => {
        it('should detect when time has moved forward', () => {
            // Set initial time
            vi.setSystemTime(new Date('2024-07-19T10:30:00Z'));

            const input = { alias: 'now', resolved: '10:30' };

            // Move time forward
            vi.setSystemTime(new Date('2024-07-19T10:31:00Z'));

            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'now',
                resolved: '10:30' // Should return face value as it's no longer current
            });
        });

        it('should detect when date has changed', () => {
            const input = { alias: 'today', resolved: '2024-07-19' };

            // Move to next day
            vi.setSystemTime(new Date('2024-07-20T00:00:00Z'));

            const result = validateAlias(input);

            expect(result).toEqual({
                isAligned: false,
                alias: 'today',
                resolved: '2024-07-19' // Should return face value as date has changed
            });
        });
    });
});
