import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./src",
  roots: ["<rootDir>"],
  testMatch: ["**/*.spec.ts"],
  moduleNameMapper: {
    "^../../../../common/(.*)$": "<rootDir>/../../common/$1",
    "^../../../common/(.*)$": "<rootDir>/../../common/$1",
    "^../../shared/(.*)$": "<rootDir>/shared/$1",
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  collectCoverage: true,
  coverageDirectory: "../coverage",
  coverageProvider: "v8",
  coverageReporters: ["text", "html", "lcov", "lcovonly"],
  collectCoverageFrom: [
    "application/services/**/*.ts",
    "infrastructure/services/**/*.ts",
    "infrastructure/repositories/**/*.ts",
    "infrastructure/database/**/*.ts",
    "routes/**/*.ts",
    "controllers/**/*.ts",
    "database/**/*.ts",
    "shared/**/*.ts",
    "utils/**/*.ts",
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