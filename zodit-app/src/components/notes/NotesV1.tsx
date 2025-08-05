import { DndContext } from '@dnd-kit/core';
import { NoteCard } from './NoteCard';
import { AddNoteButton } from './AddNoteButton';
import { ArrangeButton } from './ArrangeButton';
import { EmptyState } from './EmptyState';
import { OverlappingDisplay } from './OverlappingDisplay';
import { useNotes } from './useNotes';
// import { useSharedNotes } from '@hooks/useSharedNotes';
// import { useEffect } from 'react';

const Notes = () => {
    const {
        notes,
        topNoteId,
        editingId,
        resizingId,
        overlappingGroups,
        addNote,
        deleteNote,
        updateNoteText,
        updateNoteSize,
        changeNoteColor,
        toggleNotePin,
        bringNoteToFront,
        arrangeInGrid,
        arrangeInStack,
        arrangeInCircle,
        arrangeRandomly,
        toggleEdit,
        toggleResize,
        handleBackgroundClick,
        handleDragEnd,
    } = useNotes();

    // const { updateNotes: updateSharedNotes } = useSharedNotes();
    //
    // useEffect(() => {
    //     // updateSharedNotes(notes);
    // }, [notes]);

    return (
        <div className="fixed inset-0 top-16 w-screen h-screen" style={{ backgroundColor: 'var(--color-background)', margin: 0, padding: 0 }}>
            <AddNoteButton onAddNote={addNote} />
            <ArrangeButton
                onArrangeGrid={arrangeInGrid}
                onArrangeStack={arrangeInStack}
                onArrangeCircle={arrangeInCircle}
                onArrangeRandom={arrangeRandomly}
            />
            <OverlappingDisplay overlappingGroups={overlappingGroups} />

            <div className="w-full h-full overflow-auto" onClick={handleBackgroundClick}>
                <div
                    className="relative"
                    style={{
                        width: '300vw',
                        height: '300vh',
                        minWidth: '3000px',
                        minHeight: '2000px'
                    }}
                >
                    <DndContext onDragEnd={handleDragEnd}>

                        {notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                isEditing={editingId === note.id}
                                isResizing={resizingId === note.id}
                                onToggleEdit={() => toggleEdit(note.id)}
                                onDelete={() => deleteNote(note.id)}
                                onUpdateText={(text) => updateNoteText(note.id, text)}
                                onChangeColor={() => changeNoteColor(note.id)}
                                onToggleResize={() => toggleResize(note.id)}
                                onTogglePin={() => toggleNotePin(note.id)}
                                onResize={(width, height) => updateNoteSize(note.id, width, height)}
                                topNoteId={topNoteId}
                                bringNoteToFront={bringNoteToFront}
                            />
                        ))}

                        {notes.length === 0 && <EmptyState />}
                    </DndContext>
                </div>
            </div>
        </div>
    );
};

export default Notes;
