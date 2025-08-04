import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NotesApp from './NotesApp.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <NotesApp />
    </StrictMode>,
)
