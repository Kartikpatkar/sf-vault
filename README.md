# Salesforce Vault — Securely Manage & Auto-Login to All Your Salesforce Orgs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://github.com/your-username/sf-vault)  

**Simplify your Salesforce workflows by securely storing your credentials and switching effortlessly between multiple orgs.**

---

## 🚀 Features

- 🔒 **Secure Credential Storage:** Encrypt and save Salesforce usernames, passwords, security tokens, or OAuth tokens locally using Chrome's storage with AES encryption.
- 🔄 **Multi-Org Management:** Add, edit, or delete multiple Salesforce org profiles (Dev, Prod, Sandbox).
- 🖱️ **Quick Org Switcher:** Popup UI for one-click login to any saved org.
- ⚡ **Auto-fill & Auto-login:** Detect Salesforce login pages, fill in credentials automatically, and optionally submit the login form.
- 🔐 **Master Password Protection:** Unlock your saved credentials with a master password or biometric authentication (if supported).
- 🔄 **Export & Import:** Backup and restore your org profiles securely.
- 🔔 **Notifications:** Alerts for login failures or expired tokens.
- ⚙️ **Configurable Settings:** Enable or disable auto-fill and auto-login per org.

---

## 🛠️ Installation

### Option 1: Chrome Web Store (Coming Soon)

The extension will soon be available for easy installation from the Chrome Web Store.  
Keep an eye on this repo or the Chrome Web Store for the official release!

### Option 2: Manual Installation

If you want to try Salesforce Vault before the official release, you can install it manually:

1. Clone or download this repository:  
   ```bash
   git clone https://github.com/your-username/salesforce-vault.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** by toggling the switch in the top-right corner.
4. Click **Load unpacked** and select the `/dist` folder inside the cloned repo after building.
5. The Salesforce Vault icon will appear next to your address bar—click it to open the extension.

---

## 📦 Usage

1. Click the Salesforce Vault icon in the Chrome toolbar.
2. Add a new Salesforce org profile by entering credentials or OAuth tokens.
3. Toggle auto-fill and auto-login options per profile.
4. Visit the Salesforce login page for your org; the extension will auto-fill your credentials.
5. Switch between multiple orgs instantly from the popup menu.

---

## 🔐 Security

- All credentials are encrypted locally using AES encryption.
- Credentials never leave your browser.
- Optional master password or biometric authentication required to decrypt stored data.
- OAuth token support to enhance security and reduce reliance on passwords.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built for Salesforce professionals who value security and efficiency. Simplify your login experience with **Salesforce Vault**.
