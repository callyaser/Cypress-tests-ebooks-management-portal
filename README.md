# Powerside Testing Challenge

## What This Repository Contains

| Path | Contents |
|---|---|
| `cypress/e2e/critical_user_flows.cy.js` | Main authenticated user workflows: catalog, search, book details, shelves, navigation |
| `cypress/e2e/01_authentication.cy.js` | Authentication, validation, Remember Me, and Forgot Password checks |
| `cypress/support/commands.js` | Reusable Cypress commands for login, search, book details, shelf creation/add/cleanup |
| `cypress/support/selectors.js` | Centralized selectors used by the specs |
| `cypress/support/testData.js` | Centralized labels, prefixes, and assertion text |
| `cypress/fixtures/credentials.json` | Non-sensitive invalid login data used by the auth spec |
| `docs/test-report.md` | Exploratory test ideas, execution notes, bug summary, and app feedback |
| `docs/bug-report.md` | Bug report document |
| `cypress.config.js` | Cypress configuration and base URL |

## Application Overview

The app lets a user log in, browse an ebook catalog, search for books, open Book Details, and organize books into shelves.

## Prerequisites

- Node.js installed
- npm installed
- Internet access to `https://testapp1.andresfloresv.com`

## Setup

Install dependencies from the repository root:

```bash
npm install
```

## Running the Cypress Test Suite

Set the login credentials before running Cypress. The username and password are intentionally not committed to the repository.

For local runs, create a `cypress.env.json` file in the repository root:

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

This file is ignored by Git, so it can exist on your machine without being pushed to GitHub.

Then run all collected Cypress tests in headless mode:

```bash
npm run cy:run
```

Open Cypress in interactive mode:

```bash
npm run cy:open
```

Run one spec only when debugging:

```bash
npm run cy:run -- --spec cypress/e2e/critical_user_flows.cy.js
npm run cy:run -- --spec cypress/e2e/01_authentication.cy.js
```

As an alternative to `cypress.env.json`, credentials can also be provided through shell environment variables.

PowerShell:

```powershell
$env:CYPRESS_USERNAME="your_username"
$env:CYPRESS_PASSWORD="your_password"
npm run cy:run
```

macOS/Linux:

```bash
CYPRESS_USERNAME="your_username" CYPRESS_PASSWORD="your_password" npm run cy:run
```

## Expected Test Results

Some authentication tests are expected to fail while the documented bugs still exist:

- `does not enable Remember Me by default`
- `shows a generic password recovery message for an unknown username`

## Credentials

The login credentials are read from local runtime configuration:

- Preferred: `cypress.env.json`
- Alternative: `CYPRESS_USERNAME` and `CYPRESS_PASSWORD` environment variables

Do not commit real passwords to the repository. If the password changes after a Forgot Password action, update your local `cypress.env.json` or environment variable value before running the full suite.

## Documentation

The repo includes the Cypress code and the documentation created for the exercise:

- `docs/test-report.md` - main submission document for test ideas, coverage, findings, and bonus feedback
- `docs/bug-report.md` - bug report details

## Notes

- Selectors are centralized. Avoided hardcoding UI selectors directly in specs.
- Test data and user-facing strings are centralized in `cypress/support/testData.js`.
- Avoid running valid-username password reset tests repeatedly because they change the account password.
