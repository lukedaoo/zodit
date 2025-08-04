import React, { useState } from 'react';
import '../App.css';
import { NotesV1 } from '@components/notes';

const NotePage: React.FC = () => {
    const [version, setVersion] = useState<'v1' | 'v2'>('v1');
    const NoteComponent = version === 'v1' ? NotesV1 : null;

    return (
        <div className="min-h-screen p-8">
            <label>
                Select version:
                <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value as 'v1' | 'v2')}
                >
                    <option value="v1">Version 1</option>
                </select>
            </label>

            <hr />

            {/* Render chosen version */}
            {NoteComponent && <NoteComponent />}
        </div>
    )
};

export default NotePage;
