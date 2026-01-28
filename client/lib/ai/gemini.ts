/**
 * Gemini 1.5 Pro API Wrapper
 * Used for heavy-lifting tasks: Year in Review, Month in Review, deep insights
 * Leverages 1M token context for comprehensive analysis
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }

    if (!model) {
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    }

    return model;
}

interface Transaction {
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    category?: string;
    merchant?: string;
    transactionDate: Date | string;
    narration: string;
}

interface MonthInReviewResult {
    summary: string;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
    topCategories: { category: string; amount: number; percentage: number }[];
    subscriptionCreep: { name: string; amount: number; isNew: boolean }[];
    weekendVsWeekday: { weekendSpending: number; weekdaySpending: number; insight: string };
    unusualTransactions: { narration: string; amount: number; reason: string }[];
    recommendations: string[];
}

interface YearInReviewResult {
    summary: string;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    monthlyTrends: { month: string; income: number; expenses: number }[];
    topMerchants: { merchant: string; totalSpent: number; visits: number }[];
    categoryBreakdown: { category: string; amount: number; percentage: number }[];
    subscriptionAudit: { name: string; monthlyAmount: number; yearlyTotal: number; recommendation: string }[];
    spendingPatterns: string[];
    goals: string[];
}

const MONTH_IN_REVIEW_PROMPT = `You are a personal finance analyst. Analyze the following month's transactions and provide insights.

Return a JSON object with this exact structure:
{
  "summary": "2-3 sentence summary of the month",
  "totalIncome": number,
  "totalExpenses": number,
  "savingsRate": number (percentage),
  "topCategories": [{"category": string, "amount": number, "percentage": number}],
  "subscriptionCreep": [{"name": string, "amount": number, "isNew": boolean}],
  "weekendVsWeekday": {"weekendSpending": number, "weekdaySpending": number, "insight": string},
  "unusualTransactions": [{"narration": string, "amount": number, "reason": string}],
  "recommendations": [strings]
}

Focus on:
1. Identifying subscription creep (recurring payments that may be unnecessary)
2. Weekend vs weekday spending patterns
3. Unusual or large transactions
4. Actionable recommendations

Return ONLY valid JSON. No markdown code blocks.`;

const YEAR_IN_REVIEW_PROMPT = `You are a personal finance analyst creating a comprehensive Year in Review. Analyze all transactions and provide deep insights.

Return a JSON object with this exact structure:
{
  "summary": "Executive summary of the year (3-4 sentences)",
  "totalIncome": number,
  "totalExpenses": number,
  "netSavings": number,
  "savingsRate": number (percentage),
  "monthlyTrends": [{"month": "Jan 2025", "income": number, "expenses": number}],
  "topMerchants": [{"merchant": string, "totalSpent": number, "visits": number}],
  "categoryBreakdown": [{"category": string, "amount": number, "percentage": number}],
  "subscriptionAudit": [{"name": string, "monthlyAmount": number, "yearlyTotal": number, "recommendation": string}],
  "spendingPatterns": [strings describing patterns],
  "goals": [suggested financial goals for next year]
}

Focus on:
1. Long-term trends and patterns
2. Subscription audit with recommendations
3. Seasonal spending patterns
4. Merchant loyalty insights
5. Actionable goals for improvement

Return ONLY valid JSON. No markdown code blocks.`;

/**
 * Generate Month in Review insights
 */
export async function generateMonthInReview(transactions: Transaction[]): Promise<MonthInReviewResult> {
    const model = getModel();

    const formattedTransactions = transactions.map(tx => ({
        amount: tx.amount,
        type: tx.type,
        category: tx.category || 'UNKNOWN',
        merchant: tx.merchant || null,
        date: typeof tx.transactionDate === 'string' ? tx.transactionDate : tx.transactionDate.toISOString(),
        narration: tx.narration,
    }));

    const result = await model.generateContent([
        MONTH_IN_REVIEW_PROMPT,
        `\n\nTransactions:\n${JSON.stringify(formattedTransactions, null, 2)}`,
    ]);

    const text = result.response.text();

    try {
        // Clean up potential markdown code blocks
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned) as MonthInReviewResult;
    } catch (e) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Invalid JSON response from Gemini');
    }
}

/**
 * Generate Year in Review insights (uses full 1M context)
 */
export async function generateYearInReview(transactions: Transaction[]): Promise<YearInReviewResult> {
    const model = getModel();

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

    const result = await model.generateContent([
        YEAR_IN_REVIEW_PROMPT,
        `\n\nAll Transactions (${formattedTransactions.length} total):\n${JSON.stringify(formattedTransactions, null, 2)}`,
    ]);

    const text = result.response.text();

    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned) as YearInReviewResult;
    } catch (e) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Invalid JSON response from Gemini');
    }
}

/**
 * Generate spending predictions using historical patterns
 */
export async function generateSpendingPrediction(
    historicalData: { month: string; spending: number }[],
    monthsToPredict: number = 3
): Promise<{ predictions: { month: string; predictedSpending: number; confidence: number }[]; reasoning: string }> {
    const model = getModel();

    const prompt = `You are a financial forecasting model. Given historical monthly spending data, predict future spending.

Historical data:
${JSON.stringify(historicalData, null, 2)}

Predict the next ${monthsToPredict} months of spending.

Return JSON:
{
  "predictions": [{"month": "Feb 2026", "predictedSpending": number, "confidence": 0.0-1.0}],
  "reasoning": "Brief explanation of patterns used for prediction"
}

Consider seasonal patterns, trends, and anomalies. Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('Failed to parse Gemini prediction:', text);
        throw new Error('Invalid JSON response from Gemini');
    }
}
