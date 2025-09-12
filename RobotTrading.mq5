//+------------------------------------------------------------------+
//|                                               RobotTrading.mq5  |
//|                        Copyright 2024, Robot de Trading MT5     |
//|                                   Strategie Trend Following     |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, Robot de Trading MT5"
#property link      ""
#property version   "1.0"
#property strict

#include "BibliotecaTrading.mqh"
#include "ManagerRisc.mqh"

//--- Parametri de intrare
input group "=== SETĂRI GENERALE ==="
input bool     ActivareRobot = true;                    // Activare Robot
input double   LotMinim = 0.01;                         // Lot minim
input double   LotMaxim = 1.0;                          // Lot maxim
input double   RiscPerTrade = 2.0;                      // Risc per trade (%)

input group "=== INDICATORI TEHNICI ==="
input int      PerioadaMA_Rapida = 10;                  // Perioada MA Rapidă
input int      PerioadaMA_Lenta = 20;                   // Perioada MA Lentă
input int      PerioadaRSI = 14;                        // Perioada RSI
input double   RSI_Supraculmparat = 70.0;               // RSI Supraculmparat
input double   RSI_Supravalndut = 30.0;                 // RSI Supravandut

input group "=== MANAGEMENT RISC ==="
input double   StopLoss_Puncte = 100.0;                 // Stop Loss (puncte)
input double   TakeProfit_Puncte = 200.0;               // Take Profit (puncte)
input bool     ActivareTrailingStop = true;             // Activare Trailing Stop
input double   TrailingStop_Puncte = 50.0;              // Trailing Stop (puncte)
input double   PierdereMazimaZi = 5.0;                  // Pierdere maximă pe zi (%)

input group "=== FILTRE TRADING ==="
input bool     TradingDoarTrend = true;                 // Trading doar pe trend
input int      OreleInceputTrading = 8;                 // Ora început trading
input int      OreleSfarsitTrading = 22;                // Ora sfârșit trading
input bool     EvitareVestiBun = true;                  // Evitare vești importante

//--- Variabile globale
int            handle_MA_Rapida, handle_MA_Lenta, handle_RSI;
double         ma_rapida[], ma_lenta[], rsi[];
datetime       ultimulTick = 0;
double         profitulZilei = 0.0;
datetime       dataUltimuluiReset = 0;

//+------------------------------------------------------------------+
//| Funcția de inițializare Expert Advisor                          |
//+------------------------------------------------------------------+
int OnInit()
{
    Print("=== PORNIRE ROBOT DE TRADING ===");
    Print("Versiunea: 1.0 - Strategie Trend Following");
    
    // Verificare setări
    if(!ActivareRobot)
    {
        Print("Robot dezactivat prin parametri");
        return INIT_SUCCEEDED;
    }
    
    // Inițializare indicatori
    handle_MA_Rapida = iMA(_Symbol, PERIOD_CURRENT, PerioadaMA_Rapida, 0, MODE_SMA, PRICE_CLOSE);
    handle_MA_Lenta = iMA(_Symbol, PERIOD_CURRENT, PerioadaMA_Lenta, 0, MODE_SMA, PRICE_CLOSE);
    handle_RSI = iRSI(_Symbol, PERIOD_CURRENT, PerioadaRSI, PRICE_CLOSE);
    
    // Verificare validitate indicatori
    if(handle_MA_Rapida == INVALID_HANDLE || handle_MA_Lenta == INVALID_HANDLE || handle_RSI == INVALID_HANDLE)
    {
        Print("Eroare la inițializarea indicatorilor");
        return INIT_FAILED;
    }
    
    // Setare arrays ca series
    ArraySetAsSeries(ma_rapida, true);
    ArraySetAsSeries(ma_lenta, true);
    ArraySetAsSeries(rsi, true);
    
    // Inițializare manager risc
    IniManagementRisc(PierdereMazimaZi, LotMinim, LotMaxim);
    
    Print("Robot inițializat cu succes!");
    Print("Simbol: ", _Symbol);
    Print("Timeframe: ", EnumToString(_Period));
    Print("Spread curent: ", SymbolInfoInteger(_Symbol, SYMBOL_SPREAD));
    
    return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Funcția de curățare la închidere                                |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    Print("=== OPRIRE ROBOT DE TRADING ===");
    Print("Motiv oprire: ", reason);
    
    // Eliberare handles
    if(handle_MA_Rapida != INVALID_HANDLE) IndicatorRelease(handle_MA_Rapida);
    if(handle_MA_Lenta != INVALID_HANDLE) IndicatorRelease(handle_MA_Lenta);
    if(handle_RSI != INVALID_HANDLE) IndicatorRelease(handle_RSI);
    
    Print("Robot oprit cu succes!");
}

//+------------------------------------------------------------------+
//| Funcția principală de execuție                                  |
//+------------------------------------------------------------------+
void OnTick()
{
    // Verificare dacă robotul este activ
    if(!ActivareRobot) return;
    
    // Verificare nouă bară
    if(ultimulTick == iTime(_Symbol, PERIOD_CURRENT, 0)) return;
    ultimulTick = iTime(_Symbol, PERIOD_CURRENT, 0);
    
    // Reset profit zilnic
    ResetProfitZilnic();
    
    // Verificare condiții de trading
    if(!VerificareConditiiTrading()) return;
    
    // Obținere date indicatori
    if(!ObtineneDateIndicatori()) return;
    
    // Verificare semnale de trading
    int semnal = AnalizeazaSemnale();
    
    // Executare trading
    if(semnal != 0)
    {
        ExecutareOrdine(semnal);
    }
    
    // Actualizare trailing stop
    if(ActivareTrailingStop)
    {
        ActualizeazaTrailingStop();
    }
    
    // Afișare informații
    AfisareInformatii();
}

//+------------------------------------------------------------------+
//| Verificare condiții generale de trading                         |
//+------------------------------------------------------------------+
bool VerificareConditiiTrading()
{
    // Verificare ore de trading
    MqlDateTime dt;
    TimeToStruct(TimeCurrent(), dt);
    
    if(dt.hour < OreleInceputTrading || dt.hour >= OreleSfarsitTrading)
    {
        return false;
    }
    
    // Verificare pierdere maximă zilnică
    if(profitulZilei <= -PierdereMazimaZi * AccountInfoDouble(ACCOUNT_BALANCE) / 100)
    {
        Print("Pierdere maximă zilnică atinsă: ", profitulZilei);
        return false;
    }
    
    // Verificare spread
    double spread = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD) * _Point;
    if(spread > StopLoss_Puncte * _Point * 0.3) // Spread nu trebuie să fie > 30% din SL
    {
        return false;
    }
    
    return true;
}

//+------------------------------------------------------------------+
//| Obținere date indicatori                                        |
//+------------------------------------------------------------------+
bool ObtineneDateIndicatori()
{
    // Copiaza date MA rapidă
    if(CopyBuffer(handle_MA_Rapida, 0, 0, 3, ma_rapida) < 3)
    {
        Print("Eroare la copierea datelor MA rapidă");
        return false;
    }
    
    // Copiază date MA lentă
    if(CopyBuffer(handle_MA_Lenta, 0, 0, 3, ma_lenta) < 3)
    {
        Print("Eroare la copierea datelor MA lentă");
        return false;
    }
    
    // Copiază date RSI
    if(CopyBuffer(handle_RSI, 0, 0, 3, rsi) < 3)
    {
        Print("Eroare la copierea datelor RSI");
        return false;
    }
    
    return true;
}

//+------------------------------------------------------------------+
//| Analiză semnale de trading                                      |
//+------------------------------------------------------------------+
int AnalizeazaSemnale()
{
    // Verificare crossover MA
    bool crossover_sus = (ma_rapida[1] > ma_lenta[1] && ma_rapida[2] <= ma_lenta[2]);
    bool crossover_jos = (ma_rapida[1] < ma_lenta[1] && ma_rapida[2] >= ma_lenta[2]);
    
    // Verificare RSI pentru confirmare
    bool rsi_ok_buy = (rsi[0] < RSI_Supraculmparat && rsi[0] > RSI_Supravalndut);
    bool rsi_ok_sell = (rsi[0] > RSI_Supravalndut && rsi[0] < RSI_Supraculmparat);
    
    // Verificare trend general (doar dacă este activat)
    bool trend_ascendent = true;
    bool trend_descendent = true;
    
    if(TradingDoarTrend)
    {
        trend_ascendent = (ma_rapida[0] > ma_lenta[0]);
        trend_descendent = (ma_rapida[0] < ma_lenta[0]);
    }
    
    // Semnal de cumpărare
    if(crossover_sus && rsi_ok_buy && trend_ascendent)
    {
        return 1; // BUY
    }
    
    // Semnal de vânzare
    if(crossover_jos && rsi_ok_sell && trend_descendent)
    {
        return -1; // SELL
    }
    
    return 0; // Fără semnal
}

//+------------------------------------------------------------------+
//| Executare ordine                                                |
//+------------------------------------------------------------------+
void ExecutareOrdine(int tipOrdine)
{
    // Verificare poziții existente
    if(PositionsTotal() > 0)
    {
        Print("Există deja poziții deschise");
        return;
    }
    
    // Calculare lot
    double lot = CalculareDimensiuneLot(RiscPerTrade, StopLoss_Puncte);
    lot = NormalizareDouble(lot, 2);
    
    // Limitare lot
    if(lot < LotMinim) lot = LotMinim;
    if(lot > LotMaxim) lot = LotMaxim;
    
    // Obținere preturi
    double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    double point = _Point;
    
    MqlTradeRequest request = {};
    MqlTradeResult result = {};
    
    if(tipOrdine == 1) // BUY
    {
        request.action = TRADE_ACTION_DEAL;
        request.type = ORDER_TYPE_BUY;
        request.symbol = _Symbol;
        request.volume = lot;
        request.price = ask;
        request.sl = ask - StopLoss_Puncte * point;
        request.tp = ask + TakeProfit_Puncte * point;
        request.comment = "Robot BUY";
        request.magic = 123456;
        
        if(OrderSend(request, result))
        {
            Print("Ordine BUY executată cu succes! Ticket: ", result.order);
        }
        else
        {
            Print("Eroare la executarea ordinului BUY: ", result.retcode);
        }
    }
    else if(tipOrdine == -1) // SELL
    {
        request.action = TRADE_ACTION_DEAL;
        request.type = ORDER_TYPE_SELL;
        request.symbol = _Symbol;
        request.volume = lot;
        request.price = bid;
        request.sl = bid + StopLoss_Puncte * point;
        request.tp = bid - TakeProfit_Puncte * point;
        request.comment = "Robot SELL";
        request.magic = 123456;
        
        if(OrderSend(request, result))
        {
            Print("Ordine SELL executată cu succes! Ticket: ", result.order);
        }
        else
        {
            Print("Eroare la executarea ordinului SELL: ", result.retcode);
        }
    }
}

//+------------------------------------------------------------------+
//| Actualizare trailing stop                                       |
//+------------------------------------------------------------------+
void ActualizeazaTrailingStop()
{
    for(int i = 0; i < PositionsTotal(); i++)
    {
        if(PositionSelectByIndex(i))
        {
            if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
            if(PositionGetInteger(POSITION_MAGIC) != 123456) continue;
            
            double puncte_trailing = TrailingStop_Puncte * _Point;
            ulong ticket = PositionGetInteger(POSITION_TICKET);
            double pret_deschidere = PositionGetDouble(POSITION_PRICE_OPEN);
            double sl_curent = PositionGetDouble(POSITION_SL);
            double pret_curent = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? 
                                SymbolInfoDouble(_Symbol, SYMBOL_BID) : 
                                SymbolInfoDouble(_Symbol, SYMBOL_ASK);
            
            if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
            {
                double sl_nou = pret_curent - puncte_trailing;
                if(sl_nou > sl_curent && sl_nou > pret_deschidere)
                {
                    ModificaPozitie(ticket, sl_nou, PositionGetDouble(POSITION_TP));
                }
            }
            else
            {
                double sl_nou = pret_curent + puncte_trailing;
                if((sl_curent == 0 || sl_nou < sl_curent) && sl_nou < pret_deschidere)
                {
                    ModificaPozitie(ticket, sl_nou, PositionGetDouble(POSITION_TP));
                }
            }
        }
    }
}

//+------------------------------------------------------------------+
//| Modificare poziție                                              |
//+------------------------------------------------------------------+
bool ModificaPozitie(ulong ticket, double sl, double tp)
{
    MqlTradeRequest request = {};
    MqlTradeResult result = {};
    
    request.action = TRADE_ACTION_SLTP;
    request.position = ticket;
    request.sl = NormalizareDouble(sl, _Digits);
    request.tp = NormalizareDouble(tp, _Digits);
    
    if(OrderSend(request, result))
    {
        Print("Trailing stop actualizat pentru poziția: ", ticket);
        return true;
    }
    else
    {
        Print("Eroare la actualizarea trailing stop: ", result.retcode);
        return false;
    }
}

//+------------------------------------------------------------------+
//| Reset profit zilnic                                             |
//+------------------------------------------------------------------+
void ResetProfitZilnic()
{
    MqlDateTime dt;
    TimeToStruct(TimeCurrent(), dt);
    
    if(dataUltimuluiReset == 0 || 
       (dt.year != dataUltimuluiReset || dt.day_of_year != dataUltimuluiReset))
    {
        profitulZilei = 0.0;
        dataUltimuluiReset = TimeCurrent();
        Print("Reset profit zilnic");
    }
    else
    {
        // Calculare profit zilnic curent
        profitulZilei = 0.0;
        for(int i = 0; i < PositionsTotal(); i++)
        {
            if(PositionSelectByIndex(i))
            {
                if(PositionGetString(POSITION_SYMBOL) == _Symbol && 
                   PositionGetInteger(POSITION_MAGIC) == 123456)
                {
                    profitulZilei += PositionGetDouble(POSITION_PROFIT);
                }
            }
        }
    }
}

//+------------------------------------------------------------------+
//| Afișare informații                                              |
//+------------------------------------------------------------------+
void AfisareInformatii()
{
    static datetime ultimaAfisare = 0;
    
    // Afișare o dată pe minut
    if(TimeCurrent() - ultimaAfisare < 60) return;
    ultimaAfisare = TimeCurrent();
    
    Comment(
        "=== ROBOT TRADING MT5 ===\n",
        "Stare: ", (ActivareRobot ? "ACTIV" : "INACTIV"), "\n",
        "Simbol: ", _Symbol, "\n",
        "Spread: ", SymbolInfoInteger(_Symbol, SYMBOL_SPREAD), "\n",
        "MA Rapidă: ", DoubleToString(ma_rapida[0], _Digits), "\n",
        "MA Lentă: ", DoubleToString(ma_lenta[0], _Digits), "\n",
        "RSI: ", DoubleToString(rsi[0], 2), "\n",
        "Poziții deschise: ", PositionsTotal(), "\n",
        "Profit zilnic: ", DoubleToString(profitulZilei, 2), " ", AccountInfoString(ACCOUNT_CURRENCY), "\n",
        "Balanta: ", DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2), " ", AccountInfoString(ACCOUNT_CURRENCY)
    );
}