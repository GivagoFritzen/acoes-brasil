import { Investidor10ScraperService } from "./Investidor10ScraperService";
import type { Investidor10ServiceTest } from "../../models/Investidor10ServiceTest";
import type { Investidor10FiiDetails } from "../../../../common/models/investidor10";

global.fetch = jest.fn() as jest.Mock;

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
    expect((resultado as any).receitas).toEqual([]);
  });

  it("Deve retornar detalhes de FII quando codigo termina com 11", async () => {
    const htmlResposta = `
      <div class="sub-especial" id="data_about">
        <div class="header"><h2>DADOS SOBRE O FUNDO</h2></div>
        <div class="content">
          <table>
            <tr><td>Nome do Fundo:</td><td class='value'>XP LOG FUNDO DE INVESTIMENTO IMOBILIÁRIO</td></tr>
            <tr><td>CNPJ:</td><td class='value'>26.502.794/0001-85</td></tr>
          </table>
        </div>
      </div>
      <div class="sub-especial" id="info_about">
        <div class="header"><h2>INFORMAÇÕES SOBRE O FUNDO</h2></div>
        <div class="content">
          <div class="table grid-3" id="table-indicators-company">
            <div class="cell"><span class="title">Valor de mercado</span><span class="value"><div class="simple-value">R$ 5,4 Bi</div></span></div>
            <div class="cell"><span class="title">Valor patrimonial</span><span class="value"><div class="simple-value">R$ 5,4 Bi</div></span></div>
          </div>
        </div>
      </div>
      <div class="box especial" id="indicators_basileia">
        <div id="indicators">
          <header><h2>INDICADORES <span class="desktop">FUNDAMENTALISTAS</span> XPLG11</h2></header>
          <div class="content">
            <div id="table-indicators" class="table table-bordered outter-borderless">
              <div class="cell" style="padding: 15px 0px 20px 15px;">
                <span class="d-flex" style="color: #999; font-size: 14px; width: 100%">P/VP</span>
                <div class="value" style="margin-top: 10px; width: 100%; padding-right: 0px"><span>0,87</span></div>
              </div>
              <div class="cell" style="padding: 15px 0px 20px 15px;">
                <span class="d-flex" style="color: #999; font-size: 14px; width: 100%">Dividend Yield</span>
                <div class="value" style="margin-top: 10px; width: 100%; padding-right: 0px"><span>9,50%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sub-especial" id="properties-section" style="padding-bottom: 15px">
        <div class="header">
          <span class="icon"><img src="" alt="Cotação"></span>
          <h2>Lista de Imóveis</h2>
        </div>
        <div class="content">
          <div class="read-more" id="container-properties">
            <div class="row">
              <div class="col-6">
                <div class="card-propertie">
                  <i class="fas fa-building"></i>
                  <div>
                    <h3>CD PIRACICABA II</h3>
                    <small>Estado: São Paulo</small><br/>
                    <small>Área bruta locável: 161.340,00 m²</small>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="card-propertie">
                  <i class="fas fa-building"></i>
                  <div>
                    <h3>CD LEROY</h3>
                    <small>Estado: Minas Gerais</small><br/>
                    <small>Área bruta locável: 85.000,00 m²</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="about-company" style="padding-bottom: 20px">
        <header>
          <span class="icon"><img src="" alt="Sobre a empresa"></span>
          <h2>INFORMAÇÕES SOBRE XPLG11</h2>
        </header>
        <div class="content">
          <div id="table-indicators" class="table table-bordered outter-borderless table-info-fii" style="--column-count: 2">
            <div class="cell">
              <div class="icon"><i class="fas fa-info-circle"></i></div>
              <div class="desc">
                <span class="d-flex justify-content-between align-items-center name">Razão Social</span>
                <div class="value"><span>XP LOG FUNDO DE INVESTIMENTO IMOBILIÁRIO</span></div>
              </div>
            </div>
            <div class="cell">
              <div class="icon"><i class="fas fa-info-circle"></i></div>
              <div class="desc">
                <span class="d-flex justify-content-between align-items-center name">CNPJ</span>
                <div class="value"><span>26.502.794/0001-85</span></div>
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

    const resultado = await service.scrapeAsync("XPLG11");

    expect(resultado.codigo).toBe("XPLG11");
    expect(resultado.empresa).toBe("XP LOG FUNDO DE INVESTIMENTO IMOBILIÁRIO");
    expect(resultado.dadosSobreEmpresa.length).toBe(2);
    expect(resultado.informacoesSobreEmpresa.length).toBe(2);
    expect(resultado.indicadoresFundamentalistas.length).toBe(2);
    expect(resultado.indicadoresFundamentalistas[0].label).toBe("P/VP");
    expect(resultado.indicadoresFundamentalistas[0].value).toBe("0,87");

    const fiiResultado = resultado as Investidor10FiiDetails;
    expect(fiiResultado.imoveis).toHaveLength(2);
    expect(fiiResultado.imoveis[0].nome).toBe("CD PIRACICABA II");
    expect(fiiResultado.imoveis[0].estado).toBe("São Paulo");
    expect(fiiResultado.imoveis[0].areaBrutaLocavel).toBe("161.340,00 m²");
    expect(fiiResultado.imoveis[1].nome).toBe("CD LEROY");
    expect(fiiResultado.imoveis[1].estado).toBe("Minas Gerais");
    expect(fiiResultado.imoveis[1].areaBrutaLocavel).toBe("85.000,00 m²");

    expect(fiiResultado.informacoesFii).toHaveLength(3);
    expect(fiiResultado.informacoesFii[0].label).toBe("Razão Social");
    expect(fiiResultado.informacoesFii[0].value).toBe("XP LOG FUNDO DE INVESTIMENTO IMOBILIÁRIO");
    expect(fiiResultado.informacoesFii[1].label).toBe("CNPJ");
    expect(fiiResultado.informacoesFii[1].value).toBe("26.502.794/0001-85");
    expect(fiiResultado.informacoesFii[2].label).toBe("CNPJ");
    expect(fiiResultado.informacoesFii[2].value).toBe("26.502.794/0001-85");

    expect((fiiResultado as any).receitas).toBeUndefined();
  });

  it("Deve retornar historico de indicadores para FII quando data-id e fetch de JSON funcionam", async () => {
    const htmlResposta = `
      <div class="sub-especial" id="data_about">
        <div class="content">
          <table><tr><td>Nome do Fundo:</td><td class='value'>Teste</td></tr></table>
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
        <div class="cell"><span class="d-flex">P/VP</span><div class="value"><span>1</span></div></div>
      </div>
      <div data-id="12345"></div>
    `;
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "text/html" },
        text: async () => htmlResposta,
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          "Valor de Mercado": [
            { year: "2025", value: "4690000000", type: "numeric" },
            { year: "2024", value: "3300000000", type: "numeric" },
            { year: "2023", value: "2930000000", type: "numeric" },
            { year: "2022", value: "3220000000", type: "numeric" },
            { year: "2021", value: "2670000000", type: "numeric" },
            { year: "2020", value: "2420000000", type: "numeric" },
          ],
          "P/VP": [
            { year: "2025", value: "0.87", type: "numeric" },
            { year: "2024", value: "1.00", type: "numeric" },
            { year: "2023", value: "0.84", type: "numeric" },
            { year: "2022", value: "0.98", type: "numeric" },
            { year: "2021", value: "0.86", type: "numeric" },
            { year: "2020", value: "0.80", type: "numeric" },
          ],
          "Dividend Yield": [
            { year: "2025", value: "10.74", type: "percent" },
            { year: "2024", value: "9.90", type: "percent" },
            { year: "2023", value: "9.14", type: "percent" },
            { year: "2022", value: "8.73", type: "percent" },
            { year: "2021", value: "8.42", type: "percent" },
            { year: "2020", value: "6.94", type: "percent" },
          ],
          "Liquidez Diária": [
            { year: "2025", value: "11170000", type: "numeric" },
            { year: "2024", value: "3650000", type: "numeric" },
            { year: "2023", value: "5370000", type: "numeric" },
            { year: "2022", value: "5600000", type: "numeric" },
            { year: "2021", value: "3600000", type: "numeric" },
            { year: "2020", value: "0", type: "numeric" },
          ],
          "Valor Patrimonial": [
            { year: "2025", value: "5400000000", type: "numeric" },
            { year: "2024", value: "3300000000", type: "numeric" },
            { year: "2023", value: "3500000000", type: "numeric" },
            { year: "2022", value: "3280000000", type: "numeric" },
            { year: "2021", value: "3100000000", type: "numeric" },
            { year: "2020", value: "3020000000", type: "numeric" },
          ],
          "Val. Patrimonial p/ Cota": [
            { year: "2025", value: "105.03", type: "numeric" },
            { year: "2024", value: "105.91", type: "numeric" },
            { year: "2023", value: "112.12", type: "numeric" },
            { year: "2022", value: "110.84", type: "numeric" },
            { year: "2021", value: "114.56", type: "numeric" },
            { year: "2020", value: "111.29", type: "numeric" },
          ],
          "Vacância": [
            { year: "2025", value: "8.10", type: "percent" },
            { year: "2024", value: "4.60", type: "percent" },
            { year: "2023", value: "1.50", type: "percent" },
            { year: "2022", value: "2.30", type: "percent" },
            { year: "2021", value: "6.80", type: "percent" },
            { year: "2020", value: "9.00", type: "percent" },
          ],
          "Número de Cotistas": [
            { year: "2025", value: "347000", type: "numeric" },
            { year: "2024", value: "335000", type: "numeric" },
            { year: "2023", value: "344000", type: "numeric" },
            { year: "2022", value: "315000", type: "numeric" },
            { year: "2021", value: "303000", type: "numeric" },
            { year: "2020", value: "275000", type: "numeric" },
          ],
          "Cotas Emitidas": [
            { year: "2025", value: "51000000", type: "numeric" },
            { year: "2024", value: "31000000", type: "numeric" },
            { year: "2023", value: "31000000", type: "numeric" },
            { year: "2022", value: "30000000", type: "numeric" },
            { year: "2021", value: "27000000", type: "numeric" },
          ],
        }),
      });

    const resultado = await service.scrapeAsync("XPLG11");

    expect(resultado.historicoIndicadores.length).toBe(9);
    expect(resultado.historicoIndicadores[0].indicador).toBe("Valor de Mercado");
    expect(resultado.historicoIndicadores[0].valores.length).toBe(6);
    expect(resultado.historicoIndicadores[0].valores[0].ano).toBe(2025);
    expect(resultado.historicoIndicadores[0].valores[0].valor).toBe(4690000000);
    expect(resultado.historicoIndicadores[0].valores[0].tipo).toBe("numeric");
    expect(resultado.historicoIndicadores[1].indicador).toBe("P/VP");
    expect(resultado.historicoIndicadores[2].indicador).toBe("Dividend Yield");
    expect(resultado.historicoIndicadores[2].valores[0].tipo).toBe("percent");
    expect(resultado.historicoIndicadores[3].indicador).toBe("Liquidez Diária");
    expect(resultado.historicoIndicadores[4].indicador).toBe("Valor Patrimonial");
    expect(resultado.historicoIndicadores[5].indicador).toBe("Val. Patrimonial p/ Cota");
    expect(resultado.historicoIndicadores[6].indicador).toBe("Vacância");
    expect(resultado.historicoIndicadores[7].indicador).toBe("Número de Cotistas");
    expect(resultado.historicoIndicadores[8].indicador).toBe("Cotas Emitidas");
  });

  it("Deve retornar imoveis vazios quando secao nao existe", async () => {
    const htmlResposta = `
      <div class="sub-especial" id="data_about">
        <div class="content">
          <table><tr><td>Nome do Fundo:</td><td class='value'>Teste</td></tr></table>
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
        <div class="cell"><span class="d-flex">P/VP</span><div class="value"><span>1</span></div></div>
      </div>
    `;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      text: async () => htmlResposta,
    });

    const resultado = await service.scrapeAsync("XPLG11");

    expect((resultado as Investidor10FiiDetails).imoveis).toEqual([]);
    expect((resultado as Investidor10FiiDetails).informacoesFii).toEqual([]);
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

    it("deve filtrar entradas com year Atual para evitar NaN", async () => {
      const stockId = (service as Investidor10ServiceTest).extractStockId(`<div data-id="12345">`);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          "P/VP": [
            { year: "Atual", key: "p_vp", value: 0.87, type: "decimal" },
            { year: "2025", value: "0.85", type: "numeric" },
            { year: "2024", value: "1.00", type: "numeric" },
          ],
          "Dividend Yield": [
            { year: "Atual", key: "dy", value: 10.74, type: "percent" },
            { year: "2025", value: "10.5", type: "percent" },
          ],
        }),
      });

      const resultado = await (service as Investidor10ServiceTest).fetchHistoricoIndicadoresAsync(stockId);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].indicador).toBe("P/VP");
      expect(resultado[0].valores).toHaveLength(2);
      expect(resultado[0].valores[0].ano).toBe(2025);
      expect(resultado[0].valores[0].valor).toBe(0.85);
      expect(resultado[0].valores[1].ano).toBe(2024);
      expect(resultado[0].valores[1].valor).toBe(1);
      expect(resultado[1].indicador).toBe("Dividend Yield");
      expect(resultado[1].valores).toHaveLength(1);
      expect(resultado[1].valores[0].ano).toBe(2025);
      expect(resultado[1].valores[0].valor).toBe(10.5);
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

  describe("parseFiiCardsTicker", () => {
    it("deve extrair cotacao, dy, pvp e liquidez dos cards", () => {
      const html = `
        <section id="cards-ticker">
          <div class="_card cotacao">
            <div class="_card-header"><div><span>XPLG11 Cotação</span></div></div>
            <div class="_card-body">
              <div><span class="value">R$ 91,28</span></div>
              <span class="daily-variation-badge">0,33%</span>
            </div>
          </div>
          <div class="_card dy">
            <div class="_card-header"><div><span>XPLG11 DY (12M)</span></div></div>
            <div class="_card-body"><div><span>10,74%</span></div><i class="fas fa-question-circle"></i></div>
          </div>
          <div class="_card vp">
            <div class="_card-header"><div><span>P/VP</span></div></div>
            <div class="_card-body"><span>0,87</span><i class="fas fa-question-circle"></i></div>
          </div>
          <div class="_card val">
            <div class="_card-header"><div><span>Liquidez Diária</span></div></div>
            <div class="_card-body"><span>R$ 11,17 M</span><i class="fas fa-question-circle"></i></div>
          </div>
        </section>
      `;
      const resultado = (service as Investidor10ServiceTest).parseFiiCardsTicker(html);
      expect(resultado.get("cotacao")).toBe("R$ 91,28");
      expect(resultado.get("dy")).toBe("10,74%");
      expect(resultado.get("vp")).toBe("0,87");
      expect(resultado.get("val")).toBe("R$ 11,17 M");
    });

    it("deve retornar Map vazio quando secao cards-ticker nao existe", () => {
      const resultado = (service as Investidor10ServiceTest).parseFiiCardsTicker("<html></html>");
      expect(resultado.size).toBe(0);
    });

    it("deve ignorar cards com body vazio", () => {
      const html = `
        <section id="cards-ticker">
          <div class="_card cotacao">
            <div class="_card-header"><span>Cotação</span></div>
            <div class="_card-body"></div>
          </div>
        </section>
      `;
      const resultado = (service as Investidor10ServiceTest).parseFiiCardsTicker(html);
      expect(resultado.size).toBe(0);
    });
  });

  describe("parseFiiIndicadoresFundamentalistas", () => {
    
    it("deve retornar 9 indicadores com dados completos", () => {
      const html = `
        <section id="cards-ticker">
          <div class="_card cotacao">
            <div class="_card-body"><div><span class="value">R$ 91,28</span></div></div>
          </div>
          <div class="_card dy">
            <div class="_card-body"><span>10,74%</span></div>
          </div>
          <div class="_card vp">
            <div class="_card-body"><span>0,87</span></div>
          </div>
          <div class="_card val">
            <div class="_card-body"><span>R$ 11,17 M</span></div>
          </div>
        </section>
      `;
      const informacoesFii: Investidor10InformacaoFii[] = [
        { label: "VACÂNCIA", value: "8,10%" },
        { label: "NUMERO DE COTISTAS", value: "347.299" },
        { label: "COTAS EMITIDAS", value: "51.390.086" },
        { label: "VAL. PATRIMONIAL P/ COTA", value: "R$ 105,03" },
        { label: "VALOR PATRIMONIAL", value: "R$ 5,40 Bilhões" },
      ];
      const historicoIndicadores: Investidor10HistoricoIndicador[] = [
        {
          indicador: "P/VP",
          valores: [
            { ano: 2025, valor: 0.85, tipo: "numeric" },
            { ano: 2024, valor: 1.00, tipo: "numeric" },
            { ano: 2023, valor: 0.84, tipo: "numeric" },
            { ano: 2022, valor: 0.98, tipo: "numeric" },
            { ano: 2021, valor: 0.86, tipo: "numeric" },
          ],
        },
        {
          indicador: "Dividend Yield",
          valores: [
            { ano: 2025, valor: 10.5, tipo: "percent" },
            { ano: 2024, valor: 9.9, tipo: "percent" },
            { ano: 2023, valor: 9.14, tipo: "percent" },
            { ano: 2022, valor: 8.73, tipo: "percent" },
            { ano: 2021, valor: 8.42, tipo: "percent" },
          ],
        },
      ];

      const resultado = (service as Investidor10ServiceTest).parseFiiIndicadoresFundamentalistas(
        html, informacoesFii, historicoIndicadores
      );

      expect(resultado).toHaveLength(9);
      expect(resultado[0].nome).toBe("Valor de Mercado");
      expect(resultado[1].nome).toBe("P/VP");
      expect(resultado[2].nome).toBe("Dividend Yield");
      expect(resultado[3].nome).toBe("Liquidez Diária");
      expect(resultado[4].nome).toBe("Valor Patrimonial");
      expect(resultado[5].nome).toBe("Val. Patrimonial p/ Cota");
      expect(resultado[6].nome).toBe("Vacância");
      expect(resultado[7].nome).toBe("Nº Cotistas");
      expect(resultado[8].nome).toBe("Cotas Emitidas");
    });

    it("deve ter periodo Atual quando historico esta vazio", () => {
      const html = `
        <section id="cards-ticker">
          <div class="_card cotacao"><div class="_card-body"><span class="value">R$ 91,28</span></div></div>
          <div class="_card dy"><div class="_card-body"><span>10,74%</span></div></div>
          <div class="_card vp"><div class="_card-body"><span>0,87</span></div></div>
          <div class="_card val"><div class="_card-body"><span>R$ 11,17 M</span></div></div>
        </section>
      `;
      const informacoesFii: Investidor10InformacaoFii[] = [
        { label: "VACÂNCIA", value: "8,10%" },
        { label: "NUMERO DE COTISTAS", value: "347.299" },
        { label: "COTAS EMITIDAS", value: "51.390.086" },
        { label: "VAL. PATRIMONIAL P/ COTA", value: "R$ 105,03" },
        { label: "VALOR PATRIMONIAL", value: "R$ 5,40 Bilhões" },
      ];

      const resultado = (service as Investidor10ServiceTest).parseFiiIndicadoresFundamentalistas(
        html, informacoesFii, []
      );

      for (const indicador of resultado) {
        expect(indicador.valores).toHaveLength(1);
        expect(indicador.valores[0].periodo).toBe("Atual");
      }
    });

    it("deve usar '-' quando nao ha dados disponiveis", () => {
      const resultado = (service as Investidor10ServiceTest).parseFiiIndicadoresFundamentalistas(
        "<html></html>", [], []
      );

      expect(resultado[0].nome).toBe("Valor de Mercado");
      expect(resultado[0].valores).toHaveLength(1);
      expect(resultado[0].valores[0].valor).toBe("-");
      expect(resultado[0].valores[0].periodo).toBe("Atual");

      expect(resultado[6].nome).toBe("Vacância");
      expect(resultado[6].valores[0].valor).toBe("-");
    });

    it("deve calcular valor de mercado quando cotacao e cotas emitidas disponiveis", () => {
      const html = `
        <section id="cards-ticker">
          <div class="_card cotacao">
            <div class="_card-body"><div><span class="value">R$ 100,00</span></div></div>
          </div>
        </section>
      `;
      const informacoesFii: Investidor10InformacaoFii[] = [
        { label: "COTAS EMITIDAS", value: "1.000.000" },
      ];

      const resultado = (service as Investidor10ServiceTest).parseFiiIndicadoresFundamentalistas(
        html, informacoesFii, []
      );

      const valorMercado = resultado[0];
      expect(valorMercado.valores[0].valor).toBe("R$ 100,00 M");
    });

    it("deve cruzar dados historicos para P/VP e Dividend Yield", () => {
      const html = `
        <section id="cards-ticker">
          <div class="_card vp"><div class="_card-body"><span>0,87</span></div></div>
          <div class="_card dy"><div class="_card-body"><span>10,74%</span></div></div>
        </section>
      `;
      const historicoIndicadores: Investidor10HistoricoIndicador[] = [
        {
          indicador: "P/VP",
          valores: [
            { ano: 2025, valor: 0.85, tipo: "numeric" },
            { ano: 2024, valor: 1.00, tipo: "numeric" },
          ],
        },
        {
          indicador: "Dividend Yield",
          valores: [
            { ano: 2025, valor: 10.5, tipo: "percent" },
            { ano: 2024, valor: 9.9, tipo: "percent" },
          ],
        },
      ];

      const resultado = (service as Investidor10ServiceTest).parseFiiIndicadoresFundamentalistas(
        html, [], historicoIndicadores
      );

      expect(resultado[1].valores).toHaveLength(3);
      expect(resultado[1].valores[0].periodo).toBe("Atual");
      expect(resultado[1].valores[0].valor).toBe("0,87");
      expect(resultado[1].valores[1].periodo).toBe("2025");
      expect(resultado[1].valores[1].valor).toBe("0.85");
      expect(resultado[1].valores[2].periodo).toBe("2024");
      expect(resultado[1].valores[2].valor).toBe("1");

      expect(resultado[2].valores).toHaveLength(3);
      expect(resultado[2].valores[0].periodo).toBe("Atual");
      expect(resultado[2].valores[0].valor).toBe("10,74%");
      expect(resultado[2].valores[1].periodo).toBe("2025");
      expect(resultado[2].valores[1].valor).toBe("10.5");
      expect(resultado[2].valores[2].periodo).toBe("2024");
      expect(resultado[2].valores[2].valor).toBe("9.9");
    });
  });

  describe("parseMonetaryValue", () => {
    it("deve converter R$ 91,28 para 91.28", () => {
      const resultado = (service as Investidor10ServiceTest).parseMonetaryValue("R$ 91,28");
      expect(resultado).toBe(91.28);
    });

    it("deve converter R$ 11,17 M para 11.17", () => {
      const resultado = (service as Investidor10ServiceTest).parseMonetaryValue("R$ 11,17 M");
      expect(resultado).toBe(11.17);
    });

    it("deve converter 1.234,56 para 1234.56", () => {
      const resultado = (service as Investidor10ServiceTest).parseMonetaryValue("R$ 1.234,56");
      expect(resultado).toBe(1234.56);
    });
  });

  describe("formatMonetaryValue", () => {
    it("deve formatar valores em bilhoes", () => {
      const resultado = (service as Investidor10ServiceTest).formatMonetaryValue(4690000000);
      expect(resultado).toBe("R$ 4,69 Bilhões");
    });

    it("deve formatar valores em milhoes", () => {
      const resultado = (service as Investidor10ServiceTest).formatMonetaryValue(11170000);
      expect(resultado).toBe("R$ 11,17 M");
    });

    it("deve formatar valores pequenos", () => {
      const resultado = (service as Investidor10ServiceTest).formatMonetaryValue(91.28);
      expect(resultado).toBe("R$ 91,28");
    });
  });

  describe("indicadoresFundamentalistasFii no scrapeAsync", () => {
    it("deve retornar campo indicadoresFundamentalistasFii para FII", async () => {
      const htmlResposta = `
        <div class="sub-especial" id="data_about">
          <div class="content">
            <table><tr><td>Nome do Fundo:</td><td class='value'>XP LOG</td></tr></table>
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
          <div class="cell"><span class="d-flex">P/VP</span><div class="value"><span>0,87</span></div></div>
        </div>
        <section id="cards-ticker">
          <div class="_card cotacao">
            <div class="_card-body"><div><span class="value">R$ 91,28</span></div></div>
          </div>
          <div class="_card dy">
            <div class="_card-body"><span>10,74%</span></div>
          </div>
          <div class="_card vp">
            <div class="_card-body"><span>0,87</span></div>
          </div>
          <div class="_card val">
            <div class="_card-body"><span>R$ 11,17 M</span></div>
          </div>
        </section>
        <div id="about-company">
          <div id="table-indicators" class="table table-info-fii">
            <div class="cell">
              <span class="name">VACÂNCIA</span>
              <div class="value"><span>8,10%</span></div>
            </div>
            <div class="cell">
              <span class="name">NUMERO DE COTISTAS</span>
              <div class="value"><span>347.299</span></div>
            </div>
            <div class="cell">
              <span class="name">COTAS EMITIDAS</span>
              <div class="value"><span>51.390.086</span></div>
            </div>
            <div class="cell">
              <span class="name">VAL. PATRIMONIAL P/ COTA</span>
              <div class="value"><span>R$ 105,03</span></div>
            </div>
            <div class="cell">
              <span class="name">VALOR PATRIMONIAL</span>
              <div class="value"><span>R$ 5,40 Bilhões</span></div>
            </div>
          </div>
        </div>
        <div data-id="99999"></div>
      `;
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => "text/html" },
          text: async () => htmlResposta,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify({
            "Valor de Mercado": [
              { year: "Atual", key: "enterprise_value", value: 4690887050.08, type: "money_abbr" },
              { year: "2025", value: "3299035854.4", type: "numeric" },
              { year: "2024", value: "2933654072", type: "numeric" },
              { year: "2023", value: "3224879875.8", type: "numeric" },
              { year: "2022", value: "2665117257", type: "numeric" },
              { year: "2021", value: "2421478817.5", type: "numeric" },
            ],
            "P/VP": [
              { year: "Atual", key: "p_vp", value: 0.87, type: "decimal" },
              { year: "2025", value: "0.99913313012628", type: "numeric" },
              { year: "2024", value: "0.8392557711254", type: "numeric" },
              { year: "2023", value: "0.98250399076678", type: "numeric" },
              { year: "2022", value: "0.85841060133961", type: "numeric" },
              { year: "2021", value: "0.80282273868326", type: "numeric" },
            ],
            "Dividend Yield": [
              { year: "Atual", key: "dividend_yield_last_12_months", value: 10.74, type: "percent" },
              { year: "2025", value: "9.9", type: "percent" },
              { year: "2024", value: "9.14", type: "percent" },
              { year: "2023", value: "8.73", type: "percent" },
              { year: "2022", value: "8.42", type: "percent" },
              { year: "2021", value: "6.94", type: "percent" },
            ],
            "Liquidez Diária": [
              { year: "Atual", key: "daily_liquidity", value: 11174027, type: "money_abbr" },
              { year: "2025", value: "3647137", type: "numeric" },
              { year: "2024", value: "5370722", type: "numeric" },
              { year: "2023", value: "5600000", type: "numeric" },
              { year: "2022", value: "3600000", type: "numeric" },
              { year: "2021", value: "0", type: "numeric" },
            ],
            "Valor Patrimonial": [
              { year: "Atual", key: "equity_value", value: 5397457621, type: "money_abbr" },
              { year: "2025", value: "3301899335.48", type: "numeric" },
              { year: "2024", value: "3495543561.37", type: "numeric" },
              { year: "2023", value: "3282308371.27", type: "numeric" },
              { year: "2022", value: "3104712750.03", type: "numeric" },
              { year: "2021", value: "3016207294.18", type: "numeric" },
            ],
            "Val. Patrimonial p/ Cota": [
              { year: "Atual", key: "equity_value_account", value: 105.029, type: "money" },
              { year: "2025", value: "105.91181175889", type: "numeric" },
              { year: "2024", value: "112.12314914894", type: "numeric" },
              { year: "2023", value: "110.8392444442", type: "numeric" },
              { year: "2022", value: "114.56056093265", type: "numeric" },
              { year: "2021", value: "111.29480481152", type: "numeric" },
            ],
            "Vacância": [
              { year: "Atual", key: "occupancy_rate", value: 8.1, type: "percent" },
              { year: "2025", value: "4.6", type: "percent" },
              { year: "2024", value: "1.5", type: "percent" },
              { year: "2023", value: "2.3", type: "percent" },
              { year: "2022", value: "6.8", type: "percent" },
              { year: "2021", value: "9", type: "percent" },
            ],
            "Número de Cotistas": [
              { year: "Atual", key: "shareholders_count", value: 347299, type: "number_abbr" },
              { year: "2025", value: "334818", type: "numeric" },
              { year: "2024", value: "344321", type: "numeric" },
              { year: "2023", value: "314750", type: "numeric" },
              { year: "2022", value: "303174", type: "numeric" },
              { year: "2021", value: "275484", type: "numeric" },
            ],
            "Cotas Emitidas": [
              { year: "Atual", key: "quote_count", value: 51390086, type: "number_abbr" },
              { year: "2025", value: "31175920", type: "numeric" },
              { year: "2024", value: "31175920", type: "numeric" },
              { year: "2023", value: "29613222", type: "numeric" },
              { year: "2022", value: "27101050", type: "numeric" },
              { year: "2021", value: "27101050", type: "numeric" },
            ],
          }),
        });

      const resultado = await service.scrapeAsync("XPLG11");
      const fiiResult = resultado as Investidor10FiiDetails;

      expect(fiiResult.indicadoresFundamentalistasFii).toHaveLength(9);
      expect(fiiResult.indicadoresFundamentalistasFii[0].nome).toBe("Valor de Mercado");
      expect(fiiResult.indicadoresFundamentalistasFii[0].valores[0].periodo).toBe("Atual");
      expect(fiiResult.indicadoresFundamentalistasFii[0].valores[1].periodo).toBe("2025");
      expect(fiiResult.indicadoresFundamentalistasFii[0].valores[1].valor).toBe("3299035854.4");
      expect(fiiResult.indicadoresFundamentalistasFii[0].valores[2].periodo).toBe("2024");
      expect(fiiResult.indicadoresFundamentalistasFii[0].valores[2].valor).toBe("2933654072");
      expect(fiiResult.indicadoresFundamentalistasFii[1].nome).toBe("P/VP");
      expect(fiiResult.indicadoresFundamentalistasFii[1].valores[0].valor).toBe("0,87");
      expect(fiiResult.indicadoresFundamentalistasFii[1].valores[1].valor).toBe("0.99913313012628");
      expect(fiiResult.indicadoresFundamentalistasFii[2].nome).toBe("Dividend Yield");
      expect(fiiResult.indicadoresFundamentalistasFii[2].valores[1].valor).toBe("9.9");
      expect(fiiResult.indicadoresFundamentalistasFii[3].nome).toBe("Liquidez Diária");
      expect(fiiResult.indicadoresFundamentalistasFii[3].valores[1].valor).toBe("3647137");
      expect(fiiResult.indicadoresFundamentalistasFii[4].nome).toBe("Valor Patrimonial");
      expect(fiiResult.indicadoresFundamentalistasFii[4].valores[1].valor).toBe("3301899335.48");
      expect(fiiResult.indicadoresFundamentalistasFii[5].nome).toBe("Val. Patrimonial p/ Cota");
      expect(fiiResult.indicadoresFundamentalistasFii[5].valores[1].valor).toBe("105.91181175889");
      expect(fiiResult.indicadoresFundamentalistasFii[6].nome).toBe("Vacância");
      expect(fiiResult.indicadoresFundamentalistasFii[6].valores[0].valor).toBe("8,10%");
      expect(fiiResult.indicadoresFundamentalistasFii[6].valores[1].valor).toBe("4.6");
      expect(fiiResult.indicadoresFundamentalistasFii[7].nome).toBe("Nº Cotistas");
      expect(fiiResult.indicadoresFundamentalistasFii[7].valores[0].valor).toBe("347.299");
      expect(fiiResult.indicadoresFundamentalistasFii[7].valores[1].valor).toBe("334818");
      expect(fiiResult.indicadoresFundamentalistasFii[8].nome).toBe("Cotas Emitidas");
      expect(fiiResult.indicadoresFundamentalistasFii[8].valores[0].valor).toBe("51.390.086");
      expect(fiiResult.indicadoresFundamentalistasFii[8].valores[1].valor).toBe("31175920");
    });

    it("deve retornar indicadoresFundamentalistasFii vazio quando sem cards", async () => {
      const htmlResposta = `
        <div class="sub-especial" id="data_about">
          <div class="content">
            <table><tr><td>Nome do Fundo:</td><td class='value'>XP LOG</td></tr></table>
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
          <div class="cell"><span class="d-flex">P/VP</span><div class="value"><span>0,87</span></div></div>
        </div>
      `;
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: { get: () => "text/html" },
        text: async () => htmlResposta,
      });

      const resultado = await service.scrapeAsync("XPLG11");
      const fiiResult = resultado as Investidor10FiiDetails;

      expect(fiiResult.indicadoresFundamentalistasFii).toHaveLength(9);
      expect(fiiResult.indicadoresFundamentalistasFii[0].valores[0].valor).toBe("-");
    });
  });
});
