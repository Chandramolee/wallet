
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
}

// Schemas for structured output
const MonthInReviewSchema = z.object({
    summary: z.string().describe('2-3 sentence summary of the month'),
    totalIncome: z.number(),
    totalExpenses: z.number(),
    savingsRate: z.number().describe('Savings rate as a percentage'),
    topCategories: z.array(z.object({
        category: z.string(),
        amount: z.number(),
        percentage: z.number(),
    })),
    subscriptionCreep: z.array(z.object({
        name: z.string(),
        amount: z.number(),
        isNew: z.boolean(),
    })),
    weekendVsWeekday: z.object({
        weekendSpending: z.number(),
        weekdaySpending: z.number(),
        insight: z.string(),
    }),
    unusualTransactions: z.array(z.object({
        narration: z.string(),
        amount: z.number(),
        reason: z.string(),
    })),
    recommendations: z.array(z.string()),
});

const YearInReviewSchema = z.object({
    summary: z.string().describe('Executive summary of the year (3-4 sentences)'),
    totalIncome: z.number(),
    totalExpenses: z.number(),
    netSavings: z.number(),
    savingsRate: z.number().describe('Savings rate as a percentage'),
    monthlyTrends: z.array(z.object({
        month: z.string(),
        income: z.number(),
        expenses: z.number(),
    })),
    topMerchants: z.array(z.object({
        merchant: z.string(),
        totalSpent: z.number(),
        visits: z.number(),
    })),
    categoryBreakdown: z.array(z.object({
        category: z.string(),
        amount: z.number(),
        percentage: z.number(),
    })),
    subscriptionAudit: z.array(z.object({
        name: z.string(),
        monthlyAmount: z.number(),
        yearlyTotal: z.number(),
        recommendation: z.string(),
    })),
    spendingPatterns: z.array(z.string()),
    goals: z.array(z.string()),
});

const SpendingPredictionSchema = z.object({
    predictions: z.array(z.object({
        month: z.string(),
        predictedSpending: z.number(),
        confidence: z.number().min(0).max(1),
    })),
    reasoning: z.string().describe('Brief explanation of patterns used for prediction'),
});

interface Transaction {
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    category?: string;
    merchant?: string;
    transactionDate: Date | string;
    narration: string;
}

/**
 * Generate Month in Review insights
 */
export async function generateMonthInReview(transactions: Transaction[]) {
    const formattedTransactions = transactions.map(tx => ({
        amount: tx.amount,
        type: tx.type,
        category: tx.category || 'UNKNOWN',
        merchant: tx.merchant || null,
        date: typeof tx.transactionDate === 'string' ? tx.transactionDate : tx.transactionDate.toISOString(),
        narration: tx.narration,
    }));

    const { object } = await generateObject({
        model: google('gemini-2.5-pro'),
        schema: MonthInReviewSchema,
        prompt: `You are a personal finance analyst. Analyze the following month's transactions and provide insights.

Focus on:
1. Identifying subscription creep (recurring payments that may be unnecessary)
2. Weekend vs weekday spending patterns
3. Unusual or large transactions
4. Actionable recommendations

Transactions:
${JSON.stringify(formattedTransactions, null, 2)}`,
    });

    return object;
}

/**
 * Generate Year in Review insights
 */
export async function generateYearInReview(transactions: Transaction[]) {
    // Sort by date
    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.transactionDate);
        const dateB = new Date(b.transactionDate);
        return dateA.getTime() - dateB.getTime();
    });

    const formattedTransactions = sortedTransactions.map(tx => ({
        amount: tx.amount,
        type: tx.type,
        category: tx.category || 'UNKNOWN',
        merchant: tx.merchant || null,
        date: typeof tx.transactionDate === 'string' ? tx.transactionDate : tx.transactionDate.toISOString(),
        narration: tx.narration,
    }));

    const { object } = await generateObject({
        model: google('gemini-2.5-pro'),
        schema: YearInReviewSchema,
        prompt: `You are a personal finance analyst creating a comprehensive Year in Review. Analyze all transactions and provide deep insights.

Focus on:
1. Long-term trends and patterns
2. Subscription audit with recommendations
3. Seasonal spending patterns
4. Merchant loyalty insights
5. Actionable goals for improvement

All Transactions (${formattedTransactions.length} total):
${JSON.stringify(formattedTransactions, null, 2)}`,
    });

    return object;
}

/**
 * Generate spending predictions using historical patterns
 */
export async function generateSpendingPrediction(
    historicalData: { month: string; spending: number }[],
    monthsToPredict: number = 3
) {
    const { object } = await generateObject({
        model: google('gemini-2.5-pro'),
        schema: SpendingPredictionSchema,
        prompt: `You are a financial forecasting model. Given historical monthly spending data, predict future spending.

Historical data:
${JSON.stringify(historicalData, null, 2)}

Predict the next ${monthsToPredict} months of spending. Consider seasonal patterns, trends, and anomalies.`,
    });

    return object;
}
