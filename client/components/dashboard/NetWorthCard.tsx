'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface NetWorthCardProps {
    totalBalance: number;
    monthlyChange: number;
    changePercentage: number;
    currency?: string;
}

export function NetWorthCard({
    totalBalance,
    monthlyChange,
    changePercentage,
    currency = '₹',
}: NetWorthCardProps) {
    const isPositive = monthlyChange >= 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount).replace('₹', currency);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-2xl">
                {/* Glowing gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Wallet className="h-4 w-4" />
                        <span className="text-sm font-medium">Total Net Worth</span>
                    </div>

                    {/* Amount */}
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mt-3"
                    >
                        <span className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                            {formatCurrency(totalBalance)}
                        </span>
                    </motion.div>

                    {/* Change indicator */}
                    <div className="mt-4 flex items-center gap-2">
                        <div
                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${isPositive
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                        >
                            {isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            <span>{isPositive ? '+' : ''}{changePercentage.toFixed(1)}%</span>
                        </div>
                        <span className="text-sm text-zinc-400">
                            {formatCurrency(Math.abs(monthlyChange))} this month
                        </span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
