import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { DataProviderProvider } from './context/DataProviderContext'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <DataProviderProvider>
            <App />
        </DataProviderProvider>
    </StrictMode>,
)
