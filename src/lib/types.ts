export type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  lastDay: { time: number; price: number }[];
};

export type Index = {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  history: { month: string; value: number }[];
};

export type PortfolioItem = {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
};

export type WatchlistItem = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export type Translation = {
  [key: string]: string | Translation;
};

export type Translations = {
  [key:string]: Translation;
};

    