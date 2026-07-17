import { readSpreadsheetRows, extractField, parseDecimal, toBrDateString } from "./Spreadsheet";

describe("Spreadsheet", () => {
  describe("readSpreadsheetRows", () => {
    it("Deve retornar array vazio quando buffer vazio", () => {
      const buffer = Buffer.from("");

      const resultado = readSpreadsheetRows(buffer);

      expect(resultado).toEqual([]);
    });


  });

  describe("extractField", () => {
    it("Deve extrair campo quando header exato existe", () => {
      const row = { codigo: "VALE3", quantidade: "100" };

      const resultado = extractField(row, ["codigo"]);

      expect(resultado).toBe("VALE3");
    });

    it("Deve extrair campo quando header normalizado existe", () => {
      const row = { "Código": "VALE3" };

      const resultado = extractField(row, ["codigo"]);

      expect(resultado).toBe("VALE3");
    });

    it("Deve extrair campo com primeiro header viavel entre multiplas opcoes", () => {
      const row = { "Código do Ativo": "VALE3" };

      const resultado = extractField(row, ["codigo", "codigo_ativo", "Código do Ativo"]);

      expect(resultado).toBe("VALE3");
    });

    it("Deve ignorar campos com valor vazio", () => {
      const row = { codigo: "" };

      const resultado = extractField(row, ["codigo"]);

      expect(resultado).toBeUndefined();
    });

    it("Deve retornar undefined quando nenhum header encontrado", () => {
      const row = { nome: "teste" };

      const resultado = extractField(row, ["codigo"]);

      expect(resultado).toBeUndefined();
    });
  });

  describe("parseDecimal", () => {
    it("Deve retornar valor quando for numero finito", () => {
      expect(parseDecimal(123.45)).toBe(123.45);
    });

    it("Deve retornar null quando nao for string nem numero", () => {
      expect(parseDecimal(null)).toBeNull();
      expect(parseDecimal(undefined)).toBeNull();
    });

    it("Deve retornar null quando string vazia", () => {
      expect(parseDecimal("")).toBeNull();
    });

    it("Deve remover simbolo R$ e fazer parse", () => {
      expect(parseDecimal("R$ 1.234,56")).toBe(1234.56);
    });

    it("Deve converter virgula como separador decimal", () => {
      expect(parseDecimal("123,45")).toBe(123.45);
    });

    it("Deve converter ponto como separador de milhar e virgula decimal", () => {
      expect(parseDecimal("1.234,56")).toBe(1234.56);
    });

    it("Deve converter ponto como separador decimal quando sem virgula", () => {
      expect(parseDecimal("123.45")).toBe(123.45);
    });

    it("Deve retornar null quando string sem numeros", () => {
      expect(parseDecimal("abc")).toBeNull();
    });
  });

  describe("toBrDateString", () => {
    it("Deve converter Date para formato BR", () => {
      const data = new Date(2024, 0, 15);

      expect(toBrDateString(data)).toBe("15-01-2024");
    });

    it("Deve retornar null quando Date invalido", () => {
      const data = new Date("invalido");

      expect(toBrDateString(data)).toBeNull();
    });

    it("Deve retornar null quando valor null", () => {
      expect(toBrDateString(null)).toBeNull();
    });

    it("Deve converter string no formato BR com barras", () => {
      expect(toBrDateString("15/01/2024")).toBe("15-01-2024");
    });

    it("Deve converter string ISO para formato BR", () => {
      expect(toBrDateString("2024-01-15")).toBe("15-01-2024");
    });

    it("Deve retornar null quando string vazia", () => {
      expect(toBrDateString("")).toBeNull();
    });

    it("Deve converter numero serial Excel para formato BR", () => {
      expect(toBrDateString(45292)).toBe("01-01-2024");
    });

    it("Deve converter string com formatacao Date() para formato BR", () => {
      expect(toBrDateString("2024/01/15")).toBe("15-01-2024");
    });

    it("Deve retornar null quando string nao e data", () => {
      expect(toBrDateString("abc")).toBeNull();
    });
  });
});
