"use client";

import { TradingData } from "@/types/trading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TradingChart from "@/components/TradingChart";
import ConfigPanel from "@/components/ConfigPanel";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import RiskControls from "@/components/RiskControls";
import { formatCurrency, formatPercentage } from "@/lib/tradingData";

interface DashboardProps {
  tradingData: TradingData;
}

export default function Dashboard({ tradingData }: DashboardProps) {
  const { account, positions, metrics, riskManagement, indicators, marketCondition, serverInfo } = tradingData;

  // Calculare statistici rapide
  const totalProfit = positions.reduce((sum, pos) => sum + pos.profit, 0);
  const marginUsed = account.equity - account.freeMargin;
  const marginUsagePercent = (marginUsed / account.equity) * 100;

  return (
    <div className="space-y-6">
      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Account Balance */}
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-100">Balanta Cont</CardTitle>
            <CardDescription className="text-blue-300">Equity și Margin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-100">
                {formatCurrency(account.balance, account.currency)}
              </div>
              <div className="text-sm text-blue-300">
                Equity: {formatCurrency(account.equity, account.currency)}
              </div>
              <div className="text-xs text-blue-400">
                Margin Level: {account.marginLevel.toFixed(1)}%
              </div>
              <Progress 
                value={marginUsagePercent} 
                className="h-2 bg-blue-950" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's P&L */}
        <Card className={`bg-gradient-to-br border-opacity-50 ${
          riskManagement.dailyCurrentPnL >= 0 
            ? 'from-green-900/50 to-green-800/30 border-green-700/50' 
            : 'from-red-900/50 to-red-800/30 border-red-700/50'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Profit Zilnic</CardTitle>
            <CardDescription>P&L Curent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${
                riskManagement.dailyCurrentPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(riskManagement.dailyCurrentPnL, account.currency)}
              </div>
              <div className="text-sm opacity-80">
                Limita: -{formatCurrency(account.balance * riskManagement.dailyMaxLoss / 100, account.currency)}
              </div>
              <Progress 
                value={Math.abs(riskManagement.dailyCurrentPnL) / (account.balance * riskManagement.dailyMaxLoss / 100) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-100">Poziții Active</CardTitle>
            <CardDescription className="text-purple-300">Trading Live</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-100">
                {positions.length}
              </div>
              <div className="text-sm text-purple-300">
                Profit Curent: {formatCurrency(totalProfit, account.currency)}
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-purple-300 border-purple-400">
                  {positions.filter(p => p.type === 'BUY').length} BUY
                </Badge>
                <Badge variant="outline" className="text-purple-300 border-purple-400">
                  {positions.filter(p => p.type === 'SELL').length} SELL
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-emerald-100">Rata Câștig</CardTitle>
            <CardDescription className="text-emerald-300">Performanță</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-emerald-100">
                {formatPercentage(metrics.winRate)}
              </div>
              <div className="text-sm text-emerald-300">
                {metrics.winningTrades}/{metrics.totalTrades} trades
              </div>
              <div className="text-xs text-emerald-400">
                Profit Factor: {metrics.profitFactor.toFixed(2)}
              </div>
              <Progress 
                value={metrics.winRate} 
                className="h-2 bg-emerald-950" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trading Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Grafic Trading - {tradingData.settings.symbol}</CardTitle>
                  <CardDescription>
                    Timeframe: {tradingData.settings.timeframe} | Spread: {indicators.spread} pips
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    serverInfo.status === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-400">
                    Ping: {serverInfo.ping}ms
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pb-6">
              <TradingChart 
                priceData={tradingData.priceData} 
                positions={positions}
                indicators={indicators}
              />
            </CardContent>
          </Card>
        </div>

        {/* Market Status & Indicators */}
        <div className="space-y-6">
          
          {/* Market Condition */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Condiții Piață</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Trend:</span>
                <Badge className={`${
                  marketCondition.trend === 'BULLISH' ? 'bg-green-600' :
                  marketCondition.trend === 'BEARISH' ? 'bg-red-600' : 'bg-yellow-600'
                }`}>
                  {marketCondition.trend}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Volatilitate:</span>
                <Badge variant="outline">{marketCondition.volatility}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Sesiune:</span>
                <Badge variant="outline">{marketCondition.marketSession}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Filtru Vești:</span>
                <Badge className={marketCondition.newsFilter ? 'bg-yellow-600' : 'bg-gray-600'}>
                  {marketCondition.newsFilter ? 'ACTIV' : 'INACTIV'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Technical Indicators */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Indicatori Tehnici</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">MA Rapidă:</div>
                  <div className="font-mono text-blue-400">{indicators.maFast.toFixed(5)}</div>
                </div>
                <div>
                  <div className="text-gray-400">MA Lentă:</div>
                  <div className="font-mono text-blue-400">{indicators.maSlow.toFixed(5)}</div>
                </div>
                <div>
                  <div className="text-gray-400">RSI:</div>
                  <div className="font-mono text-purple-400">{indicators.rsi.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-gray-400">ATR:</div>
                  <div className="font-mono text-orange-400">{indicators.atr.toFixed(5)}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-1">MACD</div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-gray-500">Main:</span>
                    <div className="text-green-400">{indicators.macd.main.toFixed(4)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Signal:</span>
                    <div className="text-yellow-400">{indicators.macd.signal.toFixed(4)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Hist:</span>
                    <div className="text-red-400">{indicators.macd.histogram.toFixed(4)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row - Detailed Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Performance Metrics */}
        <div className="xl:col-span-1">
          <PerformanceMetrics metrics={metrics} tradeHistory={tradingData.tradeHistory} />
        </div>

        {/* Risk Controls */}
        <div className="xl:col-span-1">
          <RiskControls riskManagement={riskManagement} account={account} />
        </div>

        {/* Config Panel */}
        <div className="xl:col-span-1">
          <ConfigPanel settings={tradingData.settings} />
        </div>
      </div>

      {/* Active Positions Table */}
      {positions.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle>Poziții Active</CardTitle>
            <CardDescription>Detalii complete poziții deschise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">Ticket</th>
                    <th className="text-left p-2">Simbol</th>
                    <th className="text-left p-2">Tip</th>
                    <th className="text-left p-2">Lot</th>
                    <th className="text-left p-2">Preț Deschidere</th>
                    <th className="text-left p-2">Preț Curent</th>
                    <th className="text-left p-2">SL</th>
                    <th className="text-left p-2">TP</th>
                    <th className="text-left p-2">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.ticket} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="p-2 font-mono text-gray-300">{position.ticket}</td>
                      <td className="p-2 font-semibold">{position.symbol}</td>
                      <td className="p-2">
                        <Badge className={position.type === 'BUY' ? 'bg-green-600' : 'bg-red-600'}>
                          {position.type}
                        </Badge>
                      </td>
                      <td className="p-2 font-mono">{position.volume}</td>
                      <td className="p-2 font-mono">{position.openPrice.toFixed(5)}</td>
                      <td className="p-2 font-mono">{position.currentPrice.toFixed(5)}</td>
                      <td className="p-2 font-mono text-red-400">{position.stopLoss.toFixed(5)}</td>
                      <td className="p-2 font-mono text-green-400">{position.takeProfit.toFixed(5)}</td>
                      <td className={`p-2 font-mono font-semibold ${
                        position.profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(position.profit, account.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}