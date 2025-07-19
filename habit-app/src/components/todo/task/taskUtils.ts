import type { Task } from '../types';
import { TYPE_UTILS as tu } from '../types';
import { textToObject, objectToText } from '@lib/template/textTemplateProcessor.ts'
import { extractMetadata } from '@lib/metadata/metaDataExtractor';
import { resolveAlias } from '@lib/alias/timeAliasResolver';

export const taskToText = (task: any, config?: any): string => {
    return objectToText<Task>(task, config);
};

export const textToTask = (input: string, config: any): Partial<Task> => {
    const fallback = (obj: Partial<Task>, input: string) => {
        obj.title = input;
        return obj;
    }
    return textToObject<Task>(input, config, undefined, fallback);
};

export const resoleMetadata = (task: Task): any => {
    const meta = extractMetadata(task, ['startTime', 'startDate', 'endDate']);
    const result: any = {};

    for (const [key, value] of Object.entries(meta)) {
        if (key) {
            result[key] = value ? resolveAlias(value as string) : '';
        }
    }

    return result;
}

export const resolveTaskAsTask = (task: any): Task => {
    const meta = resoleMetadata(task);
    const result: Task = {
        id: task.id,
        title: task.title,
        completed: task.completed,
        description: task.description,
        startTime: meta.startTime,
        startDate: meta.startDate,
        endDate: meta.endDate
    };
    return tu.trim(result);
};
