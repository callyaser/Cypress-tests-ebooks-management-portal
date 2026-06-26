const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://testapp1.andresfloresv.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    retries: {
      runMode: 2,   // retry failed tests twice in CI
      openMode: 0,  // no retries in interactive mode (want immediate failure visibility)
    },
    specPattern: [
      'cypress/e2e/critical_user_flows.cy.js',
      'cypress/e2e/01_authentication.cy.js',
    ],
    supportFile: 'cypress/support/e2e.js',
    env: {
      username: process.env.CYPRESS_USERNAME || '',
      password: process.env.CYPRESS_PASSWORD || '',
    },
  },
})

