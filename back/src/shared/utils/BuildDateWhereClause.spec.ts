import { buildDateWhereClause } from "./BuildDateWhereClause";
import { Op } from "sequelize";

describe("buildDateWhereClause", () => {
  it("Deve retornar null quando nenhum filtro fornecido", () => {
    const resultado = buildDateWhereClause("data", {});
    expect(resultado).toBeNull();
  });

  it("Deve retornar null quando filtros vazios", () => {
    const resultado = buildDateWhereClause("data", {
      dataInicial: undefined,
      dataFinal: undefined,
      data: undefined,
    });
    expect(resultado).toBeNull();
  });

  it("Deve retornar gte quando apenas dataInicial fornecida", () => {
    const resultado = buildDateWhereClause("data", { dataInicial: "01-01-2024" });
    expect(resultado).toEqual({
      data: { [Op.gte]: "2024-01-01" },
    });
  });

  it("Deve retornar lte quando apenas dataFinal fornecida", () => {
    const resultado = buildDateWhereClause("data", { dataFinal: "31-12-2024" });
    expect(resultado).toEqual({
      data: { [Op.lte]: "2024-12-31" },
    });
  });

  it("Deve retornar between quando ambas datas fornecidas", () => {
    const resultado = buildDateWhereClause("data", {
      dataInicial: "01-01-2024",
      dataFinal: "31-12-2024",
    });
    expect(resultado).toEqual({
      data: { [Op.between]: ["2024-01-01", "2024-12-31"] },
    });
  });

  it("Deve usar data como fallback para dataInicial", () => {
    const resultado = buildDateWhereClause("data", { data: "15-06-2024" });
    expect(resultado).toEqual({
      data: { [Op.gte]: "2024-06-15" },
    });
  });

  it("Deve priorizar dataInicial sobre data", () => {
    const resultado = buildDateWhereClause("data", {
      dataInicial: "01-01-2024",
      data: "15-06-2024",
    });
    expect(resultado).toEqual({
      data: { [Op.gte]: "2024-01-01" },
    });
  });

  it("Deve aceitar formato ISO para datas", () => {
    const resultado = buildDateWhereClause("data", {
      dataInicial: "2024-01-15",
      dataFinal: "2024-06-30",
    });
    expect(resultado).toEqual({
      data: { [Op.between]: ["2024-01-15", "2024-06-30"] },
    });
  });

  it("Deve usar nome de campo personalizado", () => {
    const resultado = buildDateWhereClause("dataOperacao", {
      dataInicial: "01-01-2024",
    });
    expect(resultado).toEqual({
      dataOperacao: { [Op.gte]: "2024-01-01" },
    });
  });
});
