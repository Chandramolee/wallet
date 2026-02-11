
import { ai } from './ai-provider';
import { z } from 'zod';

/**
 * OpenRouter API Wrapper
 * Refactored to use the unified ai-provider with fallback support.
 */

const CategorizedTransactionSchema = z.object({
    narration: z.string(),
    category: z.enum([
        'FOOD', 'SHOPPING', 'TRANSPORT', 'BILLS', 'ENTERTAINMENT',
        'SUBSCRIPTIONS', 'TRANSFERS', 'INCOME', 'INVESTMENTS', 'OTHER'
    ]),
    merchant: z.string().nullable(),
    sentiment: z.enum(['ESSENTIAL', 'DISCRETIONARY', 'SAVINGS']),
});

const BatchCategorizationSchema = z.array(CategorizedTransactionSchema);

export async function categorizeTransactions(narrations: string[]) {
    const { object } = await ai.generateObject<any>({
        schema: z.object({
            categorized: BatchCategorizationSchema
        }),
        system: `You are a financial transaction categorizer for Indian users. 
        Given a list of transaction narrations, return a JSON array with categorized transactions.

        Categories:
        - FOOD: Restaurants, food delivery (Zomato, Swiggy), groceries
        - SHOPPING: E-commerce, retail (Amazon, Flipkart, Myntra)
        - TRANSPORT: Cab rides (Uber, Ola), fuel, public transport, travel
        - BILLS: Utilities (electricity, gas, water), phone/internet
        - ENTERTAINMENT: Movies, gaming, events
        - SUBSCRIPTIONS: Netflix, Spotify, Apple, recurring services
        - TRANSFERS: UPI/NEFT/IMPS transfers to individuals
        - INCOME: Salary, refunds, cashback, interest
        - INVESTMENTS: Mutual funds, stocks, trading
        - OTHER: Cannot be categorized

        Sentiment:
        - ESSENTIAL: Bills, groceries, necessary transport
        - DISCRETIONARY: Entertainment, dining out, shopping
        - SAVINGS: Investments, interest income`,
        prompt: `Categorize these transactions: ${JSON.stringify(narrations)}`,
    });

    return object.categorized;
}

/**
 * Batch categorize transactions (handles rate limiting and provider-level fallbacks)
 */
export async function batchCategorizeTransactions(
    narrations: string[],
    batchSize: number = 20
) {
    const results: any[] = [];

    for (let i = 0; i < narrations.length; i += batchSize) {
        const batch = narrations.slice(i, i + batchSize);
        try {
            const categorized = await categorizeTransactions(batch);
            results.push(...categorized);
        } catch (error) {
            console.error(`[AI_BATCH_CAT_ERROR] Failed batch ${i / batchSize}:`, error);
            // On complete failure of a batch, return original narrations with OTHER category
            results.push(...batch.map(n => ({
                narration: n,
                category: 'OTHER',
                merchant: null,
                sentiment: 'DISCRETIONARY'
            })));
        }

        // Small delay between batches to be respectful to free tier rate limits
        if (i + batchSize < narrations.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}
