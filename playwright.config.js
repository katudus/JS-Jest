const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  timeout: 30000,

  reporter: [
    ['line'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['html', { outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',  
    video: 'retain-on-failure',    
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { 
      name: 'firefox', 
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          slowMo: 500,
        }
      } 
    },  
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },    
  ],

  webServer: {
    command: 'node server.js',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});