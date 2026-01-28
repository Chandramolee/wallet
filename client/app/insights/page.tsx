'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateMockTransactions } from '@/lib/aa/mock-aggregator';
import {
    Wallet,
    LayoutDashboard,
    Receipt,
    Lightbulb,
    Settings,
    Sparkles,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Target,
    Calendar,
    DollarSign,
    Percent,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: false },
    { icon: Receipt, label: 'Transactions', href: '/transactions', active: false },
    { icon: Lightbulb, label: 'Insights', href: '/insights', active: true },
    { icon: Settings, label: 'Settings', href: '/settings', active: false },
];

export default function InsightsPage() {
    const mockTransactions = useMemo(() => generateMockTransactions(3), []);

    // Calculate metrics
    const thisMonthDebits = mockTransactions
        .filter(tx => {
            const txDate = new Date(tx.transactionDate);
            const now = new Date();
            return tx.type === 'DEBIT' && txDate.getMonth() === now.getMonth();
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

    const avgDailySpend = thisMonthDebits / 30;
    const savingsRate = 18.5;
    const budgetScore = 85;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const recommendations = [
        {
            icon: TrendingUp,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            title: 'Switch to Annual Subscriptions',
            description: 'You could save ₹12,500/year by switching Netflix and Spotify to annual plans.',
            badge: '₹12,500 savings',
            badgeColor: 'bg-green-50 text-green-700',
            confidence: 92
        },
        {
            icon: AlertCircle,
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            title: 'Weekend Spending Spike',
            description: 'Your weekend spending is 3x higher than weekdays. Consider setting a weekend budget.',
            badge: '40% higher',
            badgeColor: 'bg-orange-50 text-orange-700',
            confidence: 88
        },
        {
            icon: TrendingDown,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
            title: 'Subscription Creep Detected',
            description: 'You\'ve added 3 new subscriptions this quarter totaling ₹3,600/month.',
            badge: '₹43,200/year',
            badgeColor: 'bg-red-50 text-red-700',
            confidence: 95
        },
        {
            icon: Percent,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
            title: 'Optimal Savings Rate',
            description: 'Based on your income, aim for 20% savings rate. You\'re currently at 15%.',
            badge: '5% increase',
            badgeColor: 'bg-blue-50 text-blue-700',
            confidence: 87
        },
    ];

    const savingsGoals = [
        { name: 'Emergency Fund', current: 68000, target: 100000, due: 'Mar 2025' },
        { name: 'Vacation', current: 24000, target: 50000, due: 'Jun 2025' },
        { name: 'New Car', current: 85000, target: 250000, due: 'Dec 2025' },
    ];

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
                    className="space-y-8"
                >
                    {/* Page Title */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">AI Insights</h1>
                            <p className="text-muted-foreground">Smart analysis of your financial patterns</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        {[
                            { icon: DollarSign, label: 'Avg Daily Spend', value: formatCurrency(avgDailySpend), change: '12% less than avg', positive: true },
                            { icon: Percent, label: 'Savings Rate', value: `${savingsRate}%`, change: '3.5% above target', positive: true },
                            { icon: Target, label: 'Budget Score', value: `${budgetScore}/100`, change: 'Great progress!', positive: true },
                            { icon: Calendar, label: 'Next Milestone', value: '23 days', change: 'Until emergency fund goal', positive: null },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="border-border">
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-2xl font-semibold tabular-nums text-foreground">{stat.value}</p>
                                        <p className={`mt-1 text-sm ${stat.positive === true ? 'text-green-600' : stat.positive === false ? 'text-red-500' : 'text-muted-foreground'}`}>
                                            {stat.positive === true && '↗ '}{stat.change}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Smart Recommendations */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Smart Recommendations</h2>

                            {recommendations.map((rec, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                >
                                    <Card className="border-border hover:shadow-md transition-shadow">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-4">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${rec.iconBg} shrink-0`}>
                                                    <rec.icon className={`h-5 w-5 ${rec.iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <h3 className="font-medium text-foreground">{rec.title}</h3>
                                                        <Badge className={`${rec.badgeColor} border-0 shrink-0`}>
                                                            {rec.badge}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">AI Confidence:</span>
                                                        <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                style={{ width: `${rec.confidence}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-foreground">{rec.confidence}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Savings Goals */}
                            <Card className="border-border">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <CardTitle className="text-base font-medium">Savings Goals</CardTitle>
                                    <Button variant="ghost" size="sm" className="text-blue-600 text-xs">
                                        Add Goal
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {savingsGoals.map((goal, i) => {
                                        const progress = (goal.current / goal.target) * 100;
                                        return (
                                            <div key={i} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-sm text-foreground">{goal.name}</p>
                                                        <p className="text-xs text-muted-foreground">Due: {goal.due}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium tabular-nums">
                                                            {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{progress.toFixed(0)}%</p>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all"
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Tip of the Day */}
                            <Card className="border-border bg-amber-50 border-amber-200">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="h-5 w-5 text-amber-600" />
                                        <span className="font-medium text-amber-900">Tip of the Day</span>
                                    </div>
                                    <p className="text-sm text-amber-800">
                                        Consider automating your savings. Setting up automatic transfers on payday can increase your savings rate by up to 25%.
                                    </p>
                                    <Button variant="ghost" size="sm" className="mt-3 text-amber-700 hover:text-amber-800 p-0">
                                        Learn more <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
