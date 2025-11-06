'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Explicitly type the result object based on expected AI flow outputs
type StockAnalysisResult = {
  analysis: string;
  recommendation: string;
};

type MarketSentimentResult = {
  sentiment: string;
  reasoning: string;
};

type OptionStrategyResult = {
  strategyName: string;
  description: string;
  rationale: string;
  risk: string;
  potentialReturn: string;
  marketConditions: string;
  exampleTrade: string;
};

interface WorkHistoryItem {
    id: string;
    timestamp: string;
    activityType: string;
    details: string;
    result?: StockAnalysisResult | MarketSentimentResult | OptionStrategyResult;
}

const ResultItem = ({ label, value }: {label:string, value:string}) => (
    <div>
        <h4 className="font-semibold">{label}</h4>
        <p className="text-muted-foreground whitespace-pre-wrap">{value}</p>
    </div>
);

const renderResult = (item: WorkHistoryItem) => {
    const { t } = useTranslation();
    if (!item.result) return <p>No result data available.</p>;

    switch(item.activityType) {
        case t('ai_assistant.stock_analysis'): {
            const result = item.result as StockAnalysisResult;
            return (
                <div className="space-y-4">
                    <ResultItem label={t('ai_assistant.analysis')} value={result.analysis} />
                    <ResultItem label={t('ai_assistant.recommendation')} value={result.recommendation} />
                </div>
            )
        }
        case t('ai_assistant.market_sentiment'): {
            const result = item.result as MarketSentimentResult;
            return (
                 <div className="space-y-4">
                    <ResultItem label={t('ai_assistant.sentiment')} value={result.sentiment} />
                    <ResultItem label={t('ai_assistant.reasoning')} value={result.reasoning} />
                </div>
            )
        }
        case t('ai_assistant.option_strategy'): {
             const result = item.result as OptionStrategyResult;
             return (
                <div className="space-y-4 text-sm">
                    <ResultItem label={t('ai_assistant.strategy_name')} value={result.strategyName} />
                    <ResultItem label={t('ai_assistant.description')} value={result.description} />
                    <ResultItem label={t('ai_assistant.rationale')} value={result.rationale} />
                    <ResultItem label={t('ai_assistant.risk')} value={result.risk} />
                    <ResultItem label={t('ai_assistant.potential_return')} value={result.potentialReturn} />
                    <ResultItem label={t('ai_assistant.market_conditions')} value={result.marketConditions} />
                    <ResultItem label={t('ai_assistant.example_trade')} value={result.exampleTrade} />
                </div>
             )
        }
        default:
            return <p>Cannot display result for this activity type.</p>
    }
}

export default function WorkHistoryPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedItem, setSelectedItem] = useState<WorkHistoryItem | null>(null);

  const workHistoryQuery = useMemoFirebase(() => {
    if (!user) return null;
    const collRef = collection(firestore, 'users', user.uid, 'workHistory');
    return query(collRef, orderBy('timestamp', 'desc'));
  }, [firestore, user]);

  const { data: workHistory, isLoading } = useCollection<WorkHistoryItem>(workHistoryQuery);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={t('header.work_history')} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Card>
            <CardHeader>
                <CardTitle>{t('work_history.title')}</CardTitle>
                <CardDescription>{t('work_history.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('work_history.timestamp')}</TableHead>
                            <TableHead>{t('work_history.activity_type')}</TableHead>
                            <TableHead>{t('work_history.details')}</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <>
                                <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            </>
                        )}
                        {!isLoading && workHistory && workHistory.length > 0 ? (
                            workHistory.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{format(new Date(item.timestamp), 'PPpp')}</TableCell>
                                    <TableCell>{item.activityType}</TableCell>
                                    <TableCell className="max-w-xs truncate">{item.details}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                           !isLoading && (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center h-48">
                                  <div className="flex flex-col items-center justify-center p-10 text-center">
                                      <Activity className="h-12 w-12 text-muted-foreground" />
                                      <p className="mt-4 text-lg font-semibold">{t('work_history.no_history')}</p>
                                      <p className="text-sm text-muted-foreground">{t('work_history.no_history_desc')}</p>
                                  </div>
                                </TableCell>
                            </TableRow>
                           )
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>

       <Dialog open={!!selectedItem} onOpenChange={(isOpen) => !isOpen && setSelectedItem(null)}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Work History Details</DialogTitle>
                    <DialogDescription>
                        Showing the results for your query on {selectedItem && format(new Date(selectedItem.timestamp), 'PPpp')}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[70vh] overflow-y-auto">
                    {selectedItem && renderResult(selectedItem)}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
