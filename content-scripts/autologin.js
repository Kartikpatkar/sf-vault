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

    // Helper to check if an element is visible in the DOM
    const isVisible = el => {
      if (el.type === 'hidden') return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rects = el.getClientRects();
      if (el.offsetWidth === 0 && el.offsetHeight === 0 && rects.length === 0) return false;
      return true;
    };

    // Robust function to locate login fields piercing shadow DOM
    const findLoginFields = () => {
      const allInputs = querySelectorAllDeep('input').filter(isVisible);
      let usernameField = null;
      let passwordField = null;

      // Try exact ID/attribute matches first on visible elements
      usernameField = querySelectorDeep('#username') || 
                      querySelectorDeep('input[autocomplete="username"]') || 
                      querySelectorDeep('input[name="username"]');
                      
      passwordField = querySelectorDeep('#password') || 
                      querySelectorDeep('input[type="password"]');

      if (usernameField && passwordField && isVisible(usernameField) && isVisible(passwordField)) {
        return { usernameField, passwordField };
      }

      // Reset and use scored visible input fallback
      usernameField = null;
      passwordField = null;

      for (const input of allInputs) {
        const type = (input.getAttribute('type') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const id = (input.getAttribute('id') || '').toLowerCase();
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
        const className = (input.className || '').toLowerCase();

        if (type === 'password' || name === 'pw' || name === 'password' || id === 'password') {
          if (!passwordField) {
            passwordField = input;
          }
          continue;
        }

        if (
          name === 'username' ||
          id === 'username' ||
          placeholder.includes('username') ||
          placeholder.includes('email') ||
          ariaLabel.includes('username') ||
          ariaLabel.includes('email') ||
          className.includes('username') ||
          className.includes('email')
        ) {
          if (!usernameField) {
            usernameField = input;
          }
        }
      }

      return { usernameField, passwordField };
    };

    // Wait for the login fields to appear (handles slow-loading LWC/Aura components)
    const waitForLoginFields = (timeoutMs = 10000) => {
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
            clearInterval(pollInterval);
          }
        });

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });

        const pollInterval = setInterval(() => {
          if (check()) {
            observer.disconnect();
            clearInterval(pollInterval);
          }
        }, 150);

        setTimeout(() => {
          observer.disconnect();
          clearInterval(pollInterval);
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
      const { usernameField, passwordField } = await waitForLoginFields(10000);

      fillField(usernameField, username);
      fillField(passwordField, password);

      // Clean up storage only after successful auto-fill
      await chrome.storage.session.remove('pendingAutoFill');

      // Focus the Login button
      let loginBtn = querySelectorDeep('#Login') ||
                     querySelectorDeep('button.loginButton') ||
                     querySelectorDeep('input[type="submit"]') ||
                     querySelectorDeep('button[type="submit"]') ||
                     querySelectorDeep('.loginButton') ||
                     querySelectorDeep('button[id*="login"]') ||
                     querySelectorDeep('input[id*="login"]');

      if (!loginBtn) {
        // Text-content based search as a fallback
        const allButtons = querySelectorAllDeep('button').concat(querySelectorAllDeep('input[type="button"]'));
        for (const button of allButtons) {
          const text = (button.textContent || button.value || '').toLowerCase();
          if (text.includes('log in') || text.includes('login') || text.includes('sign in')) {
            loginBtn = button;
            break;
          }
        }
      }

      if (loginBtn) {
        loginBtn.focus();
      }
    } catch (err) {
      console.warn(err.message);
      // Clean up storage on final timeout failure to prevent stale credential issues
      await chrome.storage.session.remove('pendingAutoFill');
    }

  } catch (err) {
    console.warn('SF Vault+: Auto-fill error:', err.message);
  }
})();
