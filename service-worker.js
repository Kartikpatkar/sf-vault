/**
 * SF Vault+ — Service Worker (Background Script)
 * Handles login launcher: opens Salesforce URLs in new tab/window/incognito
 * and triggers auto-fill of credentials on the login page.
 */

// Allow content scripts to access chrome.storage.session
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' }).catch(err => {
  console.warn('SF Vault+: Could not set session storage access level:', err.message);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_AND_LOGIN') {
    handleOpenAndLogin(message.data)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }
});

/**
 * Open a Salesforce login URL and auto-fill credentials.
 * @param {Object} data
 * @param {string} data.loginUrl - The URL to open
 * @param {string} data.username - Username to fill
 * @param {string} data.password - Password to fill
 * @param {string} data.mode - 'tab' | 'window' | 'incognito'
 */
async function handleOpenAndLogin({ loginUrl, username, password, mode }) {
  const url = loginUrl || 'https://login.salesforce.com';
  let tabId;

  try {
    if (mode === 'incognito') {
      const win = await chrome.windows.create({ url, incognito: true });
      tabId = win.tabs[0].id;
    } else if (mode === 'window') {
      const win = await chrome.windows.create({ url });
      tabId = win.tabs[0].id;
    } else {
      const tab = await chrome.tabs.create({ url });
      tabId = tab.id;
    }

    // Store credentials temporarily in session storage for the content script
    await chrome.storage.session.set({
      pendingAutoFill: { tabId, username, password }
    });

    // Wait for the page to finish loading, then inject the auto-fill script
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);

        // Inject auto-fill content script
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['content-scripts/autologin.js']
        }).catch(err => {
          console.warn('SF Vault+: Could not inject auto-fill script:', err.message);
        });
      }
    });

    return { success: true };
  } catch (err) {
    console.error('SF Vault+: Login launcher error:', err);
    return { success: false, error: err.message };
  }
}
