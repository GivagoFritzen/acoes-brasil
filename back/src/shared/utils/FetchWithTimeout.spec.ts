import { fetchWithTimeout } from "./FetchWithTimeout";
import { FetchWithTimeoutOptions } from "../../models/FetchWithTimeoutOptions";
import { REQUEST_TIMEOUT_MS } from "../constants/ProjectConstants";

describe("fetchWithTimeout", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("Deve chamar fetch com URL correta", async () => {
    const mockResponse = { ok: true } as Response;
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const resultado = await fetchWithTimeout("https://api.example.com/data");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/data",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(resultado).toBe(mockResponse);
  });

  it("Deve usar timeout padrao quando nao especificado", async () => {
    const mockResponse = { ok: true } as Response;
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await fetchWithTimeout("https://api.example.com/data");

    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(callArgs.signal).toBeInstanceOf(AbortSignal);
  });

  it("Deve usar timeout customizado", async () => {
    jest.useFakeTimers();
    const mockResponse = { ok: true } as Response;
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const options: FetchWithTimeoutOptions = { timeoutMs: 5000 };
    await fetchWithTimeout("https://api.example.com/data", options);

    jest.useRealTimers();
    expect(global.fetch).toHaveBeenCalled();
  });

  it("Deve passar opcoes adicionais para fetch", async () => {
    const mockResponse = { ok: true } as Response;
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const options: FetchWithTimeoutOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    await fetchWithTimeout("https://api.example.com/data", options);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/data",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: expect.any(AbortSignal),
      })
    );
  });

  it("Deve abortar apos timeout", async () => {
    jest.useFakeTimers();

    let fetchResolve: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      fetchResolve = resolve;
    });
    (global.fetch as jest.Mock).mockReturnValue(fetchPromise);

    const options: FetchWithTimeoutOptions = { timeoutMs: 1000 };
    const fetchCall = fetchWithTimeout("https://api.example.com/data", options);

    jest.advanceTimersByTime(1000);

    jest.useRealTimers();
  });

  it("Deve limpar timeout quando fetch completa com sucesso", async () => {
    const mockResponse = { ok: true } as Response;
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    await fetchWithTimeout("https://api.example.com/data");

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
