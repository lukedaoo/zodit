import React, { useState } from 'react';
import '../App.css';
import { SwitchTheme } from '@components/gadget/SwitchTheme';
import { TodoV1, TodoV2 } from '@components/todo';

const HomePage: React.FC = () => {
    const [version, setVersion] = useState<'v1' | 'v2'>('v1');
    const TodoComponent = version === 'v1' ? TodoV1 : TodoV2;

    return (
        <div className="min-h-screen p-8">
            <div className="flex justify-end">
                <SwitchTheme />
            </div>
            <label className="block mb-2 font-semibold">
                Select version:
                <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value as 'v1' | 'v2')}
                    className="block mt-1 w-48 rounded border border-gray-300 bg-white px-3 py-2 text-gray-800
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option className="bg-white-100 text-black-900" value="v1">
                        Version 1
                    </option>
                    <option className="bg-white-100 text-black-900" value="v2">
                        Version 2
                    </option>
                </select>
            </label>

            <hr />

            {/* Render chosen version */}
            <TodoComponent />
        </div>
    )
};

export default HomePage;
