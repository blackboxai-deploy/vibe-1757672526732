# 📈 Strategii de Trading - Ghid Complet

Ghidul complet pentru strategiile de trading implementate în robotul MT5.

## 🎯 Strategia Principală: Trend Following

### Descrierea Strategiei

Strategia principală implementată în robot este **Trend Following** cu confirmări multiple, bazată pe principiile:

1. **Urmărirea trendurilor** - "Trend is your friend"
2. **Confirmări multiple** - Folosirea mai multor indicatori
3. **Management strict al riscului** - Protejarea capitalului
4. **Disciplină în execuție** - Automatizarea deciziilor

### Componentele Strategiei

#### 1. Indicatori Primari

**Moving Averages (MA)**
```mql5
// MA Rapidă (10 perioade) și MA Lentă (20 perioade)
int handle_MA_Fast = iMA(_Symbol, PERIOD_CURRENT, 10, 0, MODE_SMA, PRICE_CLOSE);
int handle_MA_Slow = iMA(_Symbol, PERIOD_CURRENT, 20, 0, MODE_SMA, PRICE_CLOSE);

// Semnal de cumpărare: MA rapidă încrucișează MA lentă în sus
bool buy_signal = (ma_fast[1] > ma_slow[1] && ma_fast[2] <= ma_slow[2]);
```

**RSI (Relative Strength Index)**
```mql5
// RSI pentru filtrarea zonelor de supraculmparat/supravandut
int handle_RSI = iRSI(_Symbol, PERIOD_CURRENT, 14, PRICE_CLOSE);

// Confirmare: RSI între 30 și 70
bool rsi_neutral = (rsi[0] > 30 && rsi[0] < 70);
```

#### 2. Indicatori de Confirmare

**MACD (Moving Average Convergence Divergence)**
```mql5
// MACD pentru confirmarea momentumului
// Histogram > 0 pentru trend ascendent
// Histogram < 0 pentru trend descendent
```

**ATR (Average True Range)**
```mql5
// Pentru măsurarea volatilității și ajustarea SL/TP
double atr = iATR(_Symbol, PERIOD_CURRENT, 14);
double stop_loss = atr * 2.0; // SL dinamic pe baza volatilității
```

## 🔄 Logica de Entry și Exit

### Condiții de Entry

#### Long Position (BUY)
1. **Semnal primar:** MA(10) încrucișează MA(20) în sus
2. **Confirmare RSI:** 30 < RSI < 70
3. **Confirmare MACD:** MACD Histogram > 0
4. **Confirmare trend:** Preț > MA(20) (dacă filtrul de trend este activ)
5. **Condiții de risc:** Spread acceptabil, ore de trading corecte

```mql5
bool EntryLong() {
    return (ma_fast[1] > ma_slow[1] && ma_fast[2] <= ma_slow[2]) &&  // Crossover
           (rsi[0] > 30 && rsi[0] < 70) &&                           // RSI neutral
           (macd_histogram[0] > 0) &&                                // MACD positiv
           (close[0] > ma_slow[0]) &&                                // Trend up
           (VerificareConditiiRisc());                               // Risk OK
}
```

#### Short Position (SELL)
1. **Semnal primar:** MA(10) încrucișează MA(20) în jos
2. **Confirmare RSI:** 30 < RSI < 70
3. **Confirmare MACD:** MACD Histogram < 0
4. **Confirmare trend:** Preț < MA(20) (dacă filtrul de trend este activ)
5. **Condiții de risc:** Spread acceptabil, ore de trading corecte

### Condiții de Exit

#### Exit Profitabil
1. **Take Profit:** 2:1 ratio față de Stop Loss (200 pips TP vs 100 pips SL)
2. **Trailing Stop:** Activat după +50 pips profit
3. **Inversare semnal:** MA crossover în direcția opusă

#### Exit cu Pierdere
1. **Stop Loss:** Fix la 100 pips
2. **Timp maxim:** Închidere după 24h dacă nu e profitabilă
3. **Pierdere zilnică:** Închiderea tuturor pozițiilor la -5% din cont

## 📊 Tipuri de Strategii Suplimentare

### 1. Scalping Strategy (M1-M5)

**Configurare Scalping:**
```mql5
// Setări pentru scalping
input int ScalpMA_Fast = 5;
input int ScalpMA_Slow = 10;
input double ScalpSL = 10.0;    // 10 pips SL
input double ScalpTP = 15.0;    // 15 pips TP
input int ScalpMaxTime = 300;   // 5 minute max hold
```

**Logica Scalping:**
- Entry rapid pe breakout-uri
- SL/TP mici pentru capturarea mișcărilor rapide
- Trading doar în sesiunile cu volum mare
- Exit rapid la primul semn de inversare

### 2. Swing Trading Strategy (H1-H4)

**Configurare Swing:**
```mql5
// Setări pentru swing trading
input int SwingMA_Fast = 50;
input int SwingMA_Slow = 100;
input double SwingSL = 200.0;   // 200 pips SL
input double SwingTP = 400.0;   // 400 pips TP
input int SwingMaxDays = 7;     // 7 zile max hold
```

**Logica Swing:**
- Poziții pe termen mediu (1-7 zile)
- Urmărirea trendurilor majore
- SL/TP mai mari pentru volatilitatea crescută
- Focus pe support/resistance levels

### 3. Breakout Strategy

**Identificarea Breakout-urilor:**
```mql5
// Detectare breakout din Bollinger Bands
bool BreakoutUp() {
    return (close[0] > bb_upper[0] && close[1] <= bb_upper[1]);
}

bool BreakoutDown() {
    return (close[0] < bb_lower[0] && close[1] >= bb_lower[1]);
}
```

**Configurare Breakout:**
- Entry pe spargerea nivelurilor cheie
- Confirmare cu volum crescut
- SL sub/peste nivelul spart
- TP la următorul nivel de rezistență/suport

## 🛡️ Management Risc Avansat

### 1. Position Sizing

**Fixed Fractional:**
```mql5
// Risc fix de 2% per trade
double CalculateLotSize(double riskPercent, double slPips) {
    double accountBalance = AccountInfoDouble(ACCOUNT_BALANCE);
    double riskAmount = accountBalance * riskPercent / 100.0;
    double pipValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
    return riskAmount / (slPips * pipValue);
}
```

**Kelly Criterion:**
```mql5
// Calculare lot pe baza Kelly Criterion
double KellyLotSize(double winRate, double avgWin, double avgLoss) {
    double kelly = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
    return MathMax(0.01, kelly * maxRiskPercent);
}
```

### 2. Portfolio Management

**Diversificare:**
- Maximum 3 poziții simultane
- Nu mai mult de 2 poziții pe același tip de pereche (majors/minors)
- Evitarea corelațiilor ridicate (EUR/USD și GBP/USD simultan)

**Risk Budget:**
```mql5
// Buget total de risc
double totalRiskBudget = 10.0; // 10% din cont
double riskPerPosition = totalRiskBudget / maxPositions;
```

### 3. Dynamic Risk Adjustment

**Performance-Based Adjustment:**
```mql5
// Ajustarea riscului pe baza performanței
double AdjustRisk(double baseRisk, double winRate, int recentTrades) {
    if (winRate > 0.7) return baseRisk * 1.2;      // Crește riscul dacă merge bine
    if (winRate < 0.4) return baseRisk * 0.8;      // Reduce riscul dacă merge prost
    return baseRisk;
}
```

## 📈 Optimizare și Backtesting

### 1. Optimizarea Parametrilor

**Parametri de optimizat:**
- Perioadele MA (fast: 5-15, slow: 15-30)
- Nivelurile RSI (overbought: 65-80, oversold: 20-35)
- SL/TP ratios (1:1 până la 1:3)
- Filtering parameters

**Metrica de optimizare:**
```mql5
// Fitness function pentru optimizare
double FitnessFunction(double totalProfit, double maxDD, int totalTrades) {
    if (maxDD == 0 || totalTrades < 30) return 0;
    double profitFactor = totalProfit / MathAbs(totalProfit - maxDD);
    double sharpeRatio = CalculateSharpe(totalProfit, maxDD, totalTrades);
    return (profitFactor * sharpeRatio) / MathSqrt(maxDD);
}
```

### 2. Walk-Forward Analysis

**Implementare WFA:**
```mql5
// Testare pe perioade consecutive
struct WFAResult {
    datetime startDate;
    datetime endDate;
    double profit;
    double drawdown;
    int trades;
};

WFAResult[] RunWFA(datetime startDate, datetime endDate, int windowSize) {
    // Împarte perioada în ferestre de optimizare și testare
    // Optimizează pe primele 70% din fereastră
    // Testează pe următoarele 30%
}
```

### 3. Monte Carlo Simulation

**Simulare MC:**
```mql5
// Simularea diferitelor scenarii de trading
double[] MonteCarloSimulation(TradeResult[] historicalTrades, int simulations) {
    double[] results = new double[simulations];
    
    for (int i = 0; i < simulations; i++) {
        // Randomizează ordinea trade-urilor
        // Calculează rezultatul final
        results[i] = CalculateFinalBalance(ShuffleTrades(historicalTrades));
    }
    
    return results;
}
```

## 🔧 Implementări Avansate

### 1. Machine Learning Integration

**Feature Engineering:**
```mql5
// Extragerea de features pentru ML
struct MLFeature {
    double[] ma_slopes;      // Pantele MA
    double rsi_momentum;     // Momentumul RSI
    double volatility;       // Volatilitatea curentă
    double correlation;      // Corelația cu alte instrumente
    int timeOfDay;          // Timpul zilei
    int dayOfWeek;          // Ziua săptămânii
};
```

**Model Integration:**
```mql5
// Integrarea cu modele ML externe
double PredictDirection(MLFeature features) {
    // Apelează API-ul ML sau folosește ONNX Runtime
    // Returnează probabilitatea de mișcare pozitivă
}
```

### 2. News Integration

**Economic Calendar:**
```mql5
// Integrarea cu calendarul economic
bool IsHighImpactNews(datetime currentTime) {
    // Verifică dacă sunt vești importante în următoarele 30 min
    return CheckEconomicCalendar(currentTime, 30);
}
```

**Sentiment Analysis:**
```mql5
// Analiza sentimentului pieței
double MarketSentiment() {
    // Agregarea datelor de sentiment din multiple surse
    double cot_sentiment = GetCOTData();
    double social_sentiment = GetSocialSentiment();
    return (cot_sentiment + social_sentiment) / 2.0;
}
```

### 3. Multi-Timeframe Analysis

**MTF Confirmation:**
```mql5
// Analiză pe multiple timeframe-uri
bool MTFConfirmation(string symbol) {
    bool h4_trend = GetTrend(symbol, PERIOD_H4);
    bool h1_trend = GetTrend(symbol, PERIOD_H1);
    bool m15_signal = GetSignal(symbol, PERIOD_M15);
    
    // Entry doar dacă toate timeframe-urile se aliniază
    return (h4_trend == h1_trend && h1_trend == m15_signal);
}
```

## 📊 Metrici de Performanță

### 1. Metrici Standard

**Profit Factor:**
```mql5
double CalculateProfitFactor(TradeResult[] trades) {
    double grossProfit = 0, grossLoss = 0;
    
    for (int i = 0; i < ArraySize(trades); i++) {
        if (trades[i].profit > 0) grossProfit += trades[i].profit;
        else grossLoss += MathAbs(trades[i].profit);
    }
    
    return grossLoss > 0 ? grossProfit / grossLoss : 0;
}
```

**Sharpe Ratio:**
```mql5
double CalculateSharpeRatio(double[] returns, double riskFreeRate = 0.02) {
    double meanReturn = CalculateMean(returns);
    double stdDev = CalculateStdDev(returns);
    
    return stdDev > 0 ? (meanReturn - riskFreeRate) / stdDev : 0;
}
```

**Maximum Drawdown:**
```mql5
double CalculateMaxDrawdown(double[] equityCurve) {
    double maxDD = 0, peak = equityCurve[0];
    
    for (int i = 1; i < ArraySize(equityCurve); i++) {
        if (equityCurve[i] > peak) peak = equityCurve[i];
        
        double drawdown = (peak - equityCurve[i]) / peak * 100;
        if (drawdown > maxDD) maxDD = drawdown;
    }
    
    return maxDD;
}
```

### 2. Metrici Avansate

**Calmar Ratio:**
```mql5
double CalculateCalmarRatio(double annualizedReturn, double maxDrawdown) {
    return maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
}
```

**Win Rate Consistency:**
```mql5
double CalculateWinRateConsistency(TradeResult[] trades, int periods) {
    double[] periodWinRates = new double[periods];
    
    // Calculează win rate pentru fiecare perioadă
    for (int i = 0; i < periods; i++) {
        periodWinRates[i] = CalculatePeriodWinRate(trades, i);
    }
    
    // Returnează deviația standard (consistența)
    return 1.0 / CalculateStdDev(periodWinRates);
}
```

## 🎯 Strategii Specifice pentru Diferite Condiții de Piață

### 1. Trending Markets

**Strong Trend Strategy:**
```mql5
// Pentru trenduri puternice (ADX > 25)
bool IsStrongTrend() {
    double adx = iADX(_Symbol, PERIOD_CURRENT, 14);
    return adx > 25;
}

// Setări pentru trending markets
if (IsStrongTrend()) {
    takeProfitMultiplier = 3.0;  // TP mai mare
    trailingStopDistance = 75;   // Trailing mai larg
}
```

### 2. Range-Bound Markets

**Range Trading Strategy:**
```mql5
// Detectarea range-urilor
bool IsRangeBoundMarket() {
    double adx = iADX(_Symbol, PERIOD_CURRENT, 14);
    return adx < 20;
}

// Setări pentru range trading
if (IsRangeBoundMarket()) {
    useSupResLevels = true;      // Folosește S/R
    takeProfitMultiplier = 1.5;  // TP mai mic
    reducePositionSize = true;   // Lot mai mic
}
```

### 3. High Volatility Markets

**Volatility Adjustment:**
```mql5
// Ajustări pentru volatilitate mare
bool IsHighVolatility() {
    double atr = iATR(_Symbol, PERIOD_CURRENT, 14);
    double avgATR = CalculateAvgATR(50); // ATR mediu ultimele 50 perioade
    return atr > avgATR * 1.5;
}

if (IsHighVolatility()) {
    stopLossMultiplier = 1.5;    // SL mai mare
    reduceFrequency = true;      // Trade mai rar
    maxPositions = 2;            // Mai puține poziții
}
```

## 📋 Checklist Implementare Strategie

### Pre-Launch
- [ ] Backtesting pe minimum 2 ani de date
- [ ] Forward testing pe cont demo minimum 3 luni
- [ ] Optimizare parametri pe multiple instrumente
- [ ] Testarea în diferite condiții de piață
- [ ] Verificarea sistemului de risk management

### Launch
- [ ] Start cu capital redus (max 10% din cont)
- [ ] Monitorizare zilnică primele 2 săptămâni
- [ ] Tracking metrici de performanță
- [ ] Compararea cu rezultatele de backtesting
- [ ] Ajustări fine dacă e necesar

### Post-Launch
- [ ] Review lunar al performanței
- [ ] Optimizare continuă parametri
- [ ] Adaptarea la schimbările de piață
- [ ] Îmbunătățirea sistemului pe baza feedbackului
- [ ] Scaling gradual al capitalului

---

*Acest ghid oferă o bază solidă pentru implementarea și optimizarea strategiilor de trading. Adaptează-l conform stilului tău de trading și condițiilor actuale de piață.*