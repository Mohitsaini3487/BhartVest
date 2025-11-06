'use server';
/**
 * @fileOverview Analyzes user expenses and provides a summary and suggestions.
 *
 * - analyzeExpenses - A function that handles the expense analysis process.
 * - categorizeExpense - A function to automatically categorize an expense.
 */

import { ai } from '@/ai/genkit';
import {
    AnalyzeExpensesInputSchema,
    AnalyzeExpensesOutputSchema,
    type AnalyzeExpensesInput,
    type AnalyzeExpensesOutput,
    CategorizeExpenseInputSchema,
    CategorizeExpenseOutputSchema,
    type CategorizeExpenseInput,
    type CategorizeExpenseOutput
} from '@/ai/schemas/expense-analysis-schemas';


export async function analyzeExpenses(input: AnalyzeExpensesInput): Promise<AnalyzeExpensesOutput> {
  return analyzeExpensesFlow(input);
}

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
    return categorizeExpenseFlow(input);
}

const analyzePrompt = ai.definePrompt({
  name: 'expenseAnalysisPrompt',
  input: { schema: AnalyzeExpensesInputSchema },
  output: { schema: AnalyzeExpensesOutputSchema },
  prompt: `You are an AI financial assistant. Analyze the following list of expenses and provide a helpful summary of spending habits and actionable suggestions for improvement.

The user has provided their expenses in the following JSON format:
{{{json expenses}}}

Based on this data, provide a 'summary' of their spending (e.g., "You spent the most on [category] this month.") and 'suggestions' for how they could save money (e.g., "Consider reducing your spending on dining out.").

Provide the response in a friendly and encouraging tone. All currency is in INR.`,
});

const analyzeExpensesFlow = ai.defineFlow(
  {
    name: 'analyzeExpensesFlow',
    inputSchema: AnalyzeExpensesInputSchema,
    outputSchema: AnalyzeExpensesOutputSchema,
  },
  async (input) => {
    const { output } = await analyzePrompt(input);
    return output!;
  }
);


const categorizePrompt = ai.definePrompt({
    name: 'categorizeExpensePrompt',
    input: { schema: CategorizeExpenseInputSchema },
    output: { schema: CategorizeExpenseOutputSchema },
    prompt: `You are an AI assistant that categorizes expenses. Based on the expense name, suggest the most relevant category from the provided list.

    Expense Name: {{{expenseName}}}
    
    Available Categories:
    - food
    - transport
    - housing
    - utilities
    - entertainment
    - health
    - shopping
    - other
    
    Your response must be one of the categories from the list above.`,
});

const categorizeExpenseFlow = ai.defineFlow(
    {
        name: 'categorizeExpenseFlow',
        inputSchema: CategorizeExpenseInputSchema,
        outputSchema: CategorizeExpenseOutputSchema,
    },
    async (input) => {
        const { output } = await categorizePrompt(input);
        return output!;
    }
);
