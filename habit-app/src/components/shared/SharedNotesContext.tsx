import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Note } from '@components/notes/types';

interface SharedNotesContextType {
    allNotes: Note[];
    pinnedNotes: Note[];
    updateNotes: (notes: Note[]) => void;
    getPinnedNotes: () => Note[];
}

const SharedNotesContext = createContext<SharedNotesContextType | undefined>(undefined);

interface SharedNotesProviderProps {
    children: React.ReactNode;
}

export const SharedNotesProvider = ({ children }: SharedNotesProviderProps) => {
    const [allNotes, setAllNotes] = useState<Note[]>([]);

    // Load notes from localStorage on initialization
    useEffect(() => {
        const savedNotes = localStorage.getItem('shared-notes');
        if (savedNotes) {
            try {
                const notes = JSON.parse(savedNotes);
                setAllNotes(notes);
            } catch (error) {
                console.error('Error loading shared notes:', error);
            }
        }
    }, []);

    // Save notes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('shared-notes', JSON.stringify(allNotes));
    }, [allNotes]);

    const updateNotes = (notes: Note[]) => {
        setAllNotes(notes);
    };

    const getPinnedNotes = () => {
        return allNotes.filter(note => note.isPinned === true);
    };

    const pinnedNotes = getPinnedNotes();

    const value: SharedNotesContextType = {
        allNotes,
        pinnedNotes,
        updateNotes,
        getPinnedNotes,
    };

    return (
        <SharedNotesContext.Provider value={value}>
            {children}
        </SharedNotesContext.Provider>
    );
};

export const useSharedNotes = () => {
    const context = useContext(SharedNotesContext);
    if (context === undefined) {
        throw new Error('useSharedNotes must be used within a SharedNotesProvider');
    }
    return context;
};
