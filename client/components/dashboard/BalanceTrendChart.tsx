
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';

interface BalanceTrendChartProps {
    data?: { date: string; income: number; expense: number }[];
    days?: number;
}

export function BalanceTrendChart({ data, days = 30 }: BalanceTrendChartProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const chartData = useMemo(() => {
        if (data && data.length > 0) {
            return data.map((item) => ({
                date: format(new Date(item.date), 'MMM d'),
                income: item.income,
                expense: item.expense,
            }));
        }
        return [];
    }, [data]);

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        } else if (value >= 1000) {
            return `₹${(value / 1000).toFixed(0)}K`;
        }
        return `₹${value}`;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {payload.map((p: any, index: number) => (
                        <p key={index} className="text-sm font-semibold tabular-nums" style={{ color: p.color }}>
                            {p.name}: ₹{new Intl.NumberFormat('en-IN').format(p.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Card className="border-border">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-medium text-foreground">
                                Spending Overview
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">Your income vs spending over time</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px] w-full">
                        {!mounted ? (
                            <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={formatCurrency}
                                        width={55}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        name="Income"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#incomeGradient)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        name="Spending"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#expenseGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-green-500" />
                            Income
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-blue-500" />
                            Spending
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
