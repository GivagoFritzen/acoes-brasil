import { GoogleFinanceService } from "./GoogleFinanceService";

jest.mock("../../shared/logger/Logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockFetch = jest.spyOn(global, "fetch") as jest.Mock;

function buildYahooJson(overrides?: {
  meta?: Record<string, any>;
  timestamps?: number[];
  closes?: (number | null)[];
  volumes?: (number | null)[];
}): string {
  const meta = overrides?.meta ?? {
    currency: "BRL",
    symbol: "PETR4.SA",
    regularMarketPrice: 42.5,
    chartPreviousClose: 41.3,
    timezone: "America/Sao_Paulo",
  };
  const timestamps = overrides?.timestamps ?? [1700000000, 1700086400];
  const closes = overrides?.closes ?? [42.5, 43.0];
  const volumes = overrides?.volumes ?? [1000, 2000];

  return JSON.stringify({
    chart: {
      result: [
        {
          meta,
          timestamp: timestamps,
          indicators: { quote: [{ close: closes, volume: volumes }] },
        },
      ],
    },
  });
}

function createFetchResponse(body: string, ok: boolean = true): Response {
  return { ok, text: async () => body } as Response;
}

describe("GoogleFinanceService", () => {
  let service: GoogleFinanceService;

  beforeEach(() => {
    service = new GoogleFinanceService();
    jest.clearAllMocks();
  });

  describe("getDataAsync", () => {
    it("deve retornar dados quando ativo encontrado com window padrao 1Y", async () => {
      const json = buildYahooJson();
      mockFetch.mockResolvedValue(createFetchResponse(json));

      const result = await service.getDataAsync("PETR4");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("PETR4.SA"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("range=1y&interval=1d"),
        expect.any(Object)
      );
      expect(result.quote).not.toBeNull();
      expect(result.quote!.ticker).toBe("PETR4");
      expect(result.quote!.price).toBe(42.5);
      expect(result.quote!.change).toBeCloseTo(1.2, 10);
      expect(result.quote!.previousClose).toBe(41.3);
      expect(result.chart).not.toBeNull();
      expect(result.chart!.points).toHaveLength(2);
    });

    it("deve retornar dados com window personalizada 5Y", async () => {
      const json = buildYahooJson();
      mockFetch.mockResolvedValue(createFetchResponse(json));

      await service.getDataAsync("PETR4", "5Y");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("range=5y&interval=1wk"),
        expect.any(Object)
      );
    });

    it.each([
      ["1D", "1d", "5m"],
      ["5D", "5d", "15m"],
      ["1M", "1mo", "90m"],
      ["6M", "6mo", "1d"],
      ["YTD", "ytd", "1d"],
      ["1Y", "1y", "1d"],
      ["5Y", "5y", "1wk"],
      ["MAX", "max", "1mo"],
    ] as [string, string, string][])(
      "deve usar range=%s e interval=%s para chartWindow %s",
      async (window, expectedRange, expectedInterval) => {
        const json = buildYahooJson();
        mockFetch.mockResolvedValue(createFetchResponse(json));

        await service.getDataAsync("PETR4", window);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`range=${expectedRange}&interval=${expectedInterval}`),
          expect.any(Object)
        );
      }
    );

    it("deve usar fallback 1y/1d para chartWindow desconhecida", async () => {
      const json = buildYahooJson();
      mockFetch.mockResolvedValue(createFetchResponse(json));

      await service.getDataAsync("PETR4", "INVALID");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("range=1y&interval=1d"),
        expect.any(Object)
      );
    });

    it("deve retornar emptyResponse quando resposta nao ok", async () => {
      mockFetch.mockResolvedValue(createFetchResponse("", false));

      const result = await service.getDataAsync("PETR4");

      expect(result.quote).toBeNull();
      expect(result.chart).toBeNull();
    });

    it("deve propagar erro quando fetch falha", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(service.getDataAsync("PETR4")).rejects.toThrow("Network error");
    });

    it("deve retornar emptyResponse quando JSON invalido", async () => {
      mockFetch.mockResolvedValue(createFetchResponse("not json"));

      const result = await service.getDataAsync("PETR4");

      expect(result.quote).toBeNull();
      expect(result.chart).toBeNull();
    });

    it("deve retornar emptyResponse quando chart sem resultado", async () => {
      const json = JSON.stringify({ chart: { result: [] } });
      mockFetch.mockResolvedValue(createFetchResponse(json));

      const result = await service.getDataAsync("PETR4");

      expect(result.quote).toBeNull();
      expect(result.chart).toBeNull();
    });

    it("deve retornar quote null quando regularMarketPrice ausente", async () => {
      const json = buildYahooJson({ meta: { currency: "BRL", timezone: "UTC" } });
      mockFetch.mockResolvedValue(createFetchResponse(json));

      const result = await service.getDataAsync("PETR4");

      expect(result.quote).toBeNull();
      expect(result.chart).not.toBeNull();
      expect(result.chart!.points).toHaveLength(2);
    });

    it("deve retornar changePercent 0 quando previousClose for zero", async () => {
      const json = buildYahooJson({
        meta: {
          currency: "BRL",
          symbol: "PETR4.SA",
          regularMarketPrice: 42.5,
          chartPreviousClose: 0,
          timezone: "America/Sao_Paulo",
        },
      });
      mockFetch.mockResolvedValue(createFetchResponse(json));

      const result = await service.getDataAsync("PETR4");

      expect(result.quote).not.toBeNull();
      expect(result.quote!.changePercent).toBe(0);
    });

    it("deve ignorar pontos com timestamp ou price nulo", async () => {
      const json = buildYahooJson({
        timestamps: [1700000000, 0, 1700086400],
        closes: [42.5, null, 43.0],
        volumes: [1000, 2000, 3000],
      });
      mockFetch.mockResolvedValue(createFetchResponse(json));

      const result = await service.getDataAsync("PETR4");

      expect(result.chart!.points).toHaveLength(2);
    });

    it("deve abortar requisicao apos timeout e propagar erro", async () => {
      jest.useFakeTimers();
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      mockFetch.mockImplementation(
        (_url: string, opts: any) =>
          new Promise((_resolve, reject) => {
            opts?.signal?.addEventListener("abort", () => reject(abortError));
          })
      );

      const promise = service.getDataAsync("PETR4");

      jest.advanceTimersByTime(10_000);
      await Promise.resolve();

      await expect(promise).rejects.toThrow("The operation was aborted");

      jest.useRealTimers();
    }, 15000);
  });

  describe("normalizeCodigo (via URL)", () => {
    it("deve manter codigo de 4 caracteres com numero sem sufixo", async () => {
      mockFetch.mockResolvedValue(createFetchResponse(buildYahooJson()));

      await service.getDataAsync("PETR4");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("PETR4.SA"),
        expect.any(Object)
      );
    });

    it("deve remover sufixo F de codigo com 5+ caracteres", async () => {
      mockFetch.mockResolvedValue(createFetchResponse(buildYahooJson()));

      await service.getDataAsync("MULT3F");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("MULT3.SA"),
        expect.any(Object)
      );
    });

    it("deve converter codigo para maiusculas", async () => {
      mockFetch.mockResolvedValue(createFetchResponse(buildYahooJson()));

      await service.getDataAsync("petr4");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("PETR4.SA"),
        expect.any(Object)
      );
    });

    it("deve fazer trim de espacos", async () => {
      mockFetch.mockResolvedValue(createFetchResponse(buildYahooJson()));

      await service.getDataAsync("  PETR4  ");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("PETR4.SA"),
        expect.any(Object)
      );
    });

    it("deve manter sufixo com 2+ letras (ex: ABC)", async () => {
      mockFetch.mockResolvedValue(createFetchResponse(buildYahooJson()));

      await service.getDataAsync("ABC");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("ABC.SA"),
        expect.any(Object)
      );
    });
  });

  describe("headers", () => {
    it("deve enviar User-Agent e Accept json", async () => {
      mockFetch.mockResolvedValue(createFetchResponse(buildYahooJson()));

      await service.getDataAsync("PETR4");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "User-Agent": expect.stringContaining("Mozilla"),
            "Accept": "application/json",
          }),
        })
      );
    });
  });
});
