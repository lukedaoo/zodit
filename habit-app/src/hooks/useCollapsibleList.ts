import { useState, useMemo } from 'react';

export function useCollapsibleList<T>(items: T[], threshold: number) {
    const [expanded, setExpanded] = useState(false);

    const shouldCollapse = items.length > threshold;

    const visibleItems = useMemo(
        () => {
            return expanded || !shouldCollapse
                ? items
                : items.slice(0, threshold)
        }, [expanded, shouldCollapse, items, threshold]);

    const toggle = () => setExpanded(!expanded);

    return {
        visibleItems,
        expanded,
        shouldCollapse,
        toggle
    };
}
