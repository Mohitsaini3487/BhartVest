'use client';

import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { useStockData } from '@/hooks/use-stock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Bot,
  Loader2,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, XAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const chartConfig = {
  value: {
    label: 'Value',
  },
  nifty: {
    label: 'NIFTY 50',
    color: 'hsl(var(--chart-1))',
  },
  sensex: {
    label: 'SENSEX',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { t } = useTranslation();
  const { indices, portfolio, watchlist, topGainers, topLosers, loading } = useStockData();
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const day = now.getUTCDay();
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      
      // Convert to IST (UTC+5:30)
      let istHours = hours + 5;
      let istMinutes = minutes + 30;
      if (istMinutes >= 60) {
        istHours += 1;
        istMinutes -=60;
      }
      if (istHours >= 24) {
        istHours -= 24;
      }
      
      // Market hours: Monday to Friday, 9:15 AM to 3:30 PM IST
      const isWeekday = day >= 1 && day <= 5;
      const afterOpen = istHours > 9 || (istHours === 9 && istMinutes >= 15);
      const beforeClose = istHours < 15 || (istHours === 15 && istMinutes <= 30);

      setIsMarketOpen(isWeekday && afterOpen && beforeClose);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const nifty = indices[0];
  const sensex = indices[1];
  
  const totalInvestment = portfolio.reduce((acc, item) => acc + item.avgPrice * item.quantity, 0);
  const currentValue = portfolio.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const overallPL = currentValue - totalInvestment;
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={t('dashboard.title')} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">{t('dashboard.market_summary')}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>{t('dashboard.market_status')}:</span>
                <Badge variant={isMarketOpen ? 'default' : 'destructive'} className={isMarketOpen ? 'bg-green-500 text-white' : ''}>
                  {isMarketOpen ? t('dashboard.open') : t('dashboard.closed')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">{nifty.name}</h3>
                  <p className="text-2xl font-bold">{formatNumber(nifty.value)}</p>
                  <div
                    className={`flex items-center text-sm font-medium ${
                      nifty.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {nifty.change >= 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {formatNumber(nifty.change)} ({formatPercentage(nifty.changePercent)})
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">{sensex.name}</h3>
                  <p className="text-2xl font-bold">{formatNumber(sensex.value)}</p>
                  <div
                    className={`flex items-center text-sm font-medium ${
                      sensex.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {sensex.change >= 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {formatNumber(sensex.change)} ({formatPercentage(sensex.changePercent)})
                  </div>
                </div>
              </div>
              <div className="mt-4 h-[150px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart data={nifty.history} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNifty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-nifty)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-nifty)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area
                      dataKey="value"
                      type="natural"
                      fill="url(#colorNifty)"
                      stroke="var(--color-nifty)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
           <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">{t('dashboard.ask_ai')}</CardTitle>
                <CardDescription>{t('dashboard.ask_ai_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                <Bot className="w-24 h-24 text-primary" />
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/ai-assistant">
                        {t('dashboard.go_to_ai')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
           </Card>
        </div>
        
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
                <CardHeader><CardTitle>{t('dashboard.total_investment')}</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{t('dashboard.current_value')}</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{formatCurrency(currentValue)}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{t('dashboard.overall_pl')}</CardTitle></CardHeader>
                <CardContent>
                    <p className={`text-2xl font-bold ${overallPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(overallPL)}
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t('dashboard.watchlist')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.symbol')}</TableHead>
                    <TableHead>{t('common.price')}</TableHead>
                    <TableHead className="text-right">{t('common.change')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchlist.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell>
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          item.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(item.changePercent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.top_gainers')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableBody>
                  {topGainers.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell>{stock.symbol}</TableCell>
                      <TableCell>{formatCurrency(stock.price)}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        +{formatPercentage(stock.changePercent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.top_losers')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableBody>
                  {topLosers.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell>{stock.symbol}</TableCell>
                      <TableCell>{formatCurrency(stock.price)}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {formatPercentage(stock.changePercent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    