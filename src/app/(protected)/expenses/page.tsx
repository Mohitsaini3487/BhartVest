'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PiggyBank, PlusCircle, Sparkles } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { analyzeExpenses, categorizeExpense } from '@/ai/flows/expense-analysis';
import type { AnalyzeExpensesOutput } from '@/ai/schemas/expense-analysis-schemas';
import { Loader2, Bot } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import debounce from 'lodash.debounce';

const expenseSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  category: z.string().min(1, { message: 'Category is required' }),
  date: z.date({ required_error: 'Date is required' }),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

type Expense = ExpenseFormValues & { id: string };

const expenseCategories = [
  'food', 'transport', 'housing', 'utilities', 'entertainment', 'health', 'shopping', 'other'
];

export default function ExpensesPage() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeExpensesOutput | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      category: '',
      date: new Date(),
    },
  });

  const onSubmit: SubmitHandler<ExpenseFormValues> = (data) => {
    const newExpense: Expense = { ...data, id: new Date().toISOString() };
    setExpenses((prev) => [newExpense, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    reset();
  };
  
  const handleAnalyzeExpenses = async () => {
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeExpenses({ expenses: expenses.map(e => ({...e, date: e.date.toISOString()})) });
      setAnalysisResult(result);
    } catch (error) {
      console.error("Failed to analyze expenses:", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const debouncedCategorize = useCallback(
    debounce(async (expenseName: string) => {
      if (!expenseName) return;
      setIsCategorizing(true);
      try {
        const result = await categorizeExpense({ expenseName });
        if (result.category && expenseCategories.includes(result.category)) {
          setValue('category', result.category, { shouldValidate: true });
        }
      } catch (error) {
        console.error("Failed to categorize expense:", error);
      } finally {
        setIsCategorizing(false);
      }
    }, 1000),
    []
  );

  const expenseName = watch('name');
  useState(() => {
    debouncedCategorize(expenseName);
  }, [expenseName, debouncedCategorize]);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={t('expenses.title')} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>{t('expenses.add_expense')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('expenses.expense_name')}</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('expenses.amount')}</Label>
                  <Input id="amount" type="number" step="0.01" {...register('amount')} />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t('expenses.category')}</Label>
                  <div className="relative">
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('expenses.select_category')} />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{t(`expenses.categories.${cat}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                     {isCategorizing && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="date">{t('expenses.date')}</Label>
                   <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker date={field.value} setDate={field.onChange} />
                    )}
                  />
                  {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('expenses.add')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('expenses.monthly_expenses')}</CardTitle>
              <CardDescription>{t('expenses.expenses_list_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('expenses.expense_name')}</TableHead>
                      <TableHead>{t('expenses.category')}</TableHead>
                      <TableHead>{t('expenses.date')}</TableHead>
                      <TableHead className="text-right">{t('expenses.amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell>{t(`expenses.categories.${expense.category}`)}</TableCell>
                        <TableCell>{format(expense.date, 'PPP')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                    <PiggyBank className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">{t('expenses.no_expenses')}</p>
                    <p className="text-sm text-muted-foreground">{t('expenses.no_expenses_desc')}</p>
                </div>
              )}
            </CardContent>
            {expenses.length > 0 && (
              <CardFooter className="justify-end">
                <Button onClick={handleAnalyzeExpenses} disabled={loadingAnalysis}>
                  {loadingAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {loadingAnalysis ? t('expenses.analyzing') : t('expenses.analyze_expenses')}
                </Button>
              </CardFooter>
            )}
          </Card>

          {analysisResult && (
             <Card className="bg-secondary">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <CardTitle>{t('expenses.analysis_result')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{t('expenses.summary')}</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">{t('expenses.suggestions')}</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.suggestions}</p>
                  </div>
                </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
