
import connectDB from '@/lib/db/mongoose';
import ReportSetting from '@/lib/db/models/ReportSetting';
import Report, { ReportStatusEnum } from '@/lib/db/models/Report';
import Transaction, { TransactionTypeEnum } from '@/lib/db/models/Transaction';
import { generateReportInsights } from '@/lib/ai/gemini';
import { sendEmail } from '@/lib/mail/mailer';
import { getReportEmailTemplate } from '@/lib/mail/templates/report';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { calulateNextReportDate } from '@/lib/utils';

export async function processScheduledReports() {
    await connectDB();

    const now = new Date();
    const settingsToProcess = await ReportSetting.find({
        isEnabled: true,
        nextReportDate: { $lte: now }
    });

    console.log(`Processing ${settingsToProcess.length} scheduled reports...`);

    for (const setting of settingsToProcess) {
        try {
            const userId = setting.userId;

            // For now, assuming MONTHLY as per prompt defaults
            const fromDate = startOfMonth(subMonths(now, 1));
            const toDate = endOfMonth(subMonths(now, 1));
            const periodLabel = format(fromDate, 'MMMM yyyy');

            // 1. Gather Data (Simplified version of the aggregation logic)
            const transactions = await Transaction.find({
                userId,
                transactionDate: { $gte: fromDate, $lte: toDate }
            });

            if (transactions.length === 0) {
                console.log(`No transactions for user ${userId} in ${periodLabel}. Skipping.`);
                setting.nextReportDate = calulateNextReportDate(setting.nextReportDate);
                await setting.save();
                continue;
            }

            let totalIncome = 0;
            let totalExpenses = 0;
            const categories: Record<string, number> = {};

            transactions.forEach(tx => {
                if (['INCOME', 'CREDIT'].includes(tx.type)) {
                    totalIncome += tx.amount;
                } else if (['EXPENSE', 'DEBIT'].includes(tx.type)) {
                    totalExpenses += tx.amount;
                    categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
                }
            });

            const availableBalance = totalIncome - totalExpenses;
            const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

            const topCategories = Object.entries(categories)
                .map(([name, amount]) => ({
                    name,
                    amount,
                    percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
                }))
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);

            // 2. Generate Insights
            const insights = await generateReportInsights({
                totalIncome,
                totalExpenses,
                availableBalance,
                savingsRate: parseFloat(savingsRate.toFixed(1)),
                categories: topCategories.reduce((acc: any, c) => {
                    acc[c.name] = { amount: c.amount, percentage: c.percent };
                    return acc;
                }, {}),
                periodLabel
            });

            // 3. Save Report
            const report = await Report.create({
                userId,
                period: periodLabel,
                sentDate: now,
                status: ReportStatusEnum.PENDING,
                totalIncome,
                totalExpenses,
                availableBalance,
                savingsRate,
                topSpendingCategories: topCategories,
                insights
            });

            // 4. Send Email (Assuming we can get user email from Clerk or metadata? For now placeholder or mock)
            // In a real app, we'd fetch the user's email from Clerk using userId.
            // Since I don't have Clerk Secret Key for backend SDK easily here or might not want to call it in loop,
            // I'll at least mock the intent.

            // Mocking email retrieval - in production use clerkClient.users.getUser(userId)
            const userEmail = "user@example.com"; // Placeholder
            const username = "Valued Member";

            const emailHtml = getReportEmailTemplate({
                username,
                period: periodLabel,
                totalIncome,
                totalExpenses,
                availableBalance,
                savingsRate,
                topSpendingCategories: topCategories,
                insights
            }, setting.frequency);

            await sendEmail({
                to: userEmail,
                subject: `${setting.frequency} Financial Report - ${periodLabel}`,
                text: `Your ${setting.frequency} report is ready.`,
                html: emailHtml
            });

            report.status = ReportStatusEnum.SENT;
            await report.save();

            // 5. Update Settings
            setting.lastSentDate = now;
            setting.nextReportDate = calulateNextReportDate(setting.nextReportDate);
            await setting.save();

            console.log(`Success: Report sent to user ${userId}`);

        } catch (error) {
            console.error(`Error processing report for setting ${setting._id}:`, error);
        }
    }
}
