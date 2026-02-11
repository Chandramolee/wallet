
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Transaction from '@/lib/db/models/Transaction';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file) return new NextResponse("No file uploaded", { status: 400 });

        const text = await file.text();

        await connectDB();

        // Use AI to parse CSV content without needing complex regex/mapping
        const { object } = await generateObject({
            model: google('gemini-2.5-pro'),
            schema: z.object({
                transactions: z.array(z.object({
                    date: z.string(),
                    narration: z.string(),
                    amount: z.number(),
                    type: z.enum(['INCOME', 'EXPENSE', 'CREDIT', 'DEBIT']),
                    category: z.string(),
                }))
            }),
            prompt: `Parse these CSV transactions into a structured format. 
            CSV CONTENT:
            ${text.substring(0, 10000)}`
        });

        const created = [];
        for (const tx of object.transactions) {
            const newTx = await Transaction.create({
                userId,
                amount: tx.amount,
                type: tx.type,
                narration: tx.narration,
                title: tx.narration,
                transactionDate: new Date(tx.date),
                category: tx.category,
                status: 'COMPLETED'
            });
            created.push(newTx);
        }

        return NextResponse.json({ success: true, count: created.length });
    } catch (error) {
        console.error('[CSV_IMPORT_ERROR]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
