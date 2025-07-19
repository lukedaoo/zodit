import type { Task } from '../types';
import { TYPE_UTILS as tu } from '../types';
import { textToObject, objectToText } from '@lib/template/textTemplateProcessor.ts';
import { extractFields } from '@lib/field-extractor/fieldExtractor';
import { resolveAlias, unwrapAlias } from '@lib/alias/timeAliasResolver';

// Convert task object to text representation
export const taskToText = (task: Partial<Task>, config?: any): string => {
    const resolveValue = (value: any) =>
        value?.alias ? String(value.alias) : JSON.stringify(value);

    return objectToText<Task>(task as Task, config, undefined, resolveValue);
};

// Convert text to task object
export const textToTask = (input: string, config: any): Partial<Task> => {
    const fallback = (obj: Partial<Task>) => {
        obj.title = input;
        return obj;
    };

    return textToObject<Task>(input, config, undefined, fallback);
};

// Extract and resolve metadata fields from a task
export const resolveMetadata = (task: Partial<Task>): Partial<Task> => {
    const meta = extractFields(task, ['startTime', 'startDate', 'endDate']);
    const result: Partial<Task> = {};

    for (const [key, value] of Object.entries(meta)) {
        result[key as keyof Task] =
            typeof value === 'string' ? resolveAlias(value) : value;
    }

    return result;
};

// Resolve task with extracted/resolved metadata
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

// Prepare task for display by unwrapping alias fields
export const resolveTaskForDisplay = (task: Task): Task =>
    unwrapAlias(task, [
        { field: 'startTime' },
        { field: 'startDate' },
        { field: 'endDate' },
    ]);
