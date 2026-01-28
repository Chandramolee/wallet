/**
 * OpenRouter API Wrapper
 * Used for high-volume tasks like auto-tagging transactions
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenRouterResponse {
    id: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
    }[];
}

interface CategorizedTransaction {
    narration: string;
    category: string;
    merchant: string | null;
    sentiment: 'ESSENTIAL' | 'DISCRETIONARY' | 'SAVINGS';
}

const CATEGORIZATION_SYSTEM_PROMPT = `You are a financial transaction categorizer for Indian users. 

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
- SAVINGS: Investments, interest income

Return ONLY valid JSON array. No markdown, no explanations.

Example input: ["ZOMATO*1234", "NETFLIX SUBSCRIPTION", "SALARY CREDIT"]
Example output: [{"narration":"ZOMATO*1234","category":"FOOD","merchant":"Zomato","sentiment":"DISCRETIONARY"},{"narration":"NETFLIX SUBSCRIPTION","category":"SUBSCRIPTIONS","merchant":"Netflix","sentiment":"DISCRETIONARY"},{"narration":"SALARY CREDIT","category":"INCOME","merchant":null,"sentiment":"SAVINGS"}]`;

export async function categorizeTransactions(narrations: string[]): Promise<CategorizedTransaction[]> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const messages: OpenRouterMessage[] = [
        { role: 'system', content: CATEGORIZATION_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(narrations) },
    ];

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Fold-JS',
        },
        body: JSON.stringify({
            model: 'anthropic/claude-3-haiku', // Fast and cheap for high-volume
            messages,
            temperature: 0.1, // Low temp for consistent categorization
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No response from OpenRouter');
    }

    try {
        // Parse the JSON response
        const parsed = JSON.parse(content);
        return parsed as CategorizedTransaction[];
    } catch (e) {
        console.error('Failed to parse OpenRouter response:', content);
        throw new Error('Invalid JSON response from OpenRouter');
    }
}

/**
 * Batch categorize transactions (handles rate limiting)
 */
export async function batchCategorizeTransactions(
    narrations: string[],
    batchSize: number = 20
): Promise<CategorizedTransaction[]> {
    const results: CategorizedTransaction[] = [];

    for (let i = 0; i < narrations.length; i += batchSize) {
        const batch = narrations.slice(i, i + batchSize);
        const categorized = await categorizeTransactions(batch);
        results.push(...categorized);

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < narrations.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}
