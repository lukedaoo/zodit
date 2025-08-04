import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
    USE_TEMPLATE_WHEN_ADDING_TASK,
    USER_THEME,
    GROUP_COLLAPSE_THRESHOLD,
    TASK_COLLAPSE_THRESHOLD,
    DEBOUNCE_TIME
} from '@user-prefs/const';
import {
    useUserSettings
} from '@hooks/useUserSettings';

import { MantineProvider } from '@mantine/core';

import './App.css';
import HomePage from '@pages/HomePage';
import ThemePage from '@pages/ThemePage';
import TodoPage from '@pages/TodoPage';
import NotesPage from '@pages/NotePage';

const App: React.FC = () => {

    const { set } = useUserSettings();

    // set(SEPARATOR_PREF_KEY, SEPARATOR_PREF_KEY.defaultValue);
    set(DEBOUNCE_TIME, DEBOUNCE_TIME.defaultValue);
    set(USE_TEMPLATE_WHEN_ADDING_TASK, true);
    set(USER_THEME, USER_THEME.defaultValue);
    set(GROUP_COLLAPSE_THRESHOLD, GROUP_COLLAPSE_THRESHOLD.defaultValue);
    set(TASK_COLLAPSE_THRESHOLD, TASK_COLLAPSE_THRESHOLD.defaultValue);

    return (
        <MantineProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    {
                        !import.meta.env.PROD &&
                        <Route path="/theme" element={<ThemePage />} />
                    }
                    <Route path="/todo" element={<TodoPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                </Routes>
            </BrowserRouter>
        </MantineProvider>
    )
};

export default App;
