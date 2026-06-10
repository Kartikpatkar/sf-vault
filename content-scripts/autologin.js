/**
 * SF Vault+ — Auto-Fill Content Script
 * Injected into Salesforce login pages by the service worker.
 * Reads pending credential data from session storage, fills the
 * username and password fields, then cleans up.
 *
 * Does NOT auto-submit — the user clicks Login themselves.
 */

(async () => {
  try {
    // Read the pending auto-fill data stored by the service worker
    const { pendingAutoFill } = await chrome.storage.session.get('pendingAutoFill');
    if (!pendingAutoFill) return;

    const { username, password } = pendingAutoFill;
    if (!username && !password) return;

    // Clean up immediately so it doesn't fire again on refresh
    await chrome.storage.session.remove('pendingAutoFill');

    // Wait for a DOM element to appear (handles slow-loading pages)
    const waitForElement = (selector, timeoutMs = 8000) => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(selector);
        if (existing) return resolve(existing);

        const observer = new MutationObserver(() => {
          const el = document.querySelector(selector);
          if (el) {
            observer.disconnect();
            resolve(el);
          }
        });

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`SF Vault+: Element "${selector}" not found within ${timeoutMs}ms`));
        }, timeoutMs);
      });
    };

    // Simulate realistic user input
    const fillField = (field, value) => {
      field.focus();
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
    };

    // Salesforce standard login page selectors
    // login.salesforce.com and test.salesforce.com use #username, #password
    // Custom domains (*.my.salesforce.com) may use the same or Lightning selectors
    const selectors = [
      { user: '#username', pass: '#password' },                         // Standard login
      { user: 'input[name="username"]', pass: 'input[name="pw"]' },     // Alternate
      { user: 'input[type="email"]', pass: 'input[type="password"]' }   // Generic fallback
    ];

    let filled = false;

    for (const { user, pass } of selectors) {
      try {
        const usernameField = await waitForElement(user, 3000);
        const passwordField = await waitForElement(pass, 3000);

        if (usernameField && passwordField) {
          fillField(usernameField, username);
          fillField(passwordField, password);

          // Focus the Login button (if visible) so user can just press Enter
          const loginBtn = document.querySelector('#Login') ||
                           document.querySelector('input[type="submit"]') ||
                           document.querySelector('button[type="submit"]');
          if (loginBtn) {
            loginBtn.focus();
          }

          filled = true;
          break;
        }
      } catch {
        // Selector not found, try next
        continue;
      }
    }

    if (!filled) {
      console.info('SF Vault+: Could not find login form fields on this page.');
    }

  } catch (err) {
    console.warn('SF Vault+: Auto-fill error:', err.message);
  }
})();
