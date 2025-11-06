import { Index, Stock, PortfolioItem, WatchlistItem } from './types';

export const indices: Index[] = [
  {
    name: 'NIFTY 50',
    value: 23537.85,
    change: 66.70,
    changePercent: 0.28,
    history: [
      { month: 'Jan', value: 21500 }, { month: 'Feb', value: 22000 }, { month: 'Mar', value: 22400 },
      { month: 'Apr', value: 22600 }, { month: 'May', value: 22800 }, { month: 'Jun', value: 23500 },
    ],
  },
  {
    name: 'SENSEX',
    value: 77341.08,
    change: 141.34,
    changePercent: 0.18,
    history: [
      { month: 'Jan', value: 71000 }, { month: 'Feb', value: 72500 }, { month: 'Mar', value: 73500 },
      { month: 'Apr', value: 74000 }, { month: 'May', value: 75000 }, { month: 'Jun', value: 77300 },
    ],
  },
];

export const stocks: Stock[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2908.30, change: 48.95, changePercent: 1.71, volume: '8.2M', marketCap: '₹19.68T', lastDay: Array.from({length: 20}, (_, i) => ({ time: i, price: 2850 + Math.random() * 100 })) },
  { symbol: 'TCS.NS', name: 'Tata Consultancy', price: 3814.75, change: -10.55, changePercent: -0.28, volume: '2.1M', marketCap: '₹13.80T', lastDay: Array.from({length: 20}, (_, i) => ({ time: i, price: 3800 + Math.random() * 50 })) },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1699.95, change: 42.60, changePercent: 2.57, volume: '25.3M', marketCap: '₹12.92T', lastDay: Array.from({length: 20}, (_, i) => ({ time: i, price: 1650 + Math.random() * 50 })) },
  { symbol: 'INFY.NS', name: 'Infosys', price: 1530.50, change: 5.25, changePercent: 0.34, volume: '6.7M', marketCap: '₹6.35T', lastDay: Array.from({length: 20}, (_, i) => ({ time: i, price: 1520 + Math.random() * 20 })) },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', price: 1121.80, change: 18.25, changePercent: 1.65, volume: '18.9M', marketCap: '₹7.89T', lastDay: Array.from({length: 20}, (_, i) => ({ time: i, price: 1100 + Math.random() * 30 })) },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', price: 2439.80, change: -15.10, changePercent: -0.61, volume: '1.5M', marketCap: '₹5.73T', lastDay: Array.from({length: 20}, (_, i) => ({ time: i, price: 2430 + Math.random() * 20 })) },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', price: 7120.00, change: -230.15, changePercent: -3.13, volume: '1.2M', marketCap: '₹4.41T', lastDay: Array.from({length: 20}, (_, i) => ({ time: i, price: 7100 + Math.random() * 250 })) },
  { symbol: 'SBIN.NS', name: 'State Bank of India', price: 836.25, change: 5.60, changePercent: 0.67, volume: '15.4M', marketCap: '₹7.46T', lastDay: Array.from({length: 20}, (_, i) => ({ time: i, price: 830 + Math.random() * 10 })) },
];

export const portfolio: PortfolioItem[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', quantity: 50, avgPrice: 2500.00, currentPrice: 2908.30 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy', quantity: 100, avgPrice: 3500.00, currentPrice: 3814.75 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', quantity: 200, avgPrice: 1600.00, currentPrice: 1699.95 },
];

export const watchlist: WatchlistItem[] = [
  { symbol: 'INFY.NS', name: 'Infosys', price: 1530.50, change: 5.25, changePercent: 0.34 },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', price: 1121.80, change: 18.25, changePercent: 1.65 },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', price: 7120.00, change: -230.15, changePercent: -3.13 },
  { symbol: 'SBIN.NS', name: 'State Bank of India', price: 836.25, change: 5.60, changePercent: 0.67 },
];

    