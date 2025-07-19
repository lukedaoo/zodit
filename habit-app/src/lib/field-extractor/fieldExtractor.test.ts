import { describe, it, expect } from 'vitest';
import { extractFields, splitFields } from './fieldExtractor';

describe('extractFields', () => {
    it('should extract specified keys from object', () => {
        const input = { id: 1, name: 'John', age: 30, email: 'john@example.com' };
        const keys = ['id', 'name'] as (keyof typeof input)[];
        const result = extractFields(input, keys);
        expect(result).toEqual({ id: 1, name: 'John' });
    });

    it('should return empty object when keys array is empty', () => {
        const input = { id: 1, name: 'John' };
        const result = extractFields(input, []);
        expect(result).toEqual({});
    });

    it('should skip non-existent keys', () => {
        const input = { id: 1, name: 'John' };
        const keys = ['id', 'age'] as (keyof typeof input)[];
        const result = extractFields(input, keys);
        expect(result).toEqual({ id: 1 });
    });

    it('should skip undefined or null values', () => {
        const input = { id: 1, name: null, age: undefined, email: 'john@example.com' };
        const keys = ['id', 'name', 'age', 'email'] as (keyof typeof input)[];
        const result = extractFields(input, keys);
        expect(result).toEqual({ id: 1, email: 'john@example.com' });
    });

    it('should return empty object for empty input', () => {
        const input = {};
        const keys = ['id', 'name'] as (keyof typeof input)[];
        const result = extractFields(input, keys);
        expect(result).toEqual({});
    });
});

describe('splitFields', () => {
    it('should split object into data and meta parts', () => {
        const input = { id: 1, name: 'John', age: 30, email: 'john@example.com' };
        const metaKeys = ['id', 'name'] as (keyof typeof input)[];
        const result = splitFields(input, metaKeys);
        expect(result).toEqual({
            others: { age: 30, email: 'john@example.com' },
            selected: { id: 1, name: 'John' }
        });
    });

    it('should return original object as data when metaKeys is empty', () => {
        const input = { id: 1, name: 'John' };
        const result = splitFields(input, []);
        expect(result).toEqual({
            others: { id: 1, name: 'John' },
            selected: {}
        });
    });

    it('should handle non-existent keys', () => {
        const input = { id: 1, name: 'John' };
        const metaKeys = ['id', 'age'] as (keyof typeof input)[];
        const result = splitFields(input, metaKeys);
        expect(result).toEqual({
            others: { name: 'John' },
            selected: { id: 1 }
        });
    });

    it('should handle undefined or null values', () => {
        const input = { id: 1, name: null, age: undefined, email: 'john@example.com' };
        const metaKeys = ['id', 'name', 'age'] as (keyof typeof input)[];
        const result = splitFields(input, metaKeys);
        expect(result).toEqual({
            others: { email: 'john@example.com' },
            selected: { id: 1, name: null, age: undefined }
        });
    });

    it('should return empty objects for empty input', () => {
        const input = {};
        const metaKeys = ['id', 'name'] as (keyof typeof input)[];
        const result = splitFields(input, metaKeys);
        expect(result).toEqual({
            others: {},
            selected: {}
        });
    });
});
