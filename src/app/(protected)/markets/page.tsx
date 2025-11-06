'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { useStockData } from '@/hooks/use-stock-data';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import { SparklineChart } from '@/components/ui/sparkline';

export default function MarketsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { stocks: allStocks } = useStockData();

  const filteredStocks = allStocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={t('markets.title')}>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('markets.search_stocks')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">{t('markets.symbol')}</TableHead>
                  <TableHead>Last 24h</TableHead>
                  <TableHead className="text-right">{t('markets.price')}</TableHead>
                  <TableHead className="text-right">{t('markets.change')}</TableHead>
                  <TableHead className="text-right">{t('markets.volume')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="h-10 w-28">
                        <SparklineChart
                            data={stock.lastDay}
                            categories={["price"]}
                            index={"time"}
                            colors={[stock.change >= 0 ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"]}
                            className="h-full w-full"
                          />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(stock.price)}
                    </TableCell>
                    <TableCell
                      className={`flex items-center justify-end gap-1 font-medium ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stock.change >= 0 ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      <span>{formatPercentage(stock.changePercent)}</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {stock.volume}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    