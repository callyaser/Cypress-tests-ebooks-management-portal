// Custom Cypress commands for the challenge suite.
import { selectors } from './selectors'

Cypress.Commands.add('assertPageLoaded', () => {
  cy.get(selectors.page.body).should('be.visible').and('not.be.empty')
  cy.get(selectors.page.body).should('not.contain.text', 'Internal Server Error')
})

Cypress.Commands.add('submitLoginForm', (username, password) => {
  cy.get(selectors.auth.username).clear().type(username)
  cy.get(selectors.auth.password).clear().type(password, { log: false })
  cy.get(selectors.auth.submit).first().click()
})

Cypress.Commands.add('submitLoginFormWithBlankUsername', (password) => {
  cy.get(selectors.auth.password).clear().type(password, { log: false })
  cy.get(selectors.auth.submit).first().click()
})

Cypress.Commands.add('submitEmptyLoginForm', () => {
  cy.get(selectors.auth.submit).first().click()
})

Cypress.Commands.add('getCredentials', () => {
  const username = Cypress.env('username')
  const password = Cypress.env('password')

  expect(username, 'CYPRESS_USERNAME or cypress.env.json username').to.be.a('string').and.not.be.empty
  expect(password, 'CYPRESS_PASSWORD or cypress.env.json password').to.be.a('string').and.not.be.empty

  return cy.wrap({ username, password }, { log: false })
})

Cypress.Commands.add('searchCatalog', (query) => {
  cy.get(selectors.catalog.searchBox).first().clear().type(`${query}{enter}`)
  cy.url().should('include', '/search')
  cy.assertPageLoaded()
})

Cypress.Commands.add('openFirstBookDetails', () => {
  cy.get(selectors.catalog.bookLink).first().click()
  cy.get(selectors.bookDetails.modal).first().should('be.visible')
})

Cypress.Commands.add('createShelf', (shelfName) => {
  cy.visit('/shelf/create')
  cy.get(selectors.shelf.titleInput).clear().type(shelfName)
  cy.get(selectors.shelf.titleInput)
    .closest('form')
    .within(() => {
      cy.get(selectors.shelf.saveButton).first().click()
    })
  cy.url().should('match', /\/shelf\/\d+/)
  cy.get(selectors.shelf.heading).should('contain.text', shelfName)
})

Cypress.Commands.add('deleteShelfIfPresent', (shelfPath) => {
  if (!shelfPath) return

  cy.request({ url: shelfPath, failOnStatusCode: false }).then((page) => {
    if (page.status !== 200 || !page.body.includes('id="delete_shelf"')) return

    const shelfId = shelfPath.match(/\/shelf\/(\d+)/)?.[1]
    const csrfToken = page.body.match(/name="csrf_token" value="([^"]+)"/)?.[1]

    if (!shelfId || !csrfToken) return

    cy.request({
      method: 'POST',
      url: `/shelf/delete/${shelfId}`,
      form: true,
      body: { csrf_token: csrfToken },
      followRedirect: false,
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [200, 204, 302])
  })
})

Cypress.Commands.add('addOpenBookToShelf', (shelfName) => {
  cy.intercept('POST', '**/shelf/add/**').as('addBookToShelf')
  cy.get(selectors.bookDetails.modal).first().within(() => {
    cy.get(selectors.bookDetails.addToShelfButton).click()
    cy.contains(selectors.bookDetails.addShelfMenuItem, shelfName).click()
    cy.wait('@addBookToShelf').its('response.statusCode').should('be.oneOf', [200, 204, 302])
    cy.contains(selectors.bookDetails.removeShelfButton, shelfName).should('be.visible')
  })
})

Cypress.Commands.add('login', (username, password) => {
  const user = username || Cypress.env('username')
  const pass = password || Cypress.env('password')

  expect(user, 'CYPRESS_USERNAME or cypress.env.json username').to.be.a('string').and.not.be.empty
  expect(pass, 'CYPRESS_PASSWORD or cypress.env.json password').to.be.a('string').and.not.be.empty

  cy.session(
    [user, pass],
    () => {
      cy.visit('/login')
      cy.submitLoginForm(user, pass)
      cy.url().should('not.include', '/login')
    },
    {
      cacheAcrossSpecs: false,
      validate() {
        cy.request({ url: '/', failOnStatusCode: false, followRedirect: false })
          .its('status')
          .should('eq', 200)
      },
    }
  )
})
