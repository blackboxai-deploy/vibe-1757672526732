// Tipuri de date pentru sistemul de trading

export interface Position {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  profit: number;
  swap: number;
  openTime: string;
  comment: string;
}

export interface TradingMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdown: number;
  currentDrawdown: number;
  sharpeRatio: number;
}

export interface AccountInfo {
  balance: number;
  equity: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  server: string;
}

export interface RiskManagement {
  dailyMaxLoss: number;
  dailyCurrentPnL: number;
  maxPositions: number;
  currentPositions: number;
  riskPerTrade: number;
  minLotSize: number;
  maxLotSize: number;
  trailingStopActive: boolean;
  trailingStopDistance: number;
}

export interface TechnicalIndicators {
  maFast: number;
  maSlow: number;
  rsi: number;
  macd: {
    main: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  atr: number;
  spread: number;
}

export interface MarketCondition {
  trend: "BULLISH" | "BEARISH" | "SIDEWAYS";
  volatility: "LOW" | "MEDIUM" | "HIGH";
  volume: "LOW" | "MEDIUM" | "HIGH";
  marketSession: "ASIAN" | "EUROPEAN" | "AMERICAN" | "OVERLAP";
  newsFilter: boolean;
}

export interface ServerInfo {
  name: string;
  ping: number;
  status: "CONNECTED" | "DISCONNECTED" | "RECONNECTING";
  lastUpdate: string;
}

export interface RobotSettings {
  isActive: boolean;
  symbol: string;
  timeframe: string;
  fastMAPeriod: number;
  slowMAPeriod: number;
  rsiPeriod: number;
  stopLossPips: number;
  takeProfitPips: number;
  riskPercent: number;
  maxDailyLoss: number;
  tradingHoursStart: number;
  tradingHoursEnd: number;
  newsFilterActive: boolean;
  trailingStopActive: boolean;
  trailingStopPips: number;
}

export interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  maFast?: number;
  maSlow?: number;
  rsi?: number;
}

export interface TradeHistory {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  closePrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string;
  closeTime: string;
  profit: number;
  swap: number;
  commission: number;
  comment: string;
  duration: number; // în minute
}

export interface TradingData {
  account: AccountInfo;
  positions: Position[];
  metrics: TradingMetrics;
  riskManagement: RiskManagement;
  indicators: TechnicalIndicators;
  marketCondition: MarketCondition;
  serverInfo: ServerInfo;
  settings: RobotSettings;
  priceData: PriceData[];
  tradeHistory: TradeHistory[];
  lastUpdate: string;
}

export interface DashboardStats {
  totalProfit: number;
  todayProfit: number;
  weekProfit: number;
  monthProfit: number;
  totalTrades: number;
  winRate: number;
  averageProfit: number;
  maxDrawdown: number;
}

export interface Alert {
  id: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Enums pentru status-uri
export enum RobotStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
  PAUSED = "PAUSED"
}

export enum OrderType {
  MARKET_BUY = "MARKET_BUY",
  MARKET_SELL = "MARKET_SELL",
  PENDING_BUY = "PENDING_BUY",
  PENDING_SELL = "PENDING_SELL"
}

// Tipuri pentru configurări avansate
export interface AdvancedSettings {
  maxSpreadPips: number;
  minimalEquity: number;
  emergencyStopLoss: boolean;
  correlationFilter: boolean;
  volatilityFilter: boolean;
  autoLotSizing: boolean;
  martingaleActive: boolean;
  hedgingActive: boolean;
}

export interface BacktestResult {
  startDate: string;
  endDate: string;
  initialBalance: number;
  finalBalance: number;
  totalReturn: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  averageTrade: number;
  bestTrade: number;
  worstTrade: number;
}

export type TimeFrame = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1" | "W1" | "MN1";
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CHF" | "AUD" | "CAD" | "NZD";
export type TradingPair = string; // Ex: "EURUSD", "GBPUSD", etc.