
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { scanReceipt } from '@/lib/ai/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { image } = body; // Expect base64 image string

        if (!image) {
            return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
        }

        // Clean base64 string if it has data prefix
        const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

        const result = await scanReceipt(base64Image);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Receipt scan error:', error);
        return NextResponse.json(
            { error: 'Failed to scan receipt' },
            { status: 500 }
        );
    }
}
