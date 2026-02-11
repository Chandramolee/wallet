
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';
import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Simple security check for cron (optional, can use CRON_SECRET)
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectDB();

        const now = new Date();
        const recurringTransactions = await Transaction.find({
            isRecurring: true,
            nextRecurringDate: { $lte: now },
            status: 'COMPLETED'
        });

        const createdCount = 0;
        for (const tx of recurringTransactions) {
            // Create a new instance of the transaction
            await Transaction.create({
                userId: tx.userId,
                accountId: tx.accountId,
                amount: tx.amount,
                type: tx.type,
                narration: tx.narration,
                title: tx.title,
                category: tx.category,
                merchant: tx.merchant,
                paymentMethod: tx.paymentMethod,
                status: 'COMPLETED',
                transactionDate: tx.nextRecurringDate,
                isRecurring: false, // The new instance is a simple record
            });

            // Update the next recurring date on the template
            let nextDate = tx.nextRecurringDate || now;
            switch (tx.recurringInterval) {
                case 'DAILY': nextDate = addDays(nextDate, 1); break;
                case 'WEEKLY': nextDate = addWeeks(nextDate, 1); break;
                case 'MONTHLY': nextDate = addMonths(nextDate, 1); break;
                case 'YEARLY': nextDate = addYears(nextDate, 1); break;
            }

            await Transaction.findByIdAndUpdate(tx._id, {
                nextRecurringDate: nextDate,
                lastProcessed: now
            });
        }

        return NextResponse.json({
            success: true,
            processed: recurringTransactions.length
        });
    } catch (error) {
        console.error('[PROCESS_RECURRING_ERROR]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
