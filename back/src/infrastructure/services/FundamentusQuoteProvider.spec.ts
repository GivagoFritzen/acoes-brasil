import { FundamentusQuoteProvider } from "./FundamentusQuoteProvider";
import { logger } from "../../shared/logger/Logger";

jest.mock("../../shared/logger/Logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

const mockFetch = jest.spyOn(global, "fetch") as jest.Mock;

function encodeIso88591(value: string): ArrayBuffer {
  const buf = new ArrayBuffer(value.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    view[i] = code > 0xff ? 0x3f : code;
  }
  return buf;
}

function createMockResponse(overrides: Partial<{
  ok: boolean;
  contentType: string | null;
  html: string;
}>): Response {
  const html = overrides.html ?? "";
  const buffer = encodeIso88591(html);

  return {
    ok: overrides.ok ?? true,
    headers: {
      get: (_name: string) => overrides.contentType ?? "text/html",
      has: () => true,
    } as unknown as Headers,
    arrayBuffer: async () => buffer,
  } as unknown as Response;
}

describe("FundamentusQuoteProvider", () => {
  let service: FundamentusQuoteProvider;

  beforeEach(() => {
    service = new FundamentusQuoteProvider();
    jest.clearAllMocks();
  });

  it("Deve chamar fetch com url correta", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ html: "" }));

    await service.getQuoteAsync("VALE3");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("papel=VALE3"),
      expect.any(Object)
    );
  });

  it("Deve retornar null quando resposta nao ok", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ ok: false }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve retornar null quando content-type nao e text/html", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ contentType: "application/json" }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve retornar null quando content-type e null", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ contentType: null }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve retornar null quando HTML excede tamanho maximo", async () => {
    const htmlGrande = "a".repeat(1_000_001);
    mockFetch.mockResolvedValue(createMockResponse({ html: htmlGrande }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve retornar null quando HTML contem papel inexistente", async () => {
    const html = "<html><body>papel inexistente</body></html>";
    mockFetch.mockResolvedValue(createMockResponse({ html }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve retornar null quando HTML contem nenhum resultado", async () => {
    const html = "<html><body>nenhum resultado encontrado</body></html>";
    mockFetch.mockResolvedValue(createMockResponse({ html }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve retornar cotacao quando label cotacao encontrada", async () => {
    const html = `
      <table>
        <tr>
          <td class="label">Cotação:</td>
          <td class="data">85,50</td>
        </tr>
      </table>
    `;
    mockFetch.mockResolvedValue(createMockResponse({ html }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBe(85.5);
  });

  it("Deve retornar cotacao com valor inteiro sem virgula", async () => {
    const html = `
      <table>
        <tr>
          <td class="label">Cotação:</td>
          <td class="data">35,00</td>
        </tr>
      </table>
    `;
    mockFetch.mockResolvedValue(createMockResponse({ html }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBe(35);
  });

  it("Deve retornar null quando label cotacao nao encontrada", async () => {
    const html = `
      <table>
        <tr>
          <td class="label">P/L:</td>
          <td class="data">10,5</td>
        </tr>
      </table>
    `;
    mockFetch.mockResolvedValue(createMockResponse({ html }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve retornar null quando fetch lanca excecao", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
    expect(logger.error).toHaveBeenCalled();
  });

  it("Deve retornar null quando fetch lanca excecao nao Error", async () => {
    mockFetch.mockRejectedValue("string error");

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
    expect(logger.error).toHaveBeenCalled();
  });

  it("Deve retornar null quando parseDecimal recebe texto invalido", async () => {
    const html = `
      <table>
        <tr>
          <td class="label">Cotação:</td>
          <td class="data">N/A</td>
        </tr>
      </table>
    `;
    mockFetch.mockResolvedValue(createMockResponse({ html }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve retornar null quando cotacao vem como campo vazio", async () => {
    const html = `
      <table>
        <tr>
          <td class="label">Cotação:</td>
          <td class="data"></td>
        </tr>
      </table>
    `;
    mockFetch.mockResolvedValue(createMockResponse({ html }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve normalizar codigo com sufixo F para Fundamentus", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ html: "" }));

    await service.getQuoteAsync("MULT3F");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("papel=MULT3"),
      expect.any(Object)
    );
  });

  it("Deve retornar null quando excede maximo de iteracoes do regex", async () => {
    const lines: string[] = [];
    for (let i = 0; i < 1001; i++) {
      lines.push(`<tr><td class="label">Indice${i}:</td><td class="data">${i}</td></tr>`);
    }
    const html = `<table>${lines.join("")}</table>`;
    mockFetch.mockResolvedValue(createMockResponse({ html }));

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });

  it("Deve abortar requisicao apos timeout e retornar null", async () => {
    jest.useFakeTimers();

    const abortError = new Error("AbortError");
    abortError.name = "AbortError";
    mockFetch.mockImplementation(
      (_url: string, opts: any) =>
        new Promise((_resolve, reject) => {
          opts?.signal?.addEventListener("abort", () => reject(abortError));
        })
    );

    const promise = service.getQuoteAsync("VALE3");

    jest.advanceTimersByTime(15_000);
    await Promise.resolve();

    const resultado = await promise;
    expect(resultado).toBeNull();

    jest.useRealTimers();
  }, 10000);
});
