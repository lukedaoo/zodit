import { useCallback } from 'react';

interface UseNoteInteractionsProps {
    editingId: string | null;
    resizingId: string | null;
    setEditingId: (id: string | null) => void;
    setResizingId: (id: string | null) => void;
    setTopNoteId: (id: string | null) => void;
}

export const useNoteInteractions = ({
    editingId,
    resizingId,
    setEditingId,
    setResizingId,
    setTopNoteId,
}: UseNoteInteractionsProps) => {
    const toggleEdit = useCallback((id: string) => {
        setResizingId(null);

        if (editingId && editingId === id) {
            setEditingId(null);
        } else {
            setEditingId(id);
        }
        setTopNoteId(id);
    }, [editingId, resizingId, setEditingId, setResizingId, setTopNoteId]);

    const toggleResize = useCallback((id: string) => {
        setResizingId(resizingId === id ? null : id);
        setTopNoteId(id);
    }, [resizingId, setResizingId, setTopNoteId]);

    const handleBackgroundClick = useCallback(() => {
        if (resizingId) {
            setResizingId(null);
        }
    }, [resizingId, setResizingId]);

    return {
        toggleEdit,
        toggleResize,
        handleBackgroundClick,
    };
};
