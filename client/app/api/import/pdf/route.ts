import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
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
    }))
});

// Schema for AI categorization
const CategorySchema = z.object({
    category: z.enum(['FOOD', 'SHOPPING', 'TRANSPORT', 'BILLS', 'ENTERTAINMENT', 'SUBSCRIPTIONS', 'TRANSFERS', 'INCOME', 'INVESTMENTS', 'OTHER']),
    merchant: z.string().optional().describe('Merchant name if identifiable'),
    sentiment: z.enum(['ESSENTIAL', 'DISCRETIONARY', 'SAVINGS']).optional(),
});

export async function POST(req: NextRequest) {
    try {
        console.log('Starting PDF import...');
        // 1. Authenticate user
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

        // 2. Extract Text from PDF
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        const rawText = textResult.text;

        console.log(`PDF Extracted Text Length: ${rawText.length}`);
        if (rawText.length < 100) {
            console.warn('PDF extraction warning: Text too short or empty');
            console.log('Preview:', rawText);
        }

        // 3. Use Gemini Flash to parse transactions
        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: TransactionSchema,
            prompt: `Extract financial transactions from this bank statement.
Also try to identify the bank name and last 4 digits of account number if visible.
Identify the date, description (narration), amount, and type (CREDIT/DEBIT).
For amounts, always use positive numbers - use the type field to indicate debit/credit.

BANK STATEMENT TEXT:
${rawText.substring(0, 30000)}`,
        });

        console.log('Gemini Parsed Object:', JSON.stringify(object, null, 2));

        // 4. Connect to database
        await connectDB();

        // 5. Create or get user account
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
                linkedVia: 'MOCK', // PDF import is manual
                linkedAt: new Date(),
                isActive: true,
            });
        }

        // 6. Save transactions to DB and categorize
        const savedTransactions = [];
        for (const tx of object.transactions) {
            // AI categorization
            const { object: categoryObj } = await generateObject({
                model: google('gemini-2.5-flash'),
                schema: CategorySchema,
                prompt: `Categorize this transaction:
Narration: ${tx.narration}
Amount: ₹${tx.amount}
Type: ${tx.type}

Return the most appropriate category, merchant name if identifiable, and whether it's essential/discretionary/savings.`,
            });

            const savedTx = await Transaction.create({
                accountId: account._id,
                userId,
                amount: tx.amount,
                type: tx.type,
                narration: tx.narration,
                transactionDate: new Date(tx.date),
                category: categoryObj.category,
                merchant: categoryObj.merchant,
                sentiment: categoryObj.sentiment,
            });

            savedTransactions.push({
                id: savedTx._id.toString(),
                date: tx.date,
                narration: tx.narration,
                amount: tx.amount,
                type: tx.type,
                category: categoryObj.category,
                merchant: categoryObj.merchant,
            });
        }

        // 7. Update account balance based on transactions
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
