"use client";

import { useState } from "react";
import { PriceData, Position, TechnicalIndicators } from "@/types/trading";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TradingChartProps {
  priceData: PriceData[];
  positions: Position[];
  indicators: TechnicalIndicators;
}

export default function TradingChart({ priceData, positions, indicators }: TradingChartProps) {
  const [activeIndicators, setActiveIndicators] = useState({
    maFast: true,
    maSlow: true,
    rsi: false,
    bb: false
  });

  const [timeframe, setTimeframe] = useState("1H");

  // Formatare date pentru grafic
  const chartData = priceData.map((data, index) => ({
    time: new Date(data.timestamp).toLocaleTimeString("ro-RO", { 
      hour: "2-digit", 
      minute: "2-digit" 
    }),
    price: data.close,
    maFast: data.maFast,
    maSlow: data.maSlow,
    rsi: data.rsi,
    volume: data.volume,
    high: data.high,
    low: data.low,
    bbUpper: indicators.bollinger.upper,
    bbMiddle: indicators.bollinger.middle,
    bbLower: indicators.bollinger.lower,
    index
  }));

  // Găsire preț minim și maxim pentru referințe
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  // Calculare support și resistance
  const supportLevel = minPrice + priceRange * 0.2;
  const resistanceLevel = maxPrice - priceRange * 0.2;

  const toggleIndicator = (indicator: keyof typeof activeIndicators) => {
    setActiveIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  // Custom tooltip pentru grafic
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        price?: number;
        volume?: number;
        maFast?: number;
        maSlow?: number;
        rsi?: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-lg">
          <p className="text-gray-300 text-sm">{`Timp: ${label}`}</p>
          <p className="text-blue-400 font-mono">{`Preț: ${data.price?.toFixed(5)}`}</p>
          <p className="text-gray-400 text-xs">{`Volum: ${data.volume}`}</p>
          {activeIndicators.maFast && data.maFast && (
            <p className="text-green-400 text-xs">{`MA${10}: ${data.maFast.toFixed(5)}`}</p>
          )}
          {activeIndicators.maSlow && data.maSlow && (
            <p className="text-yellow-400 text-xs">{`MA${20}: ${data.maSlow.toFixed(5)}`}</p>
          )}
          {activeIndicators.rsi && data.rsi && (
            <p className="text-purple-400 text-xs">{`RSI: ${data.rsi.toFixed(1)}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Timeframe:</span>
          {["5M", "15M", "1H", "4H", "1D"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Indicatori:</span>
          <Button
            variant={activeIndicators.maFast ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => toggleIndicator("maFast")}
          >
            MA10
          </Button>
          <Button
            variant={activeIndicators.maSlow ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => toggleIndicator("maSlow")}
          >
            MA20
          </Button>
          <Button
            variant={activeIndicators.rsi ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => toggleIndicator("rsi")}
          >
            RSI
          </Button>
          <Button
            variant={activeIndicators.bb ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => toggleIndicator("bb")}
          >
            BB
          </Button>
        </div>
      </div>

      {/* Price Chart */}
      <div className="h-96 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={12}
              tickCount={6}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12}
              domain={['dataMin - 0.0010', 'dataMax + 0.0010']}
              tickFormatter={(value) => value.toFixed(4)}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Support and Resistance Lines */}
            <ReferenceLine 
              y={supportLevel} 
              stroke="#10B981" 
              strokeDasharray="5 5" 
              strokeWidth={1}
              label={{ value: "Support", position: "insideTopRight", fill: "#10B981" }}
            />
            <ReferenceLine 
              y={resistanceLevel} 
              stroke="#EF4444" 
              strokeDasharray="5 5" 
              strokeWidth={1}
              label={{ value: "Resistance", position: "insideBottomRight", fill: "#EF4444" }}
            />
            
            {/* Position Entry Levels */}
            {positions.map((position) => (
              <ReferenceLine
                key={position.ticket}
                y={position.openPrice}
                stroke={position.type === "BUY" ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                strokeOpacity={0.7}
                label={{ 
                  value: `${position.type} ${position.volume}`, 
                  position: "insideTopLeft",
                  fill: position.type === "BUY" ? "#10B981" : "#EF4444"
                }}
              />
            ))}
            
            {/* Main Price Line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: "#3B82F6", strokeWidth: 2, fill: "#1F2937" }}
            />
            
            {/* Moving Averages */}
            {activeIndicators.maFast && (
              <Line
                type="monotone"
                dataKey="maFast"
                stroke="#10B981"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="none"
              />
            )}
            {activeIndicators.maSlow && (
              <Line
                type="monotone"
                dataKey="maSlow"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="none"
              />
            )}
            
            {/* Bollinger Bands */}
            {activeIndicators.bb && (
              <>
                <Line
                  type="monotone"
                  dataKey="bbUpper"
                  stroke="#8B5CF6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="2 2"
                />
                <Line
                  type="monotone"
                  dataKey="bbMiddle"
                  stroke="#6B7280"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="1 1"
                />
                <Line
                  type="monotone"
                  dataKey="bbLower"
                  stroke="#8B5CF6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="2 2"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & Position Info */}
      <div className="px-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-gray-400">Preț Curent</span>
          </div>
          {activeIndicators.maFast && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span className="text-gray-400">MA10</span>
            </div>
          )}
          {activeIndicators.maSlow && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span className="text-gray-400">MA20</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500 opacity-60" style={{borderTop: "1px dashed"}}></div>
            <span className="text-gray-400">Support</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500 opacity-60" style={{borderTop: "1px dashed"}}></div>
            <span className="text-gray-400">Resistance</span>
          </div>
        </div>

        {/* Position Markers */}
        {positions.length > 0 && (
          <div className="border-t border-gray-700 pt-3">
            <div className="text-xs text-gray-400 mb-2">Poziții pe Grafic:</div>
            <div className="flex flex-wrap gap-2">
              {positions.map((position) => (
                <Badge
                  key={position.ticket}
                  className={`text-xs ${
                    position.type === "BUY" 
                      ? "bg-green-900 text-green-300 border-green-700" 
                      : "bg-red-900 text-red-300 border-red-700"
                  }`}
                >
                  {position.symbol} {position.type} {position.volume} @ {position.openPrice.toFixed(5)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current Market Info */}
        <div className="border-t border-gray-700 pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500">Preț Curent:</span>
            <div className="font-mono text-blue-400">{chartData[chartData.length - 1]?.price.toFixed(5)}</div>
          </div>
          <div>
            <span className="text-gray-500">Spread:</span>
            <div className="font-mono text-yellow-400">{indicators.spread} pips</div>
          </div>
          <div>
            <span className="text-gray-500">ATR:</span>
            <div className="font-mono text-purple-400">{indicators.atr.toFixed(5)}</div>
          </div>
          <div>
            <span className="text-gray-500">RSI:</span>
            <div className={`font-mono ${
              indicators.rsi > 70 ? 'text-red-400' : 
              indicators.rsi < 30 ? 'text-green-400' : 'text-gray-300'
            }`}>
              {indicators.rsi.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}