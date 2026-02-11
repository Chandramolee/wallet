
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BalanceTrendChart, SpendingDonut } from '@/components/dashboard';
import { TransactionList } from '@/components/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowRight,
    Wallet,
    LayoutDashboard,
    Receipt,
    Lightbulb,
    Settings,
    Plus,
    Sparkles,
    Upload,
    FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { UserButton, useUser } from '@clerk/nextjs';

import { Navbar } from '@/components/Navbar';
import { TransactionBase as Transaction } from '@/lib/types/transaction';

interface Account {
    id: string;
    bankName: string;
    maskedAccountNumber: string;
    accountType: string;
    balance: number;
}

interface DashboardData {
    transactions: Transaction[];
    accounts: Account[];
    summary: {
        thisMonthIncome: number;
        thisMonthExpenses: number;
        thisMonthSavings: number;
    };
    pieChartData: any[]; // { name, value, color }
    barChartData: any[]; // { date, income, expense }
    totalBalance: number;
    isLoading: boolean;
    hasData: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [data, setData] = useState<DashboardData>({
        transactions: [],
        accounts: [],
        summary: { thisMonthIncome: 0, thisMonthExpenses: 0, thisMonthSavings: 0 },
        pieChartData: [],
        barChartData: [],
        totalBalance: 0,
        isLoading: true,
        hasData: false,
    });
    const spendingByCategory = data.pieChartData;

    const recentTransactions = data.transactions.slice(0, 5).map((tx) => ({
        merchant: tx.merchant || tx.narration || 'Unknown',
        amount: tx.amount,
        type: tx.type,
        category: (tx.category || 'OTHER') as any,
        transactionDate: new Date(tx.transactionDate),
        narration: tx.narration,
    }));

    if (!data.isLoading && !data.hasData) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="mx-auto max-w-7xl px-6 py-16">
                    {/* ... rest of the main */}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-7xl px-6 py-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {isLoaded && user ? `Welcome back, ${user.firstName}` : 'Good afternoon'}
                        </h1>
                        <p className="text-muted-foreground">Here&apos;s an overview of your finances</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        {data.isLoading ? (
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
                                { label: 'Total Balance', value: formatCurrency(data.totalBalance), color: 'text-foreground' },
                                { label: 'Income', value: formatCurrency(data.summary.thisMonthIncome), color: 'text-green-600' },
                                { label: 'Expenses', value: formatCurrency(data.summary.thisMonthExpenses), color: 'text-red-500' },
                                { label: 'Savings', value: formatCurrency(data.summary.thisMonthSavings), color: 'text-foreground' },
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
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <BalanceTrendChart data={data.barChartData} days={30} />
                        </div>

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
                                <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700" asChild>
                                    <Link href="/insights">
                                        View all insights <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <SpendingDonut data={spendingByCategory} />
                        </div>

                        <Card className="border-border">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
                                    <p className="text-xs text-muted-foreground">Your latest activity</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs" asChild>
                                    <Link href="/transactions">
                                        View all
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {data.isLoading ? (
                                    <div className="space-y-3">
                                        {Array(5).fill(0).map((_, i) => (
                                            <Skeleton key={i} className="h-12 w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <TransactionList transactions={recentTransactions} />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-medium">Linked Accounts</CardTitle>
                            <Button variant="outline" size="sm" className="gap-1" asChild>
                                <Link href="/import">
                                    <Plus className="h-4 w-4" />
                                    Add Account
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.isLoading ? (
                                <Skeleton className="h-20 w-full" />
                            ) : data.accounts.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-4">
                                    No accounts linked yet. Import a bank statement to get started.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {data.accounts.map((account) => (
                                        <div key={account.id} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                                                <span className="text-lg font-bold text-blue-600">
                                                    {account.bankName.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground">{account.bankName}</p>
                                                <p className="text-sm text-muted-foreground">{account.maskedAccountNumber} • {account.accountType}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-foreground tabular-nums">
                                                    {formatCurrency(account.balance)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Available Balance</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
