
import { ai } from './ai-provider';
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

    const { object } = await ai.generateObject<any>({
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

    const { object } = await ai.generateObject<any>({
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
    const { object } = await ai.generateObject<any>({
        schema: SpendingPredictionSchema,
        prompt: `You are a financial forecasting model. Given historical monthly spending data, predict future spending.

Historical data:
${JSON.stringify(historicalData, null, 2)}

Predict the next ${monthsToPredict} months of spending. Consider seasonal patterns, trends, and anomalies.`,
    });


    return object;
}

/**
 * Generate report insights
 */
export async function generateReportInsights(data: {
    totalIncome: number;
    totalExpenses: number;
    availableBalance: number;
    savingsRate: number;
    categories: Record<string, { amount: number; percentage: number }>;
    periodLabel: string;
}) {
    const categoryList = Object.entries(data.categories)
        .map(([name, { amount, percentage }]) => `- ${name}: ${amount} (${percentage}%)`)
        .join("\n");

    const prompt = `
      You are the AI brain behind "Fold" (formerly "Finora"). Your core philosophy is: "Be Painfully Aware."
      
      Your goal is to provide brutal but constructive transparency. If they are doing well, be concise. If they are overspending or have "subscription creep", be blunt and highlight the pain point clearly.

      Your job is to give **exactly 3 short, sharp insights** to the user based on their data. 

      🧾 Report for: ${data.periodLabel}
      - Total Income: $${data.totalIncome.toFixed(2)}
      - Total Expenses: $${data.totalExpenses.toFixed(2)}
      - Available Balance: $${data.availableBalance.toFixed(2)}
      - Savings Rate: ${data.savingsRate}%

      Top Expense Categories:
      ${categoryList}

      📌 Guidelines:
      - Keep each insight to one short, realistic, personalized sentence.
      - Be transparent about where the money is "leaking".
      - Use a "smart money coach" persona that doesn't sugarcoat the facts.
      - Include specific data when helpful and comma to amount.
    `.trim();

    const { object } = await ai.generateObject<any>({
        schema: z.object({
            insights: z.array(z.string()).length(3)
        }),
        prompt: prompt,
    });

    return object.insights;
}

/**
 * Scan receipt
 */
export async function scanReceipt(base64Image: string) {
    const prompt = `
      You are a financial assistant that helps users analyze and extract transaction details from receipt image.
      Analyze this receipt image and extract transaction details matching the schema.

      Rules:
      1. Amount must be positive
      2. Date must be valid and in ISO format
      3. If uncertain about any field, omit it
      4. If not a receipt, return empty object
    `.trim();

    const { object } = await ai.generateObject<any>({
        schema: z.object({
            title: z.string().describe('Merchant/store name or brief description'),
            amount: z.number().positive(),
            date: z.string().describe('ISO date string YYYY-MM-DD'),
            description: z.string().optional().describe('Items purchased summary'),
            category: z.string(),
            type: z.enum(['EXPENSE']).default('EXPENSE'),
            paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'AUTO_DEBIT', 'CASH', 'OTHER']).optional(),
        }),
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image', image: base64Image } // base64 string
                ]
            }
        ]
    });

    return object;
}

/**
 * Generate smart insights for the Insights page
 */
export async function generateSmartInsights(transactions: Transaction[]) {
    const formattedTransactions = transactions.slice(0, 50).map(tx => ({
        amount: tx.amount,
        type: tx.type,
        category: tx.category || 'UNKNOWN',
        merchant: tx.merchant || null,
        date: typeof tx.transactionDate === 'string' ? tx.transactionDate : tx.transactionDate.toISOString(),
        narration: tx.narration,
    }));

    const InsightSchema = z.object({
        icon: z.enum(['trending_up', 'trending_down', 'alert', 'percent']),
        iconBg: z.string(),
        iconColor: z.string(),
        title: z.string(),
        description: z.string(),
        badge: z.string(),
        badgeColor: z.string(),
        confidence: z.number().min(0).max(100),
    });

    const { object } = await ai.generateObject<any>({
        schema: z.object({
            insights: z.array(InsightSchema).length(3)
        }),
        prompt: `You are a personal finance coach. Analyze the last 50 transactions and provide 3 smart, actionable insights.
        
        Guidelines for the response:
        - icon: 'trending_up' (for growth/improvement), 'trending_down' (for reduced spending), 'alert' (for warnings), 'percent' (for ratio/relative stats)
        - iconBg/iconColor: use Tailwind color classes (e.g. bg-blue-50/text-blue-600)
        - title: Short and catchy (e.g. "Dining Out Spurge", "Subscription Audit")
        - description: One helpful, personalized sentence based on actual transaction patterns.
        - badge: Short status (e.g. "Critical", "Good Job", "Opportunity")
        - confidence: 0-100 rating of how sure you are about this pattern.
        
        Transactions:
        ${JSON.stringify(formattedTransactions, null, 2)}`,
    });

    return object.insights;
}
