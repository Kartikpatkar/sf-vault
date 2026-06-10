# SF Vault+ — Salesforce Credential Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.1-blue.svg)](https://github.com/Kartikpatkar/sf-vault)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/)

> **Offline-first credential organization and productivity tool for Salesforce professionals.**  
> Securely store, organize, and manage credentials across unlimited folders — right in your browser.

---

## ✨ Features

### 🗂️ Folder-Based Organization
- Create **unlimited nested folders** to organize credentials by client, org type, team, or any structure you choose
- **Subfolder cards** visible inside parent folders for easy navigation
- **Clickable breadcrumb path** — navigate up your folder hierarchy instantly
- Right-click folder context menu: Add Subfolder, Rename, Delete

### 🔑 Credential Management
- Store **username, password, security token, OAuth token, Org ID, URL, tags, and notes**
- Support for **all Salesforce org types**: Production, Sandbox, Developer, Scratch, Trailhead, Partner, Government
- **Compact card view** — shows only the credential name + action icons; expands on click to reveal full details
- **Favorites** — star any credential for instant access from the sidebar
- Copy username, password, security token, or URL to clipboard in one click

### ⚡ Auto-Login
- Detects Salesforce login pages (`login.salesforce.com`, `test.salesforce.com`, `*.my.salesforce.com`)
- **Auto-fills** username and password fields
- Launch login via the extension popup with a single click
- Works in both standard and incognito windows (incognito requires manual permission)

### 🔍 Search
- Live full-text search across title, username, alias, Org ID, notes, and tags
- Results display with folder breadcrumbs for context

### ⚙️ Settings & Backup
- **Export vault** — download all credentials as a JSON file
- **Import vault** — restore from a previously exported JSON backup
- **Download Sample JSON** — get a reference template to create your data
- **Storage Usage bar** — see how much of Chrome's local storage you've used
- **Danger Zone** — clear all data with confirmation
- **Light / Dark theme** toggle — your preference is remembered
- **About the Author** — profile card with social links

---

## 🛠️ Installation

### Option 1: Chrome Web Store *(Coming Soon)*

The extension will be published to the Chrome Web Store soon.

### Option 2: Load Unpacked (Developer Mode)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kartikpatkar/sf-vault.git
   cd sf-vault
   ```

2. **Open Chrome** and navigate to `chrome://extensions/`

3. **Enable Developer Mode** using the toggle in the top-right corner

4. Click **Load unpacked** and select the root `sf-vault/` folder (the one containing `manifest.json`)

5. The **SF Vault+** icon will appear in your Chrome toolbar — click it to open the popup

> **Incognito Support:** To use auto-fill in incognito windows, go to `chrome://extensions/` → SF Vault+ → Details → enable **"Allow in Incognito"**.

---

## 📦 Usage

### Adding Your First Credential

1. Click the **SF Vault+** toolbar icon
2. Click **New Folder** (action bar) to create a root folder (e.g. "Clients")
3. Navigate into the folder, then click **New Sub Folder** in the sidebar to add nested folders
4. Click **+ New Credential** (action bar) to add a credential to the current folder
5. Fill in the org details and click **Save**

### Auto-Login

1. Open the credential card and click the **Login** (↗) button
2. Select **Auto-login (current tab)** or **Open new tab**
3. The extension detects the Salesforce login page and fills in your credentials automatically

### Backup & Restore

1. Open **Settings** (⚙ icon in the header)
2. Use **Export** to download a `sf-vault-backup.json` snapshot of all your data
3. Use **Import** to restore from a backup file
4. Use **Sample JSON** to download a reference template

---

## 📁 Project Structure

```
sf-vault/
├── manifest.json              # Extension manifest (MV3)
├── service-worker.js          # Background service worker (auto-login coordination)
├── popup/
│   ├── popup.html             # Extension popup shell
│   ├── popup.js               # Main UI logic, state, event delegation
│   └── popup.css              # Design system & component styles
├── content-scripts/
│   └── autologin.js           # Injected into Salesforce login pages
├── services/
│   ├── credential.service.js  # Credential CRUD operations
│   ├── folder.service.js      # Folder hierarchy & tree building
│   └── storage.service.js     # chrome.storage.local wrapper
└── utils/
    └── utils.js               # Shared helpers, constants, SVG icons
```

---

## 🔐 Privacy & Security

- **All data is stored locally** in `chrome.storage.local` — nothing is ever sent to a server
- Credentials never leave your device
- No telemetry, no analytics, no external API calls
- Open source — audit the code yourself

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues and pull requests.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Kartik Patkar**

[![GitHub](https://img.shields.io/badge/GitHub-Kartikpatkar-black?logo=github)](https://github.com/Kartikpatkar/diff-board)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-kartik--patkar-blue?logo=linkedin)](https://www.linkedin.com/in/kartik-patkar)
[![Trailhead](https://img.shields.io/badge/Trailhead-kpatkar1-00a1e0?logo=salesforce)](https://www.salesforce.com/trailblazer/kpatkar1)

> Built with ❤️ for the Salesforce community.
