import type { Task } from '../types';
import { textToObject, objectToText } from '@lib/template/textTemplateProcessor.ts'

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
