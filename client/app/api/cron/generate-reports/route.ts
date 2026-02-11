
import { NextResponse } from 'next/server';
import { processScheduledReports } from '@/lib/reports/processor';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Simple secret check for "cron" (in real app use Vercel Cron Secret or similar)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await processScheduledReports();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cron report generation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
