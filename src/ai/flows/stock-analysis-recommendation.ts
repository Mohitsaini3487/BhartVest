'use server';

/**
 * @fileOverview Provides AI-driven stock analysis and investment recommendations for Indian stocks.
 *
 * - analyzeStockAndRecommend - A function that analyzes a stock and provides investment recommendations.
 * - AnalyzeStockInput - The input type for the analyzeStockAndRecommend function.
 * - AnalyzeStockOutput - The return type for the analyzeStockAndRecommend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStockInputSchema = z.object({
  stockSymbol: z
    .string()
    .describe('The stock symbol of the Indian stock to analyze (e.g., RELIANCE.NS).'),
  query: z
    .string()
    .describe(
      'The natural language query in English or Hindi requesting stock analysis and investment recommendation (e.g., Reliance ka performance kaisa hai?).'
    ),
});
export type AnalyzeStockInput = z.infer<typeof AnalyzeStockInputSchema>;

const AnalyzeStockOutputSchema = z.object({
  analysis: z.string().describe('Comprehensive analysis of the stock, including financial performance, market trends, and news sentiment.'),
  recommendation: z.string().describe('Investment recommendation based on the analysis.'),
});
export type AnalyzeStockOutput = z.infer<typeof AnalyzeStockOutputSchema>;

export async function analyzeStockAndRecommend(input: AnalyzeStockInput): Promise<AnalyzeStockOutput> {
  return analyzeStockAndRecommendFlow(input);
}

const analyzeStockPrompt = ai.definePrompt({
  name: 'analyzeStockPrompt',
  input: {schema: AnalyzeStockInputSchema},
  output: {schema: AnalyzeStockOutputSchema},
  prompt: `You are an AI financial assistant specializing in analyzing Indian stocks listed on the NSE and BSE.

You will analyze the provided stock based on its financial performance, market trends, and news sentiment, and provide an investment recommendation.
Ensure all financial data is displayed in Indian Rupees (₹).

Stock Symbol: {{{stockSymbol}}}
User Query: {{{query}}}

Analysis and Recommendation:`,
});

const analyzeStockAndRecommendFlow = ai.defineFlow(
  {
    name: 'analyzeStockAndRecommendFlow',
    inputSchema: AnalyzeStockInputSchema,
    outputSchema: AnalyzeStockOutputSchema,
  },
  async input => {
    const {output} = await analyzeStockPrompt(input);
    return output!;
  }
);
