"use client";

import { RobotSettings } from "@/types/trading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface ConfigPanelProps {
  settings: RobotSettings;
}

export default function ConfigPanel({ settings }: ConfigPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const handleToggleEdit = () => {
    if (isEditing) {
      // În aplicația reală, aici ar fi logica pentru salvarea setărilor
      alert("Setări salvate cu succes!");
    }
    setIsEditing(!isEditing);
  };

  const handleResetToDefaults = () => {
    const defaultSettings: RobotSettings = {
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
    };
    setTempSettings(defaultSettings);
  };

  const getOptimizationLevel = () => {
    // Evaluare simplă a optimizării pe baza setărilor curente
    let score = 0;
    
    if (settings.riskPercent <= 2) score += 20;
    if (settings.maxDailyLoss <= 5) score += 20;
    if (settings.newsFilterActive) score += 15;
    if (settings.trailingStopActive) score += 15;
    if (settings.stopLossPips >= 50 && settings.stopLossPips <= 150) score += 15;
    if (settings.takeProfitPips >= settings.stopLossPips * 1.5) score += 15;
    
    return Math.min(100, score);
  };

  const optimizationLevel = getOptimizationLevel();

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Configurare Robot
              <Badge className={settings.isActive ? 'bg-green-600' : 'bg-red-600'}>
                {settings.isActive ? 'ACTIV' : 'INACTIV'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Parametri și setări de trading
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={handleToggleEdit}
          >
            {isEditing ? 'Salvează' : 'Editează'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Trading Status */}
        <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-300">Status Robot</span>
            <div className="text-xs text-gray-500">
              Pornire/oprire trading automat
            </div>
          </div>
          <Switch 
            checked={isEditing ? tempSettings.isActive : settings.isActive}
            disabled={!isEditing}
            onCheckedChange={(checked) => 
              setTempSettings(prev => ({ ...prev, isActive: checked }))
            }
          />
        </div>

        {/* Symbol & Timeframe */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Instrument & Timeframe:</div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-xs text-gray-500">Simbol:</div>
              <div className="font-mono text-blue-400 text-sm">
                {settings.symbol}
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-xs text-gray-500">Timeframe:</div>
              <div className="font-mono text-blue-400 text-sm">
                {settings.timeframe}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Indicatori Tehnici:</div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-800/20 p-2 rounded text-center">
              <div className="text-gray-500">MA Rapidă</div>
              <div className="font-semibold text-green-400">
                {settings.fastMAPeriod}
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded text-center">
              <div className="text-gray-500">MA Lentă</div>
              <div className="font-semibold text-yellow-400">
                {settings.slowMAPeriod}
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded text-center">
              <div className="text-gray-500">RSI</div>
              <div className="font-semibold text-purple-400">
                {settings.rsiPeriod}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Parameters */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Parametri Risc:</div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-500">Stop Loss:</div>
              <div className="font-semibold text-red-400">
                {settings.stopLossPips} pips
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-500">Take Profit:</div>
              <div className="font-semibold text-green-400">
                {settings.takeProfitPips} pips
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-500">Risc/Trade:</div>
              <div className="font-semibold text-orange-400">
                {settings.riskPercent}%
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-500">Max Zinic:</div>
              <div className="font-semibold text-red-400">
                {settings.maxDailyLoss}%
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Ratio R/R: 1:{(settings.takeProfitPips / settings.stopLossPips).toFixed(1)}
          </div>
        </div>

        {/* Trading Hours */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Ore Trading:</div>
          
          <div className="flex items-center justify-between bg-gray-800/20 p-2 rounded">
            <span className="text-xs text-gray-500">Program:</span>
            <span className="text-sm font-mono text-blue-400">
              {String(settings.tradingHoursStart).padStart(2, '0')}:00 - {String(settings.tradingHoursEnd).padStart(2, '0')}:00
            </span>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Funcții Avansate:</div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Filtru Vești</span>
                <div className="text-xs text-gray-500">
                  Evită trading în timpul vestilor importante
                </div>
              </div>
              <Switch 
                checked={isEditing ? tempSettings.newsFilterActive : settings.newsFilterActive}
                disabled={!isEditing}
                onCheckedChange={(checked) => 
                  setTempSettings(prev => ({ ...prev, newsFilterActive: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Trailing Stop</span>
                <div className="text-xs text-gray-500">
                  {settings.trailingStopPips} pips distanță
                </div>
              </div>
              <Switch 
                checked={isEditing ? tempSettings.trailingStopActive : settings.trailingStopActive}
                disabled={!isEditing}
                onCheckedChange={(checked) => 
                  setTempSettings(prev => ({ ...prev, trailingStopActive: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Optimization Level */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Nivel Optimizare:</span>
            <Badge className={`${
              optimizationLevel > 80 ? 'bg-green-600' :
              optimizationLevel > 60 ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {optimizationLevel}%
            </Badge>
          </div>
          
          <Progress value={optimizationLevel} className="h-2" />
          
          <div className="text-xs text-gray-500">
            {optimizationLevel > 80 && "Setări excelente pentru trading sigur"}
            {optimizationLevel > 60 && optimizationLevel <= 80 && "Setări bune, dar pot fi îmbunătățite"}
            {optimizationLevel <= 60 && "Setările necesită optimizare pentru risc scăzut"}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Acțiuni Rapide:</div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleResetToDefaults}
              disabled={!isEditing}
            >
              Reset Implicit
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => alert("Optimizare automată disponibilă în versiunea PRO")}
            >
              Auto-Optimizare
            </Button>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 p-3 rounded-lg border border-indigo-800/30">
          <div className="text-xs font-medium text-indigo-300 mb-2">
            Rezumat Configurare:
          </div>
          <div className="text-xs text-gray-400 leading-relaxed">
            Robot configurat pentru trading {settings.symbol} pe timeframe {settings.timeframe} 
            {' '}cu risc de {settings.riskPercent}% per trade și ratio R/R de 1:{(settings.takeProfitPips / settings.stopLossPips).toFixed(1)}.
            {' '}{settings.newsFilterActive ? 'Filtru vești activ.' : 'Fără filtru vești.'}
            {' '}{settings.trailingStopActive ? `Trailing stop la ${settings.trailingStopPips} pips.` : 'Fără trailing stop.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}