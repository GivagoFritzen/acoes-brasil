import type {
  YahooFinanceDetails,
  YahooFinanceKeyStatistics,
  YahooFinanceFinancialData,
  YahooIncomeStatement,
  YahooBalanceSheet,
  YahooCashflowStatement,
  YahooFinanceEarningsHistoryItem,
  YahooFinanceCalendarEvents,
} from "../../../../common/models/yahoo-finance";

import type {
  RawValue,
  RawDate,
  RawIncomeStatement,
  RawBalanceSheet,
  RawCashflowStatement,
  RawEarningsItem,
  RawKeyStatistics,
} from "../../models/yahoo";

const CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb";
const QUOTE_SUMMARY_URL = "https://query2.finance.yahoo.com/v10/finance/quoteSummary";
const CONSENT_URL = "https://fc.yahoo.com/";
const FUNDAMENTALS_TIMESERIES_URL = "https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries";
const REQUEST_TIMEOUT_MS = 15_000;

const BALANCE_SHEET_API_KEYS = [
  "TotalAssets",
  "CurrentAssets",
  "CashAndCashEquivalents",
  "CurrentLiabilities",
  "TotalLiabilitiesNetMinorityInterest",
  "LongTermDebt",
  "TotalDebt",
  "StockholdersEquity",
  "MinorityInterest",
  "TangibleBookValue",
  "Goodwill",
  "OtherCurrentAssets",
  "OtherCurrentLiabilities",
  "NetPPE",
  "Inventory",
  "AccountsReceivable",
  "AccountsPayable",
  "TreasuryStock",
  "OtherAssets",
  "OtherLiabilities",
];

const CASH_FLOW_API_KEYS = [
  "OperatingCashFlow",
  "CapitalExpenditure",
  "CashDividendsPaid",
  "FreeCashFlow",
  "NetIncomeFromContinuingOperations",
  "ChangesInAccountReceivables",
  "ChangeInInventory",
  "ChangeInPayable",
  "ChangeInOtherWorkingCapital",
  "InvestingCashFlow",
  "NetOtherInvestingChanges",
  "FinancingCashFlow",
  "NetOtherFinancingCharges",
  "EffectOfExchangeRateChanges",
  "ChangesInCash",
  "RepurchaseOfCapitalStock",
  "NetIssuancePaymentsOfDebt",
  "NetInvestmentPurchaseAndSale",
];

const QUOTE_MODULES = [
  "defaultKeyStatistics",
  "financialData",
  "incomeStatementHistory",
  "incomeStatementHistoryQuarterly",
  "balanceSheetHistory",
  "balanceSheetHistoryQuarterly",
  "cashflowStatementHistory",
  "cashflowStatementHistoryQuarterly",
  "calendarEvents",
  "earningsHistory",
  "price",
].join(",");

export class YahooFinanceScraperService {
  private cookie: string | null = null;
  private crumb: string | null = null;

  async scrapeAsync(codigo: string): Promise<YahooFinanceDetails> {
    const codigoNormalized = codigo.trim().toUpperCase();
    const yahooTicker = codigoNormalized.endsWith(".SA") ? codigoNormalized : `${codigoNormalized}.SA`;

    await this.ensureAuthenticatedAsync();

    const data = await this.fetchQuoteSummaryAsync(yahooTicker);

    if (!data?.quoteSummary?.result?.[0]) {
      throw new Error(`Falha ao consultar Yahoo Finance para o ativo ${codigo}.`);
    }

    const result = data.quoteSummary.result[0];

    const rawStats = result.defaultKeyStatistics as RawKeyStatistics | undefined;
    const rawFinancialData = result.financialData as Record<string, RawValue> | undefined;
    const rawIncomeQuarterly = result.incomeStatementHistoryQuarterly as { incomeStatementHistory?: RawIncomeStatement[] } | undefined;
    const rawIncomeAnnual = result.incomeStatementHistory as { incomeStatementHistory?: RawIncomeStatement[] } | undefined;
    const rawBalanceQuarterly = result.balanceSheetHistoryQuarterly as { balanceSheetStatements?: RawBalanceSheet[] } | undefined;
    const rawBalanceAnnual = result.balanceSheetHistory as { balanceSheetStatements?: RawBalanceSheet[] } | undefined;
    const rawCashflowQuarterly = result.cashflowStatementHistoryQuarterly as { cashflowStatements?: RawCashflowStatement[] } | undefined;
    const rawCashflowAnnual = result.cashflowStatementHistory as { cashflowStatements?: RawCashflowStatement[] } | undefined;
    const rawEarningsHistory = result.earningsHistory as { history?: RawEarningsItem[] } | undefined;
    const rawCalendarEvents = result.calendarEvents as Record<string, string | number | boolean | object | null> | undefined;
    const rawPrice = result.price as Record<string, string | number | boolean | object | null> | undefined;

    const keyStatistics = this.parseKeyStatistics(rawStats, rawPrice);
    const financialData = this.parseFinancialData(rawFinancialData);
    const incomeStatements = this.parseIncomeStatements(
      rawIncomeQuarterly?.incomeStatementHistory?.length
        ? rawIncomeQuarterly.incomeStatementHistory
        : rawIncomeAnnual?.incomeStatementHistory
    );
    const balanceSheetsFundamentals = await this.fetchFundamentalsTimeSeriesAsync(
      yahooTicker,
      BALANCE_SHEET_API_KEYS
    );
    const cashflowFundamentals = await this.fetchFundamentalsTimeSeriesAsync(
      yahooTicker,
      CASH_FLOW_API_KEYS
    );

    const rawBalanceSheets = rawBalanceQuarterly?.balanceSheetStatements?.length
      ? rawBalanceQuarterly.balanceSheetStatements
      : rawBalanceAnnual?.balanceSheetStatements;

    const balanceSheets = balanceSheetsFundamentals
      ? this.parseBalanceSheetsFromFundamentals(balanceSheetsFundamentals)
      : this.parseBalanceSheets(rawBalanceSheets);

    const rawCashflowStatements = rawCashflowQuarterly?.cashflowStatements?.length
      ? rawCashflowQuarterly.cashflowStatements
      : rawCashflowAnnual?.cashflowStatements;

    const cashflowStatements = cashflowFundamentals
      ? this.parseCashflowStatementsFromFundamentals(cashflowFundamentals)
      : this.parseCashflowStatements(rawCashflowStatements);
    const earningsHistory = this.parseEarningsHistory(rawEarningsHistory?.history);
    const calendarEvents = this.parseCalendarEvents(rawCalendarEvents);

    return {
      codigo: codigoNormalized,
      empresa: null,
      keyStatistics,
      financialData,
      incomeStatements,
      balanceSheets,
      cashflowStatements,
      earningsHistory,
      calendarEvents,
      updatedAt: new Date().toISOString(),
    };
  }

  private async ensureAuthenticatedAsync(): Promise<void> {
    const crumb = await this.fetchCrumbAsync();
    if (!crumb) {
      const session = await this.fetchSessionAsync();
      if (!session) {
        throw new Error("Falha ao autenticar no Yahoo Finance.");
      }
      this.cookie = session.cookie;
      this.crumb = session.crumb;
    } else {
      this.crumb = crumb;
    }
  }

  private async fetchCrumbAsync(): Promise<string | null> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };
      if (this.cookie) {
        headers["Cookie"] = this.cookie;
      }

      const response = await fetch(CRUMB_URL, {
        signal: abortController.signal,
        headers,
      });

      if (!response.ok) return null;

      const text = await response.text();
      if (!text || text.includes("error") || text.includes("Unauthorized")) return null;

      return text;
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchSessionAsync(): Promise<{ cookie: string; crumb: string } | null> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(CONSENT_URL, {
        signal: abortController.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        redirect: "follow",
      });

      if (!response.ok && response.status !== 404) return null;

      const cookie = response.headers.get("set-cookie") ?? "";
      if (!cookie) return null;

      const crumbResponse = await fetch(CRUMB_URL, {
        signal: abortController.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Cookie: cookie,
        },
      });

      if (!crumbResponse.ok) return null;

      const crumb = await crumbResponse.text();
      if (!crumb || crumb.includes("error")) return null;

      return { cookie, crumb };
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchFundamentalsTimeSeriesAsync(
    symbol: string,
    apiKeys: string[],
    periodType: string = "quarterly",
    yearsBack: number = 5
  ): Promise<Record<number, Record<string, { raw: number; fmt: string }>> | null> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    try {
      const period2 = Math.floor(Date.now() / 1000);
      const period1 = Math.floor(new Date().getTime() / 1000 - yearsBack * 365.25 * 86400);
      const typeParam = apiKeys.map((apiKey) => `${periodType}${apiKey}`).join(",");
      const url = `${FUNDAMENTALS_TIMESERIES_URL}/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&type=${typeParam}`;

      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data?.timeseries?.result) return null;

      const grouped: Record<number, Record<string, { raw: number; fmt: string }>> = {};

      for (const entry of data.timeseries.result) {
        this.processFundamentalsEntry(entry, grouped);
      }

      return grouped;
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private processFundamentalsEntry(
    entry: {
      timestamp?: number[];
      meta?: Record<string, string | number | boolean | object | null>;
    },
    grouped: Record<number, Record<string, { raw: number; fmt: string }>>
  ): void {
    const dataKey = Object.keys(entry).find((chave) => chave !== "meta" && chave !== "timestamp");
    if (!dataKey || !entry.timestamp?.length) return;

    for (let indice = 0; indice < entry.timestamp.length; indice++) {
      const ts = entry.timestamp[indice];
      if (!grouped[ts]) grouped[ts] = {};
      const entryWithDynamic = entry as Record<string, Array<{ reportedValue?: { raw: number; fmt: string } }> | undefined>;
      const values = entryWithDynamic[dataKey];
      const rv = values?.[indice]?.reportedValue;
      if (rv) {
        grouped[ts][dataKey] = rv;
      }
    }
  }

  private async fetchQuoteSummaryAsync(codigo: string): Promise<{ quoteSummary?: { result?: Record<string, string | number | boolean | object | null>[] } }> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    try {
      const url = `${QUOTE_SUMMARY_URL}/${encodeURIComponent(codigo)}?modules=${QUOTE_MODULES}&crumb=${this.crumb}`;

      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };
      if (this.cookie) {
        headers["Cookie"] = this.cookie;
      }

      const response = await fetch(url, { signal: abortController.signal, headers });

      if (!response.ok) {
        throw new Error(`Yahoo Finance retornou status ${response.status}.`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private extractValue(value: RawValue | undefined): string | null {
    if (!value) return null;
    if (value.fmt !== undefined && value.fmt !== null) return String(value.fmt);
    if (value.raw !== undefined && value.raw !== null && value.raw !== 0) return String(value.raw);
    if (value.longFmt !== undefined && value.longFmt !== null && value.longFmt !== "0") return String(value.longFmt);
    return null;
  }

  private extractDate(date: RawDate | undefined): string | null {
    if (!date?.fmt) return null;
    return date.fmt;
  }

  private parseKeyStatistics(raw: RawKeyStatistics | undefined, rawPrice?: { marketCap?: RawValue }): YahooFinanceKeyStatistics | null {
    if (!raw) return null;
    return {
      enterpriseValue: this.extractValue(raw.enterpriseValue),
      forwardPE: this.extractValue(raw.forwardPE),
      profitMargins: this.extractValue(raw.profitMargins),
      floatShares: this.extractValue(raw.floatShares),
      sharesOutstanding: this.extractValue(raw.sharesOutstanding),
      heldPercentInsiders: this.extractValue(raw.heldPercentInsiders),
      heldPercentInstitutions: this.extractValue(raw.heldPercentInstitutions),
      beta: this.extractValue(raw.beta),
      bookValue: this.extractValue(raw.bookValue),
      priceToBook: this.extractValue(raw.priceToBook),
      earningsQuarterlyGrowth: this.extractValue(raw.earningsQuarterlyGrowth),
      netIncomeToCommon: this.extractValue(raw.netIncomeToCommon),
      trailingEps: this.extractValue(raw.trailingEps),
      forwardEps: this.extractValue(raw.forwardEps),
      pegRatio: this.extractValue(raw.pegRatio),
      enterpriseToRevenue: this.extractValue(raw.enterpriseToRevenue),
      enterpriseToEbitda: this.extractValue(raw.enterpriseToEbitda),
      lastDividendValue: this.extractValue(raw.lastDividendValue),
      lastDividendDate: this.extractDate(raw.lastDividendDate),
      lastSplitFactor: raw.lastSplitFactor ?? null,
      marketCap: this.extractValue(rawPrice?.marketCap),
    };
  }

  private parseFinancialData(raw: Record<string, RawValue> | undefined): YahooFinanceFinancialData | null {
    if (!raw) return null;
    return {
      currentPrice: this.extractValue(raw.currentPrice),
      targetHighPrice: this.extractValue(raw.targetHighPrice),
      targetLowPrice: this.extractValue(raw.targetLowPrice),
      targetMeanPrice: this.extractValue(raw.targetMeanPrice),
      targetMedianPrice: this.extractValue(raw.targetMedianPrice),
      recommendationMean: this.extractValue(raw.recommendationMean),
      recommendationKey: String(raw.recommendationKey ?? ""),
      numberOfAnalystOpinions: this.extractValue(raw.numberOfAnalystOpinions),
      totalCash: this.extractValue(raw.totalCash),
      totalCashPerShare: this.extractValue(raw.totalCashPerShare),
      ebitda: this.extractValue(raw.ebitda),
      totalDebt: this.extractValue(raw.totalDebt),
      quickRatio: this.extractValue(raw.quickRatio),
      currentRatio: this.extractValue(raw.currentRatio),
      totalRevenue: this.extractValue(raw.totalRevenue),
      debtToEquity: this.extractValue(raw.debtToEquity),
      revenuePerShare: this.extractValue(raw.revenuePerShare),
      returnOnAssets: this.extractValue(raw.returnOnAssets),
      returnOnEquity: this.extractValue(raw.returnOnEquity),
      grossProfits: this.extractValue(raw.grossProfits),
      freeCashflow: this.extractValue(raw.freeCashflow),
      operatingCashflow: this.extractValue(raw.operatingCashflow),
      earningsGrowth: this.extractValue(raw.earningsGrowth),
      revenueGrowth: this.extractValue(raw.revenueGrowth),
      grossMargins: this.extractValue(raw.grossMargins),
      ebitdaMargins: this.extractValue(raw.ebitdaMargins),
      operatingMargins: this.extractValue(raw.operatingMargins),
      profitMargins: this.extractValue(raw.profitMargins),
    };
  }

  private parseIncomeStatements(raw: RawIncomeStatement[] | undefined): YahooIncomeStatement[] {
    if (!raw?.length) return [];
    return raw.map((item) => ({
      endDate: this.extractDate(item.endDate) ?? "",
      totalRevenue: this.extractValue(item.totalRevenue),
      costOfRevenue: this.extractValue(item.costOfRevenue),
      grossProfit: this.extractValue(item.grossProfit),
      researchDevelopment: this.extractValue(item.researchDevelopment),
      sellingGeneralAdministrative: this.extractValue(item.sellingGeneralAdministrative),
      operatingIncome: this.extractValue(item.operatingIncome),
      ebit: this.extractValue(item.ebit),
      interestExpense: this.extractValue(item.interestExpense),
      incomeBeforeTax: this.extractValue(item.incomeBeforeTax),
      incomeTaxExpense: this.extractValue(item.incomeTaxExpense),
      netIncome: this.extractValue(item.netIncome),
      netIncomeApplicableToCommonShares: this.extractValue(item.netIncomeApplicableToCommonShares),
    }));
  }

  private parseBalanceSheets(raw: RawBalanceSheet[] | undefined): YahooBalanceSheet[] {
    if (!raw?.length) return [];
    return raw.map((item) => ({
      endDate: this.extractDate(item.endDate) ?? "",
      totalAssets: this.extractValue(item.totalAssets),
      totalCurrentAssets: this.extractValue(item.totalCurrentAssets),
      cash: this.extractValue(item.cash),
      totalCurrentLiabilities: this.extractValue(item.totalCurrentLiabilities),
      totalLiabilities: this.extractValue(item.totalLiabilities),
      longTermDebt: this.extractValue(item.longTermDebt),
      shortLongTermDebt: this.extractValue(item.shortLongTermDebt),
      totalShareholderEquity: this.extractValue(item.totalShareholderEquity),
      minorityInterest: this.extractValue(item.minorityInterest),
      netTangibleAssets: this.extractValue(item.netTangibleAssets),
      goodwill: this.extractValue(item.goodwill),
      intangibleAssets: this.extractValue(item.intangibleAssets),
      otherCurrentAssets: this.extractValue(item.otherCurrentAssets),
      otherCurrentLiabilities: this.extractValue(item.otherCurrentLiabilities),
      otherAssets: this.extractValue(item.otherAssets),
      otherLiabilities: this.extractValue(item.otherLiabilities),
      propertyPlantEquipment: this.extractValue(item.propertyPlantEquipment),
      inventory: this.extractValue(item.inventory),
      receivables: this.extractValue(item.receivables),
      payable: this.extractValue(item.payable),
      deferredLongTermAssetCharges: this.extractValue(item.deferredLongTermAssetCharges),
      treasuryStock: this.extractValue(item.treasuryStock),
    }));
  }

  private parseCashflowStatements(raw: RawCashflowStatement[] | undefined): YahooCashflowStatement[] {
    if (!raw?.length) return [];
    return raw.map((item) => ({
      endDate: this.extractDate(item.endDate) ?? "",
      netIncome: this.extractValue(item.netIncome),
      depreciation: this.extractValue(item.depreciation),
      changeToNetincome: this.extractValue(item.changeToNetincome),
      changeToAccountReceivables: this.extractValue(item.changeToAccountReceivables),
      changeToLiabilities: this.extractValue(item.changeToLiabilities),
      changeToInventory: this.extractValue(item.changeToInventory),
      changeToOperatingActivities: this.extractValue(item.changeToOperatingActivities),
      totalCashFromOperatingActivities: this.extractValue(item.totalCashFromOperatingActivities),
      capitalExpenditures: this.extractValue(item.capitalExpenditures),
      investments: this.extractValue(item.investments),
      otherCashflowsFromInvestingActivities: this.extractValue(item.otherCashflowsFromInvestingActivities),
      totalCashFromInvestingActivities: this.extractValue(item.totalCashFromInvestingActivities),
      dividendsPaid: this.extractValue(item.dividendsPaid),
      netBorrowings: this.extractValue(item.netBorrowings),
      otherCashflowsFromFinancingActivities: this.extractValue(item.otherCashflowsFromFinancingActivities),
      totalCashFromFinancingActivities: this.extractValue(item.totalCashFromFinancingActivities),
      effectOfExchangeRate: this.extractValue(item.effectOfExchangeRate),
      changeInCash: this.extractValue(item.changeInCash),
      repurchaseOfStock: this.extractValue(item.repurchaseOfStock),
      issuanceOfStock: this.extractValue(item.issuanceOfStock),
    }));
  }

  private parseFundamentalsEntries<T extends { endDate: string }>(
    grouped: Record<number, Record<string, { raw: number; fmt: string }>> | null,
    fieldMappings: Array<{ apiKey: string; field: keyof T }>,
    prefix: string = "quarterly"
  ): T[] {
    if (!grouped) return [];
    return Object.entries(grouped)
      .map(([ts, metrics]) => {
        const MILISSEGUNDOS_POR_SEGUNDO = 1000;
        const endDate = new Date(parseInt(ts) * MILISSEGUNDOS_POR_SEGUNDO).toISOString().split("T")[0];
        const item: Record<string, string | null> = { endDate };
        for (const { apiKey, field } of fieldMappings) {
          item[field as string] = this.extractValue(metrics[`${prefix}${apiKey}`]);
        }
        return item as T;
      })
      .sort((a, b) => (b.endDate ?? "").localeCompare(a.endDate ?? ""));
  }

  private parseBalanceSheetsFromFundamentals(
    grouped: Record<number, Record<string, { raw: number; fmt: string }>> | null
  ): YahooBalanceSheet[] {
    const fieldMappings: Array<{ apiKey: string; field: keyof YahooBalanceSheet }> = [
      { apiKey: "TotalAssets", field: "totalAssets" },
      { apiKey: "CurrentAssets", field: "totalCurrentAssets" },
      { apiKey: "CashAndCashEquivalents", field: "cash" },
      { apiKey: "CurrentLiabilities", field: "totalCurrentLiabilities" },
      { apiKey: "TotalLiabilitiesNetMinorityInterest", field: "totalLiabilities" },
      { apiKey: "LongTermDebt", field: "longTermDebt" },
      { apiKey: "TotalDebt", field: "shortLongTermDebt" },
      { apiKey: "StockholdersEquity", field: "totalShareholderEquity" },
      { apiKey: "MinorityInterest", field: "minorityInterest" },
      { apiKey: "TangibleBookValue", field: "netTangibleAssets" },
      { apiKey: "Goodwill", field: "goodwill" },
      { apiKey: "OtherCurrentAssets", field: "otherCurrentAssets" },
      { apiKey: "OtherCurrentLiabilities", field: "otherCurrentLiabilities" },
      { apiKey: "NetPPE", field: "propertyPlantEquipment" },
      { apiKey: "Inventory", field: "inventory" },
      { apiKey: "AccountsReceivable", field: "receivables" },
      { apiKey: "AccountsPayable", field: "payable" },
      { apiKey: "TreasuryStock", field: "treasuryStock" },
      { apiKey: "OtherAssets", field: "otherAssets" },
      { apiKey: "OtherLiabilities", field: "otherLiabilities" },
    ];
    return this.parseFundamentalsEntries<YahooBalanceSheet>(grouped, fieldMappings);
  }

  private parseCashflowStatementsFromFundamentals(
    grouped: Record<number, Record<string, { raw: number; fmt: string }>> | null
  ): YahooCashflowStatement[] {
    const fieldMappings: Array<{ apiKey: string; field: keyof YahooCashflowStatement }> = [
      { apiKey: "NetIncomeFromContinuingOperations", field: "netIncome" },
      { apiKey: "ChangesInAccountReceivables", field: "changeToAccountReceivables" },
      { apiKey: "ChangeInInventory", field: "changeToInventory" },
      { apiKey: "ChangeInPayable", field: "changeToLiabilities" },
      { apiKey: "ChangeInOtherWorkingCapital", field: "changeToOperatingActivities" },
      { apiKey: "OperatingCashFlow", field: "totalCashFromOperatingActivities" },
      { apiKey: "CapitalExpenditure", field: "capitalExpenditures" },
      { apiKey: "NetInvestmentPurchaseAndSale", field: "investments" },
      { apiKey: "NetOtherInvestingChanges", field: "otherCashflowsFromInvestingActivities" },
      { apiKey: "InvestingCashFlow", field: "totalCashFromInvestingActivities" },
      { apiKey: "CashDividendsPaid", field: "dividendsPaid" },
      { apiKey: "NetIssuancePaymentsOfDebt", field: "netBorrowings" },
      { apiKey: "NetOtherFinancingCharges", field: "otherCashflowsFromFinancingActivities" },
      { apiKey: "FinancingCashFlow", field: "totalCashFromFinancingActivities" },
      { apiKey: "EffectOfExchangeRateChanges", field: "effectOfExchangeRate" },
      { apiKey: "ChangesInCash", field: "changeInCash" },
      { apiKey: "RepurchaseOfCapitalStock", field: "repurchaseOfStock" },
    ];
    return this.parseFundamentalsEntries<YahooCashflowStatement>(grouped, fieldMappings);
  }

  private parseEarningsHistory(raw: RawEarningsItem[] | undefined): YahooFinanceEarningsHistoryItem[] {
    if (!raw?.length) return [];
    return raw.map((item) => ({
      epsActual: this.extractValue(item.epsActual),
      epsEstimate: this.extractValue(item.epsEstimate),
      epsDifference: this.extractValue(item.epsDifference),
      surprisePercent: this.extractValue(item.surprisePercent),
      quarter: this.extractDate(item.quarter) ?? "",
      currency: item.currency ?? null,
      period: item.period ?? null,
    }));
  }

  private parseCalendarEvents(raw: {
    earnings?: {
      earningsDate?: RawDate[];
      earningsCallDate?: RawDate[];
      isEarningsDateEstimate?: boolean;
      earningsAverage?: RawValue;
      earningsLow?: RawValue;
      earningsHigh?: RawValue;
      revenueAverage?: RawValue;
      revenueLow?: RawValue;
      revenueHigh?: RawValue;
    };
    exDividendDate?: RawDate;
    dividendDate?: RawDate;
  } | undefined): YahooFinanceCalendarEvents | null {
    if (!raw) return null;

    const earnings = raw.earnings ?? {};

    const earningsDateRaw = earnings.earningsDate?.[0];
    const earningsCallDateRaw = earnings.earningsCallDate?.[0];
    const exDividendDateRaw = raw.exDividendDate;
    const dividendDateRaw = raw.dividendDate;

    return {
      earningsDate: this.extractDate(earningsDateRaw),
      earningsCallDate: this.extractDate(earningsCallDateRaw),
      isEarningsDateEstimate: earnings.isEarningsDateEstimate ?? null,
      earningsAverage: this.extractValue(earnings.earningsAverage),
      earningsLow: this.extractValue(earnings.earningsLow),
      earningsHigh: this.extractValue(earnings.earningsHigh),
      revenueAverage: this.extractValue(earnings.revenueAverage),
      revenueLow: this.extractValue(earnings.revenueLow),
      revenueHigh: this.extractValue(earnings.revenueHigh),
      exDividendDate: this.extractDate(exDividendDateRaw),
      dividendDate: this.extractDate(dividendDateRaw),
    };
  }
}
