Observation (From automation perspective)

UI elements don't have stable test selector and rely on CSS classes, IDs, or text instead.
This makes UI automation more brittle because styling changes can break tests.

-------

### Test Environment

Application Login Page: https://testapp1.andresfloresv.com/login
Test Account: Non-administrator account provided for the challenge.

-------
BUG-01 - Password Recovery Fails After Updating Account Email Address (Severity: High)

Description: After updating the account email address, the Forgot Password workflow reports that the password was reset and sent by email. However, no recovery email is delivered to either the old or updated email address, and the previous password no longer works.

Steps:

Navigate to the Login page and Log in to the application.
Click profile menu on top right and view details.
Update the account email address and save the change.
Refresh the page to confirm the new email address was saved.
Log out.
Trigger the Forgot Password workflow for the account.
Observe the success message: "New Password was sent to your email address".
Check both the previous and updated email addresses.
Attempt to log in using the previous password.

Expected: After the account email address is updated, Forgot Password sends the recovery email to the currently saved email address. The user receives the recovery email and can regain access through the password recovery process.

Actual: The application displays a successful password reset message, but no recovery email is received at either email address. The previous password no longer authenticates.

Impact/Risk: Users can become locked out of their accounts with no working recovery path after updating their email address.

--------
BUG-02 - Forgot Password Allows Username Enumeration (Severity: High)

Description: Forgot Password reveals whether a username exists by returning different responses for valid and invalid usernames.

Steps: Navigate to the Login page. Enter a non-existent username → click Forgot Password. Observe response. Now enter a valid username and click forgot password and observe response.

Expected: Return the same generic response regardless of whether the username exists or not.

Actual: 
Valid username -> "New Password was sent..."
Invalid username -> "Please enter valid username to reset password."

Impact/Risk: Attackers can enumerate valid usernames for targeted attacks.

-----

BUG-03 - Authentication Rate Limiting Blocks Login and Password Recovery (Severity: Medium-High)

Description: Login and Forgot Password share the same rate-limit bucket, preventing users from recovering access once the limit is exhausted.

Steps:

Navigate to the Login page.
Submit 4 Forgot Password requests. (only 3 attempts per 60s window allowed)
Now rate limiting is triggered.
Attempt to:
Log in using the latest password received by email.


Expected: Authentication and password recovery should not unnecessarily interfere with one another. Legitimate users who possess valid credentials should not be prevented from signing in solely because the Forgot Password rate limit has been exceeded.

Actual: Both Login and Forgot Password requests are blocked after the rate limit is exhausted.

Impact/Risk: Legitimate users can become locked out of their accounts with no way to recover access until the rate limit expires.

----------
SEC-01 - Password Recovery Sends Plaintext Passwords via Email (Severity: High)

Description: Forgot Password generates a new password and sends it directly in the email.

Steps: Navigate to the Login page. Enter a valid username → click Forgot Password → open the recovery email.

Expected: Send a time-limited password reset link or token so the user can choose a new password.

Actual: Email contains the newly generated login password.

Impact/Risk: Credentials are transmitted and stored in email, increasing the risk of credential exposure if the mailbox is compromised or forwarded.

---------
BUG-04 - Remember Me Enabled by Default (Severity: Low-Medium)

Description: "Remember Me" is selected automatically when the Login page loads.

Steps: Navigate to the Login page.

Expected: "Remember Me" is unchecked by default.

Actual: "Remember Me" is enabled by default.

Impact/Risk: Users may unintentionally create persistent login sessions on shared or public devices.

--------
BUG-05 - Authentication Forms Do Not Use Post-Redirect-Get Pattern (Severity: Medium)

Description: Login and Forgot Password return the POST response directly instead of redirecting after submission.

Steps:

Navigate to the Login page.
Submit an invalid Login or Forgot Password request.
Refresh the page or duplicate the browser tab.
Confirm form resubmission.

Expected: The application redirects after processing the POST request, so refreshing repeats only a GET request.

Actual: The browser resubmits the original POST request.

Impact/Risk: Users can unintentionally repeat authentication requests, consuming rate-limit quota and causing confusing browser behavior.

-----
BUG - 06
Admin-only Books List page accessible to regular user (Severity: High)
Description : Admin-only page is accessible to regular user
Steps: Navigate to the Login page. Log in as non-admin → navigate to /table by clicking "Books List" in sidebar
Expected: 403 or redirect to home
Actual: Full admin table renders with bulk-management controls
Impact/Risk: A regular user can see and attempt admin operations on all books in the library

Archive action on Books List page returns 403 for non-admin user (Severity: Medium)

Steps: On /table, click an archive checkbox
Expected: Either works (if user has permission) or the page is inaccessible
Actual: 403 shown inline as a banner while the page remains rendered — no blocking, no redirect, just a red error at the top
