"use client";

import { TradingMetrics, TradeHistory } from "@/types/trading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercentage } from "@/lib/tradingData";

interface PerformanceMetricsProps {
  metrics: TradingMetrics;
  tradeHistory: TradeHistory[];
}

export default function PerformanceMetrics({ metrics, tradeHistory }: PerformanceMetricsProps) {
  // Calculare statistici suplimentare
  const recentTrades = tradeHistory.slice(0, 10);
  const recentWinRate = recentTrades.length > 0 
    ? (recentTrades.filter(t => t.profit > 0).length / recentTrades.length) * 100 
    : 0;

  // Calculare streak curent
  let currentStreak = 0;
  let streakType: 'win' | 'loss' | 'none' = 'none';
  
  for (let i = 0; i < tradeHistory.length; i++) {
    const trade = tradeHistory[i];
    if (i === 0) {
      currentStreak = 1;
      streakType = trade.profit > 0 ? 'win' : 'loss';
    } else {
      const isWin = trade.profit > 0;
      const prevIsWin = tradeHistory[i - 1].profit > 0;
      
      if (isWin === prevIsWin) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculare profit pe zile
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayTrades = tradeHistory.filter(t => new Date(t.closeTime) >= yesterday);
  const weekTrades = tradeHistory.filter(t => new Date(t.closeTime) >= thisWeek);

  const todayProfit = todayTrades.reduce((sum, t) => sum + t.profit, 0);
  const weekProfit = weekTrades.reduce((sum, t) => sum + t.profit, 0);

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Metrici de Performanță
          <Badge variant="outline" className="text-xs">
            {metrics.totalTrades} trades
          </Badge>
        </CardTitle>
        <CardDescription>
          Analiză detaliată rezultate trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-bold text-green-400">
              {formatPercentage(metrics.winRate)}
            </div>
            <div className="text-xs text-gray-400">Rata Câștig</div>
            <Progress 
              value={metrics.winRate} 
              className="h-1.5 mt-2" 
            />
          </div>
          
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-bold text-blue-400">
              {metrics.profitFactor.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">Profit Factor</div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.profitFactor > 1.5 ? 'Excelent' : 
               metrics.profitFactor > 1.2 ? 'Bun' : 'Mediocru'}
            </div>
          </div>
        </div>

        {/* Profit Breakdown */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300">Profit Detaliat:</div>
          
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-400 text-xs">Total</div>
              <div className={`font-semibold ${
                metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(metrics.netProfit)}
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-400 text-xs">Astăzi</div>
              <div className={`font-semibold ${
                todayProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(todayProfit)}
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-400 text-xs">Săptămâna</div>
              <div className={`font-semibold ${
                weekProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(weekProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Statistics */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Statistici Avansate:</div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Câștig Mediu:</span>
              <span className="text-green-400 font-mono">
                {formatCurrency(metrics.averageWin)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Pierdere Medie:</span>
              <span className="text-red-400 font-mono">
                -{formatCurrency(metrics.averageLoss)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Drawdown Max:</span>
              <span className="text-orange-400 font-mono">
                {formatPercentage(metrics.maxDrawdown)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Drawdown Curent:</span>
              <span className={`font-mono ${
                metrics.currentDrawdown > 5 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {formatPercentage(metrics.currentDrawdown)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Sharpe Ratio:</span>
              <span className="text-purple-400 font-mono">
                {metrics.sharpeRatio.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Stare Curentă:</div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Streak Curent:</span>
            <Badge className={`${
              streakType === 'win' ? 'bg-green-600' : 
              streakType === 'loss' ? 'bg-red-600' : 'bg-gray-600'
            }`}>
              {currentStreak} {streakType === 'win' ? 'câștig' : 
                              streakType === 'loss' ? 'pierdere' : 'neutru'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Ultimele 10 trades:</span>
            <Badge variant="outline">
              {formatPercentage(recentWinRate)} win rate
            </Badge>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Indicatori Risc:</div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Stabilitate:</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={Math.min(100, metrics.winRate)} 
                  className="h-2 w-16" 
                />
                <span className={`${
                  metrics.winRate > 60 ? 'text-green-400' :
                  metrics.winRate > 45 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {metrics.winRate > 60 ? 'Bună' :
                   metrics.winRate > 45 ? 'Medie' : 'Slabă'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Risc/Recompensă:</span>
              <span className={`font-mono ${
                metrics.profitFactor > 1.5 ? 'text-green-400' :
                metrics.profitFactor > 1.0 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                1:{metrics.profitFactor.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Consistență:</span>
              <Badge variant="outline" className="text-xs">
                {metrics.sharpeRatio > 1 ? 'Consistentă' : 'Variabilă'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-3 rounded-lg border border-blue-800/30">
          <div className="text-xs font-medium text-blue-300 mb-2">
            Rezumat Performanță:
          </div>
          <div className="text-xs text-gray-300 leading-relaxed">
            Robotul arată o performanță {metrics.winRate > 60 ? 'excelentă' : metrics.winRate > 45 ? 'bună' : 'slabă'} 
            {' '}cu {metrics.winningTrades} trades câștigătoare din {metrics.totalTrades} total.
            {' '}Profit factor de {metrics.profitFactor.toFixed(2)} 
            {metrics.profitFactor > 1.5 ? ' indică o strategie profitabilă.' : 
             metrics.profitFactor > 1.0 ? ' este acceptabil.' : ' necesită optimizare.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}