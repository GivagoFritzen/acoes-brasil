describe("buildBrDateOrderExpression", () => {
  describe("quando DB_DIALECT é sqlite", () => {
    it("Deve retornar expressao com substr para SQLite", () => {
      jest.isolateModules(() => {
        jest.doMock("../config/EnvConfig", () => ({
          __esModule: true,
          env: {
            db: { dialect: "sqlite", host: "", name: "", user: "", password: "", storage: undefined },
          },
        }));
        const { buildBrDateOrderExpression } = require("./DateExpression");
        const resultado = buildBrDateOrderExpression("Provento");
        expect(resultado.val).toContain("substr");
        expect(resultado.val).toContain("Provento");
      });
    });
  });

  describe("quando DB_DIALECT é mysql", () => {
    it("Deve retornar expressao com STR_TO_DATE para MySQL", () => {
      jest.isolateModules(() => {
        jest.doMock("../config/EnvConfig", () => ({
          __esModule: true,
          env: {
            db: { dialect: "mysql", host: "", name: "", user: "", password: "", storage: undefined },
          },
        }));
        const { buildBrDateOrderExpression } = require("./DateExpression");
        const resultado = buildBrDateOrderExpression("Provento");
        expect(resultado.val).toContain("STR_TO_DATE");
      });
    });
  });

  describe("quando DB_DIALECT é mssql", () => {
    it("Deve retornar expressao com TRY_CONVERT para MSSQL", () => {
      jest.isolateModules(() => {
        jest.doMock("../config/EnvConfig", () => ({
          __esModule: true,
          env: {
            db: { dialect: "mssql", host: "", name: "", user: "", password: "", storage: undefined },
          },
        }));
        const { buildBrDateOrderExpression } = require("./DateExpression");
        const resultado = buildBrDateOrderExpression("Provento");
        expect(resultado.val).toContain("TRY_CONVERT");
      });
    });
  });
});
