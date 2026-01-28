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
import { format, subDays } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface BalanceTrendChartProps {
    data?: { date: Date; balance: number }[];
    days?: number;
}

export function BalanceTrendChart({ data, days = 30 }: BalanceTrendChartProps) {
    const chartData = useMemo(() => {
        if (data && data.length > 0) {
            return data.map((item) => ({
                date: format(new Date(item.date), 'MMM d'),
                balance: item.balance,
            }));
        }

        const mockData = [];
        let balance = 150000 + Math.random() * 50000;

        for (let i = days; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const change = (Math.random() - 0.45) * 5000;
            balance = Math.max(50000, balance + change);

            mockData.push({
                date: format(date, 'MMM d'),
                balance: Math.round(balance),
            });
        }

        return mockData;
    }, [data, days]);

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
                    <p className="text-lg font-semibold text-foreground tabular-nums">
                        ₹{new Intl.NumberFormat('en-IN').format(payload[0].value)}
                    </p>
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
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="balanceGradientLight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
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
                                    dataKey="balance"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#balanceGradientLight)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
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
