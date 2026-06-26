import { selectors } from '../support/selectors'
import { testData } from '../support/testData'

describe('Authentication', () => {
  const BASE_URL = Cypress.config('baseUrl')

  beforeEach(() => {
    cy.visit('/login')
  })

  it('shows the login form to unauthenticated users', () => {
    cy.url().should('include', '/login')
    cy.get(selectors.auth.username).should('be.visible')
    cy.get(selectors.auth.password).should('be.visible')
    cy.get(selectors.auth.submit).first().should('be.visible')
  })

  it('does not enable Remember Me by default', () => {
    cy.get(selectors.auth.rememberMe).should('not.be.checked')
  })

  it('logs in with valid credentials and shows the authenticated home page', () => {
    cy.getCredentials().then(({ username, password }) => {
      cy.submitLoginForm(username, password)

      cy.url().should('not.include', '/login')
      cy.url().should('eq', `${BASE_URL}/`)
      cy.get(selectors.auth.userMenu).should('contain.text', username)
    })
  })

  it('rejects invalid login attempts without creating a session', () => {
    cy.fixture('credentials').then(({ invalid }) => {
      cy.submitLoginForm(`${testData.auth.unknownUsernamePrefix}_${Date.now()}`, invalid.password)
      cy.url().should('include', '/login')
      cy.get(selectors.auth.alert)
        .should('be.visible')
        .and('not.be.empty')

      cy.visit('/login')
      cy.submitLoginFormWithBlankUsername(invalid.password)
      cy.url().should('include', '/login')

      cy.visit('/login')
      cy.submitEmptyLoginForm()
      cy.url().should('include', '/login')
    })
  })

  it('logs out and redirects back to the login page', () => {
    cy.getCredentials().then(({ username, password }) => {
      cy.submitLoginForm(username, password)
      cy.url().should('not.include', '/login')

      cy.visit('/logout')
      cy.url().should('include', '/login')
    })
  })

  it('shows a generic password recovery message for an unknown username', () => {
    cy.get(selectors.auth.username).clear().type(`${testData.auth.unknownUsernamePrefix}_${Date.now()}`)
    cy.contains(selectors.auth.forgotPassword, /forgot password/i).click()

    cy.get(selectors.auth.alert)
      .should('be.visible')
      .and('not.contain.text', testData.auth.usernameEnumerationLeakText)
  })

})
