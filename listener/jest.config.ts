/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "ts", "json", "node"],
  // A preset that is used as a base for Jest's configuration
  preset: "ts-jest",
  // A list of paths to directories that Jest should use to search for files in
  roots: ["<rootDir>"],
  // The test environment that will be used for testing
  testEnvironment: "node",
  // The glob patterns Jest uses to detect test files
  testMatch: ["**/tests/**/*.ts", "**/?(*.)+(spec|test).ts"],
  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

export default config;
