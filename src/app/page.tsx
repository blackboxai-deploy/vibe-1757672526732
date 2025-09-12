"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import { TradingData } from "@/types/trading";
import { generateMockTradingData } from "@/lib/tradingData";

export default function HomePage() {
  const [tradingData, setTradingData] = useState<TradingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulează încărcarea datelor de trading
    const loadTradingData = async () => {
      try {
        // Simulare delay pentru încărcarea datelor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData = generateMockTradingData();
        setTradingData(mockData);
      } catch (error) {
        console.error("Eroare la încărcarea datelor de trading:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTradingData();

    // Actualizare automată la fiecare 30 de secunde
    const interval = setInterval(() => {
      if (!isLoading) {
        const updatedData = generateMockTradingData();
        setTradingData(updatedData);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-100">Încărcare Dashboard</h2>
          <p className="text-gray-400">Se conectează la robotul MT5...</p>
        </div>
      </div>
    );
  }

  if (!tradingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">⚠</span>
          </div>
          <h2 className="text-2xl font-bold text-red-400">Eroare de Conexiune</h2>
          <p className="text-gray-400">Nu s-au putut încărca datele de trading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">MT5</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Robot Trading MT5
              </h1>
              <p className="text-gray-400">Dashboard de Monitorizare și Control</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400">Robot Activ</span>
            </div>
            <div className="text-gray-400">
              Ultimă actualizare: {new Date().toLocaleTimeString("ro-RO")}
            </div>
            <div className="text-gray-400">
              Server: {tradingData.serverInfo.name}
            </div>
          </div>
        </header>

        {/* Dashboard Principal */}
        <Dashboard tradingData={tradingData} />
        
        {/* Footer */}
        <footer className="text-center py-6 border-t border-gray-700">
          <p className="text-gray-500 text-sm">
            Robot Trading MT5 v1.0 - Strategie Trend Following cu Management Risc Avansat
          </p>
          <p className="text-gray-600 text-xs mt-2">
            © 2024 Toate drepturile rezervate. Utilizați responsabil și pe propria răspundere.
          </p>
        </footer>
      </div>
    </div>
  );
}