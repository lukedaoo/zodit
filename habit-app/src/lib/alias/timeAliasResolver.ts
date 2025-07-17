interface TimeAlias {
    id: string;
    alias: string;
    value: string; // Can be a date string, time string, or special value
    type: 'date' | 'time' | 'datetime';
    description?: string;
}

export const DEFAULT_ALIASES: TimeAlias[] = [
    { id: '1', alias: 'today', value: 'TODAY', type: 'date', description: 'Current date' },
    { id: '2', alias: 'tomorrow', value: 'TOMORROW', type: 'date', description: 'Next day' },
    { id: '3', alias: 'tmr', value: 'TOMORROW', type: 'date', description: 'Next day (short)' },
    { id: '4', alias: 'now', value: 'NOW', type: 'time', description: 'Current time' },
    { id: '5', alias: 'eod', value: 'EOD', type: 'time', description: 'End of day' },
    { id: '6', alias: 'midnight', value: '00:00', type: 'time', description: 'Midnight' },
    { id: '7', alias: 'noon', value: '12:00', type: 'time', description: 'Noon' },
];

export const resolveAlias = (input: string, aliases: TimeAlias[]): string => {
    const alias = aliases.find(a => a.alias.toLowerCase() === input.trim().toLowerCase());
    if (!alias) return input;

    switch (alias.value) {
        case 'TODAY':
            return new Date().toISOString().split('T')[0];
        case 'TOMORROW':
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        case 'NOW':
            return new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'EOD':
            const today = new Date().toISOString().split('T')[0];
            return '23:59 ' + today;
        default:
            return alias.value;
    }
};

