# 🤝 Contributing to SF Vault+

Thank you for your interest in contributing to **SF Vault+**!

SF Vault+ is an **offline-first Salesforce Credential Manager & Org Launcher** built specifically for Salesforce Developers, Admins, Architects, Consultants, QA teams, and support engineers.

The project focuses on:

* Credential organization
* Folder & subfolder hierarchy
* Salesforce productivity
* Privacy-first local storage
* Offline-first architecture
* Chrome Extension best practices

We welcome contributions related to:

* Bug fixes
* New features
* Performance improvements
* UI / UX enhancements
* Accessibility improvements
* Documentation updates
* Security reviews

---

# 🧩 Ways to Contribute

## 🐞 Report Bugs

Found an issue?

Please create an issue and include:

* Clear description of the problem
* Steps to reproduce
* Expected behavior
* Actual behavior
* Chrome version
* Operating system
* Screenshots or recordings (if applicable)
* Console errors (if any)

For Salesforce-related issues include:

* Org Type (Production / Sandbox / Developer / Scratch Org)
* Login URL type
* Whether Auto Login was used

---

## 💡 Suggest Features

Have an idea?

Please create a feature request and include:

* Problem being solved
* Why it improves Salesforce workflows
* Expected user experience
* Mockups or screenshots (optional)

We especially welcome ideas around:

* Folder management
* Credential organization
* Search improvements
* Salesforce productivity
* Auto-login enhancements
* Accessibility
* Performance optimization
* Keyboard shortcuts
* Omnibox integration
* Credential launcher workflows

---

## 💻 Submit Code

Pull requests are welcome for:

* Bug fixes
* New functionality
* Refactoring
* UI improvements
* Documentation updates
* Performance enhancements

Please keep pull requests focused and avoid unrelated changes.

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/Kartikpatkar/sf-vault.git
cd sf-vault
```

---

## Load Extension in Chrome

1. Open Chrome

```text
chrome://extensions/
```

2. Enable:

```text
Developer Mode
```

3. Click:

```text
Load Unpacked
```

4. Select the project root folder containing:

```text
manifest.json
```

The extension will now appear in your browser toolbar.

---

## Test Locally

Recommended testing scenarios:

### Folder Management

* Create folders
* Create subfolders
* Rename folders
* Delete folders
* Verify breadcrumb navigation

### Credential Management

* Add credentials
* Edit credentials
* Delete credentials
* Move credentials
* Test tags
* Test favorites

### Search

* Search by title
* Search by username
* Search by Org ID
* Search by tags
* Search by notes

### Import / Export

* Export vault
* Import exported vault
* Import invalid JSON
* Test large vaults

### Auto Login

Test:

* login.salesforce.com
* test.salesforce.com
* *.my.salesforce.com

Verify:

* Username fill
* Password fill
* Login launch flow

### Theme Support

Verify:

* Dark theme
* Light theme
* Theme persistence

---

# ✅ Before Submitting a Pull Request

## 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
```

---

## 2. Keep Changes Focused

Good:

```text
feat: Add credential counts to folders
```

Avoid:

```text
Feature + Refactor + UI Redesign + Documentation
```

in a single pull request.

---

## 3. Test Thoroughly

Verify:

* No console errors
* No service worker errors
* No storage corruption
* No broken folder hierarchy
* No UI regressions
* No theme issues

---

## 4. Update Documentation

If applicable:

* README.md
* CHANGELOG.md
* PRIVACY.md

should be updated alongside your code changes.

---

## 5. Submit Pull Request

Include:

* Clear title
* Description
* Screenshots (for UI changes)
* Testing performed
* Related issue references

Example:

```text
Closes #15
```

---

# 🧪 Testing Guidelines

Please test with:

### Small Vaults

```text
1-20 credentials
```

### Medium Vaults

```text
50-200 credentials
```

### Large Vaults

```text
500+ credentials
```

Verify:

* Search speed
* Folder performance
* Import/export functionality
* Storage integrity

---

# 📚 Code Style Guide

## JavaScript

Requirements:

* ES Modules
* Modular architecture
* Clear naming conventions
* Async/Await preferred
* Avoid callback nesting
* Avoid global variables

Example:

```javascript
export async function getCredentials() {
    return StorageService.get('credentials');
}
```

---

## Chrome Extension Standards

Follow:

* Manifest V3
* Service Worker architecture
* CSP compliance
* Minimal permissions

Avoid:

* Inline JavaScript
* Remote code execution
* Unsafe eval
* Excessive permissions

---

## CSS

Requirements:

* Follow design system variables
* Support dark and light themes
* Mobile-friendly layouts
* Reusable classes

Avoid:

```css
!important
```

unless absolutely necessary.

---

## HTML

Requirements:

* Semantic HTML
* Accessibility support
* Keyboard navigation
* ARIA labels where appropriate

---

# 🗂️ Project Structure

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

Maintain the existing architecture whenever possible.

Avoid introducing unnecessary complexity.

---

# 🔒 Security Guidelines

Security is a core principle of SF Vault+.

Contributors must ensure:

### Privacy First

* No analytics
* No tracking
* No telemetry
* No cloud services

### Local First

All user data must remain local.

Use:

```javascript
chrome.storage.local
```

for storage.

---

### Never

Do NOT:

* Send credentials to servers
* Store credentials externally
* Add third-party tracking
* Introduce hidden network requests
* Log passwords or tokens

---

### Permissions

Request new permissions only when absolutely necessary.

Every permission must have a clear justification.

---

# 🎨 UI / UX Guidelines

Maintain consistency with the existing design language.

Design principles:

* Modern SaaS aesthetics
* Clean layouts
* Minimal clutter
* Fast interactions
* Accessible controls
* Consistent spacing
* Responsive behavior

The UI should feel comfortable for users managing hundreds of Salesforce credentials daily.

---

# 📝 Commit Message Guidelines

Use conventional commit messages.

Examples:

```text
feat: Add recently used credentials section

fix: Resolve folder breadcrumb navigation issue

docs: Update installation instructions

style: Improve dark theme contrast

refactor: Simplify storage service implementation
```

Avoid:

```text
fixed stuff

update

changes
```

---

# 🙌 Code of Conduct

Please be respectful and collaborative.

We follow the principles of the Contributor Covenant:

* Be welcoming
* Be constructive
* Respect differing viewpoints
* Focus on improving the project
* Help others learn

---

# 🎯 Priority Contribution Areas

We especially welcome contributions related to:

### Folder Management

* Drag & Drop folders
* Folder reordering
* Folder statistics

### Search

* Faster search
* Advanced filtering
* Search indexing

### Salesforce Productivity

* Enhanced login workflows
* Org metadata support
* Smart launch actions

### Accessibility

* Keyboard navigation
* Screen reader support
* Improved focus management

### Performance

* Faster rendering
* Better storage handling
* Reduced memory usage

### Security

* Encryption roadmap
* WebAuthn support
* Secure local storage enhancements

---

# ✨ Recognition

Contributors may be:

* Mentioned in release notes
* Credited in project documentation
* Recognized for helping improve Salesforce developer productivity

---

## 📬 Questions?

Open an issue for:

* Questions
* Discussions
* Suggestions
* Feedback

Please search existing issues before creating a new one.

---

Thank you for contributing to **SF Vault+** ❤️

Together we're building a better way for Salesforce professionals to organize, manage, and launch their Salesforce environments.
