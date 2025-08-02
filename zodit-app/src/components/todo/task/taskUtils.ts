import type { Task } from '../types';
import { DEFAULT_TASK } from '../types';
import { TYPE_UTILS as tu } from '../types';
import { textToObject, objectToText } from '@lib/template/textTemplateProcessor.ts';
import { splitFields } from '@lib/field-extractor/fieldExtractor';
import { resolveAlias, unwrapAlias, validateAlias } from '@lib/alias/timeAliasResolver';

export const taskToText = (task: Partial<Task>, config?: any): string => {
    const resolveValue = (value: any) => {
        if (!value?.alias) {
            return JSON.stringify(value);
        }
        const validated = validateAlias(value);

        return validated.isAligned
            ? String(validated.alias)
            : value.resolved; // use face value if not aligned
    };
    return objectToText<Task>(task as Task, config, undefined, resolveValue);
};

export const textToTask = (input: string, config: any): Partial<Task> => {
    const fallback = (obj: Partial<Task>) => {
        obj.title = input;
        return obj;
    };

    return textToObject<Task>(input, config, undefined, fallback);
};

export const resolveMetadata = (task: Partial<Task>): Partial<Task> => {
    const metaKeys: (keyof Task)[] = ['startTime', 'startDate', 'endDate'];

    const { meta, rest } = splitFields(task, metaKeys, {
        selected: 'meta',
        others: 'rest',
    });

    for (const key of metaKeys) {
        const value = meta[key];
        if (typeof value === 'string') {
            meta[key] = resolveAlias(value) as any;
        }
    }

    const otherKnownKeys = Object.keys(rest).filter(k => k in (DEFAULT_TASK as Task)) as (keyof Task)[];
    const { known, custom } = splitFields(rest, otherKnownKeys,
        { selected: 'known', others: 'custom' }
    );

    const result: Partial<Task> = {
        ...meta,
        ...known,
    };

    if (Object.keys(custom).length > 0) {
        (result as any).customFields = custom;
    }

    return result;
};

export const resolveTaskWithMetadata = (task: Partial<Task>): Task => {
    const meta = resolveMetadata(task);
    return tu.trim({
        id: task.id ?? '',
        title: task.title ?? '',
        completed: task.completed ?? false,
        description: task.description,
        ...meta,
    });
};

export const resolveTaskForDisplay = (task: Task): Task => {
    return unwrapAlias(task, [
        { field: 'startTime' },
        { field: 'startDate' },
        { field: 'endDate' },
    ]);
};

export const getTaskBorderColor = (task: Task): string => {
    if (task.completed) {
        return 'var(--color-success)';
    }

    if (!task.endDate) {
        return 'var(--color-primary-500)';
    }

    try {
        const today = new Date();
        const endDate = new Date(task.endDate);

        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const timeDiff = endDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Overdue (past end date)
        if (daysDiff < 0) {
            return 'var(--color-error)';
        }

        // Due today
        if (daysDiff === 0) {
            return 'var(--color-warning)';
        }

        // Due within 3 days - use primary color variant
        if (daysDiff <= 3) {
            return 'var(--color-primary-500)';
        }

        // Due within a week - use accent color
        if (daysDiff <= 7) {
            return 'var(--color-accent-500)';
        }

        // More than a week away - use secondary
        return 'var(--color-secondary-400)';
    } catch (error) {
        return 'var(--color-primary-500)';
    }
}
