import { useState } from 'react';
// import { Search, User, LogOut } from 'lucide-react';
import { Search } from 'lucide-react';
import { SwitchTheme } from './SwitchTheme';

interface NavbarProps {
    // onLogout?: () => void;
    // userName?: string;
    onNavigate?: (tab: 'dashboard' | 'todo' | 'notes') => void;
    activeTab?: 'dashboard' | 'todo' | 'notes';
}

export const Navbar = ({ onNavigate, activeTab }: NavbarProps) => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleTabClick = (tab: 'dashboard' | 'todo' | 'notes') => {
        if (onNavigate) {
            onNavigate(tab);
        }
    };

    // const handleLogout = () => {
    //     if (onLogout) {
    //         onLogout();
    //     } else {
    //         alert('Logout functionality would be implemented here');
    //     }
    // };
    //
    // const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="w-full fixed top-0 left-0 right-0 z-50">
            <nav className="navbar px-6 py-4 flex items-center justify-end w-full">
                <div className="flex items-center gap-4">
                    {/* Search Icon */}
                    <button
                        className="search-btn p-2 rounded-md transition-all duration-200 hover:scale-105"
                        onClick={() => console.log('Search clicked')}
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-1">
                        <button
                            className={`nav-item px-4 py-2 rounded-md font-medium text-sm border-b-2 border-transparent ${activeTab === 'dashboard' ? 'active' : ''
                                }`}
                            onClick={() => handleTabClick('dashboard')}
                        >
                            Dashboard
                        </button>

                        <button
                            className={`nav-item px-4 py-2 rounded-md font-medium text-sm border-b-2 border-transparent ${activeTab === 'todo' ? 'active' : ''
                                }`}
                            onClick={() => handleTabClick('todo')}
                        >
                            To Do
                        </button>

                        <button
                            className={`nav-item px-4 py-2 rounded-md font-medium text-sm border-b-2 border-transparent ${activeTab === 'notes' ? 'active' : ''
                                }`}
                            onClick={() => handleTabClick('notes')}
                        >
                            Notes
                        </button>
                    </div>

                    {/* Theme Toggle */}
                    <SwitchTheme />

                    {/* User Avatar */}
                    {/* 
                    <div className="relative">
                        <button
                            className="user-avatar w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 hover:scale-105"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            aria-label="User menu"
                        >
                            {userInitial}
                        </button>

                        {showUserMenu && (
                            <div className="user-menu absolute right-0 mt-2 w-48 rounded-md py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-600">
                                    <p className="user-menu-item text-sm font-medium">{userName}</p>
                                    <p className="text-xs text-gray-400">user@example.com</p>
                                </div>
                                <button
                                    className="user-menu-item w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2"
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        console.log('Profile clicked');
                                    }}
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </button>
                                <button
                                    className="user-menu-item w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2"
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        console.log('Settings clicked');
                                    }}
                                >
                                    Settings
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className="btn btn-outline btn-sm flex items-center gap-2 hover:scale-105 transition-all duration-200"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                */}
                </div>
            </nav>

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}

        </div>
    );
};
// {/* Demo Content */}
// <div className="pt-20 p-6">
//     <div className="card p-6">
//         <h2 className="text-xl font-semibold mb-4 text-primary">
//             {activeTab === 'dashboard' ? 'Dashboard' : 'To Do'} Content
//         </h2>
//         <p className="text-muted-foreground">
//             This is the {activeTab} page content. The navbar uses your custom CSS variables and styling.
//         </p>
//
//         <div className="mt-4 flex gap-2">
//             <span className="badge badge-primary">Primary Badge</span>
//             <span className="badge badge-outline">Outline Badge</span>
//             <span className="badge badge-success">Success Badge</span>
//         </div>
//     </div>
// </div>
