
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/ai/ai-provider';
import { z } from 'zod';
import { PDFParse } from 'pdf-parse';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';
import UserAccount from '@/lib/db/models/UserAccount';

export const dynamic = 'force-dynamic';

// Schema for extracted transactions
const TransactionSchema = z.object({
    bankName: z.string().optional().describe('Name of the bank if visible in the statement'),
    accountNumber: z.string().optional().describe('Last 4 digits of account number if visible'),
    transactions: z.array(z.object({
        date: z.string().describe('Date of transaction in YYYY-MM-DD format'),
        narration: z.string().describe('Description or narration of the transaction'),
        amount: z.number().describe('Amount of the transaction as positive number'),
        type: z.enum(['CREDIT', 'DEBIT']).describe('Type of transaction'),
        category: z.enum(['FOOD', 'SHOPPING', 'TRANSPORT', 'BILLS', 'ENTERTAINMENT', 'SUBSCRIPTIONS', 'TRANSFERS', 'INCOME', 'INVESTMENTS', 'OTHER']).describe('Category of the transaction'),
        merchant: z.string().optional().describe('Merchant name if identifiable'),
        sentiment: z.enum(['ESSENTIAL', 'DISCRETIONARY', 'SAVINGS']).optional().describe('Spending sentiment'),
    }))
});

export async function POST(req: NextRequest) {
    try {
        console.log('Starting PDF import...');
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        const rawText = textResult.text;

        console.log('Gemini extraction started...');
        const startTime = Date.now();

        const { object } = await ai.generateObject<any>({
            schema: TransactionSchema,
            prompt: `Extract and categorize financial transactions from this bank statement.
            Also try to identify the bank name and last 4 digits of account number if visible.
            For each transaction:
            1. Identify the date, description (narration), amount, and type (CREDIT/DEBIT).
            2. Categorize it into one of: FOOD, SHOPPING, TRANSPORT, BILLS, ENTERTAINMENT, SUBSCRIPTIONS, TRANSFERS, INCOME, INVESTMENTS, OTHER.
            3. Identify the merchant name if possible.
            4. Determine sentiment: ESSENTIAL (needs), DISCRETIONARY (wants), or SAVINGS.
            
            for amounts, always use positive numbers - use the type field to indicate debit/credit.
            
            BANK STATEMENT TEXT:
            ${rawText.substring(0, 30000)}`,
        });

        console.log(`Gemini extraction completed in ${(Date.now() - startTime) / 1000}s`);

        await connectDB();

        let account = await UserAccount.findOne({ userId }).sort({ createdAt: -1 });
        if (!account) {
            account = await UserAccount.create({
                userId,
                accountNumber: object.accountNumber || 'UNKNOWN',
                maskedAccountNumber: object.accountNumber ? `XXXX${object.accountNumber}` : 'XXXXUNKNOWN',
                bankName: object.bankName || 'Unknown Bank',
                accountType: 'SAVINGS',
                balance: 0,
                currency: 'INR',
                linkedVia: 'MOCK',
                linkedAt: new Date(),
                isActive: true,
            });
        }

        const savedTransactions = [];
        for (const tx of object.transactions) {
            const savedTx = await Transaction.create({
                accountId: account._id,
                userId,
                amount: tx.amount,
                type: tx.type,
                narration: tx.narration,
                transactionDate: new Date(tx.date),
                category: tx.category || 'OTHER',
                merchant: tx.merchant || 'Unknown',
                sentiment: tx.sentiment || 'ESSENTIAL',
            });

            savedTransactions.push({
                id: savedTx._id.toString(),
                date: tx.date,
                narration: tx.narration,
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                merchant: tx.merchant,
            });
        }

        const totalCredits = savedTransactions
            .filter(tx => tx.type === 'CREDIT')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const totalDebits = savedTransactions
            .filter(tx => tx.type === 'DEBIT')
            .reduce((sum, tx) => sum + tx.amount, 0);

        await UserAccount.findByIdAndUpdate(account._id, {
            $inc: { balance: totalCredits - totalDebits },
            lastUpdated: new Date(),
        });

        return NextResponse.json({
            success: true,
            account: {
                id: account._id.toString(),
                bankName: account.bankName,
                maskedAccountNumber: account.maskedAccountNumber,
            },
            transactions: savedTransactions,
            count: savedTransactions.length,
        });

    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to process PDF' },
            { status: 500 }
        );
    }
}
