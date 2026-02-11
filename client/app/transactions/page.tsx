
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Wallet,
    LayoutDashboard,
    Receipt,
    Lightbulb,
    Settings,
    Search,
    Download,
    UtensilsCrossed,
    ShoppingBag,
    Car,
    Film,
    CreditCard,
    ArrowUpDown,
    TrendingUp,
    CircleDollarSign,
    Upload,
    FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { EditTransactionDialog } from '@/components/transactions/EditTransactionDialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Copy, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

import { Navbar } from '@/components/Navbar';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: false },
    { icon: Receipt, label: 'Transactions', href: '/transactions', active: true },
    { icon: FileText, label: 'Reports', href: '/reports', active: false },
    { icon: Lightbulb, label: 'Insights', href: '/insights', active: false },
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

import { TransactionBase as Transaction } from '@/lib/types/transaction';

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50',
                keyword: searchQuery,
            });
            if (selectedCategory) params.append('category', selectedCategory);

            const res = await fetch(`/api/transactions?${params.toString()}`);
            const data = await res.json();
            setTransactions(data.transactions || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, page]);

    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};
        transactions.forEach(tx => {
            const dateKey = format(new Date(tx.transactionDate), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(tx);
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [transactions]);

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
                                <Button
                                    key={item.href}
                                    variant={item.active ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={`gap-2 ${item.active ? 'bg-slate-100' : ''}`}
                                    asChild
                                >
                                    <Link href={item.href}>
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </Button>
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
                    className="space-y-6"
                >
                    {/* Page Title */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
                            <p className="text-muted-foreground">View and manage all your transactions</p>
                        </div>
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                    onClick={async () => {
                                        if (!confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) return;
                                        setIsProcessing(true);
                                        try {
                                            const res = await fetch('/api/transactions/bulk', {
                                                method: 'DELETE',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ ids: selectedIds }),
                                            });
                                            if (!res.ok) throw new Error('Failed to delete');
                                            toast.success('Transactions deleted');
                                            setSelectedIds([]);
                                            fetchTransactions();
                                        } catch (error) {
                                            toast.error('Failed to delete transactions');
                                        } finally {
                                            setIsProcessing(false);
                                        }
                                    }}
                                    disabled={isProcessing}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete ({selectedIds.length})
                                </Button>
                            )}
                            <AddTransactionDialog onSuccess={fetchTransactions} />
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => window.open('/api/transactions/export', '_blank')}
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
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
                            {categories.slice(0, 10).map(([key, config]) => (
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
                        <div className="flex items-center px-6 py-3 border-b border-border bg-slate-50/50">
                            <Checkbox
                                checked={selectedIds.length === transactions.length && transactions.length > 0}
                                onCheckedChange={(checked: boolean) => {
                                    if (checked) setSelectedIds(transactions.map(tx => tx.id!));
                                    else setSelectedIds([]);
                                }}
                            />
                            <span className="ml-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}
                            </span>
                        </div>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-6 space-y-4">
                                    {Array(5).fill(0).map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : groupedTransactions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No transactions found
                                </div>
                            ) : (
                                <>
                                    {groupedTransactions.map(([date, txs]) => (
                                        <div key={date}>
                                            <div className="px-6 py-3 bg-slate-50 border-b border-border">
                                                <h3 className="text-sm font-medium text-muted-foreground">
                                                    {formatDateHeader(date)}
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-border">
                                                {txs.map((tx, i) => {
                                                    const config = CATEGORY_CONFIG[tx.category || 'OTHER'] || CATEGORY_CONFIG.OTHER;
                                                    const Icon = config.icon;
                                                    const isCredit = tx.type === 'CREDIT' || tx.type === 'INCOME';

                                                    return (
                                                        <motion.div
                                                            key={tx.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: i * 0.01 }}
                                                            className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <Checkbox
                                                                    checked={selectedIds.includes(tx.id!)}
                                                                    onCheckedChange={(checked: boolean) => {
                                                                        if (checked) setSelectedIds([...selectedIds, tx.id!]);
                                                                        else setSelectedIds(selectedIds.filter(id => id !== tx.id));
                                                                    }}
                                                                />
                                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bgColor}`}>
                                                                    <Icon className={`h-5 w-5 ${config.color}`} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">{tx.merchant || tx.narration || 'Unknown'}</p>
                                                                    <p className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-md">{tx.narration}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0 hidden sm:inline-flex`}>
                                                                    {config.label}
                                                                </Badge>
                                                                <span className={`font-semibold tabular-nums text-right w-24 ${isCredit ? 'text-green-600' : 'text-foreground'}`}>
                                                                    {isCredit ? '+' : '-'}₹{formatCurrency(tx.amount)}
                                                                </span>

                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem className="gap-2" onClick={() => {
                                                                            setEditingTransaction(tx);
                                                                            setIsEditOpen(true);
                                                                        }}>
                                                                            <Edit2 className="h-4 w-4" /> Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="gap-2" onClick={async () => {
                                                                            setIsProcessing(true);
                                                                            try {
                                                                                const res = await fetch(`/api/transactions/${tx.id}/duplicate`, { method: 'POST' });
                                                                                if (!res.ok) throw new Error('Failed to duplicate');
                                                                                toast.success('Transaction duplicated');
                                                                                fetchTransactions();
                                                                            } catch (error) {
                                                                                toast.error('Failed to duplicate transaction');
                                                                            } finally {
                                                                                setIsProcessing(false);
                                                                            }
                                                                        }}>
                                                                            <Copy className="h-4 w-4" /> Duplicate
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="gap-2 text-red-600" onClick={async () => {
                                                                            if (!confirm('Are you sure?')) return;
                                                                            setIsProcessing(true);
                                                                            try {
                                                                                const res = await fetch(`/api/transactions/${tx.id}`, { method: 'DELETE' });
                                                                                if (!res.ok) throw new Error('Failed to delete');
                                                                                toast.success('Transaction deleted');
                                                                                fetchTransactions();
                                                                            } catch (error) {
                                                                                toast.error('Failed to delete transaction');
                                                                            } finally {
                                                                                setIsProcessing(false);
                                                                            }
                                                                        }}>
                                                                            <Trash2 className="h-4 w-4" /> Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-border">
                                            <p className="text-sm text-muted-foreground">
                                                Page {page} of {totalPages}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={page === 1}
                                                    onClick={() => setPage(page - 1)}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={page === totalPages}
                                                    onClick={() => setPage(page + 1)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            <EditTransactionDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                transaction={editingTransaction}
                onSuccess={fetchTransactions}
            />
        </div>
    );
}
