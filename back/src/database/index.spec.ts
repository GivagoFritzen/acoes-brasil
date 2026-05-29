describe("database/index", () => {
  describe("quando dialect é sqlite com storage", () => {
    it("Deve criar sequelize sqlite com storage customizado", () => {
      jest.isolateModules(() => {
        const mockSequelize = jest.fn();

        jest.doMock("sequelize", () => ({
          Sequelize: mockSequelize,
        }));

        jest.doMock("fs", () => ({
          mkdirSync: jest.fn(),
        }));

        jest.doMock("../config/EnvConfig", () => ({
          __esModule: true,
          env: {
            db: { dialect: "sqlite", storage: "/tmp/custom/test.sqlite" },
          },
        }));

        require("../database");

        expect(mockSequelize).toHaveBeenCalledTimes(1);
        const chamada = mockSequelize.mock.calls[0][0];
        expect(chamada.dialect).toBe("sqlite");
        expect(chamada.storage).toContain("test.sqlite");
        expect(chamada.logging).toBe(false);
      });
    });
  });

  describe("quando dialect é sqlite sem storage", () => {
    it("Deve criar sequelize sqlite com storage default", () => {
      jest.isolateModules(() => {
        const mockSequelize = jest.fn();

        jest.doMock("sequelize", () => ({
          Sequelize: mockSequelize,
        }));

        jest.doMock("fs", () => ({
          mkdirSync: jest.fn(),
        }));

        jest.doMock("../config/EnvConfig", () => ({
          __esModule: true,
          env: {
            db: { dialect: "sqlite", storage: undefined },
          },
        }));

        require("../database");

        expect(mockSequelize).toHaveBeenCalledTimes(1);
        const chamada = mockSequelize.mock.calls[0][0];
        expect(chamada.dialect).toBe("sqlite");
        expect(chamada.storage).toContain("app.sqlite");
      });
    });
  });

  describe("quando dialect é mysql", () => {
    it("Deve criar sequelize mysql sem dialectOptions", () => {
      jest.isolateModules(() => {
        const mockSequelize = jest.fn();
        const mockMkdirSync = jest.fn();

        jest.doMock("sequelize", () => ({
          Sequelize: mockSequelize,
        }));

        jest.doMock("fs", () => ({
          mkdirSync: mockMkdirSync,
        }));

        jest.doMock("../config/EnvConfig", () => ({
          __esModule: true,
          env: {
            db: {
              dialect: "mysql",
              host: "mysql_host",
              name: "test_db",
              user: "root",
              password: "secret",
              storage: undefined,
            },
          },
        }));

        require("../database");

        expect(mockSequelize).toHaveBeenCalledTimes(1);
        expect(mockSequelize).toHaveBeenCalledWith(
          "test_db",
          "root",
          "secret",
          expect.objectContaining({
            dialect: "mysql",
            host: "mysql_host",
            logging: false,
          }),
        );
        expect(mockMkdirSync).not.toHaveBeenCalled();
      });
    });
  });

  describe("quando dialect é mssql", () => {
    it("Deve criar sequelize mssql com dialectOptions", () => {
      jest.isolateModules(() => {
        const mockSequelize = jest.fn();

        jest.doMock("sequelize", () => ({
          Sequelize: mockSequelize,
        }));

        jest.doMock("fs", () => ({
          mkdirSync: jest.fn(),
        }));

        jest.doMock("../config/EnvConfig", () => ({
          __esModule: true,
          env: {
            db: {
              dialect: "mssql",
              host: "localhost",
              name: "AppDb",
              user: "sa",
              password: "",
              storage: undefined,
            },
          },
        }));

        require("../database");

        expect(mockSequelize).toHaveBeenCalledTimes(1);
        expect(mockSequelize).toHaveBeenCalledWith(
          "AppDb",
          "sa",
          "",
          expect.objectContaining({
            dialect: "mssql",
            host: "localhost",
            logging: false,
            dialectOptions: {
              options: {
                encrypt: false,
                trustServerCertificate: true,
              },
            },
          }),
        );
      });
    });
  });
});
