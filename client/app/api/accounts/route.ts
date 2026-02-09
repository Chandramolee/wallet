import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import UserAccount from '@/lib/db/models/UserAccount';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const accounts = await UserAccount.find({ userId, isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        return NextResponse.json({
            accounts: accounts.map(acc => ({
                id: acc._id.toString(),
                bankName: acc.bankName,
                maskedAccountNumber: acc.maskedAccountNumber,
                accountType: acc.accountType,
                balance: acc.balance,
                currency: acc.currency,
                lastUpdated: acc.lastUpdated,
                linkedAt: acc.linkedAt,
            })),
            totalBalance,
            count: accounts.length,
        });

    } catch (error) {
        console.error('Accounts fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch accounts' },
            { status: 500 }
        );
    }
}
