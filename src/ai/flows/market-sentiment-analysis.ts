'use server';

/**
 * @fileOverview Analyzes market sentiment for a given stock or sector based on user query in English or Hindi.
 *
 * - analyzeMarketSentiment - A function that handles the market sentiment analysis process.
 * - MarketSentimentInput - The input type for the analyzeMarketSentiment function.
 * - MarketSentimentOutput - The return type for the analyzeMarketSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketSentimentInputSchema = z.object({
  query: z
    .string()
    .describe('The user query about market sentiment in English or Hindi.'),
});
export type MarketSentimentInput = z.infer<typeof MarketSentimentInputSchema>;

const MarketSentimentOutputSchema = z.object({
  sentiment: z.string().describe('The overall market sentiment based on the query.'),
  reasoning: z.string().describe('The reasoning behind the sentiment analysis.'),
});
export type MarketSentimentOutput = z.infer<typeof MarketSentimentOutputSchema>;

export async function analyzeMarketSentiment(input: MarketSentimentInput): Promise<MarketSentimentOutput> {
  return analyzeMarketSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketSentimentPrompt',
  input: {schema: MarketSentimentInputSchema},
  output: {schema: MarketSentimentOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing market sentiment for the Indian stock market (NSE/BSE).

  A user will ask you a question about the market sentiment of a specific stock or sector in either English or Hindi.
  Your task is to analyze the query and provide the overall market sentiment (positive, negative, or neutral) along with the reasoning behind your analysis.

  Query: {{{query}}}

  Respond in the same language as the query.
`,
});

const analyzeMarketSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeMarketSentimentFlow',
    inputSchema: MarketSentimentInputSchema,
    outputSchema: MarketSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
