import { describe, it, expect, vi } from 'vitest';
import { userPref as localUserPref } from './localUserPref';

const mockLocalStorage = {
    store: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage.store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
        delete mockLocalStorage.store[key];
    }),
    clear: vi.fn(() => {
        mockLocalStorage.store = {};
    })
};

// Mock localStorage globally
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });


describe('localUserPref test', () => {
    it('should set and get user preference', () => {
        localUserPref.set('task_separator', '|');
        expect(localUserPref.get('task_separator')).toBe('|');
    });

    it('should reset user separator preference', () => {
        localUserPref.remove('task_separator');
        expect(localUserPref.get('task_separator')).toBeUndefined();
    });
});
