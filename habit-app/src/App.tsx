import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
    SEPARATOR_PREF_KEY,
    USE_TEMPLATE_WHEN_ADDING_TASK,
    USER_THEME,
    GROUP_COLLAPSE_THRESHOLD,
    TASK_COLLAPSE_THRESHOLD
} from '@user-prefs/const';
import {
    useUserSettings
} from '@hooks/useUserSettings';

import { MantineProvider } from '@mantine/core';

import './App.css';
import HomePage from '@pages/HomePage';
import ThemePage from '@pages/ThemePage';
import TodoPage from '@pages/TodoPage';

const App: React.FC = () => {

    const { set } = useUserSettings();

    set(SEPARATOR_PREF_KEY, SEPARATOR_PREF_KEY.defaultValue);
    set(USE_TEMPLATE_WHEN_ADDING_TASK, true);
    set(USER_THEME, USER_THEME.defaultValue);
    set(GROUP_COLLAPSE_THRESHOLD, GROUP_COLLAPSE_THRESHOLD.defaultValue);
    set(TASK_COLLAPSE_THRESHOLD, TASK_COLLAPSE_THRESHOLD.defaultValue);

    return (
        <MantineProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/theme" element={<ThemePage />} />
                    <Route path="/to-do" element={<TodoPage />} />
                </Routes>
            </BrowserRouter>
        </MantineProvider>
    )
};

export default App;
