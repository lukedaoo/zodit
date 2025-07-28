import { useState, useCallback, useMemo } from 'react';
import type { useTodo } from '../../useTodo';

interface UseTodoDateProps {
    getTodoByDate: ReturnType<typeof useTodo>['getTodoByDate'];
    loadTodo: ReturnType<typeof useTodo>['loadTodo'];
    createTodo: ReturnType<typeof useTodo>['createTodo'];
    buildHeatMapFromTaskDates: ReturnType<typeof useTodo>['buildHeatMapFromTaskDates'];
    todos: ReturnType<typeof useTodo>['todos'];
}

export const useTodoDate = ({
    getTodoByDate,
    loadTodo,
    createTodo,
    buildHeatMapFromTaskDates,
    todos
}: UseTodoDateProps) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const heatmapData = useMemo(() => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const monthString = `${year}-${month.toString().padStart(2, '0')}`;
            return buildHeatMapFromTaskDates(monthString);
        } catch (error) {
            console.error('Error building heatmap data:', error);
            return {};
        }
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
                const newTodo = createTodo(dateAsString);
                loadTodo(newTodo);
            }
        } catch (error) {
            console.error('Error changing date:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getTodoByDate, loadTodo, createTodo]);

    return {
        currentDate,
        isLoading,
        heatmapData,
        handleDateChange
    };
};
