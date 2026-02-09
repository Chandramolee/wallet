import { NextRequest, NextResponse } from 'next/server';
import { generateMonthInReview, generateYearInReview } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
    try {
        const { transactions } = await req.json();

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

        // Generate Month in Review insights
        const result = await generateMonthInReview(transactions);

        // Transform into UI-friendly Insight objects
        const insights = [];

        // 1. Subscription Alert
        if (result.subscriptionCreep && result.subscriptionCreep.length > 0) {
            insights.push({
                icon: 'alert',
                iconBg: 'bg-red-50',
                iconColor: 'text-red-600',
                title: 'Subscription Alert',
                description: `Found ${result.subscriptionCreep.length} potentially unwanted subscriptions totaling ₹${result.subscriptionCreep.reduce((sum, s) => sum + s.amount, 0)}. Check: ${result.subscriptionCreep.map(s => s.name).join(', ')}`,
                badge: 'Action Needed',
                badgeColor: 'bg-red-50 text-red-700',
                confidence: 90
            });
        }

        // 2. Weekend Spending
        if (result.weekendVsWeekday) {
            const isWeekendHigher = result.weekendVsWeekday.weekendSpending > result.weekendVsWeekday.weekdaySpending;
            insights.push({
                icon: isWeekendHigher ? 'trending_up' : 'trending_down',
                iconBg: isWeekendHigher ? 'bg-orange-50' : 'bg-blue-50',
                iconColor: isWeekendHigher ? 'text-orange-600' : 'text-blue-600',
                title: 'Weekend vs Weekday',
                description: result.weekendVsWeekday.insight,
                badge: 'Spending Pattern',
                badgeColor: 'bg-blue-50 text-blue-700',
                confidence: 85
            });
        }

        // 3. Top Category
        if (result.topCategories && result.topCategories.length > 0) {
            const top = result.topCategories[0];
            insights.push({
                icon: 'percent',
                iconBg: 'bg-purple-50',
                iconColor: 'text-purple-600',
                title: 'Top Spending Category',
                description: `You spent ₹${top.amount} on ${top.category}, which is ${top.percentage}% of your total expenses.`,
                badge: 'Analysis',
                badgeColor: 'bg-purple-50 text-purple-700',
                confidence: 100
            });
        }

        // 4. Unusual Transactions
        if (result.unusualTransactions && result.unusualTransactions.length > 0) {
            insights.push({
                icon: 'alert',
                iconBg: 'bg-yellow-50',
                iconColor: 'text-yellow-600',
                title: 'Unusual Transactions',
                description: `Detected ${result.unusualTransactions.length} unusual transactions: ${result.unusualTransactions.map(t => `${t.narration} (₹${t.amount})`).join(', ')}`,
                badge: 'Review',
                badgeColor: 'bg-yellow-50 text-yellow-700',
                confidence: 80
            });
        }

        // 5. General Recommendations
        if (result.recommendations && result.recommendations.length > 0) {
            insights.push({
                icon: 'trending_up',
                iconBg: 'bg-green-50',
                iconColor: 'text-green-600',
                title: 'Savings Opportunity',
                description: result.recommendations[0],
                badge: 'Tip',
                badgeColor: 'bg-green-50 text-green-700',
                confidence: 95
            });
        }

        return NextResponse.json({ insights });

    } catch (error) {
        console.error('Insights generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate insights' },
            { status: 500 }
        );
    }
}
