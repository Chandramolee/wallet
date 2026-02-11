'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
    UtensilsCrossed,
    ShoppingBag,
    Car,
    Receipt,
    Film,
    CreditCard,
    ArrowUpDown,
    Wallet,
    TrendingUp,
    CircleDollarSign
} from 'lucide-react';
import { format } from 'date-fns';

type CategoryType = 'FOOD' | 'SHOPPING' | 'TRANSPORT' | 'BILLS' | 'ENTERTAINMENT' | 'SUBSCRIPTIONS' | 'TRANSFERS' | 'INCOME' | 'INVESTMENTS' | 'OTHER';

interface TransactionItemProps {
    merchant: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT' | 'INCOME' | 'EXPENSE';
    category: CategoryType;
    transactionDate: Date;
    narration?: string;
    index?: number;
}

const CATEGORY_CONFIG: Record<CategoryType, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
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

export function TransactionItem({
    merchant,
    amount,
    type,
    category,
    transactionDate,
    index = 0,
}: TransactionItemProps) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER;
    const Icon = config.icon;
    const isCredit = type === 'CREDIT' || type === 'INCOME';

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const txDate = new Date(date);
        const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return format(txDate, 'MMM d');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
        >
            {/* Left: Icon + Details */}
            <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div>
                    <p className="font-medium text-foreground text-sm">{merchant}</p>
                    <p className="text-xs text-muted-foreground">{config.label} • {formatDate(transactionDate)}</p>
                </div>
            </div>

            {/* Right: Amount */}
            <span className={`text-sm font-semibold tabular-nums ${isCredit ? 'text-green-600' : 'text-foreground'}`}>
                {isCredit ? '+' : '-'}₹{formatCurrency(amount)}
            </span>
        </motion.div>
    );
}

interface TransactionListProps {
    transactions: TransactionItemProps[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    return (
        <div className="divide-y divide-border">
            {transactions.map((tx, index) => (
                <TransactionItem key={index} {...tx} index={index} />
            ))}
        </div>
    );
}
