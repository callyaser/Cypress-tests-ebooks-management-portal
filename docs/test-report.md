# Test Report - Calibre-Web App
**URL:** https://testapp1.andresfloresv.com  

## 1. Application Understanding

The application is an ebook library web app based on Calibre-Web. A regular user can log in, browse a catalog of books, search the library, open a Book Details modal, mark/archive books, and organize books into shelves. The sidebar also exposes discovery routes such as Books, Hot Books, Downloaded Books, Read/Unread Books, Categories, Series, Authors, File formats, and Archived Books.

During exploration I also found areas that behave like administration or elevated-permission functionality, especially the Books List page at `/table`. That page is important because it exposes bulk-management style controls to a regular user. Even if some actions later return 403, the page itself should not be available to a non-admin user.

## 2. Testing Approach

I started with the flows a normal user must complete before anything else works: login, logout, and landing on the catalog. After that I followed the main journey: browse the catalog, search for a book, open Book Details, inspect metadata/actions, and organize a book into a shelf.

Once the normal workflow was understood, I shifted to risk-based testing. Authentication, password recovery, persistent sessions, rate limiting, and pages exposing management functionality carry higher risk than simple navigation because failures in these areas generally have a higher impact than navigation or catalog browsing, lock out users, or allow unauthorized actions. I chose Cypress automation for repeatable flows that are safe to run against the live challenge app. I kept some security and rate-limit scenarios as manual findings because they can reset passwords, exhaust quotas, or require access to email.

## 3. Test Scenarios

| Area | Test Idea | Priority | Automated? | Result / Notes |
|---|---|---:|---|---|
| Authentication | Login page loads with username, password, and submit controls | P0 | Yes | Confirms the unauthenticated entry point is usable. |
| Authentication | Valid credentials log the user in and show authenticated home | P0 | Yes | Core access path for all other tests. |
| Authentication | Logout returns user to login page | P0 | Yes | Confirms session can be ended. |
| Authentication | Protected catalog cannot be accessed after logout | P0 | Yes | Covered in critical flow spec. |
| Authentication | Unknown username cannot log in | P1 | Yes | Uses random username to avoid locking the valid account. |
| Authentication | Required login fields cannot be empty | P1 | Yes | Empty username and empty form stay on login page. |
| Authentication | Remember Me is unchecked by default | P1 | Yes, failing | App currently checks Remember Me by default. |
| Password Recovery | Unknown username should receive a generic recovery message | P1 | Yes, failing | App says `Please enter valid username to reset password`, which reveals account existence. |
| Password Recovery | Valid and invalid usernames should receive indistinguishable recovery responses | P1 | Manual / not active | Full comparison is risky because valid-user recovery changes the password. |
| Password Recovery | Recovery should use a reset link/token, not email a plaintext password | High security | Manual | Confirmed through email behavior; not suitable for repeatable Cypress. |
| Password Recovery | Recovery should work after the user updates their account email address | P0 | Manual | Critical account-lockout risk, but not safe for repeatable Cypress because it changes email/password state and requires mailbox verification. |
| Rate Limiting | Login and Forgot Password should not lock each other out unnecessarily | P1 | Manual | Important, but exhausting rate limits is not safe in regular automation. |
| Auth Forms | Login/Forgot Password should follow Post-Redirect-Get | P2 | Manual | Refreshing POST responses can repeat auth requests and consume rate-limit quota. |
| Catalog | Home catalog loads with search and book links | P0 | Yes | Confirms main authenticated landing page is usable. |
| Search | Search for a common term opens usable results | P0 | Yes | Main discovery path. |
| Search | Search result can open Book Details modal | P0 | Yes | Connects discovery to book inspection. |
| Search | Special/uncommon search input does not crash the app | P1 | Yes | Checks for visible server errors/tracebacks. |
| Search | Empty search should be clearly handled | P2 | Manual | UX risk; lower priority than auth/authz. |
| Book Details | Book Details modal opens from catalog/search | P0 | Yes | Core content view. |
| Book Details | Title, cover, metadata, read/archive, and shelf action are visible | P0 | Yes | Confirms the modal contains the expected user actions. |
| Book Details | Download/read action works | P1 | Manual / future | Useful core flow, but less urgent than auth and shelf state. |
| Shelves | Create shelf, add book, verify book appears in shelf | P1 | Yes | Creates temporary shelf and cleans it up after the test. |
| Shelves | Book Details reflects shelf association after add | P1 | Yes | Reopens the book from the shelf and checks the shelf appears in remove-from-shelf controls. |
| Shelves | Temporary shelf is deleted after test | P1 | Yes | Prevents test pollution from accumulating shelves. |
| Navigation | Sidebar browse/discovery options are visible | P1 | Yes | Confirms the user can discover major sections. |
| Navigation | Hot Books route opens from sidebar | P1 | Yes | Smoke test for browse navigation. |
| Authorization | Regular user cannot access admin Books List page `/table` | P0 | Recommended next | High-value broken access-control test. Safe if it only visits/asserts. |
| Authorization | Non-admin should not see or use archive/bulk admin controls | P0/P1 | Manual / future | Avoid clicking state-changing controls in automation unless cleanup and permission behavior are clear. |
| Testability | UI lacks dedicated stable test selectors | Medium | Documented | Tests rely on best available IDs/names/hrefs/classes because app HTML has no test hooks. |

### Additional Security Checks

In addition to the functional and exploratory testing described above, I performed basic manual security checks against the authentication workflows, including:

- SQL injection: Tested common payloads. No issues observed.
- XSS: Tested common payloads. No issues observed.
- CSRF: Login requests without a valid CSRF token were rejected

These were basic exploratory security checks and were not intended to be a comprehensive security assessment.

## 4. Automated Coverage

Current Cypress specs:

- `cypress/e2e/01_authentication.cy.js`
- `cypress/e2e/critical_user_flows.cy.js`

The authentication spec covers login page rendering, valid login, safe negative login checks, logout, Remember Me default state, and the Forgot Password unknown-username enumeration message. The Remember Me and username-enumeration tests are expected to fail while the bugs exist.

The critical flow spec covers authenticated catalog behavior, search, book detail modal rendering, sidebar navigation, and the shelf workflow. The shelf test creates a temporary shelf, adds a book to it, verifies the book is present in that shelf, verifies the Book Details modal reflects the shelf association, and deletes the temporary shelf using a cleanup request.

Important implementation choices:

- Selectors are centralized in `cypress/support/selectors.js`.
- Test data and repeated labels are centralized in `cypress/support/testData.js`.
- Repeated actions such as login, search, opening Book Details, creating shelves, adding books to shelves, and deleting temporary shelves are Cypress custom commands.
- The shelf cleanup uses the app's CSRF token and posts to the shelf delete route so test shelves do not accumulate.

## 5. Current Automated Results

The authentication spec intentionally contains checks for known bugs. With the current app behavior, these tests fail as expected:

- `does not enable Remember Me by default`
- `shows a generic password recovery message for an unknown username`

Those failures are useful because they represent real issues found during exploratory testing.

## 6. Tests Intentionally Not Automated

Some test ideas are important but not good candidates for repeatable automation against the live challenge account:

| Test Idea | Reason Not Automated |
|---|---|
| Valid username + invalid password repeatedly | Can contribute to account lockout/rate limiting. |
| Valid username Forgot Password comparison | It changes/resets the account password. This was removed from active automation. |
| Rate-limit exhaustion | Requires deliberately consuming the auth quota. |
| Plaintext password recovery email contents | Requires mailbox access and changes the user's password. |
| Password recovery after account email update | Requires changing the valid account email, triggering password recovery, checking external email delivery, and accepting that the previous password may stop working. |
| Post-Redirect-Get refresh/resubmission | Can repeat auth requests and consume rate-limit quota. |
| Clicking admin archive controls | State-changing admin action; safer to assert non-admin access is blocked instead. |

## 7. Bug Summary

These are the current important bugs/findings from exploratory testing. Please refer to bug-report.md for more details.

| ID | Finding | Severity | Automation Status |
|---|---|---:|---|
| BUG-01 | Forgot Password allows username enumeration | High | Automated with unknown-user generic-message check; currently failing. |
| BUG-02 | Login and Forgot Password share the same rate-limit bucket | Medium-High | Manual/security finding. Not safe to exhaust quota in Cypress. |
| SEC-01 | Password recovery sends plaintext generated passwords by email | High | Manual/security finding. Requires email inspection. |
| BUG-03 | Remember Me is enabled by default | Low-Medium | Automated; currently failing. |
| BUG-04 | Authentication forms do not use Post-Redirect-Get | Medium | Manual finding. Automation would repeat auth POSTs. |
| BUG-05 | Books List management page accessible to regular user | High | Recommended next automation target. |
| BUG-06 | Archive action on Books List returns 403 while page remains visible | Medium | Manual finding; root issue is non-admin access to the page. |
| BUG-07 | Password recovery fails after updating account email address | High | Manual/security finding. Not safe to automate against the shared live account. |
| OBS-01 | UI lacks dedicated stable test selectors | Medium | Testability observation; not a product failure by itself. |


## 8. Reflection

I started by exploring the application as a typical user would: logging in, searching for books, opening Book Details, and navigating through the sidebar. This helped me understand the application's functionality before focusing on areas that were more likely to contain security or functional issues, such as password recovery, persistent login, rate limiting, shelves, and access control.

For automation, I focused on stable, repeatable user flows including login, logout, catalog navigation, search, Book Details, sidebar navigation, and shelf creation using temporary test data with cleanup. I intentionally did not automate workflows that could permanently affect the shared test account or environment, such as password recovery for valid accounts, account email changes, authentication rate-limit testing, and administrator-only operations.

## 9. App Feedback

### What I liked most

The application has a clear and intuitive purpose. Finding books, viewing their details, and organizing them into personal shelves are easy to understand without needing additional guidance. The left-hand navigation provides multiple ways to browse the library, making it easy to explore the catalog beyond simple keyword searches.

I also liked the Book Details modal. Opening book information in a dialog keeps the browsing experience smooth while allowing users to view metadata, mark books as read or archived, and manage shelf assignments.

The shelf feature adds useful personalization by letting users organize books into their own collections. It also represents a realistic end-to-end workflow, making it a good candidate for automation testing.

### What should be improved

The biggest area for improvement is authentication and account recovery. The Forgot Password workflow reveals whether a username exists by returning different responses for valid and invalid accounts. It also emails a newly generated password instead of using a time-limited password reset link, which is less common and generally considered a less secure recovery approach.

Consider reviewing the authentication rate-limiting strategy. Login and Forgot Password currently appear to share the same rate-limit bucket, meaning repeated password recovery attempts can temporarily prevent a user from signing in with valid credentials. Using separate or independently tuned limits for these workflows could improve the user experience while still providing protection against abuse.

Also consider adding a show/hide password toggle to the password field. This would allow users to verify their input before submitting the login form, reducing accidental failed login attempts. Since the application temporarily rate-limits authentication after multiple failed attempts, helping users avoid typing errors would improve the overall login experience.

I also did not like that Remember Me is enabled by default. Persistent login should be an explicit user choice, particularly on shared or public devices.

I found some inconsistencies around authorization. For example, the Books List page exposes archive controls that return a 403 Forbidden response when used, while the same archive action succeeds from the Book Details dialog. Users should either have access to the functionality from both locations or not be presented with controls they are not authorized to use.

From an automation perspective, the application would benefit from dedicated test selectors (for example, data-testid attributes). The current HTML provides enough stable IDs, names, and classes to automate the main workflows, but explicit test hooks would make the test suite more resilient to future UI changes.

### How I would improve it

I would start by addressing the authentication and account recovery workflows:

- Replace password-by-email recovery with a time-limited password reset link.
- Return the same generic response for both valid and invalid usernames during password recovery.
- Leave Remember Me unchecked by default so users explicitly opt in to persistent sessions.
- Apply the Post-Redirect-Get pattern after authentication form submissions so refreshing the page does not resubmit the previous POST request.
- Ensure users are not presented with controls or pages they are not authorized to use. If an action is forbidden, the corresponding UI should be hidden or  inaccessible rather than returning a 403 only after the user attempts it.

From a testability perspective, I would add stable attributes such as data-testid or data-cy to key UI elements, including the login form, search box, book cards, Book Details dialog, shelf actions, and management controls. This would make the automated tests more resilient to UI changes without affecting the user experience.

### Features I would like to see

A few features would make the app more useful as a reading tool:

- Reading progress, allowing users to resume books where they left off.
- A "Recently Viewed" or "Recently Read" section on the home page for quicker access to books.
- Private notes or ratings associated with a user's account.
- More consistent authorization handling by hiding controls and pages that the current user is not permitted to access, rather than exposing them and returning a 403 only after an action is attempted.
