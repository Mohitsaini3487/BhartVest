/**
 * @fileOverview Zod schemas and TypeScript types for the expense analysis flow.
 */
import { z } from 'zod';

const ExpenseSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  category: z.string(),
  date: z.string(),
});

export const AnalyzeExpensesInputSchema = z.object({
  expenses: z.array(ExpenseSchema),
});
export type AnalyzeExpensesInput = z.infer<typeof AnalyzeExpensesInputSchema>;

export const AnalyzeExpensesOutputSchema = z.object({
  summary: z.string().describe("A brief summary of the user's spending habits."),
  suggestions: z.string().describe('Actionable suggestions for how the user can save money or manage their budget better.'),
});
export type AnalyzeExpensesOutput = z.infer<typeof AnalyzeExpensesOutputSchema>;


export const CategorizeExpenseInputSchema = z.object({
    expenseName: z.string().describe("The name of the expense to be categorized."),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

export const CategorizeExpenseOutputSchema = z.object({
    category: z.string().describe("The suggested category for the expense."),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;
