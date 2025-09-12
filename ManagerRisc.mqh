//+------------------------------------------------------------------+
//|                                            ManagerRisc.mqh      |
//|                           Manager de risc pentru robotul MT5    |
//|                       Controlul riscului și managementului      |
//+------------------------------------------------------------------+

#property copyright "Copyright 2024, Robot de Trading MT5"
#property link      ""
#property version   "1.0"

//--- Variabile globale pentru management risc
double RiscMaximZilnic = 5.0;
double LotMininGlobal = 0.01;
double LotMaximGlobal = 1.0;
double ProfitulZilnicCurent = 0.0;
datetime DataReset = 0;
int NumarPozitiiMaxime = 3;
double DrawdownMaximPermis = 10.0;

//--- Statistici
int NumarTradesExecutate = 0;
int NumarTradesCastigatoare = 0;
int NumarTradePerdatoare = 0;
double ProfitTotal = 0.0;

//+------------------------------------------------------------------+
//| Inițializare manager de risc                                    |
//+------------------------------------------------------------------+
bool IniManagementRisc(double risc_maxim_zi, double lot_minim, double lot_maxim)
{
    RiscMaximZilnic = risc_maxim_zi;
    LotMininGlobal = lot_minim;
    LotMaximGlobal = lot_maxim;
    ProfitulZilnicCurent = 0.0;
    NumarTradesExecutate = 0;
    NumarTradesCastigatoare = 0;
    NumarTradePerdatoare = 0;
    ProfitTotal = 0.0;
    
    Print("Manager de risc inițializat:");
    Print("- Risc maxim zilnic: ", risc_maxim_zi, "%");
    Print("- Lot minim: ", lot_minim);
    Print("- Lot maxim: ", lot_maxim);
    
    return true;
}

//+------------------------------------------------------------------+
//| Verificare permisiune pentru deschidere poziție                 |
//+------------------------------------------------------------------+
bool PermisiuneDeachiderePozitie()
{
    // Verificare numărul de poziții active
    if(PositionsTotal() >= NumarPozitiiMaxime)
    {
        Print("Numărul maxim de poziții atins: ", NumarPozitiiMaxime);
        return false;
    }
    
    // Verificare risc zilnic
    ActualizeazaProfitZilnic();
    
    double balanta = AccountInfoDouble(ACCOUNT_BALANCE);
    double risc_valoare = balanta * RiscMaximZilnic / 100.0;
    
    if(ProfitulZilnicCurent <= -risc_valoare)
    {
        Print("Risc zilnic maxim atins. Profit zilnic: ", ProfitulZilnicCurent);
        return false;
    }
    
    // Verificare drawdown
    double equity = AccountInfoDouble(ACCOUNT_EQUITY);
    double drawdown_procent = ((balanta - equity) / balanta) * 100.0;
    
    if(drawdown_procent > DrawdownMaximPermis)
    {
        Print("Drawdown maxim atins: ", drawdown_procent, "%");
        return false;
    }
    
    // Verificare margin liber
    double margin_liber = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
    double margin_necesar = SymbolInfoDouble(_Symbol, SYMBOL_MARGIN_INITIAL) * LotMininGlobal;
    
    if(margin_liber < margin_necesar * 2) // Păstrare 200% margin de siguranță
    {
        Print("Margin insuficient. Liber: ", margin_liber, ", Necesar: ", margin_necesar);
        return false;
    }
    
    return true;
}

//+------------------------------------------------------------------+
//| Calculare lot optimal cu management de risc                     |
//+------------------------------------------------------------------+
double CalculareLotOptimal(double procent_risc, double sl_puncte)
{
    if(!PermisiuneDeachiderePozitie()) return 0.0;
    
    double balanta = AccountInfoDouble(ACCOUNT_BALANCE);
    double risc_valoare = balanta * procent_risc / 100.0;
    
    // Ajustare risc pe baza performanței recente
    double factor_ajustare = CalculareFactorAjustare();
    risc_valoare *= factor_ajustare;
    
    double valoare_punct = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
    double lot_calculat = risc_valoare / (sl_puncte * valoare_punct);
    
    // Limitare între min și max
    if(lot_calculat < LotMininGlobal) lot_calculat = LotMininGlobal;
    if(lot_calculat > LotMaximGlobal) lot_calculat = LotMaximGlobal;
    
    // Rotunjire la pasul de lot
    double pas_lot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
    lot_calculat = MathFloor(lot_calculat / pas_lot) * pas_lot;
    
    Print("Lot calculat: ", lot_calculat, " (Risc: ", procent_risc, "%, SL: ", sl_puncte, ")");
    
    return lot_calculat;
}

//+------------------------------------------------------------------+
//| Calculare factor de ajustare pe baza performanței               |
//+------------------------------------------------------------------+
double CalculareFactorAjustare()
{
    if(NumarTradesExecutate < 5) return 1.0; // Prea puține trades pentru ajustare
    
    double rata_castig = (double)NumarTradesCastigatoare / NumarTradesExecutate;
    
    // Ajustare lot pe baza ratei de câștig
    if(rata_castig > 0.7) return 1.2;      // Performanță excelentă - crește riscul
    else if(rata_castig > 0.6) return 1.1; // Performanță bună - crește ușor
    else if(rata_castig > 0.4) return 1.0; // Performanță mediocră - păstrează
    else if(rata_castig > 0.3) return 0.8; // Performanță slabă - reduce
    else return 0.5;                       // Performanță foarte slabă - reduce mult
}

//+------------------------------------------------------------------+
//| Actualizare profit zilnic                                       |
//+------------------------------------------------------------------+
void ActualizeazaProfitZilnic()
{
    MqlDateTime dt;
    TimeToStruct(TimeCurrent(), dt);
    
    // Reset zilnic
    if(DataReset == 0 || 
       TimeToStruct(DataReset, dt) && 
       dt.day != TimeDay(TimeCurrent()))
    {
        ProfitulZilnicCurent = 0.0;
        DataReset = TimeCurrent();
        Print("Reset profit zilnic la: ", TimeToString(DataReset));
    }
    
    // Calculare profit curent
    double profit_pozitii = 0.0;
    for(int i = 0; i < PositionsTotal(); i++)
    {
        if(PositionSelectByIndex(i))
        {
            if(PositionGetString(POSITION_SYMBOL) == _Symbol &&
               PositionGetInteger(POSITION_MAGIC) == 123456)
            {
                profit_pozitii += PositionGetDouble(POSITION_PROFIT);
                profit_pozitii += PositionGetDouble(POSITION_SWAP);
            }
        }
    }
    
    ProfitulZilnicCurent = profit_pozitii;
}

//+------------------------------------------------------------------+
//| Verificare condiții pentru închidere de urgență                 |
//+------------------------------------------------------------------+
bool VerificareInchidereUrgenta()
{
    ActualizeazaProfitZilnic();
    
    double balanta = AccountInfoDouble(ACCOUNT_BALANCE);
    double equity = AccountInfoDouble(ACCOUNT_EQUITY);
    
    // Verificare pierdere critică (peste 150% din riscul zilnic)
    double risc_critic = -(balanta * RiscMaximZilnic * 1.5 / 100.0);
    
    if(ProfitulZilnicCurent <= risc_critic)
    {
        Print("ALERTĂ: Pierdere critică detectată! Profit zilnic: ", ProfitulZilnicCurent);
        InchidereTotePozitiile();
        return true;
    }
    
    // Verificare margin call
    double margin_nivel = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
    if(margin_nivel > 0 && margin_nivel < 150.0) // Sub 150% margin level
    {
        Print("ALERTĂ: Margin level critic: ", margin_nivel, "%");
        InchidereTotePozitiile();
        return true;
    }
    
    return false;
}

//+------------------------------------------------------------------+
//| Închidere toate pozițiile                                       |
//+------------------------------------------------------------------+
bool InchidereTotePozitiile()
{
    bool succes = true;
    
    for(int i = PositionsTotal() - 1; i >= 0; i--)
    {
        if(PositionSelectByIndex(i))
        {
            if(PositionGetString(POSITION_SYMBOL) == _Symbol &&
               PositionGetInteger(POSITION_MAGIC) == 123456)
            {
                ulong ticket = PositionGetInteger(POSITION_TICKET);
                if(!InchiderePozitie(ticket))
                {
                    succes = false;
                }
            }
        }
    }
    
    return succes;
}

//+------------------------------------------------------------------+
//| Închidere poziție individuală                                   |
//+------------------------------------------------------------------+
bool InchiderePozitie(ulong ticket)
{
    if(!PositionSelectByTicket(ticket)) return false;
    
    MqlTradeRequest request = {};
    MqlTradeResult result = {};
    
    request.action = TRADE_ACTION_DEAL;
    request.position = ticket;
    request.symbol = PositionGetString(POSITION_SYMBOL);
    request.volume = PositionGetDouble(POSITION_VOLUME);
    request.type = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? 
                   ORDER_TYPE_SELL : ORDER_TYPE_BUY;
    request.price = (request.type == ORDER_TYPE_SELL) ? 
                    SymbolInfoDouble(request.symbol, SYMBOL_BID) :
                    SymbolInfoDouble(request.symbol, SYMBOL_ASK);
    request.comment = "Închidere management risc";
    
    if(OrderSend(request, result))
    {
        Print("Poziția ", ticket, " închisă cu succes");
        return true;
    }
    else
    {
        Print("Eroare la închiderea poziției ", ticket, ": ", result.retcode);
        return false;
    }
}

//+------------------------------------------------------------------+
//| Actualizare statistici după închiderea unei poziții            |
//+------------------------------------------------------------------+
void ActualizeazaStatistici(double profit_pozitie)
{
    NumarTradesExecutate++;
    ProfitTotal += profit_pozitie;
    
    if(profit_pozitie > 0)
    {
        NumarTradesCastigatoare++;
    }
    else
    {
        NumarTradePerdatoare++;
    }
    
    Print("Statistici actualizate:");
    Print("- Total trades: ", NumarTradesExecutate);
    Print("- Trades câștigătoare: ", NumarTradesCastigatoare);
    Print("- Trades pierzătoare: ", NumarTradePerdatoare);
    Print("- Profit total: ", ProfitTotal);
}

//+------------------------------------------------------------------+
//| Obținere raport risc curent                                     |
//+------------------------------------------------------------------+
string ObtieneRaportRisc()
{
    ActualizeazaProfitZilnic();
    
    double balanta = AccountInfoDouble(ACCOUNT_BALANCE);
    double equity = AccountInfoDouble(ACCOUNT_EQUITY);
    double margin_liber = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
    double margin_nivel = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
    
    string raport = "";
    raport += "=== RAPORT MANAGEMENT RISC ===\n";
    raport += "Balanta: " + DoubleToString(balanta, 2) + " " + AccountInfoString(ACCOUNT_CURRENCY) + "\n";
    raport += "Equity: " + DoubleToString(equity, 2) + " " + AccountInfoString(ACCOUNT_CURRENCY) + "\n";
    raport += "Profit zilnic: " + DoubleToString(ProfitulZilnicCurent, 2) + " " + AccountInfoString(ACCOUNT_CURRENCY) + "\n";
    raport += "Margin liber: " + DoubleToString(margin_liber, 2) + " " + AccountInfoString(ACCOUNT_CURRENCY) + "\n";
    raport += "Margin level: " + DoubleToString(margin_nivel, 2) + "%\n";
    raport += "Poziții active: " + IntegerToString(PositionsTotal()) + "/" + IntegerToString(NumarPozitiiMaxime) + "\n";
    
    if(NumarTradesExecutate > 0)
    {
        double rata_castig = (double)NumarTradesCastigatoare / NumarTradesExecutate * 100.0;
        raport += "Rata de câștig: " + DoubleToString(rata_castig, 1) + "%\n";
        raport += "Profit mediu per trade: " + DoubleToString(ProfitTotal / NumarTradesExecutate, 2) + "\n";
    }
    
    return raport;
}

//+------------------------------------------------------------------+
//| Setare număr maxim de poziții                                   |
//+------------------------------------------------------------------+
void SetareNumarMaximPozitii(int numar)
{
    if(numar > 0 && numar <= 10)
    {
        NumarPozitiiMaxime = numar;
        Print("Număr maxim poziții setat la: ", numar);
    }
}

//+------------------------------------------------------------------+
//| Setare drawdown maxim permis                                    |
//+------------------------------------------------------------------+
void SetareDrawdownMaxim(double procent)
{
    if(procent > 0 && procent <= 50)
    {
        DrawdownMaximPermis = procent;
        Print("Drawdown maxim setat la: ", procent, "%");
    }
}

//+------------------------------------------------------------------+
//| Verificare sănătatea contului                                   |
//+------------------------------------------------------------------+
bool VerificareSanatateaCont()
{
    double balanta = AccountInfoDouble(ACCOUNT_BALANCE);
    double equity = AccountInfoDouble(ACCOUNT_EQUITY);
    double margin_nivel = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
    
    // Verificări critice
    if(margin_nivel > 0 && margin_nivel < 200.0)
    {
        Print("AVERTIZARE: Margin level scăzut: ", margin_nivel, "%");
        return false;
    }
    
    double drawdown = ((balanta - equity) / balanta) * 100.0;
    if(drawdown > DrawdownMaximPermis * 0.8) // 80% din drawdown maxim
    {
        Print("AVERTIZARE: Drawdown aproape de limită: ", drawdown, "%");
        return false;
    }
    
    return true;
}

//+------------------------------------------------------------------+
//| Reset statistici                                                |
//+------------------------------------------------------------------+
void ResetStatistici()
{
    NumarTradesExecutate = 0;
    NumarTradesCastigatoare = 0;
    NumarTradePerdatoare = 0;
    ProfitTotal = 0.0;
    ProfitulZilnicCurent = 0.0;
    
    Print("Statistici resetate");
}