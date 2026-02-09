'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { NetWorthCard, BalanceTrendChart, SpendingDonut } from '@/components/dashboard';
import { TransactionList } from '@/components/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    Wallet,
    LayoutDashboard,
    Receipt,
    Lightbulb,
    Settings,
    Plus,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { UserButton, useUser } from '@clerk/nextjs';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: Receipt, label: 'Transactions', href: '/transactions', active: false },
    { icon: Lightbulb, label: 'Insights', href: '/insights', active: false },
    { icon: Settings, label: 'Settings', href: '/settings', active: false },
];

export default function DashboardPage() {
    const { user, isLoaded } = useUser();

    // Calculate metrics
    const thisMonthTransactions = mockTransactions.filter((tx) => {
        const txDate = new Date(tx.transactionDate);
        const now = new Date();
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    });

    const lastMonthTransactions = mockTransactions.filter((tx) => {
        const txDate = new Date(tx.transactionDate);
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
    });

    const thisMonthIncome = thisMonthTransactions
        .filter((tx) => tx.type === 'CREDIT')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const thisMonthExpenses = thisMonthTransactions
        .filter((tx) => tx.type === 'DEBIT')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
        .filter((tx) => tx.type === 'DEBIT')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const savings = thisMonthIncome - thisMonthExpenses;
    const expenseChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100) : 0;

    // Spending by category
    const spendingByCategory = useMemo(() => {
        const categories: Record<string, { name: string; value: number; color: string }> = {};
        const colors: Record<string, string> = {
            FOOD: '#f97316',
            SHOPPING: '#ec4899',
            TRANSPORT: '#3b82f6',
            BILLS: '#eab308',
            ENTERTAINMENT: '#a855f7',
            SUBSCRIPTIONS: '#ef4444',
            TRANSFERS: '#06b6d4',
            INVESTMENTS: '#22c55e',
            OTHER: '#71717a',
        };
        const labels: Record<string, string> = {
            FOOD: 'Food & Drinks',
            SHOPPING: 'Shopping',
            TRANSPORT: 'Transport',
            BILLS: 'Bills',
            ENTERTAINMENT: 'Entertainment',
            SUBSCRIPTIONS: 'Subscriptions',
            TRANSFERS: 'Transfers',
            INVESTMENTS: 'Investments',
            OTHER: 'Other',
        };

        thisMonthTransactions
            .filter((tx) => tx.type === 'DEBIT')
            .forEach((tx) => {
                const cat = tx.category || 'OTHER';
                if (!categories[cat]) {
                    categories[cat] = { name: labels[cat] || cat, value: 0, color: colors[cat] || '#71717a' };
                }
                categories[cat].value += tx.amount;
            });

        return Object.values(categories).sort((a, b) => b.value - a.value);
    }, [thisMonthTransactions]);

    const recentTransactions = mockTransactions.slice(0, 5).map((tx) => ({
        merchant: tx.merchant || 'Unknown',
        amount: tx.amount,
        type: tx.type,
        category: (tx.category || 'OTHER') as any,
        transactionDate: tx.transactionDate,
        narration: tx.narration,
    }));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                                <Wallet className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-foreground">Fold</span>
                        </div>

                        {/* Navigation */}
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

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <UserButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-6 py-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    {/* Greeting */}
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {isLoaded && user ? `Welcome back, ${user.firstName}` : 'Good afternoon'}
                        </h1>
                        <p className="text-muted-foreground">Here&apos;s an overview of your finances</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        {[
                            { label: 'Total Balance', value: formatCurrency(mockAccount.balance), change: '+12.5%', positive: true, color: 'text-foreground' },
                            { label: 'Income', value: formatCurrency(thisMonthIncome), change: '+8.2%', positive: true, color: 'text-green-600' },
                            { label: 'Expenses', value: formatCurrency(thisMonthExpenses), change: `${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}%`, positive: expenseChange < 0, color: 'text-red-500' },
                            { label: 'Savings', value: formatCurrency(savings), change: '+15.8%', positive: true, color: 'text-foreground' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="border-border">
                                    <CardContent className="p-5">
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        <p className={`mt-1 text-2xl font-semibold tabular-nums ${stat.color}`}>
                                            {stat.value}
                                        </p>
                                        <p className={`mt-1 text-sm ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                                            ↗ {stat.change} vs last month
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts & Insights Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Spending Chart - Takes 2 columns */}
                        <div className="lg:col-span-2">
                            <BalanceTrendChart days={30} />
                        </div>

                        {/* AI Insights Card */}
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                                        <Sparkles className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-medium">AI Insights</CardTitle>
                                        <p className="text-xs text-muted-foreground">Personalized recommendations</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Lightbulb className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-sm">Review this Month</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Get a personalized Month in Review to see where your money went.
                                    </p>
                                </div>
                                <Link href="/insights">
                                    <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
                                        View all insights <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Spending Breakdown */}
                        <div className="lg:col-span-2">
                            <SpendingDonut data={spendingByCategory} />
                        </div>

                        {/* Recent Transactions */}
                        <Card className="border-border">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
                                    <p className="text-xs text-muted-foreground">Your latest activity</p>
                                </div>
                                <Link href="/transactions">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs">
                                        View all
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <TransactionList transactions={recentTransactions} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Linked Account */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-medium">Linked Accounts</CardTitle>
                            <Button variant="outline" size="sm" className="gap-1">
                                <Plus className="h-4 w-4" />
                                Add Account
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                                    <span className="text-lg font-bold text-blue-600">
                                        {mockAccount.bankName.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{mockAccount.bankName}</p>
                                    <p className="text-sm text-muted-foreground">{mockAccount.maskedAccountNumber} • Savings</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-foreground tabular-nums">
                                        {formatCurrency(mockAccount.balance)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Available Balance</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
