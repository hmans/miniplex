module.exports = {
  verbose: true,
  preset: "ts-jest",
  testMatch: [
    "**/tests/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  testPathIgnorePatterns: ["node_modules"],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "ts", "tsx"],
  globals: {
    "ts-jest": {
      isolatedModules: true
    }
  }
}
