'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { generateMockTransactions } from '@/lib/aa/mock-aggregator';
import {
    Wallet,
    LayoutDashboard,
    Receipt,
    Lightbulb,
    Settings,
    Search,
    Filter,
    Download,
    UtensilsCrossed,
    ShoppingBag,
    Car,
    Film,
    CreditCard,
    ArrowUpDown,
    TrendingUp,
    CircleDollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: false },
    { icon: Receipt, label: 'Transactions', href: '/transactions', active: true },
    { icon: Lightbulb, label: 'Insights', href: '/insights', active: false },
    { icon: Settings, label: 'Settings', href: '/settings', active: false },
];

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
    FOOD: { icon: UtensilsCrossed, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Food & Dining' },
    SHOPPING: { icon: ShoppingBag, color: 'text-pink-600', bgColor: 'bg-pink-50', label: 'Shopping' },
    TRANSPORT: { icon: Car, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Transport' },
    BILLS: { icon: Receipt, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Bills' },
    ENTERTAINMENT: { icon: Film, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Entertainment' },
    SUBSCRIPTIONS: { icon: CreditCard, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Subscription' },
    TRANSFERS: { icon: ArrowUpDown, color: 'text-cyan-600', bgColor: 'bg-cyan-50', label: 'Transfer' },
    INCOME: { icon: Wallet, color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'Income' },
    INVESTMENTS: { icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Investment' },
    OTHER: { icon: CircleDollarSign, color: 'text-slate-600', bgColor: 'bg-slate-50', label: 'Other' },
};

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const mockTransactions = useMemo(() => generateMockTransactions(3), []);

    const filteredTransactions = useMemo(() => {
        return mockTransactions.filter(tx => {
            const matchesSearch = searchQuery === '' ||
                tx.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.narration.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || tx.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [mockTransactions, searchQuery, selectedCategory]);

    const groupedTransactions = useMemo(() => {
        const groups: Record<string, typeof filteredTransactions> = {};
        filteredTransactions.forEach(tx => {
            const dateKey = format(new Date(tx.transactionDate), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(tx);
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [filteredTransactions]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
    };

    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'Today';
        if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Yesterday';
        return format(date, 'EEEE, MMMM d');
    };

    const categories = Object.entries(CATEGORY_CONFIG);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                                <Wallet className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-foreground">Fold</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {NAV_ITEMS.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={item.active ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className={`gap-2 ${item.active ? 'bg-slate-100' : ''}`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-green-600 font-medium">Connected</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-6 py-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Page Title */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
                            <p className="text-muted-foreground">View and manage all your transactions</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={selectedCategory === null ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                            >
                                All
                            </Button>
                            {categories.slice(0, 5).map(([key, config]) => (
                                <Button
                                    key={key}
                                    variant={selectedCategory === key ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                                    className="gap-1"
                                >
                                    <config.icon className="h-3 w-3" />
                                    {config.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Transactions List */}
                    <Card className="border-border">
                        <CardContent className="p-0">
                            {groupedTransactions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No transactions found
                                </div>
                            ) : (
                                groupedTransactions.map(([date, transactions]) => (
                                    <div key={date}>
                                        <div className="px-6 py-3 bg-slate-50 border-b border-border">
                                            <h3 className="text-sm font-medium text-muted-foreground">
                                                {formatDateHeader(date)}
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {transactions.map((tx, i) => {
                                                const config = CATEGORY_CONFIG[tx.category || 'OTHER'] || CATEGORY_CONFIG.OTHER;
                                                const Icon = config.icon;
                                                const isCredit = tx.type === 'CREDIT';

                                                return (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: i * 0.02 }}
                                                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bgColor}`}>
                                                                <Icon className={`h-5 w-5 ${config.color}`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-foreground">{tx.merchant || 'Unknown'}</p>
                                                                <p className="text-sm text-muted-foreground">{tx.narration.substring(0, 40)}...</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0`}>
                                                                {config.label}
                                                            </Badge>
                                                            <span className={`font-semibold tabular-nums ${isCredit ? 'text-green-600' : 'text-foreground'}`}>
                                                                {isCredit ? '+' : '-'}₹{formatCurrency(tx.amount)}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
