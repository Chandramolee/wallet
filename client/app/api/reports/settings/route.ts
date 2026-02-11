
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import ReportSetting from '@/lib/db/models/ReportSetting';
import { calulateNextReportDate } from '@/lib/utils';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();

        let settings = await ReportSetting.findOne({ userId });

        if (!settings) {
            settings = await ReportSetting.create({
                userId,
                isEnabled: true,
                frequency: 'MONTHLY',
                nextReportDate: calulateNextReportDate(),
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch report settings' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { isEnabled, frequency } = await req.json();
        await connectDB();

        const existingSettings = await ReportSetting.findOne({ userId });
        if (!existingSettings) {
            return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
        }

        let nextReportDate = existingSettings.nextReportDate;

        if (isEnabled && !existingSettings.isEnabled) {
            // If being enabled, calculate next date if missing or in past
            if (!nextReportDate || nextReportDate <= new Date()) {
                nextReportDate = calulateNextReportDate(existingSettings.lastSentDate);
            }
        }

        existingSettings.set({
            isEnabled: isEnabled ?? existingSettings.isEnabled,
            frequency: frequency ?? existingSettings.frequency,
            nextReportDate,
        });

        await existingSettings.save();

        return NextResponse.json(existingSettings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update report settings' }, { status: 500 });
    }
}
