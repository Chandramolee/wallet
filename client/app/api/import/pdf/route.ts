import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import pdfHook from 'pdf-parse/lib/pdf-parse.js';

// Schema for extracted transactions
const TransactionSchema = z.object({
    transactions: z.array(z.object({
        date: z.string().describe('Date of transaction in YYYY-MM-DD format'),
        narration: z.string().describe('Description or narration of the transaction'),
        amount: z.number().describe('Amount of the transaction. Positive for credit, negative for debit.'),
        type: z.enum(['CREDIT', 'DEBIT']).describe('Type of transaction'),
    }))
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Extract Text from PDF
        // Using pdf-parse for raw text extraction is efficient and cheap
        const pdfData = await pdfHook(buffer);
        const rawText = pdfData.text;

        // 2. Use Gemini Flash to parsing structure
        // We send the raw text to Gemini Flash which is fast & cheap
        const { object } = await generateObject({
            model: google('gemini-1.5-flash'),
            schema: TransactionSchema,
            prompt: `Extract financial transactions from the following bank statement text. 
      Identify the date, description (narration), amount, and type (CREDIT/DEBIT).
      For amounts, ensure debits are handled correctly (ensure no negative signs in the amount field, use type instead).
      Return JSON.
      
      BANK STATEMENT TEXT:
      ${rawText.substring(0, 30000)} // Limiting context window just in case
      `,
        });

        return NextResponse.json({
            transactions: object.transactions,
            rawTextLength: rawText.length
        });

    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to process PDF' },
            { status: 500 }
        );
    }
}
