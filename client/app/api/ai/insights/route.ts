
import { NextResponse } from 'next/server';
import { generateSmartInsights } from '@/lib/ai/gemini';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { transactions } = body;

        if (!transactions || !Array.isArray(transactions)) {
            return new NextResponse("Invalid transactions data", { status: 400 });
        }

        const insights = await generateSmartInsights(transactions);

        return NextResponse.json({ insights });
    } catch (error) {
        console.error('[AI_INSIGHTS_ERROR]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
