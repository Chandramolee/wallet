
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Wallet,
    LayoutDashboard,
    Receipt,
    Lightbulb,
    Settings,
    FileText,
    Menu,
    X
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Receipt, label: 'Transactions', href: '/transactions' },
    { icon: FileText, label: 'Reports', href: '/reports' },
    { icon: Lightbulb, label: 'Insights', href: '/insights' },
    { icon: Settings, label: 'Settings', href: '/settings/account' },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-foreground">Fold</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Button
                                    key={item.href}
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={`gap-2 ${isActive ? 'bg-slate-100' : ''}`}
                                    asChild
                                >
                                    <Link href={item.href}>
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" />

                    {/* Mobile Nav */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <div className="flex flex-col gap-4 mt-8">
                                    {NAV_ITEMS.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                        return (
                                            <Button
                                                key={item.href}
                                                variant={isActive ? 'secondary' : 'ghost'}
                                                className={`justify-start gap-4 h-12 text-lg ${isActive ? 'bg-slate-100' : ''}`}
                                                asChild
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Link href={item.href}>
                                                    <item.icon className="h-5 w-5" />
                                                    {item.label}
                                                </Link>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
