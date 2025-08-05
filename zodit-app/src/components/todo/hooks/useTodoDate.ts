import { useState, useCallback, useMemo, useEffect } from 'react';
import { now, convert } from '@common/utils';
import type { Todo } from '../types';

interface UseTodoDateProps {
    getTodoByDate: (date: string) => Todo | undefined;
    loadTodo: (todo: Todo | undefined) => void;
    createTodo: (date: string) => Todo | undefined;
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
    const [currentDate, setCurrentDate] = useState<Date>(now());

    const heatmapData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const monthString = `${year}-${month.toString().padStart(2, '0')}`;
        return buildHeatMapFromTaskDates(monthString);
    }, [currentDate, todos, buildHeatMapFromTaskDates]);

    const handleDateChange = useCallback(async (date: Date) => {
        setCurrentDate(date);

        const dateAsString = convert(date);
        const existingTodo = getTodoByDate(dateAsString);
        if (existingTodo) {
            loadTodo(existingTodo);
        } else {
            loadTodo(undefined);
        }
    }, [createTodo, getTodoByDate, loadTodo]);

    useEffect(() => {
        if (isInitialized) {
            handleDateChange(currentDate);
        }
    }, [isInitialized]);

    return {
        currentDate,
        heatmapData,
        handleDateChange
    };
};
