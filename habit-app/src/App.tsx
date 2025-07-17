import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
    SEPARATOR_PREF_KEY,
    USE_TEMPLATE_WHEN_ADDING_TASK
} from '@user-prefs/const';
import {
    useUserSettings
} from '@hooks/useUserSettings';

import HomePage from '@pages/HomePage';
import ThemePage from '@pages/ThemePage';
import TodoPage from '@pages/TodoPage';

const App: React.FC = () => {

    const { set } = useUserSettings();

    set(SEPARATOR_PREF_KEY, SEPARATOR_PREF_KEY.defaultValue);
    set(USE_TEMPLATE_WHEN_ADDING_TASK, true);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/theme" element={<ThemePage />} />
                <Route path="/to-do" element={<TodoPage />} />
            </Routes>
        </BrowserRouter>
    )
};

export default App;
