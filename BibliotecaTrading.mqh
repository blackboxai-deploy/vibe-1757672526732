//+------------------------------------------------------------------+
//|                                       BibliotecaTrading.mqh     |
//|                        Biblioteca de funcții pentru trading     |
//|                                 Funcții auxiliare și utile      |
//+------------------------------------------------------------------+

#property copyright "Copyright 2024, Robot de Trading MT5"
#property link      ""
#property version   "1.0"

//+------------------------------------------------------------------+
//| Calculare dimensiunea lotului pe baza riscului                  |
//+------------------------------------------------------------------+
double CalculareDimensiuneLot(double procent_risc, double sl_puncte)
{
    double balanta = AccountInfoDouble(ACCOUNT_BALANCE);
    double risc_valoare = balanta * procent_risc / 100.0;
    double valoare_punct = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
    double lot_minim = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
    double pas_lot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
    
    if(sl_puncte <= 0 || valoare_punct <= 0) return lot_minim;
    
    double lot_calculat = risc_valoare / (sl_puncte * valoare_punct);
    
    // Rotunjire la pasul de lot
    lot_calculat = MathFloor(lot_calculat / pas_lot) * pas_lot;
    
    // Verificare limite
    double lot_maxim = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
    if(lot_calculat < lot_minim) lot_calculat = lot_minim;
    if(lot_calculat > lot_maxim) lot_calculat = lot_maxim;
    
    return lot_calculat;
}

//+------------------------------------------------------------------+
//| Verificare dacă piața este deschisă                             |
//+------------------------------------------------------------------+
bool EstePiataDesschisa()
{
    MqlDateTime dt;
    TimeToStruct(TimeCurrent(), dt);
    
    // Verificare weekend
    if(dt.day_of_week == 0 || dt.day_of_week == 6) return false;
    
    // Verificare ore de trading (ajustat pentru Forex)
    if(dt.hour >= 0 && dt.hour <= 23) return true;
    
    return false;
}

//+------------------------------------------------------------------+
//| Calculare ATR (Average True Range)                              |
//+------------------------------------------------------------------+
double CalculareATR(int perioada, int bara = 0)
{
    double atr_array[];
    int handle_atr = iATR(_Symbol, PERIOD_CURRENT, perioada);
    
    if(handle_atr == INVALID_HANDLE) return 0.0;
    
    if(CopyBuffer(handle_atr, 0, bara, 1, atr_array) <= 0)
    {
        IndicatorRelease(handle_atr);
        return 0.0;
    }
    
    double valoare_atr = atr_array[0];
    IndicatorRelease(handle_atr);
    
    return valoare_atr;
}

//+------------------------------------------------------------------+
//| Verificare breakout din Bollinger Bands                        |
//+------------------------------------------------------------------+
int VerificareBreakoutBB(int perioada = 20, double deviatii = 2.0)
{
    double bb_upper[], bb_lower[], bb_middle[];
    int handle_bb = iBands(_Symbol, PERIOD_CURRENT, perioada, 0, deviatii, PRICE_CLOSE);
    
    if(handle_bb == INVALID_HANDLE) return 0;
    
    ArraySetAsSeries(bb_upper, true);
    ArraySetAsSeries(bb_lower, true);
    ArraySetAsSeries(bb_middle, true);
    
    if(CopyBuffer(handle_bb, 1, 0, 2, bb_upper) <= 0 ||
       CopyBuffer(handle_bb, 2, 0, 2, bb_lower) <= 0 ||
       CopyBuffer(handle_bb, 0, 0, 2, bb_middle) <= 0)
    {
        IndicatorRelease(handle_bb);
        return 0;
    }
    
    double pret_curent = iClose(_Symbol, PERIOD_CURRENT, 0);
    double pret_anterior = iClose(_Symbol, PERIOD_CURRENT, 1);
    
    // Breakout sus
    if(pret_curent > bb_upper[0] && pret_anterior <= bb_upper[1])
    {
        IndicatorRelease(handle_bb);
        return 1;
    }
    
    // Breakout jos
    if(pret_curent < bb_lower[0] && pret_anterior >= bb_lower[1])
    {
        IndicatorRelease(handle_bb);
        return -1;
    }
    
    IndicatorRelease(handle_bb);
    return 0;
}

//+------------------------------------------------------------------+
//| Calculare profit/pierdere pentru o poziție                     |
//+------------------------------------------------------------------+
double CalculareProfitPozitie(ulong ticket)
{
    if(PositionSelectByTicket(ticket))
    {
        return PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
    }
    return 0.0;
}

//+------------------------------------------------------------------+
//| Verificare semnal divergență RSI                                |
//+------------------------------------------------------------------+
bool VerificareDivergentaRSI(int perioada_rsi = 14)
{
    double rsi_array[];
    double close_array[];
    
    int handle_rsi = iRSI(_Symbol, PERIOD_CURRENT, perioada_rsi, PRICE_CLOSE);
    if(handle_rsi == INVALID_HANDLE) return false;
    
    ArraySetAsSeries(rsi_array, true);
    ArraySetAsSeries(close_array, true);
    
    if(CopyBuffer(handle_rsi, 0, 0, 10, rsi_array) <= 0 ||
       CopyClose(_Symbol, PERIOD_CURRENT, 0, 10, close_array) <= 0)
    {
        IndicatorRelease(handle_rsi);
        return false;
    }
    
    // Logică simplificată pentru divergență
    // Verificare dacă pretul face noi maxime dar RSI nu
    bool divergenta_bearish = (close_array[0] > close_array[5] && 
                              rsi_array[0] < rsi_array[5] && 
                              rsi_array[0] > 70);
    
    // Verificare dacă pretul face noi minime dar RSI nu
    bool divergenta_bullish = (close_array[0] < close_array[5] && 
                              rsi_array[0] > rsi_array[5] && 
                              rsi_array[0] < 30);
    
    IndicatorRelease(handle_rsi);
    return (divergenta_bearish || divergenta_bullish);
}

//+------------------------------------------------------------------+
//| Calculare suport și rezistență                                  |
//+------------------------------------------------------------------+
struct NiveluriSR
{
    double suport;
    double rezistenta;
    bool valid;
};

NiveluriSR CalculareSuportRezistenta(int numar_bare = 50)
{
    NiveluriSR nivele;
    nivele.valid = false;
    
    double high_array[], low_array[];
    ArraySetAsSeries(high_array, true);
    ArraySetAsSeries(low_array, true);
    
    if(CopyHigh(_Symbol, PERIOD_CURRENT, 0, numar_bare, high_array) <= 0 ||
       CopyLow(_Symbol, PERIOD_CURRENT, 0, numar_bare, low_array) <= 0)
    {
        return nivele;
    }
    
    // Căutare maxim recent pentru rezistență
    double max_recent = high_array[ArrayMaximum(high_array, 5, 15)];
    
    // Căutare minim recent pentru suport
    double min_recent = low_array[ArrayMinimum(low_array, 5, 15)];
    
    nivele.suport = min_recent;
    nivele.rezistenta = max_recent;
    nivele.valid = true;
    
    return nivele;
}

//+------------------------------------------------------------------+
//| Verificare condiții de vârf/fund                                |
//+------------------------------------------------------------------+
int VerificareVarfFund(int perioade_verificare = 5)
{
    double high_array[], low_array[];
    ArraySetAsSeries(high_array, true);
    ArraySetAsSeries(low_array, true);
    
    int perioade_necesare = perioade_verificare * 2 + 1;
    
    if(CopyHigh(_Symbol, PERIOD_CURRENT, 0, perioade_necesare, high_array) <= 0 ||
       CopyLow(_Symbol, PERIOD_CURRENT, 0, perioade_necesare, low_array) <= 0)
    {
        return 0;
    }
    
    // Verificare vârf (pivot high)
    bool este_varf = true;
    for(int i = 0; i < perioade_verificare; i++)
    {
        if(high_array[perioade_verificare] <= high_array[i] || 
           high_array[perioade_verificare] <= high_array[perioade_verificare + i + 1])
        {
            este_varf = false;
            break;
        }
    }
    
    if(este_varf) return 1; // Vârf detectat
    
    // Verificare fund (pivot low)
    bool este_fund = true;
    for(int i = 0; i < perioade_verificare; i++)
    {
        if(low_array[perioade_verificare] >= low_array[i] || 
           low_array[perioade_verificare] >= low_array[perioade_verificare + i + 1])
        {
            este_fund = false;
            break;
        }
    }
    
    if(este_fund) return -1; // Fund detectat
    
    return 0; // Nu s-a detectat nimic
}

//+------------------------------------------------------------------+
//| Calculare corelația cu alt simbol                               |
//+------------------------------------------------------------------+
double CalculareCorelatie(string simbol_corelatia, int perioada = 20)
{
    double close1[], close2[];
    ArraySetAsSeries(close1, true);
    ArraySetAsSeries(close2, true);
    
    if(CopyClose(_Symbol, PERIOD_CURRENT, 0, perioada, close1) <= 0 ||
       CopyClose(simbol_corelatia, PERIOD_CURRENT, 0, perioada, close2) <= 0)
    {
        return 0.0;
    }
    
    // Calculare mediatele
    double suma1 = 0, suma2 = 0;
    for(int i = 0; i < perioada; i++)
    {
        suma1 += close1[i];
        suma2 += close2[i];
    }
    double media1 = suma1 / perioada;
    double media2 = suma2 / perioada;
    
    // Calculare corelația
    double numarator = 0, denumitor1 = 0, denumitor2 = 0;
    
    for(int i = 0; i < perioada; i++)
    {
        double dif1 = close1[i] - media1;
        double dif2 = close2[i] - media2;
        
        numarator += dif1 * dif2;
        denumitor1 += dif1 * dif1;
        denumitor2 += dif2 * dif2;
    }
    
    double denumitor = MathSqrt(denumitor1 * denumitor2);
    
    if(denumitor == 0) return 0.0;
    
    return numarator / denumitor;
}

//+------------------------------------------------------------------+
//| Normalizare double la cifre zecimale ale simbolului             |
//+------------------------------------------------------------------+
double NormalizareDouble(double valoare, int cifre)
{
    return NormalizeDouble(valoare, cifre);
}

//+------------------------------------------------------------------+
//| Transformare puncte în valoare pentru simbolul curent           |
//+------------------------------------------------------------------+
double PuncteInValoare(double puncte)
{
    return puncte * _Point;
}

//+------------------------------------------------------------------+
//| Verificare dacă o poziție este în profit                        |
//+------------------------------------------------------------------+
bool EsteInProfit(ulong ticket)
{
    if(PositionSelectByTicket(ticket))
    {
        return (PositionGetDouble(POSITION_PROFIT) > 0);
    }
    return false;
}

//+------------------------------------------------------------------+
//| Obținere informații despre spread                               |
//+------------------------------------------------------------------+
struct InformatiiSpread
{
    double spread_puncte;
    double spread_valoare;
    double spread_procent_din_pret;
};

InformatiiSpread ObtieneInformatiiSpread()
{
    InformatiiSpread info;
    
    info.spread_puncte = (double)SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
    info.spread_valoare = info.spread_puncte * _Point;
    
    double pret_curent = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    info.spread_procent_din_pret = (info.spread_valoare / pret_curent) * 100.0;
    
    return info;
}

//+------------------------------------------------------------------+
//| Verificare condiții de volum pentru trading                     |
//+------------------------------------------------------------------+
bool VerificareVolumTrading()
{
    long volume_array[];
    ArraySetAsSeries(volume_array, true);
    
    if(CopyTickVolume(_Symbol, PERIOD_CURRENT, 0, 20, volume_array) <= 0)
    {
        return true; // Default: permite trading
    }
    
    // Calculare volum mediu ultimele 20 de bare
    long suma_volume = 0;
    for(int i = 0; i < 20; i++)
    {
        suma_volume += volume_array[i];
    }
    long volum_mediu = suma_volume / 20;
    
    // Volumul curent trebuie să fie cel puțin 50% din media
    return (volume_array[0] >= volum_mediu * 0.5);
}

//+------------------------------------------------------------------+
//| Funcție de logging personalizată                                |
//+------------------------------------------------------------------+
void LogPersonalizat(string mesaj, bool include_timp = true)
{
    string log_complet = "";
    
    if(include_timp)
    {
        log_complet = TimeToString(TimeCurrent()) + " - ";
    }
    
    log_complet += "[ROBOT] " + mesaj;
    
    Print(log_complet);
}