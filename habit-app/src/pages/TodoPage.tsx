import React, { useState } from 'react';
import '../App.css';
import { TodoV1, TodoV2 } from '@components/todo';

const HomePage: React.FC = () => {
    const [version, setVersion] = useState<'v1' | 'v2'>('v1');
    const TodoComponent = version === 'v1' ? TodoV1 : TodoV2;

    return (
        <div className="min-h-screen p-8">
            <label>
                Select version:
                <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value as 'v1' | 'v2')}
                >
                    <option value="v1">Version 1</option>
                    <option value="v2">Version 2</option>
                </select>
            </label>

            <hr />

            {/* Render chosen version */}
            <TodoComponent />
        </div>
    )
};

export default HomePage;
