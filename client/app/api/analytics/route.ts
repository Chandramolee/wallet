
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction, { ITransaction } from '@/lib/db/models/Transaction';
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);

        // 1. Get Monthly Stats (Income vs Expense)
        const currentMonthTx = await Transaction.find({
            userId,
            transactionDate: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
        }).lean();

        const income = currentMonthTx
            .filter(tx => ['CREDIT', 'INCOME'].includes(tx.type))
            .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = currentMonthTx
            .filter(tx => ['DEBIT', 'EXPENSE'].includes(tx.type))
            .reduce((sum, tx) => sum + tx.amount, 0);

        // 2. Get Expense Breakdown (Pie Chart)
        const expenseCategories = await Transaction.aggregate([
            {
                $match: {
                    userId,
                    transactionDate: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
                    type: { $in: ['DEBIT', 'EXPENSE'] }
                }
            },
            {
                $group: {
                    _id: "$category",
                    value: { $sum: "$amount" }
                }
            },
            { $sort: { value: -1 } }
        ]);

        const pieChartData = expenseCategories.map(cat => ({
            name: cat._id,
            value: cat.value,
            color: '#0088FE' // Frontend likely assigns colors or we can generate random hex here
        }));

        // 3. Get Income vs Expense Trend (Bar/Line Chart - Last 7 Days / 30 Days?)
        // PROMPT.md Analytics usually shows historical trend.
        // Let's fetch last 30 days data day-by-day.
        const thirtyDaysAgo = subMonths(now, 1);
        const trendTx = await Transaction.find({
            userId,
            transactionDate: { $gte: thirtyDaysAgo, $lte: now }
        }).lean();

        // Group by day
        const dayMap = new Map<string, { income: number; expense: number }>();

        // Initialize all days to 0
        const daysInterval = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
        daysInterval.forEach(day => {
            dayMap.set(format(day, 'yyyy-MM-dd'), { income: 0, expense: 0 });
        });

        trendTx.forEach(tx => {
            const dateKey = format(new Date(tx.transactionDate), 'yyyy-MM-dd');
            if (dayMap.has(dateKey)) {
                const entry = dayMap.get(dateKey)!;
                if (['CREDIT', 'INCOME'].includes(tx.type)) entry.income += tx.amount;
                if (['DEBIT', 'EXPENSE'].includes(tx.type)) entry.expense += tx.amount;
            }
        });

        const barChartData = Array.from(dayMap.entries()).map(([date, data]) => ({
            date,
            income: data.income,
            expense: data.expense
        }));

        return NextResponse.json({
            summary: {
                income,
                expenses,
                balance: income - expenses,
                savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
            },
            pieChartData,
            barChartData
        });

    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
