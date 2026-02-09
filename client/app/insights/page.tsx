'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    Target,
    Calendar,
    DollarSign,
    Percent,
    ArrowRight,
    Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: false },
    { icon: Receipt, label: 'Transactions', href: '/transactions', active: false },
    { icon: Lightbulb, label: 'Insights', href: '/insights', active: true },
    { icon: Settings, label: 'Settings', href: '/settings', active: false },
];

interface Transaction {
    id: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    narration: string;
    transactionDate: string;
    category?: string;
    merchant?: string;
}

interface Insight {
    icon: 'trending_up' | 'trending_down' | 'alert' | 'percent';
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
    confidence: number;
}

export default function InsightsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/transactions?limit=100');
                const data = await res.json();
                setTransactions(data.transactions || []);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Fetch AI insights when transactions are loaded
    useEffect(() => {
        async function fetchInsights() {
            if (transactions.length === 0) return;

            setIsLoadingInsights(true);
            try {
                const res = await fetch('/api/ai/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactions }),
                });
                const data = await res.json();
                if (data.insights) {
                    setInsights(data.insights);
                }
            } catch (error) {
                console.error('Failed to fetch insights:', error);
            } finally {
                setIsLoadingInsights(false);
            }
        }
        fetchInsights();
    }, [transactions]);

    // Calculate metrics
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonthTx = transactions.filter(tx => {
            const txDate = new Date(tx.transactionDate);
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        });

        const debits = thisMonthTx.filter(tx => tx.type === 'DEBIT');
        const totalDebits = debits.reduce((sum, tx) => sum + tx.amount, 0);
        const credits = thisMonthTx.filter(tx => tx.type === 'CREDIT').reduce((sum, tx) => sum + tx.amount, 0);

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const avgDailySpend = totalDebits / daysInMonth;
        const savingsRate = credits > 0 ? ((credits - totalDebits) / credits * 100) : 0;

        return {
            avgDailySpend,
            savingsRate: Math.max(0, savingsRate),
            budgetScore: Math.min(100, Math.max(0, 100 - (totalDebits / (credits || 1) * 50))),
            totalExpenses: totalDebits,
        };
    }, [transactions]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const getInsightIcon = (iconType: string) => {
        switch (iconType) {
            case 'trending_up': return TrendingUp;
            case 'trending_down': return TrendingDown;
            case 'alert': return AlertCircle;
            case 'percent': return Percent;
            default: return TrendingUp;
        }
    };

    // Empty state
    if (!isLoading && transactions.length === 0) {
        return (
            <div className="min-h-screen bg-background">
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
                    </div>
                </header>
                <main className="mx-auto max-w-7xl px-6 py-16">
                    <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 mb-6">
                            <Sparkles className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-semibold text-foreground mb-2">No insights yet</h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Import your bank statement to get AI-powered insights about your spending.
                        </p>
                        <Link href="/import">
                            <Button size="lg" className="gap-2">
                                <Upload className="h-5 w-5" />
                                Import Bank Statement
                            </Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // Default insights when AI hasn't loaded yet
    const defaultInsights: Insight[] = [
        {
            icon: 'trending_up',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            title: 'Analyzing your spending patterns...',
            description: 'AI is reviewing your transactions to find savings opportunities.',
            badge: 'Loading',
            badgeColor: 'bg-slate-50 text-slate-700',
            confidence: 0
        }
    ];

    const displayInsights = insights.length > 0 ? insights : (isLoadingInsights ? defaultInsights : []);

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
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <Card key={i} className="border-border">
                                    <CardContent className="p-5">
                                        <Skeleton className="h-4 w-24 mb-2" />
                                        <Skeleton className="h-8 w-32" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            [
                                { icon: DollarSign, label: 'Avg Daily Spend', value: formatCurrency(stats.avgDailySpend), subtext: 'This month' },
                                { icon: Percent, label: 'Savings Rate', value: `${stats.savingsRate.toFixed(1)}%`, subtext: 'Of income saved' },
                                { icon: Target, label: 'Budget Score', value: `${Math.round(stats.budgetScore)}/100`, subtext: 'Based on spending' },
                                { icon: Calendar, label: 'Total Expenses', value: formatCurrency(stats.totalExpenses), subtext: 'This month' },
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
                                            <p className="mt-1 text-sm text-muted-foreground">{stat.subtext}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Smart Recommendations */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Smart Recommendations</h2>

                        {isLoadingInsights ? (
                            <div className="space-y-4">
                                {Array(3).fill(0).map((_, i) => (
                                    <Card key={i} className="border-border">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-4">
                                                <Skeleton className="h-10 w-10 rounded-xl" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-5 w-48 mb-2" />
                                                    <Skeleton className="h-4 w-full" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : displayInsights.length === 0 ? (
                            <Card className="border-border">
                                <CardContent className="p-8 text-center">
                                    <p className="text-muted-foreground">
                                        Add more transactions to get personalized recommendations.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            displayInsights.map((rec, i) => {
                                const IconComponent = getInsightIcon(rec.icon);
                                return (
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
                                                        <IconComponent className={`h-5 w-5 ${rec.iconColor}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <h3 className="font-medium text-foreground">{rec.title}</h3>
                                                            <Badge className={`${rec.badgeColor} border-0 shrink-0`}>
                                                                {rec.badge}
                                                            </Badge>
                                                        </div>
                                                        <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
                                                        {rec.confidence > 0 && (
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
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

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
                </motion.div>
            </main>
        </div>
    );
}
