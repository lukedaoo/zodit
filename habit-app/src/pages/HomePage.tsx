import React, { useState } from 'react';
import '../App.css';
import { SwitchTheme } from '@components/gadget/SwitchTheme';
import { TodoV1, TodoV2 } from '@components/todo';

const HomePage: React.FC = () => {
    const [version, _] = useState<'v1' | 'v2'>('v2');
    const TodoComponent = version === 'v1' ? TodoV1 : TodoV2;

    return (
        <div className="min-h-screen p-8">
            <div className="flex justify-end">
                <SwitchTheme />
            </div>
            <TodoComponent />
        </div>
    )
};

export default HomePage;
