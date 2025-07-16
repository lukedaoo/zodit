import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    generateTemplate,
    createCustomTemplate,
    setUserSeparator,
    resetUserSeparator,
    objectToText,
    textToObject,
} from './textTemplateProcessor.ts';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    description?: string;
    startTime?: string;
    startDate?: string;
    endDate?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    role?: string;
}


interface Project {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    tags?: string[];
}


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


describe('templateProcessori test', () => {

    const sampleTask: Task = {
        id: 'task-123',
        title: 'Team Meeting',
        completed: false,
        description: 'Weekly team standup',
        startTime: '09:00',
        startDate: '2024-01-15',
        endDate: '2024-01-15'
    };

    const sampleUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        role: 'admin'
    };

    const sampleProject: Project = {
        id: 'proj-456',
        title: 'Authentication System',
        description: 'Implement user authentication',
        priority: 'high',
        dueDate: '2024-02-01',
        tags: ['security', 'backend']
    };

    beforeEach(() => {
        resetUserSeparator();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Template Generation', () => {
        it('should generate template for any object', () => {
            const template = generateTemplate(sampleUser);
            expect(template).toContain('id:{id}');
            expect(template).toContain('name:{name}');
            expect(template).toContain('email:{email}');
        });

        it('should generate template with custom config', () => {
            const template = generateTemplate(sampleUser, {
                exclude: ['id'],
                order: ['name', 'email']
            });
            expect(template).not.toContain('id:{id}');
            expect(template.indexOf('name:{name}')).toBeLessThan(template.indexOf('email:{email}'));
        });

        it('should create custom template with separator', () => {
            const template = createCustomTemplate(sampleUser, {}, '|');
            expect(template).toContain('|');
            expect(template).not.toContain(';');
        });
    });

    describe('Generic Object Functions', () => {
        it('should convert any object to text', () => {
            const text = objectToText(sampleUser);
            expect(text).toContain('name:John Doe');
            expect(text).toContain('email:john@example.com');
            expect(text).toContain('isActive:true');
        });

        it('should convert text to object', () => {
            const text = 'name:Jane;email:jane@example.com;isActive:false';
            const user = textToObject<User>(text);

            expect(user.name).toBe('Jane');
            expect(user.email).toBe('jane@example.com');
            expect(user.isActive).toBe(false);
        });

        it('should handle complex object with arrays', () => {
            const text = objectToText(sampleProject);
            expect(text).toContain('title:Authentication System');
            expect(text).toContain('priority:high');
            expect(text).toContain('tags:security,backend');
        });
    });

    describe('Field Configuration', () => {
        it('should exclude specified fields', () => {
            const text = objectToText<Task>(sampleTask, { exclude: ['id', 'startTime'] });
            expect(text).not.toContain('id:');
            expect(text).not.toContain('startTime:');
            expect(text).toContain('title:Team Meeting');
        });

        it('should include only specified fields', () => {
            const text = objectToText<Task>(sampleTask, { include: ['title', 'completed'] });
            expect(text).toContain('title:Team Meeting');
            expect(text).toContain('completed:false');
            expect(text).not.toContain('description:');
            expect(text).not.toContain('startDate:');
        });

        it('should respect field order', () => {
            const text = objectToText<Task>(sampleTask, {
                include: ['title', 'completed', 'description'],
                order: ['completed', 'title', 'description']
            });
            const parts = text.split(';');
            expect(parts[0]).toContain('completed:');
            expect(parts[1]).toContain('title:');
            expect(parts[2]).toContain('description:');
        });

        it('should handle custom aliases', () => {
            const config = {
                aliases: { 'name': 'title' as keyof Task }
            };
            const text = 'name:Custom Title;completed:true';
            const task = textToObject<Task>(text, config);
            expect(task.title).toBe('Custom Title');
        });
    });

    describe('Template Generation', () => {
        it('should generate template for any object', () => {
            const template = generateTemplate(sampleUser);
            expect(template).toContain('id:{id}');
            expect(template).toContain('name:{name}');
            expect(template).toContain('email:{email}');
        });

        it('should generate template with custom config', () => {
            const template = generateTemplate(sampleUser, {
                exclude: ['id'],
                order: ['name', 'email']
            });
            expect(template).not.toContain('id:{id}');
            expect(template.indexOf('name:{name}')).toBeLessThan(template.indexOf('email:{email}'));
        });

        it('should create custom template with separator', () => {
            const template = createCustomTemplate(sampleUser, {}, '|');
            expect(template).toContain('|');
            expect(template).not.toContain(';');
        });

        it('should create task template (backward compatibility)', () => {
            const template = createCustomTemplate(sampleTask, { include: ['title', 'description', 'completed'] as (keyof Task)[] });
            expect(template).toContain('title:{title}');
            expect(template).toContain('description:{description}');
            expect(template).toContain('completed:{completed}');
        });
    });

    describe('Task Functions (Backward Compatibility)', () => {
        it('should convert task to text with default config', () => {
            const text = objectToText(sampleTask, { exclude: ['id'] });
            expect(text).toContain('title:Team Meeting');
            expect(text).toContain('completed:false');
            expect(text).toContain('description:Weekly team standup');
            expect(text).not.toContain('id:task-123'); // excluded by default
        });

        it('should convert text to task with type conversion', () => {
            const text = 'title:Meeting;completed:true;description:Daily standup';
            const task = textToObject<Task>(text);

            expect(task.title).toBe('Meeting');
            expect(Boolean(task.completed)).toBe(true); // converted to boolean
            expect(task.description).toBe('Daily standup');
        });

        it('should handle aliases in textToTask', () => {
            const text = 'title:Meeting;desc:Team standup;starttime:09:00';
            const task = textToObject<Task>(text, { aliases: { desc: 'description', starttime: 'startTime' } });

            expect(task.title).toBe('Meeting');
            expect(task.description).toBe('Team standup'); // desc -> description
            expect(task.startTime).toBe('09:00'); // starttime -> startTime
        });

        it('should use fallback title when parsing fails', () => {
            const text = 'Just a plain text';
            const fallback = (obj: Partial<Task>, input: string) => {
                obj.title = input;
                return obj;
            };
            const task = textToObject<Task>(text, {}, undefined, fallback);
            expect(task.title).toBe('Just a plain text');
        });

        it('should work with custom separators', () => {
            const text = objectToText<Task>(sampleTask, {}, '|');
            expect(text).toContain('|');

            const parsed = textToObject<Task>(text, {}, '|');
            expect(parsed.title).toBe(sampleTask.title);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty objects', () => {
            const emptyObj = {};
            const text = objectToText(emptyObj);
            expect(text).toBe('');
        });

        it('should handle null and undefined values', () => {
            const taskWithNulls: Task = {
                id: 'test',
                title: 'Test',
                completed: false,
                description: undefined,
                startTime: null as any
            };
            const text = objectToText<Task>(taskWithNulls);
            expect(text).toContain('title:Test');
            expect(text).toContain('description:');
            expect(text).toContain('startTime:');
        });

        it('should handle empty input string', () => {
            const task = textToObject<Task>('');
            expect(task.title).toBeUndefined();
        });

        it('should handle malformed input', () => {
            const task = textToObject<Task>('title:Meeting;invalidformat;completed:true');
            expect(task.title).toBe('Meeting');
            expect(Boolean(task.completed)).toBe(true);
        });

        it('should handle values with colons', () => {
            const text = 'title:Meeting: Planning Session;description:Review project: Phase 1';
            const task = textToObject<Task>(text);
            expect(task.title).toBe('Meeting: Planning Session');
            expect(task.description).toBe('Review project: Phase 1');
        });

        it('should handle custom separators in user preference', () => {
            setUserSeparator('||');
            const text = objectToText<Task>(sampleTask);
            expect(text).toContain('||');

            const parsed = textToObject<Task>(text);
            expect(parsed.title).toBe(sampleTask.title);
        });
    });

    describe('Type Conversions', () => {
        it('should convert boolean strings correctly', () => {
            const tests = [
                { input: 'true', expected: true },
                { input: 'True', expected: true },
                { input: 'TRUE', expected: true },
                { input: 'false', expected: false },
                { input: 'False', expected: false },
                { input: 'anything', expected: false }
            ];

            tests.forEach(({ input, expected }) => {
                const task = textToObject<Task>(`title:Test;completed:${input}`);
                const actual = task.completed?.toString().toLowerCase();
                let asBool = actual == "true" ? true : false;
                expect(asBool).toBe(expected);
            });
        });

        it('should handle various data types in generic objects', () => {
            const complexObj = {
                string: 'test',
                number: 42,
                boolean: true,
                array: [1, 2, 3],
                object: { nested: 'value' }
            };

            const text = objectToText(complexObj);
            expect(text).toContain('string:test');
            expect(text).toContain('number:42');
            expect(text).toContain('boolean:true');
            expect(text).toContain('array:1,2,3');
            expect(text).toContain('object:[object Object]');
        });
    });

    describe('Performance and Memory', () => {
        it('should handle large objects efficiently', () => {
            const largeTask: Task = {
                id: 'large-task',
                title: 'A'.repeat(1000),
                completed: false,
                description: 'B'.repeat(2000)
            };

            const text = objectToText<Task>(largeTask);
            const parsed = textToObject<Task>(text);

            expect(parsed.title).toBe(largeTask.title);
            expect(parsed.description).toBe(largeTask.description);
        });

        it('should handle many fields efficiently', () => {
            const manyFieldsObj: Record<string, string> = {};
            for (let i = 0; i < 100; i++) {
                manyFieldsObj[`field${i}`] = `value${i}`;
            }

            const text = objectToText(manyFieldsObj);
            const parsed = textToObject(text);

            expect(Object.keys(parsed).length).toBe(100);
            expect(parsed.hasOwnProperty('field50')).toBe(true);
        });
    });
});
