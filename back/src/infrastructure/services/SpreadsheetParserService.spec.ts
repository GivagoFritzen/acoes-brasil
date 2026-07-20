import * as XLSX from "xlsx";
import { SpreadsheetParserService } from "./SpreadsheetParserService";

function criarBufferExcel(rows: Record<string, unknown>[]): Buffer {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("SpreadsheetParserService", () => {
  let service: SpreadsheetParserService;

  beforeEach(() => {
    service = new SpreadsheetParserService();
  });

  describe("parseOrderRowsAsync", () => {
    it("Deve retornar array vazio quando buffer vazio", () => {
      const buffer = Buffer.from([]);

      const resultado = service.parseOrderRowsAsync(buffer);

      expect(resultado).toEqual([]);
    });

    it("Deve importar orders quando dados validos", () => {
      const buffer = criarBufferExcel([
        {
          "Código de Negociação": "VALE3",
          Quantidade: "100",
          Preço: "50,00",
          "Data do Negócio": "15-01-2024",
          "Tipo de Movimentação": "Compra",
        },
      ]);

      const resultado = service.parseOrderRowsAsync(buffer);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].codigo).toBe("VALE3");
      expect(resultado[0].quantidade).toBe(100);
      expect(resultado[0].valor).toBe(50);
      expect(resultado[0].operacao).toBe("Compra");
    });

    it("Deve importar varias orders quando multiplas linhas", () => {
      const buffer = criarBufferExcel([
        {
          "Código de Negociação": "PETR4",
          Quantidade: "200",
          Preço: "30,00",
          "Data do Negócio": "15-01-2024",
          "Tipo de Movimentação": "Compra",
        },
        {
          "Código de Negociação": "VALE3",
          Quantidade: "150",
          Preço: "55,00",
          "Data do Negócio": "16-01-2024",
          "Tipo de Movimentação": "Compra",
        },
      ]);

      const resultado = service.parseOrderRowsAsync(buffer);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].codigo).toBe("PETR4");
      expect(resultado[1].codigo).toBe("VALE3");
    });

    it("Deve detectar operacao como Venda quando texto contem venda", () => {
      const buffer = criarBufferExcel([
        {
          "Código de Negociação": "VALE3",
          Quantidade: "50",
          Preço: "60,00",
          "Data do Negócio": "20-01-2024",
          "Tipo de Movimentação": "Venda",
        },
      ]);

      const resultado = service.parseOrderRowsAsync(buffer);

      expect(resultado[0].operacao).toBe("Venda");
    });

    it("Deve lancar erro quando linha sem codigo", () => {
      const buffer = criarBufferExcel([
        {
          Quantidade: "100",
          Preço: "50,00",
          "Data do Negócio": "15-01-2024",
          "Tipo de Movimentação": "Compra",
        },
      ]);

      expect(() => service.parseOrderRowsAsync(buffer)).toThrow("dados obrigatórios inválidos");
    });

    it("Deve lancar erro quando linha sem quantidade", () => {
      const buffer = criarBufferExcel([
        {
          "Código de Negociação": "VALE3",
          Preço: "50,00",
          "Data do Negócio": "15-01-2024",
          "Tipo de Movimentação": "Compra",
        },
      ]);

      expect(() => service.parseOrderRowsAsync(buffer)).toThrow("dados obrigatórios inválidos");
    });

    it("Deve lancar erro quando linha sem preco", () => {
      const buffer = criarBufferExcel([
        {
          "Código de Negociação": "VALE3",
          Quantidade: "100",
          "Data do Negócio": "15-01-2024",
          "Tipo de Movimentação": "Compra",
        },
      ]);

      expect(() => service.parseOrderRowsAsync(buffer)).toThrow("dados obrigatórios inválidos");
    });

    it("Deve lancar erro quando linha sem data", () => {
      const buffer = criarBufferExcel([
        {
          "Código de Negociação": "VALE3",
          Quantidade: "100",
          Preço: "50,00",
          "Tipo de Movimentação": "Compra",
        },
      ]);

      expect(() => service.parseOrderRowsAsync(buffer)).toThrow("dados obrigatórios inválidos");
    });

    it("Deve lancar erro quando operacao nao reconhecida", () => {
      const buffer = criarBufferExcel([
        {
          "Código de Negociação": "VALE3",
          Quantidade: "100",
          Preço: "50,00",
          "Data do Negócio": "15-01-2024",
          "Tipo de Movimentação": "Doação",
        },
      ]);

      expect(() => service.parseOrderRowsAsync(buffer)).toThrow("dados obrigatórios inválidos");
    });

    it("Deve lancar erro quando codigo nao reconhecido como ativo suportado", () => {
      const buffer = criarBufferExcel([
        {
          "Código de Negociação": "INVALIDO",
          Quantidade: "100",
          Preço: "50,00",
          "Data do Negócio": "15-01-2024",
          "Tipo de Movimentação": "Compra",
        },
      ]);

      expect(() => service.parseOrderRowsAsync(buffer)).toThrow("dados obrigatórios inválidos");
    });
  });

  describe("parseProventoRowsAsync", () => {
    it("Deve retornar proventos quando dados validos", () => {
      const buffer = criarBufferExcel([
        {
          Produto: "VALE3",
          Pagamento: "15-01-2024",
          "Tipo de Evento": "Dividendo",
          Instituição: "Banco do Brasil",
          Quantidade: "100",
          "Preço unitário": "1,50",
          "Valor líquido": "150,00",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows).toHaveLength(1);
      expect(resultado.invalidLineNumbers).toEqual([]);
      expect(resultado.validRows[0].codigo).toBe("VALE3");
      expect(resultado.validRows[0].tipo).toBe("Dividendo");
      expect(resultado.validRows[0].quantidade).toBe(100);
      expect(resultado.validRows[0].precoUnitario).toBe(1.5);
      expect(resultado.validRows[0].valorLiquido).toBe(150);
    });

    it("Deve ignorar linhas de cabecalho", () => {
      const buffer = criarBufferExcel([
        {
          Produto: "Produto",
          Pagamento: "Data",
          "Tipo de Evento": "Tipo de Evento",
          Instituição: "Instituição",
          Quantidade: "Quantidade",
          "Preço unitário": "Preço unitário",
          "Valor líquido": "Valor líquido",
        },
        {
          Produto: "VALE3",
          Pagamento: "15-01-2024",
          "Tipo de Evento": "Dividendo",
          Instituição: "BB",
          Quantidade: "100",
          "Preço unitário": "1,50",
          "Valor líquido": "150,00",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows).toHaveLength(1);
      expect(resultado.validRows[0].codigo).toBe("VALE3");
    });

    it("Deve ignorar linhas vazias", () => {
      const buffer = criarBufferExcel([
        { Produto: "", Pagamento: "", "Tipo de Evento": "", Instituição: "", Quantidade: "", "Preço unitário": "", "Valor líquido": "" },
        {
          Produto: "PETR4",
          Pagamento: "20-01-2024",
          "Tipo de Evento": "Juros sobre Capital Próprio",
          Instituição: "BB",
          Quantidade: "50",
          "Preço unitário": "2,00",
          "Valor líquido": "100,00",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows).toHaveLength(1);
      expect(resultado.validRows[0].codigo).toBe("PETR4");
    });

    it("Deve retornar linhas invalidas quando linha sem campos principais", () => {
      const buffer = criarBufferExcel([
        {
          Produto: "VALE3",
          Pagamento: "15-01-2024",
          "Tipo de Evento": "Dividendo",
          Instituição: "BB",
          Quantidade: "100",
          "Preço unitário": "1,50",
          "Valor líquido": "150,00",
        },
        {
          Produto: "",
          Pagamento: "",
          "Tipo de Evento": "",
          Instituição: "",
          Quantidade: "",
          "Preço unitário": "",
          "Valor líquido": "",
          Observacao: "linha sem dados principais",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows).toHaveLength(1);
      expect(resultado.invalidLineNumbers).toEqual([2]);
    });

    it("Deve classificar tipo como JurosSobreCapitalProprio quando contem juros", () => {
      const buffer = criarBufferExcel([
        {
          Produto: "VALE3",
          Pagamento: "15-01-2024",
          "Tipo de Evento": "Juros sobre Capital Próprio",
          Instituição: "BB",
          Quantidade: "100",
          "Preço unitário": "1,00",
          "Valor líquido": "100,00",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows[0].tipo).toBe("JurosSobreCapitalProprio");
    });

    it("Deve classificar tipo como Rendimento quando nao reconhecido", () => {
      const buffer = criarBufferExcel([
        {
          Produto: "VALE3",
          Pagamento: "15-01-2024",
          "Tipo de Evento": "Aluguel",
          Instituição: "BB",
          Quantidade: "100",
          "Preço unitário": "1,00",
          "Valor líquido": "100,00",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows[0].tipo).toBe("Rendimento");
    });

    it("Deve extrair codigo do produto quando contem descricao", () => {
      const buffer = criarBufferExcel([
        {
          Produto: "VALE3 - Vale S.A.",
          Pagamento: "15-01-2024",
          "Tipo de Evento": "Dividendo",
          Instituição: "BB",
          Quantidade: "100",
          "Preço unitário": "1,50",
          "Valor líquido": "150,00",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows[0].codigo).toBe("VALE3");
    });

    it("Deve extrair codigo do produto via fallback quando regex nao encontra padrao", () => {
      const buffer = criarBufferExcel([
        {
          Produto: "ALGUM TEXTO",
          Pagamento: "15-01-2024",
          "Tipo de Evento": "Dividendo",
          Instituição: "BB",
          Quantidade: "100",
          "Preço unitário": "1,50",
          "Valor líquido": "150,00",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows[0].codigo).toBe("ALGUM");
    });

    it("Deve retornar proventos e linhas invalidas separadamente", () => {
      const buffer = criarBufferExcel([
        {
          Produto: "VALE3",
          Pagamento: "15-01-2024",
          "Tipo de Evento": "Dividendo",
          Instituição: "BB",
          Quantidade: "100",
          "Preço unitário": "1,50",
          "Valor líquido": "150,00",
        },
        {
          Produto: "",
          Pagamento: "",
          "Tipo de Evento": "",
          Instituição: "",
          Quantidade: "",
          "Preço unitário": "",
          "Valor líquido": "",
          Observacao: "linha sem dados",
        },
        {
          Produto: "PETR4",
          Pagamento: "20-01-2024",
          "Tipo de Evento": "Dividendo",
          Instituição: "BB",
          Quantidade: "200",
          "Preço unitário": "2,00",
          "Valor líquido": "400,00",
        },
      ]);

      const resultado = service.parseProventoRowsAsync(buffer);

      expect(resultado.validRows).toHaveLength(2);
      expect(resultado.invalidLineNumbers).toEqual([2]);
    });
  });
});
