'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SpendingCategory {
    name: string;
    value: number;
    color: string;
}

interface SpendingDonutProps {
    data?: SpendingCategory[];
    title?: string;
}

const MOCK_DATA: SpendingCategory[] = [
    { name: 'Food & Drinks', value: 12500, color: '#f97316' },
    { name: 'Shopping', value: 18000, color: '#ec4899' },
    { name: 'Transport', value: 5500, color: '#3b82f6' },
    { name: 'Bills', value: 8000, color: '#eab308' },
    { name: 'Entertainment', value: 4500, color: '#a855f7' },
    { name: 'Subscriptions', value: 2500, color: '#ef4444' },
    { name: 'Investments', value: 25000, color: '#22c55e' },
];

export function SpendingDonut({ data, title = 'Spending Breakdown' }: SpendingDonutProps) {
    const chartData = data || MOCK_DATA;
    const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium text-foreground">{data.name}</p>
                    <p className="text-lg font-semibold tabular-nums" style={{ color: data.color }}>
                        {formatCurrency(data.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">{percentage}% of total</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="border-border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-foreground">{title}</CardTitle>
                    <p className="text-sm text-muted-foreground">This month</p>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-8">
                        {/* Chart */}
                        <div className="relative h-[200px] w-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xs text-muted-foreground">Total</span>
                                <span className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 grid grid-cols-2 gap-3">
                            {chartData.slice(0, 6).map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                                    <div className="min-w-0">
                                        <p className="text-sm text-foreground truncate">{entry.name}</p>
                                        <p className="text-xs text-muted-foreground tabular-nums">{formatCurrency(entry.value)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
