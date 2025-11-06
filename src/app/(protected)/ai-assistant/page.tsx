'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import {
  analyzeStockAndRecommend,
  AnalyzeStockOutput,
} from '@/ai/flows/stock-analysis-recommendation';
import {
  analyzeMarketSentiment,
  MarketSentimentOutput,
} from '@/ai/flows/market-sentiment-analysis';
import {
  generateOptionStrategy,
  OptionStrategyOutput,
} from '@/ai/flows/option-trading-strategy';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Loader2 } from 'lucide-react';
import { useForm, SubmitHandler, Controller, Control } from 'react-hook-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

type StockAnalysisInputs = { stockSymbol: string; query: string };
type MarketSentimentInputs = { query: string };
type OptionStrategyInputs = { riskProfile: string; investmentGoals: string; marketOutlook: string, stock: string };

function StockAnalysisForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeStockOutput | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<StockAnalysisInputs>();
  const { user } = useUser();
  const firestore = useFirestore();

  const recordActivity = (activityType: string, details: string, result: any) => {
    if (user && firestore) {
      const workHistoryRef = collection(firestore, 'users', user.uid, 'workHistory');
      addDocumentNonBlocking(workHistoryRef, {
        userId: user.uid,
        timestamp: new Date().toISOString(),
        activityType: activityType,
        details: details,
        result: result,
      });
    }
  };

  const onSubmit: SubmitHandler<StockAnalysisInputs> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeStockAndRecommend(data);
      setResult(res);
      recordActivity(t('ai_assistant.stock_analysis'), `Stock: ${data.stockSymbol}, Query: ${data.query}`, res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>{t('ai_assistant.stock_analysis')}</CardTitle>
          <CardDescription>{t('ai_assistant.stock_analysis_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stockSymbol">{t('ai_assistant.stock_symbol')}</Label>
            <Input id="stockSymbol" {...register('stockSymbol', { required: true })} />
             {errors.stockSymbol && <p className="text-sm text-destructive">{t('common.required_field')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="querySA">{t('ai_assistant.your_query')}</Label>
            <Textarea id="querySA" {...register('query', { required: true })} />
            {errors.query && <p className="text-sm text-destructive">{t('common.required_field')}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? t('ai_assistant.analyzing') : t('ai_assistant.analyze')}
          </Button>
        </CardFooter>
      </form>
      {result && <ResultCard title={t('ai_assistant.result')} content={
          <div>
            <h3 className="font-bold text-lg mb-2">{t('ai_assistant.analysis')}</h3>
            <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{result.analysis}</p>
            <h3 className="font-bold text-lg mb-2">{t('ai_assistant.recommendation')}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{result.recommendation}</p>
          </div>
      } />}
    </Card>
  );
}


function MarketSentimentForm() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MarketSentimentOutput | null>(null);
    const { register, handleSubmit, formState: { errors } } = useForm<MarketSentimentInputs>();
    const { user } = useUser();
    const firestore = useFirestore();

    const recordActivity = (activityType: string, details: string, result: any) => {
        if (user && firestore) {
        const workHistoryRef = collection(firestore, 'users', user.uid, 'workHistory');
        addDocumentNonBlocking(workHistoryRef, {
            userId: user.uid,
            timestamp: new Date().toISOString(),
            activityType: activityType,
            details: details,
            result: result,
        });
        }
    };

    const onSubmit: SubmitHandler<MarketSentimentInputs> = async (data) => {
        setLoading(true);
        setResult(null);
        const res = await analyzeMarketSentiment(data);
        setResult(res);
        recordActivity(t('ai_assistant.market_sentiment'), `Query: ${data.query}`, res);
        setLoading(false);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>{t('ai_assistant.market_sentiment')}</CardTitle>
                    <CardDescription>{t('ai_assistant.market_sentiment_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="queryMS">{t('ai_assistant.your_query')}</Label>
                        <Textarea id="queryMS" {...register('query', { required: true })} />
                        {errors.query && <p className="text-sm text-destructive">{t('common.required_field')}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {loading ? t('ai_assistant.analyzing') : t('ai_assistant.analyze')}
                    </Button>
                </CardFooter>
            </form>
            {result && <ResultCard title={t('ai_assistant.result')} content={
                <div>
                    <h3 className="font-bold text-lg mb-2">{t('ai_assistant.sentiment')}</h3>
                    <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{result.sentiment}</p>
                    <h3 className="font-bold text-lg mb-2">{t('ai_assistant.reasoning')}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.reasoning}</p>
                </div>
            } />}
        </Card>
    );
}

function OptionStrategyForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptionStrategyOutput | null>(null);
  const { register, handleSubmit, control, formState: { errors } } = useForm<OptionStrategyInputs>({
    defaultValues: {
      riskProfile: '',
      investmentGoals: '',
      marketOutlook: '',
      stock: ''
    }
  });
  const { user } = useUser();
  const firestore = useFirestore();

    const recordActivity = (activityType: string, details: string, result: any) => {
        if (user && firestore) {
            const workHistoryRef = collection(firestore, 'users', user.uid, 'workHistory');
            addDocumentNonBlocking(workHistoryRef, {
                userId: user.uid,
                timestamp: new Date().toISOString(),
                activityType: activityType,
                details: details,
                result: result,
            });
        }
    };

  const onSubmit: SubmitHandler<OptionStrategyInputs> = async (data) => {
    setLoading(true);
    setResult(null);
    const details = `Risk: ${data.riskProfile}, Goals: ${data.investmentGoals}, Outlook: ${data.marketOutlook}, Stock: ${data.stock || 'N/A'}`;
    const res = await generateOptionStrategy(data);
    setResult(res);
    recordActivity(t('ai_assistant.option_strategy'), details, res);
    setLoading(false);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>{t('ai_assistant.option_strategy')}</CardTitle>
          <CardDescription>{t('ai_assistant.option_strategy_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('ai_assistant.risk_profile')}</Label>
              <ControllerSelect name="riskProfile" control={control} t={t} required={true} options={[
                  { value: 'conservative', label: t('ai_assistant.conservative') },
                  { value: 'moderate', label: t('ai_assistant.moderate') },
                  { value: 'aggressive', label: t('ai_assistant.aggressive') }
              ]} placeholder={t('ai_assistant.select_risk')} />
              {errors.riskProfile && <p className="text-sm text-destructive">{t('common.required_field')}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('ai_assistant.investment_goals')}</Label>
              <ControllerSelect name="investmentGoals" control={control} t={t} required={true} options={[
                  { value: 'capital preservation', label: t('ai_assistant.capital_preservation') },
                  { value: 'income generation', label: t('ai_assistant.income_generation') },
                  { value: 'growth', label: t('ai_assistant.growth') }
              ]} placeholder={t('ai_assistant.select_goal')} />
              {errors.investmentGoals && <p className="text-sm text-destructive">{t('common.required_field')}</p>}
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>{t('ai_assistant.market_outlook')}</Label>
                <ControllerSelect name="marketOutlook" control={control} t={t} options={[
                    { value: 'bullish', label: t('ai_assistant.bullish') },
                    { value: 'bearish', label: t('ai_assistant.bearish') },
                    { value: 'neutral', label: t('ai_assistant.neutral') }
                ]} placeholder={t('ai_assistant.select_market_outlook')} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="stockOS">{t('ai_assistant.stock_symbol_optional')}</Label>
                <Input id="stockOS" {...register('stock')} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? t('ai_assistant.generating') : t('ai_assistant.generate')}
          </Button>
        </CardFooter>
      </form>
      {result && <ResultCard title={t('ai_assistant.result')} content={
          <div className="space-y-4 text-sm">
              <ResultItem label={t('ai_assistant.strategy_name')} value={result.strategyName} />
              <ResultItem label={t('ai_assistant.description')} value={result.description} />
              <ResultItem label={t('ai_assistant.rationale')} value={result.rationale} />
              <ResultItem label={t('ai_assistant.risk')} value={result.risk} />
              <ResultItem label={t('ai_assistant.potential_return')} value={result.potentialReturn} />
              <ResultItem label={t('ai_assistant.market_conditions')} value={result.marketConditions} />
              <ResultItem label={t('ai_assistant.example_trade')} value={result.exampleTrade} />
          </div>
      } />}
    </Card>
  );
}

// Helper components for forms and results
const ControllerSelect = ({ name, control, t, options, placeholder, required }: {name:any, control: Control<any>, t:any, options: {value:string, label:string}[], placeholder:string, required?:boolean}) => (
    <Controller
        name={name}
        control={control}
        rules={{ required: required }}
        render={({ field, fieldState }) => (
            <>
            <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
                <SelectContent>
                    {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
            </Select>
            {fieldState.error && required && <p className="text-sm text-destructive">{t('common.required_field')}</p>}
            </>
        )}
    />
);

const ResultCard = ({ title, content }: {title: string, content: React.ReactNode}) => (
    <Card className="mt-6 bg-secondary">
        <CardHeader className="flex flex-row items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
    </Card>
);

const ResultItem = ({ label, value }: {label:string, value:string}) => (
    <div>
        <h4 className="font-semibold">{label}</h4>
        <p className="text-muted-foreground whitespace-pre-wrap">{value}</p>
    </div>
)

export default function AiAssistantPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={t('ai_assistant.title')} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Tabs defaultValue="stock_analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stock_analysis">{t('ai_assistant.stock_analysis')}</TabsTrigger>
            <TabsTrigger value="market_sentiment">{t('ai_assistant.market_sentiment')}</TabsTrigger>
            <TabsTrigger value="option_strategy">{t('ai_assistant.option_strategy')}</TabsTrigger>
          </TabsList>
          <TabsContent value="stock_analysis">
            <StockAnalysisForm />
          </TabsContent>
          <TabsContent value="market_sentiment">
            <MarketSentimentForm />
          </TabsContent>
          <TabsContent value="option_strategy">
            <OptionStrategyForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
