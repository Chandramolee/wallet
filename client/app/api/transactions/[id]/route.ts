
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';
import { baseTransactionSchema } from '@/lib/validators';
import { calculateNextOccurrence } from '@/lib/utils'; // I should verify if this exists or port it

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await connectDB();

        const transaction = await Transaction.findOne({ _id: id, userId }).lean();
        if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        return NextResponse.json(transaction);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        // Use a partial schema or safeParse
        const parsedBody = baseTransactionSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsedBody.error.flatten() }, { status: 400 });
        }

        const data = parsedBody.data;
        await connectDB();

        const existingTransaction = await Transaction.findOne({ _id: id, userId });
        if (!existingTransaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        // Update logic (adapted from PROMPT.md service)
        const isRecurring = data.isRecurring;
        const date = data.date;
        const recurringInterval = data.recurringInterval;

        let nextRecurringDate: Date | undefined;
        if (isRecurring && recurringInterval) {
            nextRecurringDate = calculateNextOccurrence(new Date(date), recurringInterval);
        }

        existingTransaction.set({
            title: data.title,
            narration: data.title,
            description: data.description,
            amount: data.amount,
            type: data.type,
            category: data.category,
            transactionDate: data.date,
            paymentMethod: data.paymentMethod,
            isRecurring,
            recurringInterval,
            nextRecurringDate,
            receiptUrl: data.receiptUrl,
        });

        await existingTransaction.save();

        return NextResponse.json({ success: true, transaction: existingTransaction });
    } catch (error) {
        console.error('Transaction update error:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await connectDB();

        const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
        if (!deleted) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Transaction deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}
