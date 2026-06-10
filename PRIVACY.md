# Privacy Policy for SF Vault+

**Last Updated:** June 10, 2026

Your privacy and the security of your credentials are of paramount importance. This Privacy Policy details how **SF Vault+** handles data, what information is stored, and your controls over your personal data.

---

## 1. What Data We Collect

To provide its core functionality (credential organization and Salesforce login automation), SF Vault+ stores the following information:

* **Authentication Information**: Salesforce usernames, passwords, security tokens, and login URLs.
* **Organization Metadata**: Folder structures (folder names, nesting parent relations, ordering), credential titles, environment badges (Production, Sandbox, Developer, Scratch Org, Community), aliases, org IDs, and optional notes/tags.
* **User Preferences**: UI configuration settings, such as your theme preference (light or dark mode).

---

## 2. How Data Is Stored and Transmitted

SF Vault+ is designed with an **offline-first, zero-tracking architecture**:

* **Local Storage & Encryption**: All credentials, folder hierarchies, and settings are stored locally on your physical device using the browser's sandbox environment (`chrome.storage.local`). Stored sensitive data is encrypted on-device using AES-GCM (256-bit) with a key derived from your user-defined Master Password.
* **No Cloud Syncing**: The extension does **not** use `chrome.storage.sync` or any external cloud services. Your data never leaves your device.
* **No Remote Servers**: SF Vault+ does **not** transmit any credential, session, or usage data off your device. There is no remote database or server connection.
* **Temporary Session Data**: When launching an auto-fill login action, credentials are temporarily placed in the browser's session storage (`chrome.storage.session`). This session data is stored in memory and is programmatically cleared immediately upon a successful login, early tab closure, or after a 20-second timeout.


---

## 3. Third-Party Services and Analytics

* **No Tracking**: This extension does not utilize any third-party analytics trackers, telemetry libraries, error-reporting services, or advertising networks.
* **No Third-Party APIs**: No external APIs are called. The extension operates completely within the offline sandbox of your Google Chrome browser.

---

## 4. Data Sharing and Sale

* **We do not share, sell, rent, trade, or distribute your data** to any third parties, advertisers, or organizations. All of your authentication information is strictly private to your browser profile.

---

## 5. Data Retention and Deletion

You have complete control over all data stored by the extension:

* **User-Initiated Deletion**: You can delete individual credentials or entire folders at any time directly through the extension's user interface.
* **Full Database Purge**: You can wipe the entire database by clicking the "Clear All Data" option in the settings menu, or by uninstalling the extension from your browser.
* **Local Backups**: The import/export features generate a password-encrypted backup file of your vault. The backup file is encrypted using AES-GCM (256-bit) with a user-supplied password to safeguard your credentials.

---

## 6. Changes to This Policy

We may update this Privacy Policy from time to time to reflect functional changes or legal requirements. Any updates will be logged in the project's repository, and the "Last Updated" date at the top of this page will be revised accordingly.

---

## 7. Contact

If you have any questions, feedback, or concerns regarding data privacy and security, please contact us or open an issue on our support page:

* **Support Page**: [https://github.com/Kartikpatkar/sf-vault/issues](https://github.com/Kartikpatkar/sf-vault/issues)
* **Contact Email**: kartikkp.assets@gmail.com
