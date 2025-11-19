import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 600000, // 10 minutes
  use: {
    baseURL: 'http://192.168.5.2:8080',
    headless: false,
    viewport: { width: 1920, height: 1080 },
    video: 'on',
    trace: 'on',
    launchOptions: {
      slowMo: 150,
      args: [
        '--start-maximized',
        '--window-size=1920,1080'
      ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    }
  ]
});
