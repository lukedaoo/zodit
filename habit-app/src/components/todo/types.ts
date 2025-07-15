export interface Task {
    id: string;
    title: string;
    completed: boolean;
}

export interface Group {
    id: string;
    name: string;
    tasks: Task[];
}
