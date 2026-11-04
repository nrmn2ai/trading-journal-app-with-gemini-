export type TradeSentiment = 'Confident' | 'Nervous' | 'Bored' | 'Aggressive' | 'Calm' | 'FOMO';

export interface TradeItem {
  id: string;
  symbol: string;
  entry: string;
  tp: string;
  sl: string;
  r: number;
  direction?: 'BUY' | 'SELL';
  sentiment?: TradeSentiment | string;
  tags?: string[];
  time?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ScreenshotItem {
  id: string;
  img: string; // base64 webp
  desc: string;
  timestamp?: string;
}

export interface DayJournal {
  emotion: number; // 1 to 10
  goal: string;
  pre: string;
  trades: TradeItem[];
  screenshots: ScreenshotItem[];
  score: number; // 0 to 5
  evidence: string;
  noPlan: 'yes' | 'no';
  noPlanReason: string;
  auditLesson: string;
  auditCommit: string;
}

export interface SetupConfig {
  accountSize: number;
  propPhase: '1' | '2';
  riskValue: number; // USD per 1R
  timeframe: string;
  stoploss: string; // e.g. -2R
  markets: string;
  setups: string;
  noTrade: string;
  afterStop: string;
}

export interface ReviewData {
  best: string;
  error: string;
  behavior: string;
  next: string;
}

export interface SessionInfo {
  name: string;
  status: 'active' | 'upcoming' | 'closed';
  time: string;
}
