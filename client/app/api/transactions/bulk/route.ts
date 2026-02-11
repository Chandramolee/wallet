
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { ids } = await req.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No transaction IDs provided' }, { status: 400 });
        }

        await connectDB();

        const result = await Transaction.deleteMany({
            _id: { $in: ids },
            userId,
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'No transactions found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} transactions deleted successfully`,
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 });
    }
}
