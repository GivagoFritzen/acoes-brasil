import { OrderValidator, ValidationError } from "./OrderValidator";

describe("OrderValidator", () => {
  describe("validateCreateOrderDto", () => {
    it("Deve lancar ValidationError quando codigo vazio", () => {
      expect(() =>
        OrderValidator.validateCreateOrderDto({
          codigo: "",
          quantidade: 100,
          valor: 50,
          data: "01-01-2024",
          tipo: "ACAO",
          operacao: "Compra",
        })
      ).toThrow(ValidationError);
    });

    it("Deve lancar ValidationError quando quantidade for zero", () => {
      expect(() =>
        OrderValidator.validateCreateOrderDto({
          codigo: "VALE3",
          quantidade: 0,
          valor: 50,
          data: "01-01-2024",
          tipo: "ACAO",
          operacao: "Compra",
        })
      ).toThrow("Dados inválidos para criar order");
    });

    it("Deve lancar ValidationError quando valor for zero", () => {
      expect(() =>
        OrderValidator.validateCreateOrderDto({
          codigo: "VALE3",
          quantidade: 100,
          valor: 0,
          data: "01-01-2024",
          tipo: "ACAO",
          operacao: "Compra",
        })
      ).toThrow("Dados inválidos para criar order");
    });

    it("Deve lancar ValidationError quando quantidade for negativa", () => {
      expect(() =>
        OrderValidator.validateCreateOrderDto({
          codigo: "VALE3",
          quantidade: -1,
          valor: 50,
          data: "01-01-2024",
          tipo: "ACAO",
          operacao: "Compra",
        })
      ).toThrow("Quantidade deve ser maior que zero.");
    });

    it("Deve lancar ValidationError quando valor for negativo", () => {
      expect(() =>
        OrderValidator.validateCreateOrderDto({
          codigo: "VALE3",
          quantidade: 100,
          valor: -1,
          data: "01-01-2024",
          tipo: "ACAO",
          operacao: "Compra",
        })
      ).toThrow("Valor deve ser maior que zero.");
    });

    it("Deve lancar ValidationError quando operacao invalida", () => {
      expect(() =>
        OrderValidator.validateCreateOrderDto({
          codigo: "VALE3",
          quantidade: 100,
          valor: 50,
          data: "01-01-2024",
          tipo: "ACAO",
          operacao: "Invalida" as any,
        })
      ).toThrow("Operação inválida para portfolio. Use Compra ou Venda.");
    });

    it("Deve passar quando dados forem validos", () => {
      expect(() =>
        OrderValidator.validateCreateOrderDto({
          codigo: "VALE3",
          quantidade: 100,
          valor: 50,
          data: "01-01-2024",
          tipo: "ACAO",
          operacao: "Compra",
        })
      ).not.toThrow();
    });
  });

  describe("validateOrderDate", () => {
    it("Deve lancar ValidationError quando data for futura", () => {
      const dataFutura = new Date();
      dataFutura.setFullYear(dataFutura.getFullYear() + 1);
      const dia = String(dataFutura.getDate()).padStart(2, "0");
      const mes = String(dataFutura.getMonth() + 1).padStart(2, "0");
      const ano = dataFutura.getFullYear();
      const dataStr = `${dia}-${mes}-${ano}`;

      expect(() => OrderValidator.validateOrderDate(dataStr)).toThrow(
        "A data da ordem não pode ser futura."
      );
    });

    it("Deve passar quando data for passada", () => {
      expect(() =>
        OrderValidator.validateOrderDate("01-01-2020")
      ).not.toThrow();
    });
  });

  describe("parseOperacao", () => {
    it("Deve retornar Compra quando texto contiver compra", () => {
      const resultado = OrderValidator.parseOperacao("compra");

      expect(resultado).toBe("Compra");
    });

    it("Deve retornar Compra quando texto contiver COMPRA maiusculo", () => {
      const resultado = OrderValidator.parseOperacao("COMPRA");

      expect(resultado).toBe("Compra");
    });

    it("Deve retornar Venda quando texto contiver venda", () => {
      const resultado = OrderValidator.parseOperacao("venda");

      expect(resultado).toBe("Venda");
    });

    it("Deve lancar ValidationError quando operacao invalida", () => {
      expect(() => OrderValidator.parseOperacao("invalida")).toThrow(
        ValidationError
      );
    });
  });

  describe("parseTipo", () => {
    it("Deve detectar tipo ACAO pelo codigo quando ticker valido", () => {
      const resultado = OrderValidator.parseTipo("", "VALE3");

      expect(resultado).toBe("ACAO");
    });

    it("Deve detectar tipo FII pelo codigo quando ticker FII valido", () => {
      const resultado = OrderValidator.parseTipo("", "KNRI11");

      expect(resultado).toBe("FII");
    });

    it("Deve detectar tipo BDR pelo codigo quando ticker BDR valido", () => {
      const resultado = OrderValidator.parseTipo("", "XPLG32");

      expect(resultado).toBe("BDR");
    });

    it("Deve lancar ValidationError quando codigo invalido", () => {
      expect(() => OrderValidator.parseTipo("", "INVALIDO")).toThrow(
        ValidationError
      );
    });

    it("Deve retornar FII quando value contiver fii", () => {
      const resultado = OrderValidator.parseTipo("fii");

      expect(resultado).toBe("FII");
    });

    it("Deve retornar FII quando value contiver fundo imobili", () => {
      const resultado = OrderValidator.parseTipo("fundo imobiliario");

      expect(resultado).toBe("FII");
    });

    it("Deve retornar BDR quando value contiver bdr", () => {
      const resultado = OrderValidator.parseTipo("bdr");

      expect(resultado).toBe("BDR");
    });

    it("Deve retornar ACAO quando value contiver acao", () => {
      const resultado = OrderValidator.parseTipo("acao");

      expect(resultado).toBe("ACAO");
    });

    it("Deve lancar ValidationError quando value e codigo indefinido", () => {
      expect(() => OrderValidator.parseTipo("invalido")).toThrow(
        ValidationError
      );
    });
  });
});
