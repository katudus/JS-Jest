module.exports = {
  testEnvironment: 'allure-jest/node',
  testMatch: ['**/tests/**/*.test.js'],
  testEnvironmentOptions: {
    resultsDir: './allure-results',
    cleanResultsDir: true,
  },
};