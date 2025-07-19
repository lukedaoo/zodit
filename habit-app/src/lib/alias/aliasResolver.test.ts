import { describe, it, expect } from 'vitest';
import { resolveAlias, unwrapAlias } from './timeAliasResolver';

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
