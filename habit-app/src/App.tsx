import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './Home';
import Theme from './Theme';

const App: React.FC = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/theme" element={<Theme />} />
        </Routes>
    </BrowserRouter>
);

export default App;
