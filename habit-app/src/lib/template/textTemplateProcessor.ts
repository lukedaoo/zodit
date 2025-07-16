import { userPref } from '../../user-prefs/localUserPref';
import { SEPARATOR_PREF_KEY } from '../../user-prefs/const';

interface FieldConfig<T> {
    exclude?: (keyof T)[];
    include?: (keyof T)[];
    aliases?: Record<string, keyof T>;
    order?: (keyof T)[];
}

const getObjectFields = <T>(obj: T, config: FieldConfig<T> = {}): (keyof T)[] => {
    let fields = Object.keys(obj as any) as (keyof T)[];

    if (config.include?.length) {
        fields = fields.filter(field => config.include!.includes(field));
    }

    if (config.exclude?.length) {
        fields = fields.filter(field => !config.exclude!.includes(field));
    }

    if (config.order?.length) {
        const orderedFields = config.order.filter(field => fields.includes(field));
        const remainingFields = fields.filter(field => !config.order!.includes(field));
        fields = [...orderedFields, ...remainingFields];
    }

    return fields;
}

export const generateTemplate = <T>(
    obj: T,
    config: FieldConfig<T> = {},
    separator?: string): string => {
    const finalSeparator = separator || getUserSeparator();
    const fields = getObjectFields(obj, config);

    return fields.map(field => `${String(field)}:{${String(field)}}`).join(finalSeparator);
}

export const objectToText = <T>(
    obj: T,
    config: FieldConfig<T> = {},
    separator?: string
): string => {
    const finalSeparator = separator ?? getUserSeparator();
    const fields = getObjectFields(obj, config);

    return fields.map(field => {
        const value = (obj as any)[field];
        const displayValue = value !== undefined && value !== null ? String(value) : '';
        return `${String(field)}:${displayValue}`;
    }).join(finalSeparator);
}

export const textToObject = <T>(
    input: string,
    config: FieldConfig<T> = {},
    separator?: string,
    fallback?: (obj: Partial<T>, input: string) => Partial<T>
): Partial<T> => {
    const finalSeparator = separator ?? getUserSeparator() ?? SEPARATOR_PREF_KEY.defaultValue;
    const parts = input?.split(finalSeparator) ?? [];
    const obj: Partial<T> = {};

    for (const part of parts) {
        const [rawKey, ...rest] = part.split(':');
        let key = rawKey.trim();
        const value = rest.join(':');

        if (config.aliases && config.aliases[key]) {
            key = config.aliases[key] as string;
        }

        if (value !== undefined && value !== '') {
            let v = value.toLowerCase();
            if (v == "true") {
                (obj as any)[key] = true;
            } else if (v == "false") {
                (obj as any)[key] = false;
            } else {
                (obj as any)[key] = value;
            }
        }
    }

    if (Object.keys(obj).length === 0 && fallback) {
        return fallback(obj, input);
    }

    return obj;
}

export const createCustomTemplate = <T>(
    obj: T,
    config: FieldConfig<T> = {},
    separator?: string): string => {
    return generateTemplate(obj, config, separator);
}

export const getUserSeparator = () => {
    return userPref.get(SEPARATOR_PREF_KEY.key, SEPARATOR_PREF_KEY.defaultValue);
};

export const setUserSeparator = (separator: string) => {
    userPref.set(SEPARATOR_PREF_KEY.key, separator);
};

export const resetUserSeparator = () => {
    userPref.remove(SEPARATOR_PREF_KEY.key);
};
