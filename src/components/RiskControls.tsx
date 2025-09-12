"use client";

import { RiskManagement, AccountInfo } from "@/types/trading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercentage } from "@/lib/tradingData";
import { useState } from "react";

interface RiskControlsProps {
  riskManagement: RiskManagement;
  account: AccountInfo;
}

export default function RiskControls({ riskManagement, account }: RiskControlsProps) {
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Calculare utilizare risc
  const dailyLossUsed = Math.abs(riskManagement.dailyCurrentPnL) / (account.balance * riskManagement.dailyMaxLoss / 100) * 100;
  const positionUsage = (riskManagement.currentPositions / riskManagement.maxPositions) * 100;
  
  // Calculare margin usage
  const marginUsed = account.equity - account.freeMargin;
  const marginUsage = (marginUsed / account.equity) * 100;

  // Starea riscului global
  const getRiskStatus = () => {
    if (dailyLossUsed > 80 || marginUsage > 80) return { level: 'HIGH', color: 'text-red-400', bgColor: 'bg-red-900/20' };
    if (dailyLossUsed > 50 || marginUsage > 60) return { level: 'MEDIUM', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20' };
    return { level: 'LOW', color: 'text-green-400', bgColor: 'bg-green-900/20' };
  };

  const riskStatus = getRiskStatus();

  const handleEmergencyStop = () => {
    setEmergencyMode(true);
    // În aplicația reală, aici ar fi logica pentru oprirea de urgență
    alert("Oprire de urgență activată! Toate pozițiile vor fi închise.");
  };

  const handleResetDaily = () => {
    // În aplicația reală, aici ar fi logica pentru reset
    alert("Reset limitelor zilnice efectuat!");
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Controale Risc
          <Badge className={`text-xs ${riskStatus.color} ${riskStatus.bgColor} border-current`}>
            RISC {riskStatus.level}
          </Badge>
        </CardTitle>
        <CardDescription>
          Management și monitorizare risc real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Daily Risk Usage */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Utilizare Risc Zilnic:</span>
            <span className={`text-sm font-semibold ${
              dailyLossUsed > 80 ? 'text-red-400' :
              dailyLossUsed > 50 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {dailyLossUsed.toFixed(1)}%
            </span>
          </div>
          
          <Progress 
            value={dailyLossUsed} 
            className="h-2"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>P&L Curent: {formatCurrency(riskManagement.dailyCurrentPnL)}</span>
            <span>Limită: -{formatCurrency(account.balance * riskManagement.dailyMaxLoss / 100)}</span>
          </div>
        </div>

        {/* Position Usage */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Poziții Active:</span>
            <span className="text-sm font-semibold">
              {riskManagement.currentPositions}/{riskManagement.maxPositions}
            </span>
          </div>
          
          <Progress 
            value={positionUsage} 
            className="h-2"
          />
          
          <div className="text-xs text-gray-500">
            Capacitate rămasă: {riskManagement.maxPositions - riskManagement.currentPositions} poziții
          </div>
        </div>

        {/* Margin Management */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Utilizare Margin:</span>
            <span className={`text-sm font-semibold ${
              marginUsage > 80 ? 'text-red-400' :
              marginUsage > 60 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {marginUsage.toFixed(1)}%
            </span>
          </div>
          
          <Progress 
            value={marginUsage} 
            className="h-2"
          />
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Margin Level:</span>
              <div className={`font-mono ${
                account.marginLevel < 200 ? 'text-red-400' :
                account.marginLevel < 500 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {account.marginLevel.toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-gray-500">Margin Liber:</span>
              <div className="font-mono text-blue-400">
                {formatCurrency(account.freeMargin, account.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Parameters */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Parametri Risc:</div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-500">Risc/Trade:</div>
              <div className="font-semibold text-blue-400">
                {formatPercentage(riskManagement.riskPerTrade)}
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-500">Max Zinic:</div>
              <div className="font-semibold text-red-400">
                {formatPercentage(riskManagement.dailyMaxLoss)}
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-500">Lot Min:</div>
              <div className="font-mono text-gray-300">
                {riskManagement.minLotSize}
              </div>
            </div>
            
            <div className="bg-gray-800/20 p-2 rounded">
              <div className="text-gray-500">Lot Max:</div>
              <div className="font-mono text-gray-300">
                {riskManagement.maxLotSize}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Controls */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Controale Active:</div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Trailing Stop</span>
                <div className="text-xs text-gray-500">
                  Distanță: {riskManagement.trailingStopDistance} pips
                </div>
              </div>
              <Switch checked={riskManagement.trailingStopActive} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Protecție Risc</span>
                <div className="text-xs text-gray-500">
                  Oprire automată la limită
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Mod Urgență</span>
                <div className="text-xs text-gray-500">
                  Oprire completă trading
                </div>
              </div>
              <Switch checked={emergencyMode} disabled />
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300">Acțiuni de Urgență:</div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-9 text-xs"
              onClick={handleEmergencyStop}
              disabled={emergencyMode}
            >
              {emergencyMode ? 'OPRIRE ACTIVĂ' : 'OPRIRE DE URGENȚĂ'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs"
              onClick={handleResetDaily}
            >
              Reset Limite Zilnice
            </Button>
          </div>
        </div>

        {/* Risk Summary */}
        <div className={`p-3 rounded-lg border ${riskStatus.bgColor} border-opacity-30`}>
          <div className="text-xs font-medium mb-2 text-gray-300">
            Status Risc Curent:
          </div>
          <div className="text-xs text-gray-400 leading-relaxed">
            {riskStatus.level === 'HIGH' && (
              <>
                ⚠️ ATENȚIE: Risc ridicat detectat! Monitorizați atent pozițiile active 
                și considerați reducerea expunerii pentru a evita pierderile mari.
              </>
            )}
            {riskStatus.level === 'MEDIUM' && (
              <>
                ⚡ Risc moderat: Expunerea curentă se apropie de limitele setate. 
                Monitorizați și fiți pregătiți pentru ajustări.
              </>
            )}
            {riskStatus.level === 'LOW' && (
              <>
                ✅ Risc scăzut: Expunerea curentă este în parametri siguri. 
                Continuați trading-ul cu prudență.
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}