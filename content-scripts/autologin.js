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

    // Helper to find all elements matching selector, piercing shadow DOM roots
    const querySelectorAllDeep = (selector, root = document) => {
      const elements = Array.from(root.querySelectorAll(selector));
      const hasShadow = el => el.shadowRoot;
      const shadowElements = Array.from(root.querySelectorAll('*')).filter(hasShadow);
      
      for (const el of shadowElements) {
        elements.push(...querySelectorAllDeep(selector, el.shadowRoot));
      }
      return elements;
    };

    const querySelectorDeep = (selector, root = document) => {
      const elements = querySelectorAllDeep(selector, root);
      return elements.length > 0 ? elements[0] : null;
    };

    // Robust function to locate login fields piercing shadow DOM
    const findLoginFields = () => {
      const allInputs = querySelectorAllDeep('input');
      let usernameField = null;
      let passwordField = null;

      // Try exact ID/attribute matches first
      usernameField = querySelectorDeep('#username') || 
                      querySelectorDeep('input[autocomplete="username"]') || 
                      querySelectorDeep('input[name="username"]');
                      
      passwordField = querySelectorDeep('#password') || 
                      querySelectorDeep('input[type="password"]');

      if (usernameField && passwordField) {
        return { usernameField, passwordField };
      }

      // Fallback: search all inputs
      for (const input of allInputs) {
        const type = (input.getAttribute('type') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const id = (input.getAttribute('id') || '').toLowerCase();
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();

        if (type === 'password' || name === 'pw' || name === 'password' || id === 'password') {
          passwordField = input;
          continue;
        }

        if (
          name === 'username' ||
          id === 'username' ||
          placeholder.includes('username') ||
          placeholder.includes('email') ||
          ariaLabel.includes('username') ||
          ariaLabel.includes('email')
        ) {
          usernameField = input;
        }
      }

      return { usernameField, passwordField };
    };

    // Wait for the login fields to appear (handles slow-loading LWC/Aura components)
    const waitForLoginFields = (timeoutMs = 8000) => {
      return new Promise((resolve, reject) => {
        const check = () => {
          const fields = findLoginFields();
          if (fields.usernameField && fields.passwordField) {
            resolve(fields);
            return true;
          }
          return false;
        };

        if (check()) return;

        const observer = new MutationObserver(() => {
          if (check()) {
            observer.disconnect();
          }
        });

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          const finalFields = findLoginFields();
          if (finalFields.usernameField && finalFields.passwordField) {
            resolve(finalFields);
          } else {
            reject(new Error(`SF Vault+: Login fields not found within ${timeoutMs}ms`));
          }
        }, timeoutMs);
      });
    };

    // Simulate realistic user input events
    const fillField = (field, value) => {
      field.focus();
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
    };

    try {
      const { usernameField, passwordField } = await waitForLoginFields(5000);

      fillField(usernameField, username);
      fillField(passwordField, password);

      // Focus the Login button
      const loginBtn = querySelectorDeep('#Login') ||
                       querySelectorDeep('button.loginButton') ||
                       querySelectorDeep('input[type="submit"]') ||
                       querySelectorDeep('button[type="submit"]');
      if (loginBtn) {
        loginBtn.focus();
      }
    } catch (err) {
      console.warn(err.message);
    }

  } catch (err) {
    console.warn('SF Vault+: Auto-fill error:', err.message);
  }
})();
