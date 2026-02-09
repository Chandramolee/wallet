import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';
import UserAccount from '@/lib/db/models/UserAccount';

// Schema for AI categorization
const CategorySchema = z.object({
    category: z.enum(['FOOD', 'SHOPPING', 'TRANSPORT', 'BILLS', 'ENTERTAINMENT', 'SUBSCRIPTIONS', 'TRANSFERS', 'INCOME', 'INVESTMENTS', 'OTHER']),
    merchant: z.string().optional().describe('Merchant name if identifiable'),
    sentiment: z.enum(['ESSENTIAL', 'DISCRETIONARY', 'SAVINGS']).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, date, narration, type } = await req.json();

        if (!amount || !date || !narration || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        // Get default account (create if not exists)
        let account = await UserAccount.findOne({ userId, isActive: true }).sort({ createdAt: -1 });

        if (!account) {
            // Create a default "Cash" account if none exists
            account = await UserAccount.create({
                userId,
                accountNumber: 'CASH',
                maskedAccountNumber: 'XXXXCASH',
                bankName: 'Cash / Manual',
                accountType: 'OTHER',
                balance: 0,
                currency: 'INR',
                linkedVia: 'MOCK', // Manual entry
                linkedAt: new Date(),
                isActive: true,
            });
        }

        // AI categorization
        const { object: categoryObj } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: CategorySchema,
            prompt: `Categorize this transaction:
Narration: ${narration}
Amount: ₹${amount}
Type: ${type}

Return the most appropriate category, merchant name if identifiable, and whether it's essential/discretionary/savings.`,
        });

        // Create transaction
        const transaction = await Transaction.create({
            accountId: account._id,
            userId,
            amount: parseFloat(amount),
            type,
            narration,
            transactionDate: new Date(date),
            category: categoryObj.category,
            merchant: categoryObj.merchant,
            sentiment: categoryObj.sentiment,
        });

        // Update account balance
        const balanceChange = type === 'CREDIT' ? parseFloat(amount) : -parseFloat(amount);
        await UserAccount.findByIdAndUpdate(account._id, {
            $inc: { balance: balanceChange },
            lastUpdated: new Date(),
        });

        return NextResponse.json({
            success: true,
            transaction: {
                id: transaction._id,
                amount: transaction.amount,
                type: transaction.type,
                narration: transaction.narration,
                date: transaction.transactionDate,
                category: transaction.category
            }
        });

    } catch (error) {
        console.error('Manual transaction error:', error);
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        );
    }
}
