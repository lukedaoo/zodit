import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import ThemePage from './pages/ThemePage';
import TodoPage from './pages/TodoPage';

const App: React.FC = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/theme" element={<ThemePage />} />
            <Route path="/to-do" element={<TodoPage />} />
        </Routes>
    </BrowserRouter>
);

export default App;
