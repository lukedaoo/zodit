import { describe, it, expect } from 'vitest';
import { extractFields, splitFields } from './fieldExtractor';
import type { Task } from '@components/todo/types';

describe('extractFields with Task interface', () => {
    const metaKeys: (keyof Task)[] = ['startTime', 'startDate', 'endDate'];

    it('should extract metadata fields from complete Task object', () => {
        const task: Task = {
            id: '1',
            title: 'Test Task',
            completed: false,
            description: 'Test description',
            startTime: '09:00',
            startDate: '2025-07-18',
            endDate: '2025-07-19'
        };
        const result = extractFields(task, metaKeys);
        expect(result).toEqual({
            startTime: '09:00',
            startDate: '2025-07-18',
            endDate: '2025-07-19'
        });
    });

    it('should extract only available metadata fields when some are undefined', () => {
        const task: Task = {
            id: '2',
            title: 'Partial Task',
            completed: true,
            startDate: '2025-07-18'
        };
        const result = extractFields(task, metaKeys);
        expect(result).toEqual({
            startDate: '2025-07-18'
        });
    });

    it('should return empty object when no metadata fields are present', () => {
        const task: Task = {
            id: '3',
            title: 'No Meta Task',
            completed: false
        };
        const result = extractFields(task, metaKeys);
        expect(result).toEqual({});
    });

    it('should handle empty keys array', () => {
        const task: Task = {
            id: '4',
            title: 'Test Task',
            completed: false,
            startTime: '10:00'
        };
        const result = extractFields(task, []);
        expect(result).toEqual({});
    });
});

describe('splitFields with Task interface', () => {
    const metaKeys: (keyof Task)[] = ['startTime', 'startDate', 'endDate'];

    it('should split Task into data and meta parts', () => {
        const task: Task = {
            id: '1',
            title: 'Test Task',
            completed: false,
            description: 'Test description',
            startTime: '09:00',
            startDate: '2025-07-18',
            endDate: '2025-07-19'
        };
        const result = splitFields(task, metaKeys);
        expect(result).toEqual({
            others: {
                id: '1',
                title: 'Test Task',
                completed: false,
                description: 'Test description'
            },
            selected: {
                startTime: '09:00',
                startDate: '2025-07-18',
                endDate: '2025-07-19'
            }
        });
    });

    it('should handle partial metadata fields', () => {
        const task: Task = {
            id: '2',
            title: 'Partial Task',
            completed: true,
            startDate: '2025-07-18'
        };
        const result = splitFields(task, metaKeys);
        expect(result).toEqual({
            others: {
                id: '2',
                title: 'Partial Task',
                completed: true
            },
            selected: {
                startDate: '2025-07-18'
            }
        });
    });

    it('should return all fields in data when no metadata fields are present', () => {
        const task: Task = {
            id: '3',
            title: 'No Meta Task',
            completed: false,
            description: 'No metadata'
        };
        const result = splitFields(task, metaKeys);
        expect(result).toEqual({
            others: {
                id: '3',
                title: 'No Meta Task',
                completed: false,
                description: 'No metadata'
            },
            selected: {}
        });
    });

    it('should return original object as data when metaKeys is empty', () => {
        const task: Task = {
            id: '4',
            title: 'Test Task',
            completed: false,
            startTime: '10:00'
        };
        const result = splitFields(task, []);
        expect(result).toEqual({
            others: {
                id: '4',
                title: 'Test Task',
                completed: false,
                startTime: '10:00'
            },
            selected: {}
        });
    });
});

describe('splitFields with Task interface (rename)', () => {
    const metaKeys: (keyof Task)[] = ['startTime', 'startDate', 'endDate'];

    it('should split Task into data and meta parts', () => {
        const task: Task = {
            id: '1',
            title: 'Test Task',
            completed: false,
            description: 'Test description',
            startTime: '09:00',
            startDate: '2025-07-18',
            endDate: '2025-07-19'
        };
        const result = splitFields(task, metaKeys, { selected: 'meta', others: 'data' });
        expect(result).toEqual({
            data: {
                id: '1',
                title: 'Test Task',
                completed: false,
                description: 'Test description'
            },
            meta: {
                startTime: '09:00',
                startDate: '2025-07-18',
                endDate: '2025-07-19'
            }
        });
    });

    it('should handle partial metadata fields (rename)', () => {
        const task: Task = {
            id: '2',
            title: 'Partial Task',
            completed: true,
            startDate: '2025-07-18'
        };
        const result = splitFields(task, metaKeys, { selected: 'meta', others: 'data' });
        expect(result).toEqual({
            data: {
                id: '2',
                title: 'Partial Task',
                completed: true
            },
            meta: {
                startDate: '2025-07-18'
            }
        });
    });
});

