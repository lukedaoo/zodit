export interface Task {
    id: string;
    title: string;
    completed: boolean;
    description?: string;
    startTime?: string;
    startDate?: string;
    endDate?: string;
}

export interface Group {
    id: string;
    name: string;
    tasks: Task[];
}
