import { SequelizeTransactionManager } from "./SequelizeTransactionManager";
import { sequelize } from "../../database";

jest.mock("../../database", () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));

describe("SequelizeTransactionManager", () => {
  let manager: SequelizeTransactionManager;
  let transacaoMock: any;

  beforeEach(() => {
    manager = new SequelizeTransactionManager();
    transacaoMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transacaoMock);
  });

  it("Deve executar operacao com transacao e commitar", async () => {
    const operacao = jest.fn().mockResolvedValue("resultado");

    const resultado = await manager.executeAsync(operacao);

    expect(sequelize.transaction).toHaveBeenCalledTimes(1);
    expect(operacao).toHaveBeenCalledWith(transacaoMock);
    expect(transacaoMock.commit).toHaveBeenCalledTimes(1);
    expect(transacaoMock.rollback).not.toHaveBeenCalled();
    expect(resultado).toBe("resultado");
  });

  it("Deve fazer rollback quando operacao lanca erro", async () => {
    const erro = new Error("falha na operacao");
    const operacao = jest.fn().mockRejectedValue(erro);

    await expect(manager.executeAsync(operacao)).rejects.toThrow("falha na operacao");

    expect(transacaoMock.rollback).toHaveBeenCalledTimes(1);
    expect(transacaoMock.commit).not.toHaveBeenCalled();
  });

  it("Deve propagar erro original apos rollback", async () => {
    const erro = new Error("erro original");
    const operacao = jest.fn().mockRejectedValue(erro);

    await expect(manager.executeAsync(operacao)).rejects.toThrow(erro);
  });

});
