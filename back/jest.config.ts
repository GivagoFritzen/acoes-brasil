import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./src",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.spec.ts"],
  moduleNameMapper: {
    "^../../../../common/(.*)$": "<rootDir>/../../common/$1",
    "^../../../common/(.*)$": "<rootDir>/../../common/$1",
    "^../../shared/(.*)$": "<rootDir>/shared/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ],
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["text", "html", "lcov", "lcovonly"],
  collectCoverageFrom: [
    "application/services/**/*.ts",
    "infrastructure/services/**/*.ts",
    "routes/**/*.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

export default config;