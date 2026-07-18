import { Investidor10ScraperService } from "./Investidor10ScraperService";

global.fetch = jest.fn() as jest.Mock;

interface Investidor10ServiceTest {
  parseRevenueData(html: string): object[];
  extractStockId(html: string): string | null;
  fetchHistoricoIndicadoresAsync(stockId: string): object[];
  extractJSObject(html: string, varName: string): string | null;
  sanitizeJSON(json: string): string;
  mapRegioes(data: object | null): object[];
  mapNegocios(data: object | null): object[];
}

describe("Investidor10ScraperService", () => {
  let service: Investidor10ScraperService;

  beforeEach(() => {
    service = new Investidor10ScraperService();
    jest.clearAllMocks();
  });

  it("Deve retornar detalhes quando ativo encontrado", async () => {
    const htmlResposta = `
      <div class="sub-especial" id="data_about">
        <div class="header"><h2>DADOS SOBRE A EMPRESA</h2></div>
        <div class="content">
          <table>
            <tr><td>Nome da Empresa:</td><td class='value'>VIVO - TELEFÔNICA BRASIL</td></tr>
            <tr><td>CNPJ:</td><td class='value'>02.558.157/0001-62</td></tr>
          </table>
        </div>
      </div>
      <div class="sub-especial" id="info_about">
        <div class="header"><h2>INFORMAÇÕES SOBRE A EMPRESA</h2></div>
        <div class="content">
          <div class="table grid-3" id="table-indicators-company">
            <div class="cell"><span class="title">Valor de mercado</span><span class="value"><div class="simple-value">R$ 111,96 Bilhões</div></span></div>
            <div class="cell"><span class="title">Valor de firma</span><span class="value"><div class="simple-value">R$ 122,68 Bilhões</div></span></div>
          </div>
        </div>
      </div>
      <div class="box especial" id="indicators_basileia">
        <div id="indicators">
          <header><h2>INDICADORES <span class="desktop">FUNDAMENTALISTAS</span> VIVT3</h2></header>
          <div class="content">
            <div id="table-indicators" class="table table-bordered outter-borderless">
              <div class="cell" style="padding: 15px 0px 20px 15px;">
                <span class="d-flex" style="color: #999; font-size: 14px; width: 100%">P/L</span>
                <div class="value" style="margin-top: 10px; width: 100%; padding-right: 0px"><span>17,57</span></div>
              </div>
              <div class="cell" style="padding: 15px 0px 20px 15px;">
                <span class="d-flex" style="color: #999; font-size: 14px; width: 100%">P/VP</span>
                <div class="value" style="margin-top: 10px; width: 100%; padding-right: 0px"><span>1,61</span></div>
              </div>
              <div class="cell" style="padding: 15px 0px 20px 15px;">
                <span class="d-flex" style="color: #999; font-size: 14px; width: 100%">Dividend Yield</span>
                <div class="value" style="margin-top: 10px; width: 100%; padding-right: 0px"><span>3,82%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      text: async () => htmlResposta,
    });

    const resultado = await service.scrapeAsync("VIVT3");

    expect(resultado.codigo).toBe("VIVT3");
    expect(resultado.empresa).toBe("VIVO - TELEFÔNICA BRASIL");
    expect(resultado.dadosSobreEmpresa.length).toBe(2);
    expect(resultado.informacoesSobreEmpresa.length).toBe(2);
    expect(resultado.indicadoresFundamentalistas.length).toBe(3);
    expect(resultado.indicadoresFundamentalistas[0].label).toBe("P/L");
    expect(resultado.indicadoresFundamentalistas[0].value).toBe("17,57");
    expect(resultado.receitas).toEqual([]);
  });

  it("Deve lancar erro quando ativo nao encontrado", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      text: async () => "<html> papel inexistente </html>",
    });

    await expect(service.scrapeAsync("INVALID")).rejects.toThrow();
  });

  it("Deve lancar erro quando resposta nao ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(service.scrapeAsync("VIVT3")).rejects.toThrow();
  });

  it("Deve retornar empresa null quando dadosSobreEmpresa vazio", async () => {
    const htmlResposta = `
      <div class="sub-especial" id="info_about">
        <div class="content">
          <div class="table grid-3" id="table-indicators-company">
            <div class="cell"><span class="title">Valor de mercado</span><span class="value">R$ 100 Bi</span></div>
          </div>
        </div>
      </div>
    `;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      text: async () => htmlResposta,
    });

    const resultado = await service.scrapeAsync("VIVT3");
    expect(resultado.empresa).toBeNull();
  });

  describe("scrapeDividendosAsync", () => {
    it("deve retornar proventos quando tabela existe", async () => {
      const html = `
        <table id="table-dividends-history">
          <tr><td>Juros sobre Capital Próprio</td><td>20/06/2024</td><td>20/06/2024</td><td>1,50</td></tr>
          <tr><td>Dividendo</td><td>15/01/2024</td><td>15/01/2024</td><td>0,75</td></tr>
        </table>
      `;
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: { get: () => "text/html" },
        text: async () => html,
      });

      const resultado = await service.scrapeDividendosAsync("VIVT3");

      expect(resultado.codigo).toBe("VIVT3");
      expect(resultado.proventos.length).toBe(2);
      expect(resultado.proventos[0].tipo).toBe("Juros sobre Capital Próprio");
      expect(resultado.proventos[0].valor).toBe("1.50");
      expect(resultado.proventos[1].tipo).toBe("Dividendo");
    });

    it("deve lancar erro quando fetch retorna null", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(service.scrapeDividendosAsync("VIVT3")).rejects.toThrow(
        "Falha ao consultar Investidor10 para o ativo VIVT3."
      );
    });

    it("deve retornar array vazio quando tabela de proventos nao existe", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: { get: () => "text/html" },
        text: async () => "<html><body>sem tabela</body></html>",
      });

      const resultado = await service.scrapeDividendosAsync("VIVT3");

      expect(resultado.proventos).toEqual([]);
    });

    it("deve pular linhas com menos de 4 colunas", async () => {
      const html = `
        <table id="table-dividends-history">
          <tr><td>col1</td><td>col2</td></tr>
        </table>
      `;
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: { get: () => "text/html" },
        text: async () => html,
      });

      const resultado = await service.scrapeDividendosAsync("VIVT3");

      expect(resultado.proventos).toEqual([]);
    });
  });

  describe("parseRevenueData", () => {
    it("deve extrair receitas do HTML com objetos JS", async () => {
      const html = `
        <script>
          let companyRevenues = {"2023":{"totalRevenue":1000,"company_revenue_country":[{"name":"Brasil","pivot":{"percentage":60}},{"name":"EUA","pivot":{"percentage":40}}]}};
          let companyBussinesRevenues = {"2023":{"company_revenue_bussines":[{"bussines":"Telecom","percentage":70},{"bussines":"Digital","percentage":30}]}};
        </script>
      `;
      const resultado = (service as Investidor10ServiceTest).parseRevenueData(html);

      expect(resultado.length).toBe(1);
      expect(resultado[0].ano).toBe(2023);
      expect(resultado[0].receitaTotal).toBe("1000");
      expect(resultado[0].regioes.length).toBe(2);
      expect(resultado[0].regioes[0].nome).toBe("Brasil");
      expect(resultado[0].regioes[0].porcentagem).toBe(60);
      expect(resultado[0].negocios.length).toBe(2);
      expect(resultado[0].negocios[0].nome).toBe("Telecom");
      expect(resultado[0].negocios[0].porcentagem).toBe(70);
    });

    it("deve retornar array vazio quando JS objects nao encontrados", () => {
      const resultado = (service as Investidor10ServiceTest).parseRevenueData("<html></html>");
      expect(resultado).toEqual([]);
    });

    it("deve retornar array vazio quando JSON invalido", () => {
      const html = `
        <script>
          let companyRevenues = {invalid};
          let companyBussinesRevenues = {invalid};
        </script>
      `;
      const resultado = (service as Investidor10ServiceTest).parseRevenueData(html);
      expect(resultado).toEqual([]);
    });

    it("deve ignorar entradas sem dados", () => {
      const html = `
        <script>
          let companyRevenues = {"2023":null};
          let companyBussinesRevenues = {"2023":null};
        </script>
      `;
      const resultado = (service as Investidor10ServiceTest).parseRevenueData(html);
      expect(resultado).toEqual([]);
    });

    it("deve retornar array vazio quando company_revenue_country nao e array", () => {
      const html = `
        <script>
          let companyRevenues = {"2023":{"totalRevenue":500}};
          let companyBussinesRevenues = {"2023":{"company_revenue_bussines":[]}};
        </script>
      `;
      const resultado = (service as Investidor10ServiceTest).parseRevenueData(html);
      expect(resultado.length).toBe(1);
      expect(resultado[0].regioes).toEqual([]);
    });

    it("deve retornar negocios vazio quando company_revenue_bussines nao e array", () => {
      const html = `
        <script>
          let companyRevenues = {"2023":{"totalRevenue":500,"company_revenue_country":[]}};
          let companyBussinesRevenues = {"2023":{}};
        </script>
      `;
      const resultado = (service as Investidor10ServiceTest).parseRevenueData(html);
      expect(resultado.length).toBe(1);
      expect(resultado[0].negocios).toEqual([]);
    });

    it("deve ordenar anos do mais recente para o mais antigo", () => {
      const html = `
        <script>
          let companyRevenues = {"2022":{"totalRevenue":200,"company_revenue_country":[]},"2024":{"totalRevenue":400,"company_revenue_country":[]},"2023":{"totalRevenue":300,"company_revenue_country":[]}};
          let companyBussinesRevenues = {"2022":[],"2024":[],"2023":[]};
        </script>
      `;
      const resultado = (service as Investidor10ServiceTest).parseRevenueData(html);
      expect(resultado.map((r: object) => (r as Record<string, object>).ano)).toEqual([2024, 2023, 2022]);
    });
  });

  describe("fetchHistoricoIndicadoresAsync", () => {
    const baseHtml = `
      <div class="sub-especial" id="data_about">
        <div class="content">
          <table><tr><td>Nome da Empresa:</td><td class='value'>Teste</td></tr></table>
        </div>
      </div>
      <div class="sub-especial" id="info_about">
        <div class="content">
          <div class="table grid-3" id="table-indicators-company">
            <div class="cell"><span class="title">Valor</span><span class="value">R$ 100</span></div>
          </div>
        </div>
      </div>
      <div id="table-indicators" class="table">
        <div class="cell"><span class="d-flex">P/L</span><div class="value"><span>10</span></div></div>
      </div>
      <div data-id="12345"></div>
    `;

    it("deve retornar historico quando data-id e fetch de JSON funcionam", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => "text/html" },
          text: async () => baseHtml,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify({
            "P/L": [
              { year: "2024", value: "15.5", type: "numeric" },
              { year: "2023", value: "12.3", type: "numeric" },
            ],
            "Dividend Yield": [
              { year: "2024", value: "5.2", type: "percent" },
            ],
          }),
        });

      const resultado = await service.scrapeAsync("VIVT3");

      expect(resultado.historicoIndicadores.length).toBe(2);
      expect(resultado.historicoIndicadores[0].indicador).toBe("P/L");
      expect(resultado.historicoIndicadores[0].valores.length).toBe(2);
      expect(resultado.historicoIndicadores[0].valores[0].ano).toBe(2024);
      expect(resultado.historicoIndicadores[0].valores[0].valor).toBe(15.5);
      expect(resultado.historicoIndicadores[0].valores[0].tipo).toBe("numeric");
      expect(resultado.historicoIndicadores[1].valores[0].tipo).toBe("percent");
    });

    it("deve retornar historico vazio quando fetch de JSON retorna null", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => "text/html" },
          text: async () => baseHtml,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => "",
        });

      const resultado = await service.scrapeAsync("VIVT3");

      expect(resultado.historicoIndicadores).toEqual([]);
    });

    it("deve pular entradas que nao sao array no JSON", async () => {
      const stockId = (service as Investidor10ServiceTest).extractStockId(`<div data-id="12345">`);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          "P/L": "nao-e-array",
          "VPA": [{ year: "2024", value: "10", type: "numeric" }],
        }),
      });

      const resultado = await (service as Investidor10ServiceTest).fetchHistoricoIndicadoresAsync(stockId);

      expect(resultado.length).toBe(1);
      expect(resultado[0].indicador).toBe("VPA");
    });
  });

  describe("extractJSObject", () => {
    it("deve retornar null quando varName nao encontrado", () => {
      const resultado = (service as Investidor10ServiceTest).extractJSObject("<html></html>", "inexistente");
      expect(resultado).toBeNull();
    });

    it("deve retornar null quando chave de abertura nao encontrada", () => {
      const resultado = (service as Investidor10ServiceTest).extractJSObject("let foo = bar", "foo");
      expect(resultado).toBeNull();
    });

    it("deve extrair objeto JS com strings escapadas", () => {
      const html = `let foo = {"key":"value with \\"quote\\" inside"}`;
      const resultado = (service as Investidor10ServiceTest).extractJSObject(html, "foo");
      expect(resultado).toBe('{"key":"value with \\"quote\\" inside"}');
    });
  });

  describe("sanitizeJSON", () => {
    it("deve remover virgula antes de colchete de fechamento", () => {
      const resultado = (service as Investidor10ServiceTest).sanitizeJSON('{"a":1,}');
      expect(resultado).toBe('{"a":1}');
    });

    it("deve remover virgula antes de chave de fechamento", () => {
      const resultado = (service as Investidor10ServiceTest).sanitizeJSON('[1,2,3,]');
      expect(resultado).toBe('[1,2,3]');
    });
  });

  describe("mapRegioes", () => {
    it("deve retornar array vazio quando data e null", () => {
      const resultado = (service as Investidor10ServiceTest).mapRegioes(null);
      expect(resultado).toEqual([]);
    });

    it("deve filtrar itens sem pivot.percentage", () => {
      const data = {
        company_revenue_country: [
          { name: "Brasil", pivot: { percentage: 50 } },
          { name: "SemPivot", pivot: null },
          { name: "SemPercentage", pivot: {} },
        ],
      };
      const resultado = (service as Investidor10ServiceTest).mapRegioes(data);
      expect(resultado.length).toBe(1);
      expect(resultado[0].nome).toBe("Brasil");
    });
  });

  describe("mapNegocios", () => {
    it("deve retornar array vazio quando bussinesData e null", () => {
      const resultado = (service as Investidor10ServiceTest).mapNegocios(null);
      expect(resultado).toEqual([]);
    });

    it("deve retornar array vazio quando company_revenue_bussines nao e array", () => {
      const resultado = (service as Investidor10ServiceTest).mapNegocios({});
      expect(resultado).toEqual([]);
    });
  });

  describe("extractStockId", () => {
    it("deve retornar null quando nao ha data-id", () => {
      const resultado = (service as Investidor10ServiceTest).extractStockId("<html></html>");
      expect(resultado).toBeNull();
    });
  });
});
