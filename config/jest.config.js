module.exports = {
  preset: 'jest-puppeteer',
  rootDir: '../',
  transform: {
    "^.+\\.tsx?$": ['ts-jest', {
      tsconfig: 'config/tsconfig.json'  // TODO: Modify this when tsconfig.json moves
    }]
  },
  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 30000
};