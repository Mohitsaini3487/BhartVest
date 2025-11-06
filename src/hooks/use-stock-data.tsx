'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  indices as initialIndices,
  stocks as initialStocks,
  portfolio as initialPortfolio,
  watchlist as initialWatchlist,
} from '@/lib/mock-data';
import type { Index, Stock, PortfolioItem, WatchlistItem } from '@/lib/types';
import cloneDeep from 'lodash.clonedeep';

const SIMULATION_INTERVAL = 3000; // 3 seconds

export function useStockData() {
  const [loading, setLoading] = useState(true);
  const [indices, setIndices] = useState<Index[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  
  const simulateUpdate = useCallback(() => {
    setStocks((currentStocks) => {
        const updatedStocks = currentStocks.map((stock) => {
          const changePercent = (Math.random() - 0.5) * 0.05; // Max 5% change up or down
          const changeAmount = stock.price * changePercent;
          const newPrice = Math.max(10, stock.price + changeAmount); // Ensure price doesn't go below 10

          const newLastDay = [...stock.lastDay.slice(1), { time: stock.lastDay.length, price: newPrice }];

          return {
            ...stock,
            price: newPrice,
            change: newPrice - (stock.price - stock.change),
            changePercent: ((newPrice - (stock.price - stock.change)) / (stock.price - stock.change)) * 100,
            lastDay: newLastDay,
          };
        });
        return updatedStocks;
    });

    setPortfolio(currentPortfolio => {
        return currentPortfolio.map(item => {
            const liveStock = stocks.find(s => s.symbol === item.symbol);
            if (liveStock) {
                return { ...item, currentPrice: liveStock.price };
            }
            return item;
        })
    });
    
    setIndices(currentIndices => {
       return currentIndices.map(index => {
           const changePercent = (Math.random() - 0.45) * 0.01; // smaller change for indices
           const changeAmount = index.value * changePercent;
           const newValue = index.value + changeAmount;
           
           const newHistory = [...index.history.slice(1), { month: 'Now', value: newValue }];

           return {
               ...index,
               value: newValue,
               change: newValue - (index.value - index.change),
               changePercent: ((newValue - (index.value - index.change)) / (index.value - index.change)) * 100,
               history: newHistory,
           }
       })
    });
  }, [stocks]);

  useEffect(() => {
    // Initial data load
    setIndices(cloneDeep(initialIndices));
    setStocks(cloneDeep(initialStocks));
    setPortfolio(cloneDeep(initialPortfolio));
    setWatchlist(cloneDeep(initialWatchlist));
    setLoading(false);
  
    const intervalId = setInterval(simulateUpdate, SIMULATION_INTERVAL);
  
    return () => clearInterval(intervalId);
  }, []); // Run only once on mount to initialize

  useEffect(() => {
      // Update derived data whenever stocks change
      if (stocks.length > 0) {
          const sortedByGain = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
          setTopGainers(sortedByGain.slice(0, 5));

          const sortedByLoss = [...stocks].sort((a, b) => a.changePercent - b.changePercent);
          setTopLosers(sortedByLoss.slice(0, 5));

          setWatchlist(currentWatchlist => {
              return currentWatchlist.map(item => {
                  const liveStock = stocks.find(s => s.symbol === item.symbol);
                  if (liveStock) {
                      return {
                          ...item,
                          price: liveStock.price,
                          change: liveStock.change,
                          changePercent: liveStock.changePercent,
                      }
                  }
                  return item;
              });
          });
      }
  }, [stocks]);

  const updatePortfolio = (newPortfolio: PortfolioItem[]) => {
      setPortfolio(newPortfolio);
  }

  return { loading, indices, stocks, portfolio, watchlist, topGainers, topLosers, updatePortfolio };
}

    