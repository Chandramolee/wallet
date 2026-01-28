import { NextRequest, NextResponse } from 'next/server';
import { generateMonthInReview, generateYearInReview } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
    try {
        const { type, transactions } = await req.json();

        if (!transactions || !Array.isArray(transactions)) {
            return NextResponse.json(
                { error: 'Invalid request: transactions array required' },
                { status: 400 }
            );
        }

        if (transactions.length === 0) {
            return NextResponse.json(
                { error: 'No transactions to analyze' },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'month':
                result = await generateMonthInReview(transactions);
                break;
            case 'year':
                result = await generateYearInReview(transactions);
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid type: must be "month" or "year"' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            type,
            insights: result,
            transactionCount: transactions.length,
        });
    } catch (error) {
        console.error('Insights generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate insights' },
            { status: 500 }
        );
    }
}
