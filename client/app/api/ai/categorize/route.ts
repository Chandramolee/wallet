import { NextRequest, NextResponse } from 'next/server';
import { batchCategorizeTransactions } from '@/lib/ai/openrouter';

export async function POST(req: NextRequest) {
    try {
        const { narrations } = await req.json();

        if (!narrations || !Array.isArray(narrations)) {
            return NextResponse.json(
                { error: 'Invalid request: narrations array required' },
                { status: 400 }
            );
        }

        if (narrations.length === 0) {
            return NextResponse.json({ categorized: [] });
        }

        if (narrations.length > 100) {
            return NextResponse.json(
                { error: 'Maximum 100 transactions per request' },
                { status: 400 }
            );
        }

        const categorized = await batchCategorizeTransactions(narrations);

        return NextResponse.json({
            categorized,
            count: categorized.length,
        });
    } catch (error) {
        console.error('Categorization error:', error);
        return NextResponse.json(
            { error: 'Failed to categorize transactions' },
            { status: 500 }
        );
    }
}
