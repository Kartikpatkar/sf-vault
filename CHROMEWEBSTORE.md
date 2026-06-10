# Chrome Web Store Listing — SF Vault+

> Last Updated: 2026-06-10

## Store Listing

**Extension Name** [REQUIRED]
SF Vault+

**Short Description** [REQUIRED]
Secure offline credential organizer with nested folders and login autofill for Salesforce professionals.

**Detailed Description** [REQUIRED]
SF Vault+ is a secure, offline-first credential organizer and productivity assistant tailored specifically for Salesforce consultants, developers, and administrators. Keep your org credentials organized, categorized, and protected on your local device.

Key Features:
* Unlimited nested folder structure to organize credentials by client, project, or environment.
* Secure local vault encryption: credentials and folders are encrypted on-device using AES-GCM (256-bit) and a user-defined Master Password.
* Dynamic session key caching (in session memory only) or secure "Remember password" persistent storage.
* Fast dynamic search across org titles, usernames, aliases, notes, and tags.
* Star/Favorite credentials for instant access.
* Secure auto-fill for Salesforce logins: launch environments in New Tab, New Window, or Incognito Mode, and let SF Vault+ safely populate fields.
* Supports Salesforce Production, Sandboxes, Scratch Orgs, Custom Domains, and Experience Cloud/Communities.
* Zero-knowledge model: no servers, no tracking, and no external data transmission.
* Export and import your credentials vault as password-encrypted backup files.

How to use:
1. Open the extension popup and set up your Master Password.
2. Create folders (e.g., "Client A", "Production Orgs") to set up your hierarchy.
3. Click "New Credential" to add your Salesforce details.
4. Hover over any card and click "Login" to open the org in your preferred mode with safe, hands-free autofill.
5. Search at any time to locate any org within seconds.

Privacy & Permissions:
SF Vault+ is designed with a zero-tracking policy. All data remains encrypted on your local device. We only request permissions necessary to open Salesforce pages, fill in login forms, and safeguard database storage size limits.

Support:
For issues, feedback, or suggestions, please visit our repository support page at:
https://github.com/Kartikpatkar/sf-vault/issues

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Securely stores Salesforce environment credentials locally and automates login field populating on Salesforce domains.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `assets/icons/logo-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | `artifacts/screenshot1.png` |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | `artifacts/screenshot2.png` |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | `artifacts/screenshot3.png` |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | `artifacts/promo_small.png` |

### Screenshot Notes
* **Screenshot 1**: The main credentials vault panel showing client folders, environment color badges (PROD, SANDBOX), and the search bar.
* **Screenshot 2**: The nested subfolder view, showing folders like "Client A > Integration" and favorited items marked with stars.
* **Screenshot 3**: The credential creation/edit modal showing URL and Salesforce org type options (Production, Sandbox, Custom Domain, Community).

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Used to store the credentials vault, folder hierarchy, and user theme settings locally on the device using `chrome.storage.local`, as well as temporary tab credentials via `chrome.storage.session`. |
| `scripting` | permissions | Used to programmatically inject the auto-fill script (`content-scripts/autologin.js`) into target Salesforce tabs to populate the username and password fields. |
| `tabs` | permissions | Used to listen for page loads (`chrome.tabs.onUpdated` and `chrome.tabs.onRemoved`) on target login tabs so that the auto-fill script is injected precisely when the login DOM is ready. |
| `unlimitedStorage` | permissions | Used to lift profile storage write limits (10MB default) to safely support large credentials lists, attachments, and extensive custom notes. |
| `*://login.salesforce.com/*` | host_permissions | Allows the extension to interact with and auto-fill credentials on the standard Salesforce Production login portal. |
| `*://test.salesforce.com/*` | host_permissions | Allows the extension to interact with and auto-fill credentials on the standard Salesforce Sandbox login portal. |
| `*://*.my.salesforce.com/*` | host_permissions | Allows the extension to interact with and auto-fill credentials on Salesforce custom domains. |
| `*://*.force.com/*` | host_permissions | Allows the extension to interact with and auto-fill credentials on older Salesforce sandbox, developer, and community domains. |
| `*://*.my.site.com/*` | host_permissions | Allows the extension to interact with and auto-fill credentials on Salesforce Experience Cloud/Communities (LWC-based and custom login pages). |
| `*://*.mil.site.com/*` | host_permissions | Allows the extension to interact with and auto-fill credentials on Salesforce public sector government site domains. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Authentication info | Yes | No | Credentials (username, password, security token) are saved locally on the user's browser database (`chrome.storage.local`) to provide vault storage and login automation. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL** [RECOMMENDED]
https://github.com/Kartikpatkar/sf-vault/blob/main/PRIVACY_POLICY.md

---

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

---

## Developer Info

**Publisher Name** [REQUIRED]
Kartik Patkar

**Contact Email** [REQUIRED]
developer@example.com

**Homepage URL** [RECOMMENDED]
https://github.com/Kartikpatkar/sf-vault

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.1 | 2026-06-11 | Integrated AES-GCM database encryption, lock/unlock UI views, password-protected backups, unlimited storage support, and resolved Experience Cloud login auto-fill issues. | Draft |
