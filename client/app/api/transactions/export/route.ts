
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const transactions = await Transaction.find({ userId }).sort({ transactionDate: -1 }).lean();

        if (transactions.length === 0) {
            return new Response('No transactions found', { status: 404 });
        }

        const headers = [
            'Date',
            'Narration',
            'Category',
            'Amount',
            'Type',
            'Merchant',
            'Status',
            'Payment Method'
        ];

        const rows = transactions.map(tx => [
            tx.transactionDate.toISOString().split('T')[0],
            `"${tx.narration.replace(/"/g, '""')}"`,
            tx.category,
            tx.amount,
            tx.type,
            tx.merchant || '',
            tx.status,
            tx.paymentMethod
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
