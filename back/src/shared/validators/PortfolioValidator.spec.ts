import { PortfolioValidator } from "./PortfolioValidator";
import { ValidationError } from "../exceptions/ValidationError";

describe("PortfolioValidator", () => {
  describe("validate", () => {
    it("Deve lancar ValidationError quando codigo vazio", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "",
          quantidade: 100,
          precoMedio: 50,
        })
      ).toThrow(ValidationError);
    });

    it("Deve lancar ValidationError quando codigo invalido", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "INVALIDO",
          quantidade: 100,
          precoMedio: 50,
        })
      ).toThrow("Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações.");
    });

    it("Deve lancar ValidationError quando quantidade for zero", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "VALE3",
          quantidade: 0,
          precoMedio: 50,
        })
      ).toThrow("Dados inválidos para criar/atualizar portfolio.");
    });

    it("Deve lancar ValidationError quando quantidade for negativa", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "VALE3",
          quantidade: -1,
          precoMedio: 50,
        })
      ).toThrow("Dados inválidos para criar/atualizar portfolio.");
    });

    it("Deve lancar ValidationError quando quantidade for NaN", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "VALE3",
          quantidade: NaN,
          precoMedio: 50,
        })
      ).toThrow("Dados inválidos para criar/atualizar portfolio.");
    });

    it("Deve lancar ValidationError quando quantidade for Infinity", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "VALE3",
          quantidade: Infinity,
          precoMedio: 50,
        })
      ).toThrow("Dados inválidos para criar/atualizar portfolio.");
    });

    it("Deve lancar ValidationError quando precoMedio for negativo", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "VALE3",
          quantidade: 100,
          precoMedio: -1,
        })
      ).toThrow("Dados inválidos para criar/atualizar portfolio.");
    });

    it("Deve lancar ValidationError quando precoMedio for NaN", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "VALE3",
          quantidade: 100,
          precoMedio: NaN,
        })
      ).toThrow("Dados inválidos para criar/atualizar portfolio.");
    });

    it("Deve lancar ValidationError quando precoMedio for Infinity", () => {
      expect(() =>
        PortfolioValidator.validate({
          codigo: "VALE3",
          quantidade: 100,
          precoMedio: Infinity,
        })
      ).toThrow("Dados inválidos para criar/atualizar portfolio.");
    });

    it("Deve retornar codigo normalizado quando dados forem validos", () => {
      const resultado = PortfolioValidator.validate({
        codigo: "VALE3",
        quantidade: 100,
        precoMedio: 50,
      });

      expect(resultado).toBe("VALE3");
    });

    it("Deve aceitar precoMedio zero", () => {
      const resultado = PortfolioValidator.validate({
        codigo: "VALE3",
        quantidade: 100,
        precoMedio: 0,
      });

      expect(resultado).toBe("VALE3");
    });

    it("Deve normalizar codigo com sufixo F", () => {
      const resultado = PortfolioValidator.validate({
        codigo: "PETR4F",
        quantidade: 100,
        precoMedio: 30,
      });

      expect(resultado).toBe("PETR4F");
    });
  });
});
