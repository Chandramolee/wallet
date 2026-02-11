
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction, { ITransaction } from '@/lib/db/models/Transaction';
import { baseTransactionSchema } from '@/lib/validators';
import { startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

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
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const keyword = searchParams.get('keyword');

        // Build query
        const query: Record<string, any> = { userId };

        if (category && category !== 'ALL') query.category = category;
        if (type && type !== 'ALL') query.type = type;

        if (keyword) {
            query.$or = [
                { narration: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { merchant: { $regex: keyword, $options: 'i' } },
            ];
        }

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

        // Calculate summary stats for CURRENT MONTH (or filtered range if provided?)
        // PROMPT.md logic seems to calculate for the *requested period* usually, but let's stick to existing logic 
        // OR adopt PROMPT.md's specific summary endpoint logic? 
        // Existing logic calculates for "this month" regardless of filter. Let's keep it for dashboard summary compatibility unless UI changes.

        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);

        const summaryQuery = {
            userId,
            transactionDate: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
        };

        const thisMonthTx = await Transaction.find(summaryQuery).lean();

        // Use type casting or checks because type is string in DB but we know values
        const income = thisMonthTx
            .filter(tx => tx.type === 'CREDIT' || tx.type === 'INCOME')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = thisMonthTx
            .filter(tx => tx.type === 'DEBIT' || tx.type === 'EXPENSE')
            .reduce((sum, tx) => sum + tx.amount, 0);

        return NextResponse.json({
            transactions: transactions.map(tx => ({
                id: tx._id.toString(),
                amount: tx.amount,
                type: tx.type,
                narration: tx.narration, // Mapping 'narration' to UI's expectation
                title: tx.title || tx.narration, // Expose title for new UI
                description: tx.description,
                transactionDate: tx.transactionDate,
                category: tx.category,
                merchant: tx.merchant,
                sentiment: tx.sentiment,
                paymentMethod: tx.paymentMethod,
                status: tx.status,
                receiptUrl: tx.receiptUrl,
                isRecurring: tx.isRecurring,
                recurringInterval: tx.recurringInterval
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
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

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const parsedBody = baseTransactionSchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsedBody.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsedBody.data;
        await connectDB();

        const newTransaction = await Transaction.create({
            userId,
            amount: data.amount,
            type: data.type, // INCOME | EXPENSE
            narration: data.title, // Map title to narration for backward compatibility
            title: data.title,
            description: data.description,
            transactionDate: data.date,
            category: data.category,
            isRecurring: data.isRecurring,
            recurringInterval: data.recurringInterval || undefined,
            receiptUrl: data.receiptUrl,
            paymentMethod: data.paymentMethod,
            status: 'COMPLETED', // Default to completed for manual
        });

        return NextResponse.json({
            success: true,
            transaction: newTransaction
        }, { status: 201 });

    } catch (error) {
        console.error('Transaction create error:', error);
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        );
    }
}
