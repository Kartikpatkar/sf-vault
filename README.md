# 🗂️ SF Vault+ – Salesforce Credential Manager & Org Launcher

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](#)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg?logo=google-chrome)](#)
[![Salesforce](https://img.shields.io/badge/Salesforce-Developer%20Tool-00A1E0.svg)](#)

> **Tagline:** *Organize, manage, and launch Salesforce credentials with speed, structure, and confidence.*

---

## ✨ Overview

**SF Vault+** is a modern, offline-first Chrome Extension built specifically for Salesforce Developers, Admins, Architects, Consultants, QA teams, and support engineers who manage multiple Salesforce environments daily.

Unlike traditional password managers, SF Vault+ focuses on:

* Salesforce credential organization
* Client-based folder structures
* Multi-org management
* Fast credential access
* One-click login workflows
* Local-first privacy

Whether you're managing:

```text
Client A
├── Production
├── UAT
├── SIT
└── Development

Client B
├── Production
└── Sandbox

Client C
├── Production
└── UAT
```

SF Vault+ helps you stay organized without spreadsheets, sticky notes, shared documents, or generic password managers.

---

## 🚀 Key Features

### 🗂️ Unlimited Folder & Subfolder Organization

Organize credentials using a hierarchical folder structure.

Examples:

```text
Salesforce
├── Client A
│   ├── Production
│   ├── UAT
│   └── Dev
│
├── Client B
│   ├── Production
│   └── Sandbox
│
AWS
│
Databases
```

Features include:

* Unlimited nested folders
* Subfolder navigation cards
* Folder tree sidebar
* Folder counts
* Breadcrumb navigation
* Folder rename
* Folder deletion
* Move credentials between folders

---

### 🔑 Credential Management

Store and organize:

* Salesforce Credentials
* AWS Credentials
* Database Credentials
* Internal Applications
* Third-party Services
* API Credentials

Credential fields include:

* Title
* Username
* Password
* Security Token
* OAuth Token
* Login URL
* Alias
* Org ID
* Tags
* Notes
* Color Labels

---

### ☁️ Salesforce Org Support

Built specifically for Salesforce professionals.

Supported org types:

* Production
* Sandbox
* Developer Edition
* Scratch Org
* Trailhead Playground
* Partner Org
* Government Cloud
* Custom Domain
* Community

Visual color-coded badges help quickly identify environments.

---

### ⭐ Favorites

Mark important credentials as favorites.

Quickly access:

* Production orgs
* Frequently used sandboxes
* Critical customer environments

Dedicated Favorites section in the sidebar.

---

### 🏷️ Tags & Metadata

Organize credentials with tags.

Examples:

```text
production
sandbox
uat
customer-a
customer-b
critical
migration
```

Search and filter instantly using tags.

---

### 🔍 Global Search

Instant full-text search across:

* Credential title
* Username
* Alias
* Org ID
* Notes
* Tags

Search results display folder breadcrumbs for context.

---

### ⚡ Auto Login

Launch Salesforce logins directly from the extension.

Supported domains:

* login.salesforce.com
* test.salesforce.com
* *.my.salesforce.com

Features:

* Auto-fill username
* Auto-fill password
* Open in new tab
* Open in current tab
* Open in incognito window

---

### 📦 Import & Export

Protect your vault with local backups.

#### Export

Download your entire vault as:

```json
{
  "folders": [],
  "credentials": []
}
```

#### Import

Restore:

* Previous SF Vault+ backups
* Migration files
* Shared vault exports

#### Sample JSON

Generate a sample file to understand the format before importing.

---

### ⚙️ Settings & Storage

Manage:

* Light Theme
* Dark Theme
* Storage Usage
* Backup & Restore
* Clear Vault Data

Storage usage is displayed visually with a progress bar.

---

### 🎨 Modern Developer Experience

Built using a modern design system featuring:

* Dark Mode by default
* Glassmorphism effects
* Smooth animations
* Responsive layout
* Premium SaaS styling
* Keyboard-friendly workflows

Designed specifically for daily Salesforce usage.

---

## 📸 Screenshots

### 🌑 Dark Theme

* Dashboard
* Folder Tree
* Credential View
* Login Launcher
* Settings Panel

### ☀️ Light Theme

* Dashboard
* Search Results
* Import / Export
* Favorites View

---

## 🛠 Built With

* HTML5
* CSS3
* Vanilla JavaScript (ES Modules)
* Chrome Extensions API
* Manifest V3
* Chrome Storage API
* Service Workers
* Content Scripts

Architecture:

```text
sf-vault/

manifest.json

service-worker.js

popup/
├── popup.html
├── popup.js
└── popup.css

content-scripts/
└── autologin.js

services/
├── storage.service.js
├── folder.service.js
├── credential.service.js

utils/
└── utils.js
```

---

## 📦 Installation

### 🌐 Chrome Web Store

Coming Soon.

---

### 🔧 Load Extension Manually

Clone the repository:

```bash
git clone https://github.com/Kartikpatkar/sf-vault.git
cd sf-vault
```

Open:

```text
chrome://extensions
```

Enable:

```text
Developer Mode
```

Click:

```text
Load Unpacked
```

Select the project folder containing:

```text
manifest.json
```

Done 🎉

---

## 🎯 How To Use

### Create Your First Vault

1. Open SF Vault+
2. Create a root folder
3. Create subfolders
4. Add credentials
5. Save

Example:

```text
Salesforce
└── Client A
    ├── Production
    ├── UAT
    └── Dev
```

---

### Add Credentials

1. Open desired folder
2. Click New Credential
3. Enter details
4. Save

---

### Launch Login

1. Open credential card
2. Click Login
3. Choose:

* Current Tab
* New Tab
* Incognito Window

SF Vault+ handles the rest.

---

### Backup Your Vault

1. Open Settings
2. Click Export
3. Save backup file

To restore:

1. Click Import
2. Select backup file
3. Confirm

---

## 🧪 Current Capabilities

✅ Unlimited folders

✅ Nested subfolders

✅ Credential CRUD

✅ Salesforce org support

✅ Favorites

✅ Tags

✅ Global Search

✅ Auto Login

✅ Import

✅ Export

✅ Storage Usage Monitoring

✅ Light Theme

✅ Dark Theme

✅ Offline First

✅ Chrome Storage Integration

✅ Manifest V3

---

## 🛣️ Roadmap

### Version 1.1

* Recently Used Credentials
* Folder Credential Counts
* Bulk Actions
* Enhanced Search

### Version 1.2

* Smart Views
* Production View
* Sandbox View
* Recent Logins

### Version 1.3

* Omnibox Search
* Keyboard Shortcuts
* Quick Launcher

### Version 2.0

* Optional Encryption
* Master Password
* WebAuthn Support
* Biometric Unlock

---

## 🔐 Security & Privacy

### Privacy First

SF Vault+ follows a strict local-first architecture.

### Security Principles

1. No external servers
2. No analytics
3. No telemetry
4. No tracking
5. No account creation
6. No cloud dependency
7. All processing happens locally

### Storage

Credentials are stored using:

```javascript
chrome.storage.local
```

Nothing leaves your browser.

---

## 🔑 Permissions

| Permission | Purpose                        |
| ---------- | ------------------------------ |
| storage    | Store credentials and settings |
| tabs       | Launch login sessions          |
| scripting  | Auto-fill login pages          |
| activeTab  | Detect current Salesforce page |

No unnecessary permissions requested.

---

## 🤝 Contributing

Contributions, ideas, bug reports, and feature requests are welcome.

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push branch
5. Open Pull Request

---

## 🧠 Author

Built by **Kartik Patkar**

Salesforce Developer • Chrome Extension Builder

GitHub:
https://github.com/Kartikpatkar

LinkedIn:
https://linkedin.com/in/kartik-patkar

Trailhead:
https://www.salesforce.com/trailblazer/kpatkar1

---

## 📜 License

Licensed under the MIT License.

Free to use, modify, and distribute.

---

> **SF Vault+** — Because managing Salesforce credentials should be organized, secure, and effortless.
