// This file is loaded automatically before every spec.
// Import custom commands so they're available in all tests.
import './commands'

// Globally suppress uncaught exceptions that originate from the app
// (not from test code) to prevent spurious test failures caused by
// third-party scripts or app-side errors unrelated to the scenario under test.
// Remove this if you specifically want to assert on app-thrown exceptions.
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false prevents Cypress from failing the test
  console.warn('Uncaught app exception (not failing test):', err.message)
  return false
})
