import { TradingData, Position, TradeHistory, PriceData } from "@/types/trading";

// Simulare date de trading pentru demo
export function generateMockTradingData(): TradingData {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Generare poziții active
  const positions: Position[] = [
    {
      ticket: 123456789,
      symbol: "EURUSD",
      type: "BUY",
      volume: 0.10,
      openPrice: 1.0850,
      currentPrice: 1.0875,
      stopLoss: 1.0800,
      takeProfit: 1.0950,
      profit: 25.0,
      swap: -0.5,
      openTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      comment: "Robot BUY - Trend Following"
    },
    {
      ticket: 123456790,
      symbol: "GBPUSD",
      type: "SELL",
      volume: 0.05,
      openPrice: 1.2650,
      currentPrice: 1.2630,
      stopLoss: 1.2700,
      takeProfit: 1.2550,
      profit: 10.0,
      swap: 0.2,
      openTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      comment: "Robot SELL - MA Crossover"
    }
  ];

  // Generare istoric trades
  const tradeHistory: TradeHistory[] = [];
  for (let i = 0; i < 15; i++) {
    const isWin = Math.random() > 0.35; // 65% win rate
    const profit = isWin ? 
      Math.random() * 50 + 10 : 
      -(Math.random() * 30 + 5);
    
    tradeHistory.push({
      ticket: 123456700 + i,
      symbol: ["EURUSD", "GBPUSD", "USDJPY", "USDCHF"][Math.floor(Math.random() * 4)],
      type: Math.random() > 0.5 ? "BUY" : "SELL",
      volume: Math.round((Math.random() * 0.2 + 0.05) * 100) / 100,
      openPrice: 1.0800 + Math.random() * 0.02,
      closePrice: 1.0800 + Math.random() * 0.02,
      stopLoss: 1.0750,
      takeProfit: 1.0900,
      openTime: new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000).toISOString(),
      closeTime: new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      profit: Math.round(profit * 100) / 100,
      swap: Math.round((Math.random() - 0.5) * 2 * 100) / 100,
      commission: -0.7,
      comment: "Robot - Automated Trade",
      duration: 45
    });
  }

  // Generare date preț pentru grafic
  const priceData: PriceData[] = [];
  let basePrice = 1.0850;
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
    const change = (Math.random() - 0.5) * 0.001;
    basePrice += change;
    
    priceData.push({
      timestamp: timestamp.toISOString(),
      open: Math.round(basePrice * 10000) / 10000,
      high: Math.round((basePrice + Math.random() * 0.0005) * 10000) / 10000,
      low: Math.round((basePrice - Math.random() * 0.0005) * 10000) / 10000,
      close: Math.round(basePrice * 10000) / 10000,
      volume: Math.floor(Math.random() * 1000 + 100),
      maFast: Math.round((basePrice + 0.0002) * 10000) / 10000,
      maSlow: Math.round((basePrice - 0.0001) * 10000) / 10000,
      rsi: Math.round((Math.random() * 40 + 30) * 100) / 100
    });
  }

  // Calculare metrici
  const totalProfit = tradeHistory.reduce((sum, trade) => sum + trade.profit, 0);
  const winningTrades = tradeHistory.filter(trade => trade.profit > 0).length;
  const losingTrades = tradeHistory.filter(trade => trade.profit < 0).length;
  const totalWins = tradeHistory.filter(trade => trade.profit > 0).reduce((sum, trade) => sum + trade.profit, 0);
  const totalLosses = Math.abs(tradeHistory.filter(trade => trade.profit < 0).reduce((sum, trade) => sum + trade.profit, 0));

  const currentEquity = 5000 + totalProfit + positions.reduce((sum, pos) => sum + pos.profit, 0);
  const currentDrawdown = Math.max(0, (5000 - currentEquity) / 5000 * 100);

  return {
    account: {
      balance: 5000.00,
      equity: currentEquity,
      freeMargin: currentEquity * 0.8,
      marginLevel: 300.5,
      currency: "USD",
      leverage: 500,
      server: "MetaQuotes-Demo"
    },
    positions,
    metrics: {
      totalTrades: tradeHistory.length,
      winningTrades,
      losingTrades,
      winRate: Math.round((winningTrades / tradeHistory.length) * 100),
      totalProfit: Math.round(totalWins * 100) / 100,
      totalLoss: Math.round(totalLosses * 100) / 100,
      netProfit: Math.round(totalProfit * 100) / 100,
      profitFactor: totalLosses > 0 ? Math.round((totalWins / totalLosses) * 100) / 100 : 0,
      averageWin: winningTrades > 0 ? Math.round((totalWins / winningTrades) * 100) / 100 : 0,
      averageLoss: losingTrades > 0 ? Math.round((totalLosses / losingTrades) * 100) / 100 : 0,
      maxDrawdown: 8.5,
      currentDrawdown: Math.round(currentDrawdown * 100) / 100,
      sharpeRatio: 1.45
    },
    riskManagement: {
      dailyMaxLoss: 5.0,
      dailyCurrentPnL: Math.round((positions.reduce((sum, pos) => sum + pos.profit, 0) + 
        tradeHistory.filter(trade => new Date(trade.closeTime) >= todayStart)
          .reduce((sum, trade) => sum + trade.profit, 0)) * 100) / 100,
      maxPositions: 3,
      currentPositions: positions.length,
      riskPerTrade: 2.0,
      minLotSize: 0.01,
      maxLotSize: 1.0,
      trailingStopActive: true,
      trailingStopDistance: 50
    },
    indicators: {
      maFast: 1.0872,
      maSlow: 1.0858,
      rsi: 65.5,
      macd: {
        main: 0.0008,
        signal: 0.0005,
        histogram: 0.0003
      },
      bollinger: {
        upper: 1.0890,
        middle: 1.0860,
        lower: 1.0830
      },
      atr: 0.0025,
      spread: 1.2
    },
    marketCondition: {
      trend: "BULLISH",
      volatility: "MEDIUM",
      volume: "MEDIUM",
      marketSession: getCurrentMarketSession(),
      newsFilter: false
    },
    serverInfo: {
      name: "MetaQuotes-Demo",
      ping: Math.floor(Math.random() * 50 + 20),
      status: "CONNECTED",
      lastUpdate: new Date().toISOString()
    },
    settings: {
      isActive: true,
      symbol: "EURUSD",
      timeframe: "M15",
      fastMAPeriod: 10,
      slowMAPeriod: 20,
      rsiPeriod: 14,
      stopLossPips: 100,
      takeProfitPips: 200,
      riskPercent: 2.0,
      maxDailyLoss: 5.0,
      tradingHoursStart: 8,
      tradingHoursEnd: 22,
      newsFilterActive: true,
      trailingStopActive: true,
      trailingStopPips: 50
    },
    priceData,
    tradeHistory,
    lastUpdate: new Date().toISOString()
  };
}

function getCurrentMarketSession(): "ASIAN" | "EUROPEAN" | "AMERICAN" | "OVERLAP" {
  const hour = new Date().getUTCHours();
  
  if (hour >= 0 && hour < 7) return "ASIAN";
  if (hour >= 7 && hour < 8) return "OVERLAP";
  if (hour >= 8 && hour < 16) return "EUROPEAN";
  if (hour >= 16 && hour < 17) return "OVERLAP";
  if (hour >= 17 && hour < 24) return "AMERICAN";
  
  return "AMERICAN";
}

// Funcții utilitare pentru calculele de trading
export function calculatePipValue(symbol: string, volume: number, accountCurrency: string = "USD"): number {
  // Simplificat - în realitate ar trebui să ia în considerare cursurile de schimb
  const pipSize = symbol.includes("JPY") ? 0.01 : 0.0001;
  // Pentru demo, ignorăm accountCurrency dar îl păstrăm pentru API consistency
  return volume * 100000 * pipSize * (accountCurrency === "USD" ? 1 : 1);
}

export function calculateMarginRequired(symbol: string, volume: number, leverage: number, price: number): number {
  // Pentru demo, folosim calcul simplificat - în producție ar trebui să considerăm simbolul
  return (volume * 100000 * price) / leverage * (symbol ? 1 : 1);
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatPips(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)} pips`;
}

// Calculare statistici avansate
export function calculateSharpeRatio(trades: TradeHistory[], riskFreeRate: number = 0.02): number {
  if (trades.length === 0) return 0;
  
  const returns = trades.map(trade => trade.profit);
  const averageReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  return (averageReturn - riskFreeRate) / stdDev;
}

export function calculateMaxDrawdown(trades: TradeHistory[]): number {
  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;
  
  for (const trade of trades) {
    runningTotal += trade.profit;
    if (runningTotal > peak) {
      peak = runningTotal;
    }
    
    const drawdown = peak - runningTotal;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}