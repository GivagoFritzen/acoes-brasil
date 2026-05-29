import { FundamentusScraperService } from "./FundamentusScraperService";

global.fetch = jest.fn() as any;

describe("FundamentusScraperService", () => {
  let service: FundamentusScraperService;

  beforeEach(() => {
    service = new FundamentusScraperService();
    jest.clearAllMocks();
  });

  it("Deve retornar detalhes quando ativo encontrado", async () => {
    const htmlResposta = `
      <td class="label">Empresa</td>
      <td class="data">VALE S.A.</td>
      <td class="label">Setor</td>
      <td class="data">Mineração</td>
      <td class="label">Subsetor</td>
      <td class="data">Minerais Metálicos</td>
      <td class="label">Cotação</td>
      <td class="data">50,00</td>
    `;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode(htmlResposta).buffer,
    });

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.codigo).toBe("VALE3");
    expect(resultado.empresa).toBe("VALE S.A.");
  });

  it("Deve lancar erro quando ativo nao encontrado", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode("papel inexistente").buffer,
    });

    await expect(service.scrapeAsync("INVALID")).rejects.toThrow();
  });

  it("Deve lancar erro quando resposta nao ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(service.scrapeAsync("VALE3")).rejects.toThrow();
  });
});