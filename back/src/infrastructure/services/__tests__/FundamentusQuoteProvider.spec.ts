import { FundamentusQuoteProvider } from "../FundamentusQuoteProvider";

global.fetch = jest.fn() as any;

describe("FundamentusQuoteProvider", () => {
  let service: FundamentusQuoteProvider;

  beforeEach(() => {
    service = new FundamentusQuoteProvider();
    jest.clearAllMocks();
  });

  it("Deve chamar fetch com url correta", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode("").buffer,
    });

    await service.getQuoteAsync("VALE3");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("papel=VALE3"),
      expect.any(Object)
    );
  });

  it("Deve retornar null quando resposta nao ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const resultado = await service.getQuoteAsync("VALE3");

    expect(resultado).toBeNull();
  });
});