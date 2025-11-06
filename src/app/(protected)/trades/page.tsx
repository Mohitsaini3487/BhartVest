'use client';

import { useState, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { useStockData } from '@/hooks/use-stock-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { PortfolioItem, Stock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { toast } from '@/hooks/use-toast';
import { Upload, Download, PlusCircle, Wallet, MinusCircle, Briefcase } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const tradeSchema = z.object({
  type: z.enum(['buy', 'sell']),
  symbol: z.string().min(1, { message: 'Stock is required' }),
  quantity: z.coerce.number().positive({ message: 'Quantity must be positive' }),
});
type TradeFormValues = z.infer<typeof tradeSchema>;

function TradeSimulationDialog({ open, onOpenChange, onSimulateTrade, portfolio, stocks }: { open: boolean, onOpenChange: (open: boolean) => void, onSimulateTrade: (trade: TradeFormValues) => void, portfolio: PortfolioItem[], stocks: Stock[] }) {
  const { t } = useTranslation();
  const { control, handleSubmit, watch, formState: { errors } } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: { type: 'buy', quantity: 1 }
  });

  const tradeType = watch('type');
  const selectedSymbol = watch('symbol');
  const availableQuantity = portfolio.find(s => s.symbol === selectedSymbol)?.quantity || 0;

  const onSubmit = (data: TradeFormValues) => {
    onSimulateTrade(data);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('trades.simulate_trade')}</DialogTitle>
          <DialogDescription>{t('trades.simulate_trade_desc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('trades.trade_type')}</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">{t('trades.buy')}</SelectItem>
                    <SelectItem value="sell">{t('trades.sell')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.symbol')}</Label>
            <Controller
              name="symbol"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder={t('trades.select_stock')} /></SelectTrigger>
                  <SelectContent>
                    {stocks
                      .filter(s => tradeType === 'buy' || portfolio.some(p => p.symbol === s.symbol))
                      .map(stock => (
                      <SelectItem key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} ({stock.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
             {errors.symbol && <p className="text-sm text-destructive">{errors.symbol.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('trades.quantity')}</Label>
            <Controller
                name="quantity"
                control={control}
                rules={{
                  max: tradeType === 'sell' ? { value: availableQuantity, message: t('trades.not_enough_shares', { quantity: availableQuantity }) } : undefined
                }}
                render={({ field }) => <Input id="quantity" type="number" {...field} />}
              />
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t('common.close')}</Button>
            <Button type="submit">
              {tradeType === 'buy' ? <PlusCircle className="mr-2 h-4 w-4" /> : <MinusCircle className="mr-2 h-4 w-4" />}
              {t('trades.execute_trade')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function TradesPage() {
  const { t } = useTranslation();
  const { portfolio, stocks: mockStocks, updatePortfolio } = useStockData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);

  const handleExport = () => {
    const headers = ['symbol', 'name', 'quantity', 'avgPrice', 'currentPrice'];
    const csvContent = [
      headers.join(','),
      ...portfolio.map(item => headers.map(header => item[header as keyof PortfolioItem]).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-s-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'bharatvest_portfolio.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast({ title: 'Success', description: 'Portfolio exported successfully.' });
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text.split('\n').slice(1);
          const newPortfolio: PortfolioItem[] = rows.map(row => {
            const [symbol, name, quantity, avgPrice, currentPrice] = row.split(',');
            return {
              symbol,
              name,
              quantity: parseFloat(quantity),
              avgPrice: parseFloat(avgPrice),
              currentPrice: parseFloat(currentPrice),
            };
          }).filter(item => item.symbol);
          updatePortfolio(newPortfolio);
          toast({ title: 'Success', description: 'Portfolio imported successfully.' });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to parse CSV file.' });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSimulateTrade = (trade: TradeFormValues) => {
    const stock = mockStocks.find(s => s.symbol === trade.symbol);
    if (!stock) return;

    let newPortfolio = [...portfolio];
    const existingHolding = newPortfolio.find(s => s.symbol === trade.symbol);

    if (trade.type === 'buy') {
      if (existingHolding) {
        const newQuantity = existingHolding.quantity + trade.quantity;
        const newAvgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + (stock.price * trade.quantity)) / newQuantity;
        newPortfolio = newPortfolio.map(s => s.symbol === trade.symbol ? { ...s, quantity: newQuantity, avgPrice: newAvgPrice } : s);
      } else {
        newPortfolio.push({
          symbol: stock.symbol,
          name: stock.name,
          quantity: trade.quantity,
          avgPrice: stock.price,
          currentPrice: stock.price
        });
      }
    } else { // Sell
      if (!existingHolding || existingHolding.quantity < trade.quantity) {
        toast({ variant: 'destructive', title: 'Error', description: 'Not enough shares to sell.' });
        return;
      }
      const newQuantity = existingHolding.quantity - trade.quantity;
      if (newQuantity === 0) {
        newPortfolio = newPortfolio.filter(s => s.symbol !== trade.symbol);
      } else {
        newPortfolio = newPortfolio.map(s => s.symbol === trade.symbol ? { ...s, quantity: newQuantity } : s);
      }
    }
    updatePortfolio(newPortfolio);
    toast({ title: 'Success', description: `Successfully simulated ${trade.type} of ${trade.quantity} ${trade.symbol} shares.` });
  };


  const totalInvestment = portfolio.reduce((acc, item) => acc + item.avgPrice * item.quantity, 0);
  const currentValue = portfolio.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const overallPL = currentValue - totalInvestment;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={t('trades.title')}>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" />
                {t('trades.import_portfolio')}
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
            />
            <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                {t('trades.export_portfolio')}
            </Button>
            <Button size="sm" onClick={() => setIsTradeDialogOpen(true)}>
                <Briefcase className="mr-2 h-4 w-4" />
                {t('trades.simulate_trade')}
            </Button>
        </div>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
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

        <Card>
          <CardHeader>
            <CardTitle>{t('trades.holdings')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {portfolio.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.symbol')}</TableHead>
                    <TableHead>{t('trades.quantity')}</TableHead>
                    <TableHead>{t('trades.avg_price')}</TableHead>
                    <TableHead>{t('trades.current_price')}</TableHead>
                    <TableHead>{t('trades.investment_value')}</TableHead>
                    <TableHead className="text-right">{t('trades.profit_loss')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((item) => {
                    const investmentValue = item.avgPrice * item.quantity;
                    const liveStock = mockStocks.find(s => s.symbol === item.symbol);
                    const currentPrice = liveStock ? liveStock.price : item.currentPrice;
                    const currentValue = currentPrice * item.quantity;
                    const pnl = currentValue - investmentValue;
                    return (
                      <TableRow key={item.symbol}>
                        <TableCell>
                          <div className="font-medium">{item.symbol}</div>
                          <div className="text-xs text-muted-foreground">{item.name}</div>
                        </TableCell>
                        <TableCell>{formatNumber(item.quantity)}</TableCell>
                        <TableCell>{formatCurrency(item.avgPrice)}</TableCell>
                        <TableCell>{formatCurrency(currentPrice)}</TableCell>
                        <TableCell>{formatCurrency(investmentValue)}</TableCell>
                        <TableCell className={`text-right font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(pnl)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">{t('trades.no_holdings')}</p>
                <Button className="mt-4" size="sm" onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    {t('trades.import_portfolio')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <TradeSimulationDialog open={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen} onSimulateTrade={handleSimulateTrade} portfolio={portfolio} stocks={mockStocks} />
    </div>
  );
}

    