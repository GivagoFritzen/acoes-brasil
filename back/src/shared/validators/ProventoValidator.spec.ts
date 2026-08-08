import { ProventoValidator } from "./ProventoValidator";
import { ValidationError } from "../exceptions/ValidationError";

describe("ProventoValidator", () => {
  describe("validate", () => {
    it("Deve lancar ValidationError quando codigo vazio", () => {
      expect(() =>
        ProventoValidator.validate({
          codigo: "",
          data: "01-01-2024",
          tipo: "Dividendo",
          instituicao: "Petrobras",
          quantidade: 100,
          precoUnitario: 1.5,
          valorLiquido: 150,
        })
      ).toThrow(ValidationError);
    });

    it("Deve lancar ValidationError quando codigo invalido", () => {
      expect(() =>
        ProventoValidator.validate({
          codigo: "INVALIDO",
          data: "01-01-2024",
          tipo: "Dividendo",
          instituicao: "Petrobras",
          quantidade: 100,
          precoUnitario: 1.5,
          valorLiquido: 150,
        })
      ).toThrow("Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações.");
    });

    it("Deve lancar ValidationError quando data vazia", () => {
      expect(() =>
        ProventoValidator.validate({
          codigo: "VALE3",
          data: "",
          tipo: "Dividendo",
          instituicao: "Petrobras",
          quantidade: 100,
          precoUnitario: 1.5,
          valorLiquido: 150,
        })
      ).toThrow("Data inválida para provento.");
    });

    it("Deve lancar ValidationError quando data for futura", () => {
      const futuro = new Date();
      futuro.setFullYear(futuro.getFullYear() + 1);
      const dia = String(futuro.getDate()).padStart(2, "0");
      const mes = String(futuro.getMonth() + 1).padStart(2, "0");
      const ano = futuro.getFullYear();
      const dataFutura = `${dia}-${mes}-${ano}`;

      expect(() =>
        ProventoValidator.validate({
          codigo: "VALE3",
          data: dataFutura,
          tipo: "Dividendo",
          instituicao: "Petrobras",
          quantidade: 100,
          precoUnitario: 1.5,
          valorLiquido: 150,
        })
      ).toThrow("A data do provento não pode ser futura.");
    });

    it("Deve retornar codigo normalizado quando dados forem validos", () => {
      const resultado = ProventoValidator.validate({
        codigo: "VALE3",
        data: "01-01-2024",
        tipo: "Dividendo",
        instituicao: "Petrobras",
        quantidade: 100,
        precoUnitario: 1.5,
        valorLiquido: 150,
      });

      expect(resultado).toBe("VALE3");
    });

    it("Deve aceitar data passada", () => {
      const resultado = ProventoValidator.validate({
        codigo: "PETR4",
        data: "01-01-2020",
        tipo: "Juros",
        instituicao: "Petrobras",
        quantidade: 50,
        precoUnitario: 2.0,
        valorLiquido: 100,
      });

      expect(resultado).toBe("PETR4");
    });

    it("Deve aceitar data de hoje", () => {
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, "0");
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const ano = hoje.getFullYear();
      const dataHoje = `${dia}-${mes}-${ano}`;

      const resultado = ProventoValidator.validate({
        codigo: "BBDC4",
        data: dataHoje,
        tipo: "Dividendo",
        instituicao: "Bradesco",
        quantidade: 200,
        precoUnitario: 0.5,
        valorLiquido: 100,
      });

      expect(resultado).toBe("BBDC4");
    });
  });
});
