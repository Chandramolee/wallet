
import React from 'react';
import Link from 'next/link';

const settingsNav = [
    { title: 'Account', href: '/settings/account' },
    { title: 'Appearance', href: '/settings/appearance' },
    { title: 'Billing', href: '/settings/billing' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="container mx-auto py-10 px-4 md:px-0">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64">
                    <nav className="flex flex-col gap-1">
                        {settingsNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-4 py-2 rounded-md hover:bg-secondary text-sm font-medium transition-colors"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
