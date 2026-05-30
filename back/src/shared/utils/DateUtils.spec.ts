import { DateUtils } from "./DateUtils";

describe("DateUtils", () => {
  describe("normalizeToBrDateString", () => {
    it("Deve retornar string vazia quando valor null", () => {
      expect(DateUtils.normalizeToBrDateString(null)).toBe("");
    });

    it("Deve retornar string vazia quando valor undefined", () => {
      expect(DateUtils.normalizeToBrDateString(undefined)).toBe("");
    });

    it("Deve retornar mesmo valor quando ja estiver no formato BR", () => {
      expect(DateUtils.normalizeToBrDateString("01-02-2024")).toBe(
        "01-02-2024"
      );
    });

    it("Deve converter ISO para BR quando formato yyyy-MM-dd", () => {
      expect(DateUtils.normalizeToBrDateString("2024-02-01")).toBe(
        "01-02-2024"
      );
    });

    it("Deve converter ISO completo para BR quando formato ISO com T", () => {
      expect(DateUtils.normalizeToBrDateString("2024-02-01T10:00:00")).toBe(
        "01-02-2024"
      );
    });

    it("Deve retornar string original quando formato desconhecido", () => {
      expect(DateUtils.normalizeToBrDateString("invalido")).toBe("invalido");
    });
  });

  describe("normalizeToIsoDate", () => {
    it("Deve retornar null quando valor nao for string", () => {
      expect(DateUtils.normalizeToIsoDate(123)).toBeNull();
    });

    it("Deve converter BR para ISO quando formato dd-MM-yyyy", () => {
      expect(DateUtils.normalizeToIsoDate("01-02-2024")).toBe("2024-02-01");
    });

    it("Deve retornar mesmo valor quando ja estiver ISO", () => {
      expect(DateUtils.normalizeToIsoDate("2024-02-01")).toBe("2024-02-01");
    });

    it("Deve retornar null quando formato invalido", () => {
      expect(DateUtils.normalizeToIsoDate("invalido")).toBeNull();
    });
  });

  describe("isFutureBrDate", () => {
    it("Deve retornar false quando formato invalido", () => {
      expect(DateUtils.isFutureBrDate("invalido")).toBe(false);
    });

    it("Deve retornar true quando data futura", () => {
      const futuro = new Date();
      futuro.setFullYear(futuro.getFullYear() + 1);
      const dia = String(futuro.getDate()).padStart(2, "0");
      const mes = String(futuro.getMonth() + 1).padStart(2, "0");
      const ano = futuro.getFullYear();

      expect(DateUtils.isFutureBrDate(`${dia}-${mes}-${ano}`)).toBe(true);
    });

    it("Deve retornar false quando data passada", () => {
      expect(DateUtils.isFutureBrDate("01-01-2020")).toBe(false);
    });

    it("Deve retornar false quando data for hoje", () => {
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, "0");
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const ano = hoje.getFullYear();

      expect(DateUtils.isFutureBrDate(`${dia}-${mes}-${ano}`)).toBe(false);
    });
  });

  describe("getCurrentBrDate", () => {
    it("Deve retornar data atual no formato dd-MM-yyyy", () => {
      const agora = new Date();
      const dia = String(agora.getDate()).padStart(2, "0");
      const mes = String(agora.getMonth() + 1).padStart(2, "0");
      const ano = agora.getFullYear();
      const esperado = `${dia}-${mes}-${ano}`;

      expect(DateUtils.getCurrentBrDate()).toBe(esperado);
    });
  });

  describe("generateFileName", () => {
    it("Deve gerar nome com prefixo e data atual", () => {
      const agora = new Date();
      const dataStr = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, "0")}${String(agora.getDate()).padStart(2, "0")}`;

      expect(DateUtils.generateFileName("relatorio")).toBe(
        `relatorio-${dataStr}.xlsx`
      );
    });

    it("Deve gerar nome com extensao personalizada", () => {
      const agora = new Date();
      const dataStr = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, "0")}${String(agora.getDate()).padStart(2, "0")}`;

      expect(DateUtils.generateFileName("backup", "csv")).toBe(
        `backup-${dataStr}.csv`
      );
    });
  });
});
