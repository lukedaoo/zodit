export interface ExportData {
    version: string;
    exportDate: string;
    todos: any[];
    notes?: any[];
    metadata?: {
        totalTodos: number;
        totalGroups: number;
        totalTasks: number;
    };
}

export const makeExportData = (todos: any[], notes: any[] = []): ExportData => {
    const exportData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        todos,
        notes,
        metadata: {
            totalTodos: todos.length,
            totalGroups: todos.reduce((acc, todo) => acc + (todo.groups?.length || 0), 0),
            totalTasks: todos.reduce((acc, todo) =>
                acc + (todo.groups?.reduce((groupAcc: number, group: any) =>
                    groupAcc + (group.tasks?.length || 0), 0) || 0), 0
            )
        }
    };
    return exportData;
};

export const downloadJsonFile = (data: any, filename: string = 'todo-export.json') => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const uploadJsonFile = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        };

        input.click();
    });
};

export const validateImportData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
        errors.push('Invalid data format');
        return { isValid: false, errors };
    }

    if (!data.todos || !Array.isArray(data.todos)) {
        errors.push('Missing or invalid todos array');
    }

    if (data.version && typeof data.version !== 'string') {
        errors.push('Invalid version format');
    }

    // Validate todo structure
    if (data.todos && Array.isArray(data.todos)) {
        data.todos.forEach((todo: any, index: number) => {
            if (!todo.id) {
                errors.push(`Todo at index ${index} missing id`);
            }
            if (todo.groups && !Array.isArray(todo.groups)) {
                errors.push(`Todo at index ${index} has invalid groups format`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
