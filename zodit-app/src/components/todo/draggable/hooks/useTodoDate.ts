import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Todo } from '../../types';

interface UseTodoDateProps {
    getTodoByDate: (date: string) => Todo | undefined;
    loadTodo: (todo: Todo) => void;
    createTodo: (date: string) => Todo;
    buildHeatMapFromTaskDates: (month: string) => Record<string, number>;
    todos: Todo[];
    isInitialized: boolean;
}

export const useTodoDate = ({
    getTodoByDate,
    loadTodo,
    createTodo,
    buildHeatMapFromTaskDates,
    todos,
    isInitialized
}: UseTodoDateProps) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const heatmapData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const monthString = `${year}-${month.toString().padStart(2, '0')}`;
        return buildHeatMapFromTaskDates(monthString);
    }, [currentDate, todos, buildHeatMapFromTaskDates]);

    const handleDateChange = useCallback(async (date: Date) => {
        try {
            setIsLoading(true);
            setCurrentDate(date);

            const dateAsString = date.toISOString().split('T')[0];
            const existingTodo = getTodoByDate(dateAsString);
            if (existingTodo) {
                loadTodo(existingTodo);
            } else {
                const todo = createTodo(dateAsString);
                loadTodo(todo);
            }
        } finally {
            setIsLoading(false);
        }
    }, [createTodo, getTodoByDate, loadTodo]);

    useEffect(() => {
        if (isInitialized) {
            handleDateChange(currentDate);
        }
    }, [isInitialized]);

    return {
        currentDate,
        isLoading,
        heatmapData,
        handleDateChange
    };
};
