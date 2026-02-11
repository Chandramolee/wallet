
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await connectDB();

        const transaction = await Transaction.findOne({ _id: id, userId });
        if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        // Duplicate logic (adapted from PROMPT.md service)
        const duplicatedData = {
            ...transaction.toObject(),
            _id: undefined,
            id: undefined,
            title: `Duplicate - ${transaction.title || transaction.narration}`,
            description: transaction.description
                ? `${transaction.description} (Duplicate)`
                : "Duplicated transaction",
            isRecurring: false,
            recurringInterval: undefined,
            nextRecurringDate: undefined,
            createdAt: undefined,
            updatedAt: undefined,
        };

        const duplicated = await Transaction.create(duplicatedData);

        return NextResponse.json({
            success: true,
            transaction: duplicated,
        });
    } catch (error) {
        console.error('Transaction duplication error:', error);
        return NextResponse.json({ error: 'Failed to duplicate transaction' }, { status: 500 });
    }
}
