import React, { useState } from 'react';
import { TodoV1, TodoV2 } from '@components/todo';
import { NotesV1, NotesV2 } from '@components/notes';
import { Navbar } from '@components/gadget/NavBar';
import { ScrollButton } from "@components/gadget/ScrollButton";

const HomePage: React.FC = () => {
    const [version, _] = useState<'v1' | 'v2'>('v2');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'todo' | 'notes'>('dashboard');

    const TodoComponent = version === 'v1' ? TodoV1 : TodoV2;
    const NotesComponent = version === 'v1' ? NotesV1 : NotesV2;

    const handleNavigation = (tab: 'dashboard' | 'todo' | 'notes') => {
        setActiveTab(tab);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'todo':
                return <TodoComponent />;
            case 'notes':
                return <NotesComponent />;
            case 'dashboard':
            default:
                return (
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold mb-4 text-primary">Dashboard</h2>
                        <p className="text-muted-foreground">
                            Welcome to your dashboard. Switch to "To Do" to see your tasks.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar
                onNavigate={handleNavigation}
                activeTab={activeTab}
            />
            <ScrollButton />
            <div className="p-6 pt-24">
                <div className="max-w-3xl mx-auto"> {/* Add negative margin */}
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
