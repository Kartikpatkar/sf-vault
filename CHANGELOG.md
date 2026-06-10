# Changelog

All notable changes to **SF Vault+** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.1] — 2026-06-10

### Added

#### 🎨 UI / UX
- **Light mode as default theme** — Extension now opens in light mode. Theme preference (light/dark) is persisted in `chrome.storage.local` and restored on next open.
- **Compact credential cards** — Cards now show only the credential name + icon-only action buttons (favorite, copy, login, more). Clicking a card expands it to reveal full details (username, org type, badge, tags, notes, etc.).
- **Clickable breadcrumb navigation** — When inside a folder, the breadcrumb bar shows the full path (`All › Parent › Current`). Every ancestor segment is clickable and navigates directly to that folder.
- **Subfolder cards in content pane** — When a folder contains subfolders, those subfolders are shown as compact 2-column tile cards at the top of the content area. Clicking a tile navigates into that subfolder.

#### 🗂️ Folder Management
- **Separated "New Folder" and "New Sub Folder" flows:**
  - Action bar **"New Folder"** button opens a simple dialog (name only) and always creates a root-level folder.
  - Sidebar **"New Sub Folder"** button opens a dialog with a parent folder dropdown, defaulting to the currently selected folder.
  - Right-click → **Add Subfolder** still works as before.
- **`nav-breadcrumb` click handler** — New click action that navigates to any ancestor folder by its ID.
- **`getFolderPathIds()` helper** — Returns the full folder ancestry as `[{ id, name }]` for use in the clickable breadcrumb.
- **`renderFolderCard()` helper** — Renders a subfolder tile with folder icon, name, and credential/subfolder count badge.

#### ⚙️ Settings Page
- **Storage Usage bar** — Visual progress bar showing KB used vs 10 240 KB Chrome local storage limit.
- **Sample JSON download** — "Sample JSON" button in the Backup & Restore section downloads a reference template file users can fill in and import.
- **Author / Profile modal** — Profile button (👤) added to the top-right of the Settings header. Clicking it opens a glassmorphism modal showing:
  - Gradient avatar, author name (Kartik Patkar), and tagline
  - SF Vault+ app badge
  - Social links grid: GitHub, LinkedIn, Trailhead, Email
  - Copyright footer

#### 🔐 Auto-Login
- **Username auto-fill fix** — Content script (`autologin.js`) now correctly uses `chrome.storage.session` with `TRUSTED_AND_UNTRUSTED_CONTEXTS` access level so credentials can be read from the injected content script context.
- Both username and password fields are now reliably auto-filled on Salesforce login pages.

---

### Changed

#### 🗂️ Folder Management
- Sidebar folder creation button label changed from **"New Folder"** to **"New Sub Folder"** to make the distinction between root folder and subfolder creation clear.
- `showAddFolderModal` is now two separate functions:
  - `showAddRootFolderModal()` — simple name-only dialog, `save-root-folder` action
  - `showAddFolderModal(initialParentId)` — with parent dropdown, `save-folder` action

#### 🎨 UI / UX
- **`renderContent()`** completely rewritten to support subfolder tiles + clickable breadcrumb while still handling Search, Favorites, and All Credentials views correctly.
- Settings page **Appearance section removed** (no longer needed — theme toggle moved to main header).
- **Backup & Restore** section repositioned above Storage Usage in the Settings layout.

---

### Fixed

- `Auto-fill error: Access to storage is not allowed from this context` — resolved by using `chrome.storage.session` with the correct `TRUSTED_AND_UNTRUSTED_CONTEXTS` access level in the service worker and content script.
- Password field was not being auto-filled — fixed by ensuring the session storage write from the service worker completes before the content script reads it.
- Orphaned CSS comment fragment left after subfolder card styles were inserted — cleaned up.
- `--sidebar-hover` CSS variable was referenced but never defined — replaced with `--bg-tertiary`.
- Bottom action bar "New Folder" button was incorrectly opening the "New Sub Folder" modal — restored to a dedicated simple root-folder creation flow.

---

## [1.0.0] — Initial Release

### Added

#### Core Architecture
- **Manifest V3** Chrome extension with service worker background script
- **`chrome.storage.local`** for offline-first credential and folder persistence via `StorageService`
- **`FolderService`** — hierarchical folder tree building, CRUD operations, path resolution
- **`CredentialService`** — credential CRUD operations with folder association
- **`StorageService`** — low-level storage wrapper with size calculation utilities
- Shared `utils.js` — helpers (`generateId`, `formatDate`, `debounce`, `copyToClipboard`, `escapeHtml`), org type constants, and centralized SVG `Icons` object

#### Popup UI
- Full glassmorphism design system with CSS custom properties for dark/light themes
- **Header** — logo, theme toggle (sun/moon), settings gear button
- **Sidebar** — "All Credentials", "Favorites" quick nav; nested folder tree with expand/collapse chevrons; right-click context menu (Add Subfolder, Rename, Delete); "New Sub Folder" button
- **Content area** — credential cards, empty states, folder breadcrumb
- **Action bar** — "New Folder" and "+ New Credential" buttons
- **Search bar** — live search with clear button; results show folder breadcrumb on cards
- **Modals** — Add/Edit Credential, Add Root Folder, Add Sub Folder, Rename Folder, Delete confirmation, Copy menu, Login menu
- **Toast notifications** — success / error / info
- **Context menus** — right-click on folders; "Copy Actions" and "Login Actions" dropdown menus on credential cards
- **Settings page** — Backup & Restore (Export / Import / Sample JSON), Storage Usage bar, Danger Zone (Clear All), Author modal

#### Credential Fields
- Title, Username, Password (show/hide toggle), Security Token, OAuth Token, Org ID, URL, Org Type (badge-coded), Tags, Notes

#### Org Types with Color Coding
- Production (red), Sandbox (blue), Developer (purple), Scratch (orange), Trailhead (green), Partner (indigo), Government (dark), Other (gray)

#### Auto-Login (Content Script)
- `autologin.js` injected into `login.salesforce.com`, `test.salesforce.com`, `*.my.salesforce.com`
- Service worker receives login request from popup, writes credentials to `chrome.storage.session`, then injects the content script
- Content script reads from session storage and auto-fills + optionally submits the login form
- Supports standard tab and new tab launch modes

---

*© 2026 Kartik Patkar — SF Vault+*
