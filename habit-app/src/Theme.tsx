import React, { useState } from 'react';
import './App.css';

const Theme: React.FC = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [inputValue, setInputValue] = useState('');

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        if (newTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    return (
        <div className="min-h-screen p-8 space-y-8">
            {/* Theme Toggle */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Custom Theme Examples</h1>
                <button
                    onClick={toggleTheme}
                    className="btn btn-outline btn-md"
                >
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
            </div>

            {/* Button Examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Button Examples</h2>
                <div className="flex flex-wrap gap-4">
                    <button className="btn btn-primary btn-sm">Small Primary</button>
                    <button className="btn btn-primary btn-md">Medium Primary</button>
                    <button className="btn btn-primary btn-lg">Large Primary</button>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button className="btn btn-secondary btn-md">Secondary</button>
                    <button className="btn btn-accent btn-md">Accent</button>
                    <button className="btn btn-outline btn-md">Outline</button>
                    <button className="btn btn-ghost btn-md">Ghost</button>
                    <button className="btn btn-destructive btn-md">Destructive</button>
                </div>
            </section>

            {/* Card Examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Card Examples</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Basic Card</h3>
                            <p className="card-description">
                                This is a basic card with header, content, and footer
                            </p>
                        </div>
                        <div className="card-content">
                            <p>Card content goes here. This demonstrates the dark theme with proper contrast.</p>
                        </div>
                        <div className="card-footer">
                            <button className="btn btn-primary btn-sm">Action</button>
                            <button className="btn btn-ghost btn-sm ml-2">Cancel</button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Stats Card</h3>
                            <p className="card-description">Sample statistics card</p>
                        </div>
                        <div className="card-content">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-2xl font-bold text-primary">1,234</p>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-success">+12%</p>
                                    <p className="text-sm text-muted-foreground">Growth</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Input Examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Input Examples</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="input focus-primary"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="input focus-accent"
                        />
                    </div>
                </div>
            </section>

            {/* Badge Examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Badge Examples</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-primary">Primary</span>
                    <span className="badge badge-secondary">Secondary</span>
                    <span className="badge badge-success">Success</span>
                    <span className="badge badge-warning">Warning</span>
                    <span className="badge badge-error">Error</span>
                    <span className="badge badge-outline">Outline</span>
                </div>
            </section>

            {/* Typography Examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Typography Examples</h2>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold">Heading 1</h1>
                    <h2 className="text-3xl font-semibold">Heading 2</h2>
                    <h3 className="text-2xl font-medium">Heading 3</h3>
                    <p className="text-base">
                        This is regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        This is smaller muted text, perfect for descriptions or secondary information.
                    </p>
                    <p className="text-primary">Text with primary color</p>
                    <p className="text-secondary">Text with secondary color</p>
                    <p className="text-accent">Text with accent color</p>
                    <p className="text-success">Success text</p>
                    <p className="text-warning">Warning text</p>
                    <p className="text-error">Error text</p>
                </div>
            </section>

            {/* Layout Examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Layout Examples</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-primary/10 border border-primary p-4 rounded-lg">
                        <h4 className="font-semibold text-primary">Primary Section</h4>
                        <p className="text-sm mt-2">Content with primary background</p>
                    </div>
                    <div className="bg-secondary/10 border border-secondary p-4 rounded-lg">
                        <h4 className="font-semibold text-secondary">Secondary Section</h4>
                        <p className="text-sm mt-2">Content with secondary background</p>
                    </div>
                    <div className="bg-accent/10 border border-accent p-4 rounded-lg">
                        <h4 className="font-semibold text-accent">Accent Section</h4>
                        <p className="text-sm mt-2">Content with accent background</p>
                    </div>
                </div>
            </section>

            {/* Interactive Examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Interactive Examples</h2>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">User Profile</h3>
                        <p className="card-description">Manage your profile settings</p>
                    </div>
                    <div className="card-content space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xl">JD</span>
                            </div>
                            <div>
                                <h4 className="font-semibold">John Doe</h4>
                                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                                <div className="flex space-x-2 mt-2">
                                    <span className="badge badge-primary">Admin</span>
                                    <span className="badge badge-success">Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bio</label>
                            <textarea
                                className="input min-h-[80px] resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>
                    <div className="card-footer">
                        <button className="btn btn-primary btn-md">Save Changes</button>
                        <button className="btn btn-outline btn-md ml-2">Cancel</button>
                    </div>
                </div>
            </section>

            {/* Color Palette Display */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Color Palette</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <div className="w-full h-16 bg-primary rounded-lg"></div>
                        <p className="text-sm font-medium">Primary (#B03060)</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-full h-16 bg-secondary rounded-lg"></div>
                        <p className="text-sm font-medium">Secondary</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-full h-16 bg-success rounded-lg"></div>
                        <p className="text-sm font-medium">Success</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-full h-16 bg-error rounded-lg"></div>
                        <p className="text-sm font-medium">Error</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Theme;
