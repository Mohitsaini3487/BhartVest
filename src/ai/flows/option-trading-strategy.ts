'use server';

/**
 * @fileOverview An AI agent for generating options trading strategies tailored for the Indian market.
 *
 * - generateOptionStrategy - A function that generates options trading strategies.
 * - OptionStrategyInput - The input type for the generateOptionStrategy function.
 * - OptionStrategyOutput - The return type for the generateOptionStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptionStrategyInputSchema = z.object({
  riskProfile: z
    .string()
    .describe(
      'The risk profile of the user (e.g., conservative, moderate, aggressive).'
    ),
  investmentGoals: z
    .string()
    .describe(
      'The investment goals of the user (e.g., capital preservation, income generation, growth).'
    ),
  marketOutlook: z
    .string()
    .optional()
    .describe(
      'The user provided market outlook (e.g., bullish, bearish, neutral).'
    ),
  stock: z.string().optional().describe('The specific stock to trade options on'),
});
export type OptionStrategyInput = z.infer<typeof OptionStrategyInputSchema>;

const OptionStrategyOutputSchema = z.object({
  strategyName: z.string().describe('The name of the options trading strategy.'),
  description: z
    .string()
    .describe('A detailed description of the options trading strategy.'),
  rationale: z
    .string()
    .describe(
      'The rationale behind the strategy, considering the risk profile and investment goals.'
    ),
  risk: z.string().describe('The risk level associated with the strategy.'),
  potentialReturn: z
    .string()
    .describe('The potential return associated with the strategy.'),
  marketConditions: z
    .string()
    .describe(
      'The ideal market conditions for implementing this strategy (e.g., bullish, bearish, neutral, volatile).'
    ),
  exampleTrade: z
    .string()
    .describe(
      'A sample trade demonstrating how to execute the strategy with Indian stock examples (e.g., RELIANCE.NS, TCS.NS).'
    ),
});
export type OptionStrategyOutput = z.infer<typeof OptionStrategyOutputSchema>;

export async function generateOptionStrategy(
  input: OptionStrategyInput
): Promise<OptionStrategyOutput> {
  return optionTradingStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optionTradingStrategyPrompt',
  input: {schema: OptionStrategyInputSchema},
  output: {schema: OptionStrategyOutputSchema},
  prompt: `You are an expert options trading strategist specializing in the Indian stock market (NSE/BSE). Generate an options trading strategy based on the user's risk profile, investment goals, and market outlook. 

Consider factors like NIFTY and SENSEX trends, Indian market volatility, and specific stock examples (e.g., RELIANCE.NS, TCS.NS).

Risk Profile: {{{riskProfile}}}
Investment Goals: {{{investmentGoals}}}
Market Outlook: {{{marketOutlook}}}
Stock: {{{stock}}}

Provide the strategy in the following format:
Strategy Name: <strategy name>
Description: <detailed description>
Rationale: <rationale>
Risk: <risk level>
Potential Return: <potential return>
Market Conditions: <ideal market conditions>
Example Trade: <example trade with Indian stocks>`,
});

const optionTradingStrategyFlow = ai.defineFlow(
  {
    name: 'optionTradingStrategyFlow',
    inputSchema: OptionStrategyInputSchema,
    outputSchema: OptionStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
