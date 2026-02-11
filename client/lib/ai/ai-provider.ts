
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject as originalGenerateObject, LanguageModel } from 'ai';

// OpenRouter uses OpenAI SDK compatibility
const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

// Configure primary model
// Using gemini-1.5-pro as primary (stable)
const GEMINI_MODEL = google('gemini-1.5-pro') as LanguageModel;

// Configure fallback models from OpenRouter (Verified Free IDs as of Feb 2026)
const FALLBACK_MODELS = [
    'openrouter/auto', // OpenRouter's own dynamic router for free models
    'google/gemini-2.0-flash-exp:free', // Re-attempting if transient
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
];

/**
 * Enhanced generateObject with automatic multiple fallbacks to OpenRouter
 */
export async function generateObject<T>(options: any): Promise<{ object: T }> {
    // 1. Try Primary Model (Gemini via Google AI SDK)
    try {
        console.info('[AI] Attempting primary model: gemini-1.5-pro');
        return await originalGenerateObject({
            ...options,
            model: GEMINI_MODEL,
        });
    } catch (primaryError: any) {
        console.warn(`[AI] Primary model failed: ${primaryError.message}`);
        console.info('[AI] Initiating fallback chain via OpenRouter...');

        // 2. Loop through fallback models
        for (const modelId of FALLBACK_MODELS) {
            try {
                console.info(`[AI] Trying fallback model: ${modelId}`);
                return await originalGenerateObject({
                    ...options,
                    model: openrouter(modelId) as LanguageModel,
                });
            } catch (fallbackError: any) {
                console.warn(`[AI] Fallback model ${modelId} failed: ${fallbackError.message}`);
                // Continue to next model in list
            }
        }

        // 3. If everything fails
        const finalError = new Error('All AI models (Primary & Fallbacks) failed to respond.');
        console.error(`[AI] ${finalError.message}`);
        throw finalError;
    }
}

export const ai = {
    generateObject,
};
