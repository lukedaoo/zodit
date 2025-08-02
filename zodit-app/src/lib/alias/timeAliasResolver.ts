import { now, getToday } from '@common/utils';
interface Alias {
    id: string;
    alias: string;
    value: string; // Can be a date string, time string, or special value
    type: 'date' | 'time' | 'datetime';
    description?: string;
}

export const DEFAULT_ALIASES: Alias[] = [
    { id: '1', alias: 'today', value: 'TODAY', type: 'date', description: 'Current date' },
    { id: '2', alias: 'tomorrow', value: 'TOMORROW', type: 'date', description: 'Next day' },
    { id: '3', alias: 'tmr', value: 'TOMORROW', type: 'date', description: 'Next day (short)' },
    { id: '4', alias: 'now', value: 'NOW', type: 'time', description: 'Current time' },
    { id: '5', alias: 'eod', value: 'EOD', type: 'time', description: 'End of day' },
    { id: '6', alias: 'midnight', value: '00:00', type: 'time', description: 'Midnight' },
    { id: '7', alias: 'noon', value: '12:00', type: 'time', description: 'Noon' },
];

export const resolveAlias = (input: string, aliases: Alias[] = DEFAULT_ALIASES): { alias: string; resolved: any; } | string | undefined => {
    const trimmed = input.trim();
    if (!trimmed) return undefined;

    const alias = aliases.find(a => a.alias.toLowerCase() === trimmed.toLowerCase());
    if (!alias) {
        return trimmed;
    }
    let resolved: any;

    switch (alias.value) {
        case 'TODAY':
            resolved = getToday();
            break;
        case 'TOMORROW': {
            const tomorrow = now();
            tomorrow.setDate(tomorrow.getDate() + 1);
            resolved = tomorrow.toISOString().split('T')[0];
            break;
        }
        case 'NOW':
            resolved = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
            });
            break;
        case 'EOD': {
            const today = now();
            resolved = { at: '23:59', date: today };
            break;
        }
        default:
            resolved = alias.value;
    }

    return {
        alias: alias.alias,
        resolved
    };
};

const deepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every(key => deepEqual(a[key], b[key]));
    }

    return false;
};

export const validateAlias = (
    input: { alias: string; resolved: any },
    aliases: Alias[] = DEFAULT_ALIASES
): { isAligned: boolean; alias: string; resolved: any; } => {
    const { alias, resolved } = input;

    const aliasDefinition = aliases.find(a => a.alias.toLowerCase() === alias.toLowerCase());

    if (!aliasDefinition) {
        return {
            isAligned: true,
            alias,
            resolved: resolved
        }
    }

    const currentResult = resolveAlias(alias, aliases);

    // If resolveAlias returns a string, it means the alias wasn't found or returned the input
    // If it returns an object, extract the resolved value
    const currentResolution = typeof currentResult === 'object' && currentResult !== null
        ? currentResult.resolved
        : currentResult;

    // Compare resolved value with current resolution
    const isAligned = deepEqual(resolved, currentResolution);

    if (isAligned) {
        // Still valid - return current resolved value
        return {
            isAligned,
            alias,
            resolved: currentResolution
        };
    } else {
        return {
            isAligned,
            alias,
            resolved: resolved
        };
    }
};

type AliasWrapper<T = any> = {
    alias: string;
    resolved: T;
};

function unwrapField(
    value: any,
    objResolver?: (data: any) => any
): any {
    if (
        value &&
        typeof value === 'object' &&
        'alias' in value &&
        'resolved' in value
    ) {
        const data = (value as AliasWrapper).resolved;

        if (
            typeof data === 'string' ||
            typeof data === 'number' ||
            typeof data === 'boolean'
        ) {
            return data;
        }

        if (typeof data === 'object' && data !== null) {
            return objResolver
                ? objResolver(data)
                : Object.values(data).join(' ');
        }

        return data;
    }

    return value;
}

export const unwrapAlias = <T extends object>(
    input: T,
    fieldsToUnwrap: {
        field: keyof T;
        resolver?: (data: any) => any;
    }[]
): T => {
    const result = { ...input };

    for (const { field, resolver } of fieldsToUnwrap) {
        const value = input[field];
        if (value && result[field]) {
            result[field] = unwrapField(value, resolver);
        }
    }

    return result;
};
