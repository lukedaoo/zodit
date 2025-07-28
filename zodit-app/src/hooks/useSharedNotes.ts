import { useState, useEffect } from 'react';
import type { Note } from '@components/notes/types';

const SHARED_NOTES_KEY = 'app-shared-notes';

export const useSharedNotes = () => {
    const [allNotes, setAllNotes] = useState<Note[]>([]);

    // Load notes from localStorage on initialization
    useEffect(() => {
        const loadNotes = () => {
            const savedNotes = localStorage.getItem(SHARED_NOTES_KEY);
            if (savedNotes) {
                try {
                    const notes = JSON.parse(savedNotes);
                    setAllNotes(notes);
                } catch (error) {
                    console.error('Error loading shared notes:', error);
                }
            }
        };

        loadNotes();

        // Listen for storage changes (when notes are updated in another tab/component)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === SHARED_NOTES_KEY) {
                loadNotes();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events (for same-tab updates)
        const handleNotesUpdate = () => {
            loadNotes();
        };

        window.addEventListener('shared-notes-updated', handleNotesUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('shared-notes-updated', handleNotesUpdate);
        };
    }, []);

    const updateNotes = (notes: Note[]) => {
        setAllNotes(notes);
        localStorage.setItem(SHARED_NOTES_KEY, JSON.stringify(notes));

        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('shared-notes-updated'));
    };

    const getPinnedNotes = () => {
        return allNotes.filter(note => note.isPinned === true);
    };

    const pinnedNotes = getPinnedNotes();

    return {
        allNotes,
        pinnedNotes,
        updateNotes,
        getPinnedNotes,
    };
};
