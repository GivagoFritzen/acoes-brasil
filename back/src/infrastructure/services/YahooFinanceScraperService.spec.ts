import { YahooFinanceScraperService } from "./YahooFinanceScraperService";

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

function buildQuoteSummaryResponse(overrides: Record<string, any> = {}): any {
  return {
    quoteSummary: {
      result: [
        {
          defaultKeyStatistics: {
            enterpriseValue: { raw: 404723138560, fmt: "404.72B" },
            forwardPE: { raw: 46.57, fmt: "46.57" },
            profitMargins: { raw: 0.0726, fmt: "7.26%" },
            beta: { raw: 0.73, fmt: "0.73" },
            bookValue: { raw: 44.839, fmt: "44.84" },
            priceToBook: { raw: 1.66, fmt: "1.66" },
            trailingEps: { raw: 3.42, fmt: "3.42" },
            forwardEps: { raw: 8.18, fmt: "8.18" },
            pegRatio: { raw: 0.3, fmt: "0.30" },
            heldPercentInsiders: { raw: 0.0645, fmt: "6.45%" },
            heldPercentInstitutions: { raw: 0.54475, fmt: "54.47%" },
            ...overrides.defaultKeyStatistics,
          },
          financialData: {
            currentPrice: { raw: 74.51, fmt: "74.51" },
            targetMeanPrice: { raw: 87.27, fmt: "87.27" },
            recommendationKey: "buy",
            totalCash: { raw: 27552000000, fmt: "27.55B" },
            totalDebt: { raw: 111957999616, fmt: "111.96B" },
            freeCashflow: { raw: 10600125440, fmt: "10.6B" },
            operatingCashflow: { raw: 48816001024, fmt: "48.82B" },
            grossMargins: { raw: 0.35076, fmt: "35.08%" },
            ebitdaMargins: { raw: 0.36253, fmt: "36.25%" },
            profitMargins: { raw: 0.0726, fmt: "7.26%" },
            returnOnEquity: { raw: 0.0684, fmt: "6.84%" },
            debtToEquity: { raw: 57.146, fmt: "57.15%" },
            revenueGrowth: { raw: 0.027, fmt: "2.70%" },
            ...overrides.financialData,
          },
          incomeStatementHistory: {
            incomeStatementHistory: [
              {
                endDate: { raw: 1767139200, fmt: "2025-12-31" },
                totalRevenue: { raw: 38403000000, fmt: "38.4B" },
                netIncome: { raw: 2352000000, fmt: "2.35B" },
              },
            ],
          },
          incomeStatementHistoryQuarterly: {
            incomeStatementHistory: [
              { endDate: { raw: 1767139200, fmt: "2025-12-31" }, totalRevenue: { raw: 38403000000, fmt: "38.4B" }, netIncome: { raw: 2352000000, fmt: "2.35B" } },
              { endDate: { raw: 1759348800, fmt: "2025-09-30" }, totalRevenue: { raw: 37210000000, fmt: "37.2B" }, netIncome: { raw: 2100000000, fmt: "2.10B" } },
              { endDate: { raw: 1751472000, fmt: "2025-06-30" }, totalRevenue: { raw: 36850000000, fmt: "36.9B" }, netIncome: { raw: 1980000000, fmt: "1.98B" } },
              { endDate: { raw: 1743638400, fmt: "2025-03-31" }, totalRevenue: { raw: 35900000000, fmt: "35.9B" }, netIncome: { raw: 1850000000, fmt: "1.85B" } },
            ],
          },
          balanceSheetHistory: {
            balanceSheetStatements: [
              {
                endDate: { raw: 1767139200, fmt: "2025-12-31" },
                totalAssets: { raw: 50000000000, fmt: "50B" },
                totalLiabilities: { raw: 20000000000, fmt: "20B" },
              },
            ],
          },
          balanceSheetHistoryQuarterly: {
            balanceSheetStatements: [
              { endDate: { raw: 1767139200, fmt: "2025-12-31" }, totalAssets: { raw: 50000000000, fmt: "50B" }, totalLiabilities: { raw: 20000000000, fmt: "20B" } },
              { endDate: { raw: 1759348800, fmt: "2025-09-30" }, totalAssets: { raw: 49000000000, fmt: "49B" }, totalLiabilities: { raw: 19500000000, fmt: "19.5B" } },
              { endDate: { raw: 1751472000, fmt: "2025-06-30" }, totalAssets: { raw: 48500000000, fmt: "48.5B" }, totalLiabilities: { raw: 19200000000, fmt: "19.2B" } },
            ],
          },
          cashflowStatementHistory: {
            cashflowStatements: [
              {
                endDate: { raw: 1767139200, fmt: "2025-12-31" },
                netIncome: { raw: 2352000000, fmt: "2.35B" },
                totalCashFromOperatingActivities: { raw: 48816001024, fmt: "48.82B" },
              },
            ],
          },
          cashflowStatementHistoryQuarterly: {
            cashflowStatements: [
              { endDate: { raw: 1767139200, fmt: "2025-12-31" }, netIncome: { raw: 2352000000, fmt: "2.35B" }, totalCashFromOperatingActivities: { raw: 48816001024, fmt: "48.82B" } },
              { endDate: { raw: 1759348800, fmt: "2025-09-30" }, netIncome: { raw: 2100000000, fmt: "2.10B" }, totalCashFromOperatingActivities: { raw: 12500000000, fmt: "12.5B" } },
              { endDate: { raw: 1751472000, fmt: "2025-06-30" }, netIncome: { raw: 1980000000, fmt: "1.98B" }, totalCashFromOperatingActivities: { raw: 12100000000, fmt: "12.1B" } },
              { endDate: { raw: 1743638400, fmt: "2025-03-31" }, netIncome: { raw: 1850000000, fmt: "1.85B" }, totalCashFromOperatingActivities: { raw: 11800000000, fmt: "11.8B" } },
            ],
          },
          earningsHistory: {
            history: [
              {
                epsActual: { raw: 0.5, fmt: "0.5" },
                epsEstimate: { raw: 0.33, fmt: "0.33" },
                epsDifference: { raw: 0.17, fmt: "0.17" },
                surprisePercent: { raw: 0.507, fmt: "50.70%" },
                quarter: { raw: 1751241600, fmt: "2025-06-30" },
                currency: "USD",
                period: "-4q",
              },
            ],
          },
          calendarEvents: {
            earnings: {
              earningsDate: [{ raw: 1777406400, fmt: "2026-04-28" }],
              earningsCallDate: [{ raw: 1777471200, fmt: "2026-04-29" }],
              revenueAverage: { raw: 10332906410, fmt: "10.33B" },
            },
            exDividendDate: { raw: 1765497600, fmt: "2025-12-12" },
          },
          price: {
            marketCap: { raw: 317096886272, fmt: "317.10B" },
          },
          ...overrides,
        },
      ],
      error: null,
    },
  };
}

function generateTimestamps(count: number): number[] {
  const now = Date.now();
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now - (count - i) * 90 * 86400 * 1000);
    result.push(Math.floor(d.getTime() / 1000));
  }
  return result;
}

function buildFundamentalsResponse(apiKeys: string[], numPeriods: number): any {
  const timestamps = generateTimestamps(numPeriods);
  const result = apiKeys.map((key) => {
    const typeKey = `quarterly${key}`;
    return {
      meta: { symbol: ["VALE3.SA"], type: [typeKey] },
      timestamp: timestamps,
      [typeKey]: timestamps.map((ts) => ({
        dataId: 99999,
        asOfDate: new Date(ts * 1000).toISOString().split("T")[0],
        periodType: "3M",
        currencyCode: "USD",
        reportedValue: { raw: 1000000000, fmt: "1B" },
      })),
    };
  });
  return { timeseries: { result, error: null } };
}

function createTextResponse(text: string, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    text: async () => text,
    json: async () => JSON.parse(text),
    headers: new Map() as any,
  } as Response;
}

function createJsonResponse(data: any, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Map() as any,
  } as Response;
}

function createConsentResponse(): Response {
  return {
    ok: true,
    status: 200,
    text: async () => "",
    json: async () => ({}),
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === "set-cookie") return "A3=test-cookie";
        return null;
      },
      forEach: () => {},
    } as any,
  } as Response;
}

describe("YahooFinanceScraperService", () => {
  let service: YahooFinanceScraperService;

  beforeEach(() => {
    service = new YahooFinanceScraperService();
    jest.clearAllMocks();
  });

  it("Deve retornar detalhes quando ativo encontrado", async () => {
    mockFetch
      .mockResolvedValueOnce(createTextResponse("abc123"))
      .mockResolvedValueOnce(createJsonResponse(buildQuoteSummaryResponse()))
      .mockResolvedValueOnce(createJsonResponse({ timeseries: { result: null, error: null } }))
      .mockResolvedValueOnce(createJsonResponse({ timeseries: { result: null, error: null } }));

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.codigo).toBe("VALE3");
    expect(resultado.keyStatistics?.enterpriseValue).toBe("404.72B");
    expect(resultado.keyStatistics?.forwardPE).toBe("46.57");
    expect(resultado.keyStatistics?.beta).toBe("0.73");
    expect(resultado.keyStatistics?.heldPercentInsiders).toBe("6.45%");
    expect(resultado.financialData?.currentPrice).toBe("74.51");
    expect(resultado.financialData?.recommendationKey).toBe("buy");
    expect(resultado.financialData?.grossMargins).toBe("35.08%");
    expect(resultado.incomeStatements).toHaveLength(4);
    expect(resultado.incomeStatements[0].endDate).toBe("2025-12-31");
    expect(resultado.incomeStatements[3].endDate).toBe("2025-03-31");
    expect(resultado.balanceSheets).toHaveLength(3);
    expect(resultado.cashflowStatements).toHaveLength(4);
    expect(resultado.earningsHistory).toHaveLength(1);
    expect(resultado.earningsHistory[0].epsActual).toBe("0.5");
    expect(resultado.calendarEvents?.earningsDate).toBe("2026-04-28");
    expect(resultado.calendarEvents?.exDividendDate).toBe("2025-12-12");
    expect(resultado.keyStatistics?.marketCap).toBe("317.10B");
  });

  it("Deve usar fundamentalsTimeSeries quando disponivel", async () => {
    const balanceSheetsMock = buildFundamentalsResponse(
      ["TotalAssets", "CurrentLiabilities", "StockholdersEquity"],
      3
    );
    const cashflowMock = buildFundamentalsResponse(
      ["OperatingCashFlow", "CapitalExpenditure", "NetIncomeFromContinuingOperations"],
      4
    );

    mockFetch
      .mockResolvedValueOnce(createTextResponse("abc123"))
      .mockResolvedValueOnce(createJsonResponse(buildQuoteSummaryResponse()))
      .mockResolvedValueOnce(createJsonResponse(balanceSheetsMock))
      .mockResolvedValueOnce(createJsonResponse(cashflowMock));

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.codigo).toBe("VALE3");
    expect(resultado.balanceSheets.length).toBe(3);
    expect(resultado.balanceSheets[0].endDate).toBeDefined();
    expect(resultado.balanceSheets[0].totalAssets).toBe("1B");
    expect(resultado.balanceSheets[0].totalCurrentLiabilities).toBe("1B");
    expect(resultado.balanceSheets[0].totalShareholderEquity).toBe("1B");
    expect(resultado.cashflowStatements.length).toBe(4);
    expect(resultado.cashflowStatements[0].totalCashFromOperatingActivities).toBe("1B");
    expect(resultado.cashflowStatements[0].capitalExpenditures).toBe("1B");
    expect(resultado.cashflowStatements[0].netIncome).toBe("1B");
  });

  it("Deve autenticar quando crumb nao disponivel", async () => {
    mockFetch
      .mockResolvedValueOnce(createTextResponse("", false))
      .mockResolvedValueOnce(createConsentResponse())
      .mockResolvedValueOnce(createTextResponse("abc123"))
      .mockResolvedValueOnce(createJsonResponse(buildQuoteSummaryResponse()))
      .mockResolvedValueOnce(createJsonResponse({ timeseries: { result: null, error: null } }))
      .mockResolvedValueOnce(createJsonResponse({ timeseries: { result: null, error: null } }));

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.codigo).toBe("VALE3");
    expect(resultado.keyStatistics).not.toBeNull();
  });

  it("Deve lancar erro quando fetchQuoteSummary falha", async () => {
    mockFetch
      .mockResolvedValueOnce(createTextResponse("abc123"))
      .mockResolvedValueOnce(createJsonResponse(null, false));

    await expect(service.scrapeAsync("VALE3")).rejects.toThrow(
      "Yahoo Finance retornou status"
    );
  });

  it("Deve lancar erro quando ativo nao encontrado", async () => {
    mockFetch
      .mockResolvedValueOnce(createTextResponse("abc123"))
      .mockResolvedValueOnce(
        createJsonResponse({ quoteSummary: { result: null, error: { code: "NOT_FOUND" } } })
      );

    await expect(service.scrapeAsync("INVALID")).rejects.toThrow(
      "Falha ao consultar Yahoo Finance para o ativo INVALID"
    );
  });

  it("Deve retornar keyStatistics null quando modulo ausente", async () => {
    mockFetch
      .mockResolvedValueOnce(createTextResponse("abc123"))
      .mockResolvedValueOnce(
        createJsonResponse({
          quoteSummary: {
            result: [{}],
            error: null,
          },
        })
      )
      .mockResolvedValueOnce(createJsonResponse({ timeseries: { result: null, error: null } }))
      .mockResolvedValueOnce(createJsonResponse({ timeseries: { result: null, error: null } }));

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.keyStatistics).toBeNull();
    expect(resultado.financialData).toBeNull();
    expect(resultado.incomeStatements).toEqual([]);
    expect(resultado.balanceSheets).toEqual([]);
    expect(resultado.cashflowStatements).toEqual([]);
    expect(resultado.earningsHistory).toEqual([]);
    expect(resultado.calendarEvents).toBeNull();
  });

  it("Deve lancar erro quando autenticacao falha", async () => {
    mockFetch
      .mockResolvedValueOnce(createTextResponse("", false))
      .mockResolvedValueOnce(createJsonResponse(null, false));

    await expect(service.scrapeAsync("VALE3")).rejects.toThrow(
      "Falha ao autenticar no Yahoo Finance"
    );
  });

  it("Deve normalizar codigo para maiusculas", async () => {
    mockFetch
      .mockResolvedValueOnce(createTextResponse("abc123"))
      .mockResolvedValueOnce(createJsonResponse(buildQuoteSummaryResponse()))
      .mockResolvedValueOnce(createJsonResponse({ timeseries: { result: null, error: null } }))
      .mockResolvedValueOnce(createJsonResponse({ timeseries: { result: null, error: null } }));

    const resultado = await service.scrapeAsync("vale3");

    expect(resultado.codigo).toBe("VALE3");
  });
});
