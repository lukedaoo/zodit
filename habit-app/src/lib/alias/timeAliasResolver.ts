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
            resolved = new Date().toISOString().split('T')[0];
            break;
        case 'TOMORROW': {
            const tomorrow = new Date();
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
            const today = new Date().toISOString().split('T')[0];
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
