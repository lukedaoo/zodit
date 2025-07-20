import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TodoApp from './ToDoApp.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TodoApp />
    </StrictMode>,
)
