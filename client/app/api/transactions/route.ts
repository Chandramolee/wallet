import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Parse query params for filtering
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = parseInt(searchParams.get('skip') || '0');
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query
        const query: Record<string, unknown> = { userId };

        if (category) query.category = category;
        if (type) query.type = type;
        if (startDate || endDate) {
            query.transactionDate = {};
            if (startDate) (query.transactionDate as Record<string, Date>).$gte = new Date(startDate);
            if (endDate) (query.transactionDate as Record<string, Date>).$lte = new Date(endDate);
        }

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .sort({ transactionDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Transaction.countDocuments(query),
        ]);

        // Calculate summary stats
        const allUserTx = await Transaction.find({ userId }).lean();
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const thisMonthTx = allUserTx.filter(tx => new Date(tx.transactionDate) >= thisMonth);
        const income = thisMonthTx.filter(tx => tx.type === 'CREDIT').reduce((sum, tx) => sum + tx.amount, 0);
        const expenses = thisMonthTx.filter(tx => tx.type === 'DEBIT').reduce((sum, tx) => sum + tx.amount, 0);

        return NextResponse.json({
            transactions: transactions.map(tx => ({
                id: tx._id.toString(),
                amount: tx.amount,
                type: tx.type,
                narration: tx.narration,
                transactionDate: tx.transactionDate,
                category: tx.category,
                merchant: tx.merchant,
                sentiment: tx.sentiment,
            })),
            pagination: {
                total,
                skip,
                limit,
                hasMore: skip + transactions.length < total,
            },
            summary: {
                thisMonthIncome: income,
                thisMonthExpenses: expenses,
                thisMonthSavings: income - expenses,
            },
        });

    } catch (error) {
        console.error('Transactions fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
