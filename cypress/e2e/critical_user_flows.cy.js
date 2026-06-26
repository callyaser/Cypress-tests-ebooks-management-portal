import { selectors } from '../support/selectors'
import { testData } from '../support/testData'

describe('Critical user flows', () => {
  let shelfToDelete

  afterEach(() => {
    if (shelfToDelete) {
      cy.login()
      cy.deleteShelfIfPresent(shelfToDelete)
      shelfToDelete = undefined
    }
  })

  it('logs in with valid credentials and opens the authenticated home page', () => {
    cy.visit('/login')
    cy.getCredentials().then(({ username, password }) => {
      cy.submitLoginForm(username, password)

      cy.url().should('not.include', '/login')
      cy.assertPageLoaded()
      cy.get(selectors.auth.userMenu).should('contain.text', username)
    })
  })

  it('requires authentication for protected catalog pages after logout', () => {
    cy.login()
    cy.visit('/logout')
    cy.url().should('include', '/login')

    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('shows the catalog shell with searchable book content', () => {
    cy.login()
    cy.visit('/')

    cy.assertPageLoaded()
    cy.get(selectors.catalog.searchBox).first().should('be.visible')
    cy.get(selectors.catalog.bookLink).first().should('have.attr', 'href').and('match', /\/book\/\d+/)
  })

  it('searches the catalog and opens a matching book detail modal', () => {
    cy.login()
    cy.visit('/')

    cy.searchCatalog('the')
    cy.openFirstBookDetails()
    cy.contains('Book Details').should('be.visible')
  })

  it('keeps the search page stable for uncommon user input', () => {
    cy.login()
    cy.visit('/')

    cy.searchCatalog("' OR 1=1 --")
    cy.get(selectors.page.body).should('not.contain.text', 'Traceback')
    cy.get(selectors.page.body).should('not.contain.text', 'ProgrammingError')
  })

  it('renders book details with key metadata and user actions', () => {
    cy.login()
    cy.visit('/')
    cy.openFirstBookDetails()

    cy.get(selectors.bookDetails.modal).first().within(() => {
      cy.get(selectors.bookDetails.title).first().should('be.visible')
      cy.get(selectors.bookDetails.cover).first().should('be.visible')
      cy.contains(/Publisher:|Published:|Language:/).should('be.visible')
      cy.contains(/Read|Archive/).should('be.visible')
      cy.contains(/Add to shelf/i).should('be.visible')
    })
  })

  it('exposes the main browse and discovery menu options', () => {
    cy.login()
    cy.visit('/')

    testData.navigation.browseMenuLabels.forEach((label) => {
      cy.contains(selectors.navigation.item, label).should('be.visible')
    })
  })

  it('opens a sidebar browse option from the menu', () => {
    cy.login()
    cy.visit('/')

    cy.contains(selectors.navigation.hotBooks, testData.navigation.hotBooksLabel).click()
    cy.url().should('include', '/hot')
    cy.assertPageLoaded()
  })

  it('creates a shelf and adds a book to it', () => {
    const shelfName = `${testData.shelf.temporaryNamePrefix} ${Date.now()}`

    cy.login()
    cy.createShelf(shelfName)
    cy.location('pathname').then((path) => {
      shelfToDelete = path
    })

    cy.visit('/')
    cy.openFirstBookDetails()
    cy.get(selectors.bookDetails.modal)
      .first()
      .find(selectors.bookDetails.bookName)
      .first()
      .invoke('text')
      .then((rawTitle) => {
        const bookTitle = rawTitle.trim()

        cy.addOpenBookToShelf(shelfName)

        cy.visit(shelfToDelete)
        cy.get(selectors.shelf.heading).should('contain.text', shelfName)
        cy.contains(selectors.catalog.bookLink, bookTitle).should('be.visible')

        cy.contains(selectors.catalog.bookLink, bookTitle).click()
        cy.get(selectors.bookDetails.modal).first().within(() => {
          cy.contains(selectors.bookDetails.removeShelfButton, shelfName).should('be.visible')
        })
      })
  })
})
