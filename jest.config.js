module.exports = {
  projects: [
    {
      displayName: "@kremlingjs/core",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      rootDir: "./packages/core",
      testPathIgnorePatterns: ["<rootDir>/node_modules"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    },
    {
      displayName: "@kremlingjs/react",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      rootDir: "./packages/react",
      testPathIgnorePatterns: ["<rootDir>/node_modules"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    },
  ],
};
