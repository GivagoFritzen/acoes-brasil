import { FundamentusProventosScraperService } from "./FundamentusProventosScraperService";

global.fetch = jest.fn() as any;

function htmlComProventos(rows: string[]): string {
  return `<html><body><table><tbody>${rows.join("")}</tbody></table></body></html>`;
}

function linhaProvento(data: string, valor: string, tipo: string): string {
  return `<tr><td>${data}</td><td>${valor}</td><td>${tipo}</td></tr>`;
}

describe("FundamentusProventosScraperService", () => {
  let service: FundamentusProventosScraperService;

  beforeEach(() => {
    service = new FundamentusProventosScraperService();
    jest.clearAllMocks();
  });

  it("Deve retornar proventos quando HTML contem dados validos", async () => {
    const html = htmlComProventos([
      linhaProvento("01/01/2024", "R$ 1,50", "DIVIDENDO"),
      linhaProvento("15/02/2024", "R$ 0,75", "JCP"),
    ]);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode(html).buffer,
    });

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.codigo).toBe("VALE3");
    expect(resultado.proventos).toHaveLength(2);
    expect(resultado.proventos[0]).toEqual({ data: "01/01/2024", valor: "R$ 1,50", tipo: "DIVIDENDO" });
    expect(resultado.proventos[1]).toEqual({ data: "15/02/2024", valor: "R$ 0,75", tipo: "JCP" });
    expect(resultado.updatedAt).toBeDefined();
  });

  it("Deve lancar erro quando resposta nao ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(service.scrapeAsync("VALE3")).rejects.toThrow(
      "Falha ao consultar Fundamentus proventos para o ativo VALE3."
    );
  });

  it("Deve retornar lista vazia quando HTML nao contem tbody", async () => {
    const html = "<html><body><table></table></body></html>";

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode(html).buffer,
    });

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.proventos).toEqual([]);
  });

  it("Deve ignorar linhas com data invalida", async () => {
    const html = htmlComProventos([
      linhaProvento("01/01/2024", "R$ 1,50", "DIVIDENDO"),
      linhaProvento("data-invalida", "R$ 2,00", "RENDIMENTO"),
    ]);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode(html).buffer,
    });

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.proventos).toHaveLength(1);
    expect(resultado.proventos[0].data).toBe("01/01/2024");
  });

  it("Deve ignorar linhas com celulas insuficientes", async () => {
    const html = `<html><body><table><tbody>
      <tr><td>01/01/2024</td><td>R$ 1,50</td><td>DIVIDENDO</td></tr>
      <tr><td>So uma celula</td></tr>
    </tbody></table></body></html>`;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode(html).buffer,
    });

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.proventos).toHaveLength(1);
  });

  it("Deve limpar tags HTML dentro das celulas", async () => {
    const html = `<html><body><table><tbody>
      <tr><td><span>01/01/2024</span></td><td><b>R$ 1,50</b></td><td>DIVIDENDO</td></tr>
    </tbody></table></body></html>`;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode(html).buffer,
    });

    const resultado = await service.scrapeAsync("VALE3");

    expect(resultado.proventos).toHaveLength(1);
    expect(resultado.proventos[0]).toEqual({ data: "01/01/2024", valor: "R$ 1,50", tipo: "DIVIDENDO" });
  });

  it("Deve normalizar codigo com sufixo F para Fundamentus", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode("<html></html>").buffer,
    });

    await service.scrapeAsync("MULT3F");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("papel=MULT3"),
      expect.any(Object)
    );
  });

  it("Deve chamar fetch com tipo=2 na URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      arrayBuffer: async () => new TextEncoder().encode("<html></html>").buffer,
    });

    await service.scrapeAsync("VALE3");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("tipo=2"),
      expect.any(Object)
    );
  });
});
