/**
 * SF Vault+ — Main Popup Application
 * Renders the UI, manages state, handles all user interactions.
 */

import FolderService from '../services/folder.service.js';
import CredentialService from '../services/credential.service.js';
import StorageService from '../services/storage.service.js';
import {
  generateId, formatDate, debounce, copyToClipboard,
  isSalesforceUrl, escapeHtml,
  ORG_TYPE_COLORS, ORG_TYPE_LABELS, ORG_TYPES, Icons
} from '../utils/utils.js';

// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
const state = {
  folders: [],
  credentials: [],
  currentFolderId: null,   // selected folder (null = "All")
  showingFavorites: false,
  showingAll: true,
  searchQuery: '',
  theme: 'light',
  expandedFolders: new Set(),
  expandedCredentialIds: new Set(),
  editingCredentialId: null
};

const PREFS_KEY = 'sf_vault_prefs';

// ═══════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadPreferences();
  await loadData();
  applyTheme();
  renderHeader();
  renderSearchBar();
  renderSidebar();
  renderContent();
  renderActionBar();
  setupGlobalListeners();
}

async function loadData() {
  state.folders = await FolderService.getFolders();
  state.credentials = await CredentialService.getAllCredentials();
}

async function loadPreferences() {
  const prefs = await StorageService.get(PREFS_KEY);
  if (prefs) {
    state.theme = prefs.theme || 'light';
    state.expandedFolders = new Set(prefs.expandedFolders || []);
    state.currentFolderId = prefs.currentFolderId || null;
    state.showingAll = prefs.showingAll !== false;
    state.showingFavorites = prefs.showingFavorites || false;
  }
}

async function savePreferences() {
  await StorageService.set(PREFS_KEY, {
    theme: state.theme,
    expandedFolders: [...state.expandedFolders],
    currentFolderId: state.currentFolderId,
    showingAll: state.showingAll,
    showingFavorites: state.showingFavorites
  });
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

// ═══════════════════════════════════════════════════════
// RENDER: HEADER
// ═══════════════════════════════════════════════════════
function renderHeader() {
  const el = document.getElementById('app-header');
  el.innerHTML = `
    <div class="header-left">
      <div class="header-logo">${Icons.lock}</div>
      <span class="header-title">SF Vault+</span>
    </div>
    <div class="header-actions">
      <button class="icon-btn" data-action="toggle-theme" title="${state.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
        ${state.theme === 'dark' ? Icons.sun : Icons.moon}
      </button>
      <button class="icon-btn" data-action="open-settings" title="Settings">
        ${Icons.settings}
      </button>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════
// RENDER: SEARCH BAR
// ═══════════════════════════════════════════════════════
function renderSearchBar() {
  const el = document.getElementById('app-search');
  el.innerHTML = `
    <div class="search-wrapper">
      <span class="search-icon">${Icons.search}</span>
      <input type="text" class="search-input" id="search-input"
             placeholder="Search credentials..." value="${escapeHtml(state.searchQuery)}">
      <button class="search-clear ${state.searchQuery ? '' : 'hidden'}"
              data-action="clear-search" title="Clear search">${Icons.x}</button>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════
// RENDER: SIDEBAR (Folder Tree)
// ═══════════════════════════════════════════════════════
function renderSidebar() {
  const el = document.getElementById('app-sidebar');
  const tree = FolderService.buildTree(state.folders);
  const favCount = state.credentials.filter(c => c.isFavorite).length;
  const allCount = state.credentials.length;

  el.innerHTML = `
    <div class="sidebar-section">
      <div class="nav-item ${state.showingAll && !state.showingFavorites ? 'active' : ''}"
           data-action="show-all">
        <span class="nav-icon">${Icons.list}</span>
        <span>All</span>
        <span class="nav-badge">${allCount}</span>
      </div>
      <div class="nav-item ${state.showingFavorites ? 'active' : ''}"
           data-action="show-favorites">
        <span class="nav-icon">${Icons.starFilled}</span>
        <span>Favorites</span>
        ${favCount > 0 ? `<span class="nav-badge">${favCount}</span>` : ''}
      </div>
    </div>
    <div class="sidebar-divider"></div>
    <div class="sidebar-section" style="flex:1; overflow-y:auto;">
      <div class="sidebar-label">Folders</div>
      ${tree.length > 0 ? renderFolderTree(tree, 0) : '<div style="padding: 8px 10px; font-size: 11px; color: var(--text-tertiary);">No folders yet</div>'}
    </div>
    <div class="sidebar-add-folder">
      <button class="add-folder-btn" data-action="add-root-folder">
        ${Icons.plus} New Folder
      </button>
    </div>
  `;
}

function renderFolderTree(nodes, level) {
  return nodes.map(node => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = state.expandedFolders.has(node.id);
    const isActive = !state.showingAll && !state.showingFavorites && state.currentFolderId === node.id;
    const indent = level * 14;

    const credCount = state.credentials.filter(c => c.folderId === node.id).length;

    return `
      <div class="folder-item ${isActive ? 'active' : ''}"
           data-folder-id="${node.id}"
           data-action="select-folder"
           data-id="${node.id}"
           style="padding-left: ${8 + indent}px;"
           title="${escapeHtml(node.name)}">
        <span class="folder-toggle ${isExpanded ? 'expanded' : ''} ${hasChildren ? '' : 'empty'}"
              data-action="toggle-expand"
              data-id="${node.id}">
          ${Icons.chevronRight}
        </span>
        <span class="folder-icon">${isExpanded && hasChildren ? Icons.folderOpen : Icons.folder}</span>
        <span class="folder-name">${escapeHtml(node.name)}</span>
        ${credCount > 0 ? `<span class="nav-badge" style="font-size:9px;min-width:14px;height:14px;">${credCount}</span>` : ''}
      </div>
      ${hasChildren ? `<div class="folder-children" style="max-height: ${isExpanded ? '2000px' : '0px'}; overflow: hidden;">
        ${renderFolderTree(node.children, level + 1)}
      </div>` : ''}
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════
// RENDER: CONTENT (Credential Cards)
// ═══════════════════════════════════════════════════════
function renderContent() {
  const el = document.getElementById('app-content');
  let creds = [];
  let title = '';
  let showBreadcrumbOnCards = false;

  if (state.searchQuery) {
    // Search results
    const q = state.searchQuery.toLowerCase();
    creds = state.credentials.filter(c =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.username && c.username.toLowerCase().includes(q)) ||
      (c.alias && c.alias.toLowerCase().includes(q)) ||
      (c.orgId && c.orgId.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
    );
    title = `Search results (${creds.length})`;
    showBreadcrumbOnCards = true;
  } else if (state.showingFavorites) {
    creds = state.credentials.filter(c => c.isFavorite);
    title = 'Favorites';
    showBreadcrumbOnCards = true;
  } else if (state.showingAll) {
    creds = [...state.credentials];
    title = 'All Credentials';
    showBreadcrumbOnCards = true;
  } else if (state.currentFolderId) {
    creds = state.credentials.filter(c => c.folderId === state.currentFolderId);
    const folder = state.folders.find(f => f.id === state.currentFolderId);
    title = folder ? folder.name : 'Folder';
  }

  if (creds.length === 0) {
    el.innerHTML = renderEmptyState();
    return;
  }

  // Build breadcrumb for folder view
  let breadcrumbHtml = '';
  if (!state.showingAll && !state.showingFavorites && !state.searchQuery && state.currentFolderId) {
    const path = getFolderPathSync(state.currentFolderId);
    breadcrumbHtml = `<div class="breadcrumb">
      ${path.map((name, i) => `${i > 0 ? '<span class="breadcrumb-separator">›</span>' : ''}
        <span class="${i === path.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item'}">${escapeHtml(name)}</span>`).join('')}
    </div>`;
  }

  el.innerHTML = `
    ${breadcrumbHtml}
    ${creds.map(c => renderCredentialCard(c, showBreadcrumbOnCards)).join('')}
  `;
}

function renderCredentialCard(cred, showBreadcrumb = false) {
  const color = ORG_TYPE_COLORS[cred.orgType] || ORG_TYPE_COLORS['Other'];
  const label = ORG_TYPE_LABELS[cred.orgType] || 'OTHER';
  const badgeClass = cred.orgType.toLowerCase().replace(/\s+/g, '-');
  const isFav = cred.isFavorite;
  const isExpanded = state.expandedCredentialIds.has(cred.id);

  let breadcrumbHtml = '';
  if (showBreadcrumb && cred.folderId) {
    const path = getFolderPathSync(cred.folderId);
    if (path.length > 0) {
      breadcrumbHtml = `<div class="card-breadcrumb">${Icons.folder} ${path.map(n => escapeHtml(n)).join(' › ')}</div>`;
    }
  }

  if (!isExpanded) {
    // Compact mode
    return `
      <div class="credential-card compact" style="border-left-color: ${color};" data-credential-id="${cred.id}" data-action="toggle-card-expand" data-id="${cred.id}">
        ${breadcrumbHtml}
        <div class="card-compact-row">
          <span class="card-title" title="${escapeHtml(cred.title)}">${escapeHtml(cred.title)}</span>
          <div class="card-actions compact" onclick="event.stopPropagation()">
            <button class="card-fav-btn ${isFav ? 'active' : ''}"
                    data-action="toggle-fav" data-id="${cred.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ${isFav ? Icons.starFilled : Icons.star}
            </button>
            <button class="card-action-icon-btn" data-action="show-copy-menu" data-id="${cred.id}" title="Copy Actions">
              ${Icons.copy}
            </button>
            <button class="card-action-icon-btn" data-action="show-login-menu" data-id="${cred.id}" title="Login Actions">
              ${Icons.externalLink}
            </button>
            <button class="card-more-btn" data-action="show-card-menu" data-id="${cred.id}" title="More actions">
              ${Icons.moreVertical}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Expanded mode
  return `
    <div class="credential-card expanded" style="border-left-color: ${color};" data-credential-id="${cred.id}">
      ${breadcrumbHtml}
      <div class="card-header" data-action="toggle-card-expand" data-id="${cred.id}" style="cursor: pointer;">
        <div class="card-title-row">
          <span class="card-title" title="${escapeHtml(cred.title)}">${escapeHtml(cred.title)}</span>
        </div>
        <button class="card-fav-btn ${isFav ? 'active' : ''}"
                data-action="toggle-fav" data-id="${cred.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" onclick="event.stopPropagation()">
          ${isFav ? Icons.starFilled : Icons.star}
        </button>
      </div>
      <div class="card-body-expanded">
        <div class="card-username" title="${escapeHtml(cred.username)}">${escapeHtml(cred.username)}</div>
        <div class="card-meta">
          <span class="org-badge ${badgeClass}">${label}</span>
          ${cred.alias ? `<span style="font-size:10px;color:var(--text-tertiary);">${escapeHtml(cred.alias)}</span>` : ''}
        </div>
        ${cred.tags && cred.tags.length > 0 ? `
          <div class="card-tags">
            ${cred.tags.map(t => `<span class="card-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
        ${cred.notes ? `<div class="card-notes-preview" style="font-size:11px;color:var(--text-secondary);background:var(--bg-tertiary);padding:6px;border-radius:4px;margin-bottom:8px;white-space:pre-wrap;word-break:break-all;">${escapeHtml(cred.notes)}</div>` : ''}
        <div class="card-actions">
          <button class="card-action-btn" data-action="show-copy-menu" data-id="${cred.id}">
            ${Icons.copy} Copy <span class="caret">▾</span>
          </button>
          <button class="card-action-btn" data-action="show-login-menu" data-id="${cred.id}">
            ${Icons.externalLink} Login <span class="caret">▾</span>
          </button>
          <button class="card-more-btn" data-action="show-card-menu" data-id="${cred.id}" title="More actions">
            ${Icons.moreVertical}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  if (state.searchQuery) {
    return `<div class="empty-state">
      <div class="empty-state-icon">${Icons.search}</div>
      <div class="empty-state-title">No matches found</div>
      <div class="empty-state-text">Try a different search term</div>
    </div>`;
  }
  if (state.showingFavorites) {
    return `<div class="empty-state">
      <div class="empty-state-icon">${Icons.star}</div>
      <div class="empty-state-title">No favorites yet</div>
      <div class="empty-state-text">Star credentials for quick access</div>
    </div>`;
  }
  if (state.showingAll && state.credentials.length === 0) {
    return `<div class="empty-state">
      <div class="empty-state-icon">${Icons.lock}</div>
      <div class="empty-state-title">Welcome to SF Vault+</div>
      <div class="empty-state-text">Create a folder and add your first credential to get started</div>
      <button class="empty-state-btn" data-action="add-root-folder">${Icons.plus} Create Folder</button>
    </div>`;
  }
  return `<div class="empty-state">
    <div class="empty-state-icon">${Icons.folder}</div>
    <div class="empty-state-title">No credentials here</div>
    <div class="empty-state-text">Add a credential to this folder</div>
    <button class="empty-state-btn" data-action="add-credential">${Icons.plus} Add Credential</button>
  </div>`;
}

// ═══════════════════════════════════════════════════════
// RENDER: ACTION BAR
// ═══════════════════════════════════════════════════════
function renderActionBar() {
  const el = document.getElementById('app-actions');
  el.innerHTML = `
    <button class="action-btn action-btn-secondary" data-action="add-root-folder">
      ${Icons.folder} New Folder
    </button>
    <button class="action-btn action-btn-primary" data-action="add-credential">
      ${Icons.plus} New Credential
    </button>
  `;
}

// ═══════════════════════════════════════════════════════
// RENDER: SETTINGS
// ═══════════════════════════════════════════════════════
// Helper to get storage size in KB
async function getStorageSize() {
  try {
    const data = await StorageService.getAll();
    const str = JSON.stringify(data);
    return str.length / 1024;
  } catch {
    return 0;
  }
}

const sampleJson = {
  version: "1.0.0",
  exportDate: new Date().toISOString(),
  folders: [
    {
      id: "folder-uuid-1",
      name: "Salesforce Client A",
      parentId: null,
      color: null,
      order: 0,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    },
    {
      id: "folder-uuid-2",
      name: "Sandbox Orgs",
      parentId: "folder-uuid-1",
      color: null,
      order: 0,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    }
  ],
  credentials: [
    {
      id: "cred-uuid-1",
      folderId: "folder-uuid-2",
      title: "UAT Org",
      username: "admin@client-a.uat",
      password: "password123",
      token: "SECURITY_TOKEN_HERE",
      loginUrl: "https://test.salesforce.com",
      alias: "client-a-uat",
      orgId: "00Dxx000000xxxx",
      notes: "Important notes go here.",
      tags: ["uat", "client-a"],
      color: null,
      isFavorite: true,
      orgType: "Sandbox",
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    }
  ]
};

async function renderSettings() {
  const el = document.getElementById('settings-view');
  const usedKb = await getStorageSize();
  const limitKb = 10240;
  const progressPercent = Math.min(100, (usedKb / limitKb) * 100);

  el.innerHTML = `
    <div class="settings-header">
      <button class="icon-btn" data-action="close-settings">${Icons.arrowLeft}</button>
      <span class="settings-title">Settings</span>
    </div>
    <div class="settings-body">
      <div class="settings-card">
        <div class="settings-card-title">Backup & Restore</div>
        <div class="settings-card-desc">Export, import, or get a template file</div>
        <div class="settings-btn-row">
          <button class="btn btn-secondary" data-action="export-vault">
            ${Icons.download} Export
          </button>
          <button class="btn btn-secondary" data-action="import-vault">
            ${Icons.upload} Import
          </button>
          <button class="btn btn-secondary" data-action="download-sample" title="Download sample JSON template" style="padding: 4px 6px; font-size: 11px;">
            ${Icons.download} Sample JSON
          </button>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-title">Storage Usage</div>
        <div class="settings-card-desc">Local chrome storage details</div>
        <div class="storage-usage-container">
          <div class="storage-progress-bar">
            <div class="storage-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="storage-usage-text">
            <span>${usedKb.toFixed(2)} KB used</span>
            <span class="storage-usage-separator">--------</span>
            <span>${limitKb} KB limit</span>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-title" style="color:var(--danger);">Danger Zone</div>
        <div class="settings-card-desc">Irreversible actions</div>
        <button class="btn btn-danger btn-block" data-action="clear-all-data">
          ${Icons.trash} Clear All Data
        </button>
      </div>

      <div class="settings-version">
        SF Vault+ v1.0.1 · Offline-first credential manager
      </div>
    </div>
  `;

  el.classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function closeSettings() {
  document.getElementById('settings-view').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════
function showModal(html) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.classList.remove('hidden');
}

function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}

/** Show Add/Edit Credential modal */
function showCredentialModal(credential = null) {
  const isEdit = !!credential;
  const title = isEdit ? 'Edit Credential' : 'New Credential';

  // Build folder options with hierarchy
  const tree = FolderService.buildTree(state.folders);
  const folderOptions = buildFolderOptions(tree, 0);

  const defaultUrl = 'https://login.salesforce.com';
  const c = credential || {};
  const tags = (c.tags || []).map(t => `<span class="tag-pill">${escapeHtml(t)}<button class="tag-pill-remove" data-action="remove-tag" data-tag="${escapeHtml(t)}">×</button></span>`).join('');

  showModal(`
    <div class="modal-header">
      <span class="modal-title">${title}</span>
      <button class="modal-close" data-action="close-modal">${Icons.x}</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input class="form-input" id="cred-title" placeholder="e.g. Production Org" value="${escapeHtml(c.title || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Username *</label>
        <input class="form-input" id="cred-username" placeholder="e.g. admin@company.com" value="${escapeHtml(c.username || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="form-password-wrapper">
          <input class="form-input" id="cred-password" type="password" placeholder="Enter password" value="${escapeHtml(c.password || '')}">
          <button class="form-password-toggle" data-action="toggle-password" title="Show/Hide password">${Icons.eye}</button>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Security Token</label>
          <input class="form-input" id="cred-token" placeholder="Token" value="${escapeHtml(c.token || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Org Type</label>
          <select class="form-select" id="cred-orgtype">
            ${ORG_TYPES.map(t => `<option value="${t}" ${c.orgType === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Login URL</label>
        <input class="form-input" id="cred-url" placeholder="${defaultUrl}" value="${escapeHtml(c.loginUrl || defaultUrl)}">
      </div>
      <div class="form-group">
        <label class="form-label">Folder</label>
        <select class="form-select" id="cred-folder">
          <option value="">— No Folder —</option>
          ${folderOptions}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Alias</label>
          <input class="form-input" id="cred-alias" placeholder="Optional alias" value="${escapeHtml(c.alias || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Org ID</label>
          <input class="form-input" id="cred-orgid" placeholder="e.g. 00Dxx0000001gEP" value="${escapeHtml(c.orgId || '')}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" id="cred-notes" placeholder="Any notes...">${escapeHtml(c.notes || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Tags</label>
        <div class="tag-input-container" id="tag-container">
          ${tags}
          <input class="tag-input-field" id="tag-input" placeholder="Type & press Enter">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
      <button class="btn btn-primary" data-action="save-credential" data-edit-id="${c.id || ''}">${isEdit ? 'Save Changes' : 'Add Credential'}</button>
    </div>
  `);

  // Focus title input
  setTimeout(() => document.getElementById('cred-title')?.focus(), 100);
}

function buildFolderOptions(tree, level) {
  return tree.map(node => {
    const indent = '\u00A0\u00A0'.repeat(level);
    const selected = state.currentFolderId === node.id ? 'selected' : '';
    const childOpts = node.children.length > 0 ? buildFolderOptions(node.children, level + 1) : '';
    return `<option value="${node.id}" ${selected}>${indent}${level > 0 ? '└ ' : ''}${escapeHtml(node.name)}</option>${childOpts}`;
  }).join('');
}

/** Show Add Folder modal */
function showAddFolderModal(parentId = null) {
  const parentName = parentId ? (state.folders.find(f => f.id === parentId)?.name || 'folder') : null;

  showModal(`
    <div class="modal-header">
      <span class="modal-title">${parentId ? 'New Subfolder' : 'New Folder'}</span>
      <button class="modal-close" data-action="close-modal">${Icons.x}</button>
    </div>
    <div class="modal-body">
      ${parentId ? `<div style="font-size:12px;color:var(--text-tertiary);margin-bottom:4px;">Inside: ${escapeHtml(parentName)}</div>` : ''}
      <div class="form-group">
        <label class="form-label">Folder Name</label>
        <input class="form-input" id="folder-name" placeholder="e.g. Client A" autofocus>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
      <button class="btn btn-primary" data-action="save-folder" data-parent-id="${parentId || ''}">Create</button>
    </div>
  `);

  setTimeout(() => document.getElementById('folder-name')?.focus(), 100);
}

/** Show Rename Folder modal */
function showRenameFolderModal(folderId) {
  const folder = state.folders.find(f => f.id === folderId);
  if (!folder) return;

  showModal(`
    <div class="modal-header">
      <span class="modal-title">Rename Folder</span>
      <button class="modal-close" data-action="close-modal">${Icons.x}</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Folder Name</label>
        <input class="form-input" id="folder-name" value="${escapeHtml(folder.name)}" autofocus>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
      <button class="btn btn-primary" data-action="rename-folder" data-id="${folderId}">Rename</button>
    </div>
  `);

  setTimeout(() => {
    const inp = document.getElementById('folder-name');
    if (inp) { inp.focus(); inp.select(); }
  }, 100);
}

/** Show Delete Folder modal with options */
function showDeleteFolderModal(folderId) {
  const folder = state.folders.find(f => f.id === folderId);
  if (!folder) return;

  const credCount = state.credentials.filter(c => c.folderId === folderId).length;
  const childFolders = state.folders.filter(f => f.parentId === folderId).length;
  const hasContents = credCount > 0 || childFolders > 0;

  showModal(`
    <div class="modal-header">
      <span class="modal-title">Delete Folder</span>
      <button class="modal-close" data-action="close-modal">${Icons.x}</button>
    </div>
    <div class="modal-body">
      <div style="font-size:13px;color:var(--text-secondary);">
        Delete <strong>"${escapeHtml(folder.name)}"</strong>?
        ${hasContents ? `<br><span style="font-size:12px;color:var(--text-tertiary);">(Contains ${credCount} credential${credCount !== 1 ? 's' : ''}${childFolders > 0 ? `, ${childFolders} subfolder${childFolders !== 1 ? 's' : ''}` : ''})</span>` : ''}
      </div>
      ${hasContents ? `
        <div class="delete-options">
          <div class="delete-option selected" data-option="move" data-action="select-delete-option">
            <div class="delete-option-radio"></div>
            <div>
              <div class="delete-option-text">Delete folder only</div>
              <div class="delete-option-desc">Move contents to parent folder</div>
            </div>
          </div>
          <div class="delete-option" data-option="all" data-action="select-delete-option">
            <div class="delete-option-radio"></div>
            <div>
              <div class="delete-option-text text-danger">Delete folder and contents</div>
              <div class="delete-option-desc">Permanently delete everything inside</div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
      <button class="btn btn-danger" data-action="confirm-delete-folder" data-id="${folderId}">Delete</button>
    </div>
  `);
}

/** Show Delete Credential confirmation */
function showDeleteCredentialModal(credId) {
  const cred = state.credentials.find(c => c.id === credId);
  if (!cred) return;

  showModal(`
    <div class="modal-header">
      <span class="modal-title">Delete Credential</span>
      <button class="modal-close" data-action="close-modal">${Icons.x}</button>
    </div>
    <div class="modal-body">
      <div style="font-size:13px;color:var(--text-secondary);">
        Delete <strong>"${escapeHtml(cred.title)}"</strong>?<br>
        <span style="font-size:12px;color:var(--text-tertiary);">This action cannot be undone.</span>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
      <button class="btn btn-danger" data-action="confirm-delete-credential" data-id="${credId}">Delete</button>
    </div>
  `);
}

// ═══════════════════════════════════════════════════════
// DROPDOWN & CONTEXT MENU
// ═══════════════════════════════════════════════════════
function showDropdown(anchorEl, items) {
  const dropdown = document.getElementById('dropdown-menu');
  const rect = anchorEl.getBoundingClientRect();

  dropdown.innerHTML = items.map(item =>
    item.divider
      ? '<div class="context-menu-divider"></div>'
      : `<button class="dropdown-item" data-dropdown-action="${item.action}" data-id="${item.id || ''}">
          <span class="dropdown-item-icon">${item.icon || ''}</span>
          <span>${item.label}</span>
        </button>`
  ).join('');

  // Position below the anchor
  let top = rect.bottom + 4;
  let left = rect.left;

  // Keep within viewport
  const dw = 170;
  if (left + dw > 440) left = 440 - dw - 8;
  if (top + 200 > 560) top = rect.top - 200;

  dropdown.style.top = `${top}px`;
  dropdown.style.left = `${left}px`;
  dropdown.classList.remove('hidden');

  // Close on next click anywhere
  setTimeout(() => {
    document.addEventListener('click', hideDropdown, { once: true });
  }, 10);
}

function hideDropdown() {
  document.getElementById('dropdown-menu').classList.add('hidden');
}

function showContextMenu(x, y, items) {
  const menu = document.getElementById('context-menu');
  menu.innerHTML = items.map(item =>
    item.divider
      ? '<div class="context-menu-divider"></div>'
      : `<button class="context-menu-item ${item.danger ? 'danger' : ''}"
                data-ctx-action="${item.action}" data-id="${item.id || ''}">
          ${item.icon ? `<span>${item.icon}</span>` : ''}
          <span>${item.label}</span>
        </button>`
  ).join('');

  // Keep within bounds
  const mw = 160, mh = items.length * 34;
  if (x + mw > 440) x = 440 - mw - 8;
  if (y + mh > 560) y = 560 - mh - 8;

  menu.style.top = `${y}px`;
  menu.style.left = `${x}px`;
  menu.classList.remove('hidden');

  setTimeout(() => {
    document.addEventListener('click', hideContextMenu, { once: true });
  }, 10);
}

function hideContextMenu() {
  document.getElementById('context-menu').classList.add('hidden');
}

// ═══════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${type === 'success' ? Icons.check : type === 'error' ? Icons.x : Icons.info} ${escapeHtml(message)}`;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 2600);
}

// ═══════════════════════════════════════════════════════
// EVENT HANDLING
// ═══════════════════════════════════════════════════════
function setupGlobalListeners() {
  // Delegated click handler for the entire app
  document.addEventListener('click', handleClick);

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.searchQuery = e.target.value;
      renderContent();
      // Show/hide clear button
      const clearBtn = document.querySelector('.search-clear');
      if (clearBtn) clearBtn.classList.toggle('hidden', !state.searchQuery);
    }, 200));
  }

  // Context menu on folders (right-click)
  document.getElementById('app-sidebar').addEventListener('contextmenu', (e) => {
    const folderEl = e.target.closest('[data-folder-id]');
    if (!folderEl) return;
    e.preventDefault();
    const folderId = folderEl.dataset.folderId;
    showContextMenu(e.clientX, e.clientY, [
      { label: 'Add Subfolder', icon: Icons.plus, action: 'ctx-add-subfolder', id: folderId },
      { label: 'Rename', icon: Icons.edit, action: 'ctx-rename-folder', id: folderId },
      { divider: true },
      { label: 'Delete', icon: Icons.trash, action: 'ctx-delete-folder', id: folderId, danger: true }
    ]);
  });

  // Close modal on overlay click
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
  });

  // Keyboard: Escape closes modals/dropdowns/settings
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal();
      hideDropdown();
      hideContextMenu();
      if (!document.getElementById('settings-view').classList.contains('hidden')) {
        closeSettings();
      }
    }
    // Enter key in modal inputs
    if (e.key === 'Enter' && e.target.id === 'folder-name') {
      const saveBtn = document.querySelector('[data-action="save-folder"], [data-action="rename-folder"]');
      if (saveBtn) saveBtn.click();
    }
    if (e.key === 'Enter' && e.target.id === 'tag-input') {
      handleAddTag();
    }
  });
}

async function handleClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) {
    // Check for dropdown/context menu actions
    const ddTarget = e.target.closest('[data-dropdown-action]');
    if (ddTarget) {
      await handleDropdownAction(ddTarget.dataset.dropdownAction, ddTarget.dataset.id);
      return;
    }
    const ctxTarget = e.target.closest('[data-ctx-action]');
    if (ctxTarget) {
      await handleContextAction(ctxTarget.dataset.ctxAction, ctxTarget.dataset.id);
      return;
    }
    // Delete option selection
    const deleteOpt = e.target.closest('[data-action="select-delete-option"]');
    if (deleteOpt) {
      document.querySelectorAll('.delete-option').forEach(opt => opt.classList.remove('selected'));
      deleteOpt.classList.add('selected');
      return;
    }
    return;
  }

  const action = target.dataset.action;
  const id = target.dataset.id;

  switch (action) {
    // Navigation
    case 'show-all':
      state.showingAll = true;
      state.showingFavorites = false;
      state.currentFolderId = null;
      state.searchQuery = '';
      await savePreferences();
      renderSidebar();
      renderContent();
      renderSearchBar();
      break;

    case 'show-favorites':
      state.showingFavorites = true;
      state.showingAll = false;
      state.currentFolderId = null;
      state.searchQuery = '';
      await savePreferences();
      renderSidebar();
      renderContent();
      renderSearchBar();
      break;

    case 'select-folder':
      e.stopPropagation();
      // Don't select if clicking the toggle chevron
      if (e.target.closest('[data-action="toggle-expand"]')) break;
      state.currentFolderId = id;
      state.showingAll = false;
      state.showingFavorites = false;
      state.searchQuery = '';
      await savePreferences();
      renderSidebar();
      renderContent();
      renderSearchBar();
      break;

    case 'toggle-expand':
      e.stopPropagation();
      if (state.expandedFolders.has(id)) {
        state.expandedFolders.delete(id);
      } else {
        state.expandedFolders.add(id);
      }
      await savePreferences();
      renderSidebar();
      break;

    // Theme
    case 'toggle-theme':
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      await savePreferences();
      renderHeader();
      break;

    case 'toggle-theme-setting':
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      await savePreferences();
      await renderSettings();
      break;

    // Settings
    case 'open-settings':
      await renderSettings();
      break;

    case 'close-settings':
      closeSettings();
      break;

    case 'download-sample': {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleJson, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "sf-vault-sample.json");
      downloadAnchor.click();
      showToast('Sample JSON downloaded', 'info');
      break;
    }

    // Search
    case 'clear-search':
      state.searchQuery = '';
      renderSearchBar();
      renderContent();
      // Restore focus
      setTimeout(() => document.getElementById('search-input')?.focus(), 50);
      break;

    // Folders
    case 'add-root-folder':
      showAddFolderModal(null);
      break;

    case 'save-folder': {
      const name = document.getElementById('folder-name')?.value?.trim();
      if (!name) { showToast('Folder name is required', 'error'); break; }
      const parentId = target.dataset.parentId || null;
      await FolderService.createFolder(name, parentId);
      await loadData();
      hideModal();
      if (parentId) state.expandedFolders.add(parentId);
      await savePreferences();
      renderSidebar();
      showToast('Folder created');
      break;
    }

    case 'rename-folder': {
      const name = document.getElementById('folder-name')?.value?.trim();
      if (!name) { showToast('Folder name is required', 'error'); break; }
      await FolderService.renameFolder(id, name);
      await loadData();
      hideModal();
      renderSidebar();
      renderContent();
      showToast('Folder renamed');
      break;
    }

    case 'confirm-delete-folder': {
      const selectedOption = document.querySelector('.delete-option.selected');
      const deleteContents = selectedOption?.dataset.option === 'all';
      await FolderService.deleteFolder(id, deleteContents);
      await loadData();
      hideModal();
      // If we were viewing this folder, go to All
      if (state.currentFolderId === id) {
        state.showingAll = true;
        state.currentFolderId = null;
      }
      await savePreferences();
      renderSidebar();
      renderContent();
      showToast('Folder deleted');
      break;
    }

    // Credentials
    case 'add-credential':
      showCredentialModal();
      break;

    case 'save-credential': {
      const editId = target.dataset.editId;
      const data = getCredentialFormData();
      if (!data.title) { showToast('Title is required', 'error'); break; }
      if (!data.username) { showToast('Username is required', 'error'); break; }

      if (editId) {
        await CredentialService.updateCredential(editId, data);
        showToast('Credential updated');
      } else {
        await CredentialService.createCredential(data);
        showToast('Credential added');
      }
      await loadData();
      hideModal();
      renderSidebar();
      renderContent();
      break;
    }

    case 'confirm-delete-credential':
      await CredentialService.deleteCredential(id);
      await loadData();
      hideModal();
      renderSidebar();
      renderContent();
      showToast('Credential deleted');
      break;

    case 'toggle-card-expand':
      if (state.expandedCredentialIds.has(id)) {
        state.expandedCredentialIds.delete(id);
      } else {
        state.expandedCredentialIds.add(id);
      }
      renderContent();
      break;

    // Favorites
    case 'toggle-fav': {
      const btn = target;
      btn.classList.add('pop');
      setTimeout(() => btn.classList.remove('pop'), 300);
      await CredentialService.toggleFavorite(id);
      await loadData();
      renderSidebar();
      renderContent();
      break;
    }

    // Password toggle
    case 'toggle-password': {
      const pwInput = document.getElementById('cred-password');
      if (pwInput) {
        const isPassword = pwInput.type === 'password';
        pwInput.type = isPassword ? 'text' : 'password';
        target.innerHTML = isPassword ? Icons.eyeOff : Icons.eye;
      }
      break;
    }

    // Tags
    case 'remove-tag': {
      const tag = target.dataset.tag;
      const pill = target.closest('.tag-pill');
      if (pill) pill.remove();
      break;
    }

    // Modal
    case 'close-modal':
      hideModal();
      break;

    // Copy menu
    case 'show-copy-menu': {
      const cred = state.credentials.find(c => c.id === id);
      if (!cred) break;
      showDropdown(target, [
        { label: 'Copy Username', icon: Icons.copy, action: 'copy-username', id },
        { label: 'Copy Password', icon: Icons.copy, action: 'copy-password', id },
        ...(cred.token ? [{ label: 'Copy Token', icon: Icons.copy, action: 'copy-token', id }] : []),
        { label: 'Copy URL', icon: Icons.globe, action: 'copy-url', id },
        { divider: true },
        { label: 'Copy Full Details', icon: Icons.copy, action: 'copy-full', id }
      ]);
      break;
    }

    // Login menu
    case 'show-login-menu': {
      const cred = state.credentials.find(c => c.id === id);
      if (!cred) break;
      const sf = isSalesforceUrl(cred.loginUrl);
      showDropdown(target, [
        { label: `Open in New Tab`, icon: Icons.externalLink, action: 'login-tab', id },
        { label: `Open in New Window`, icon: Icons.window, action: 'login-window', id },
        { label: `Open in Incognito`, icon: Icons.incognito, action: 'login-incognito', id }
      ]);
      break;
    }

    // Card more menu
    case 'show-card-menu': {
      showDropdown(target, [
        { label: 'Edit', icon: Icons.edit, action: 'edit-credential', id },
        { divider: true },
        { label: 'Delete', icon: Icons.trash, action: 'delete-credential', id }
      ]);
      break;
    }

    // Import/Export
    case 'export-vault':
      await handleExport();
      break;

    case 'import-vault':
      handleImport();
      break;

    case 'clear-all-data':
      showModal(`
        <div class="modal-header">
          <span class="modal-title">Clear All Data</span>
          <button class="modal-close" data-action="close-modal">${Icons.x}</button>
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:var(--text-secondary);">
            This will permanently delete <strong>all folders and credentials</strong>.<br>
            <span style="color:var(--danger);font-size:12px;">This cannot be undone. Consider exporting first.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn btn-danger" data-action="confirm-clear-all">Delete Everything</button>
        </div>
      `);
      break;

    case 'confirm-clear-all':
      await StorageService.remove('sf_vault_folders');
      await StorageService.remove('sf_vault_credentials');
      await loadData();
      state.currentFolderId = null;
      state.showingAll = true;
      state.showingFavorites = false;
      await savePreferences();
      hideModal();
      closeSettings();
      renderSidebar();
      renderContent();
      showToast('All data cleared', 'info');
      break;
  }
}

async function handleDropdownAction(action, id) {
  hideDropdown();
  const cred = state.credentials.find(c => c.id === id);
  if (!cred && action !== 'ctx-add-subfolder') return;

  switch (action) {
    case 'copy-username':
      await copyToClipboard(cred.username);
      showToast('Username copied');
      break;
    case 'copy-password':
      await copyToClipboard(cred.password);
      showToast('Password copied');
      break;
    case 'copy-token':
      await copyToClipboard(cred.token);
      showToast('Token copied');
      break;
    case 'copy-url':
      await copyToClipboard(cred.loginUrl);
      showToast('URL copied');
      break;
    case 'copy-full': {
      const details = [
        `Title: ${cred.title}`,
        `Username: ${cred.username}`,
        `Password: ${cred.password}`,
        cred.token ? `Token: ${cred.token}` : null,
        `URL: ${cred.loginUrl}`,
        cred.alias ? `Alias: ${cred.alias}` : null,
        cred.orgId ? `Org ID: ${cred.orgId}` : null,
        `Type: ${cred.orgType}`
      ].filter(Boolean).join('\n');
      await copyToClipboard(details);
      showToast('Full details copied');
      break;
    }
    case 'login-tab':
      await triggerLogin(cred, 'tab');
      break;
    case 'login-window':
      await triggerLogin(cred, 'window');
      break;
    case 'login-incognito':
      await triggerLogin(cred, 'incognito');
      break;
    case 'edit-credential':
      showCredentialModal(cred);
      break;
    case 'delete-credential':
      showDeleteCredentialModal(id);
      break;
  }
}

async function handleContextAction(action, id) {
  hideContextMenu();
  switch (action) {
    case 'ctx-add-subfolder':
      showAddFolderModal(id);
      break;
    case 'ctx-rename-folder':
      showRenameFolderModal(id);
      break;
    case 'ctx-delete-folder':
      showDeleteFolderModal(id);
      break;
  }
}

// ═══════════════════════════════════════════════════════
// LOGIN LAUNCHER
// ═══════════════════════════════════════════════════════
async function triggerLogin(cred, mode) {
  const sf = isSalesforceUrl(cred.loginUrl);

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'OPEN_AND_LOGIN',
      data: {
        loginUrl: cred.loginUrl,
        username: sf ? cred.username : '',
        password: sf ? cred.password : '',
        mode
      }
    });

    if (response?.success) {
      showToast(sf ? 'Opened with auto-fill' : 'Opened in browser', 'info');
    } else {
      showToast(response?.error || 'Failed to open', 'error');
    }
  } catch (err) {
    // Incognito may fail if not allowed
    if (mode === 'incognito') {
      showToast('Enable "Allow in Incognito" in extension settings', 'error');
    } else {
      showToast('Failed to open: ' + err.message, 'error');
    }
  }
}

// ═══════════════════════════════════════════════════════
// IMPORT / EXPORT
// ═══════════════════════════════════════════════════════
async function handleExport() {
  const exportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    folders: state.folders,
    credentials: state.credentials
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sf-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Vault exported', 'info');
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.folders || !data.credentials) {
        showToast('Invalid backup file', 'error');
        return;
      }

      // Replace all data
      await StorageService.set('sf_vault_folders', data.folders);
      await StorageService.set('sf_vault_credentials', data.credentials);
      await loadData();
      state.currentFolderId = null;
      state.showingAll = true;
      state.showingFavorites = false;
      state.expandedFolders = new Set();
      await savePreferences();
      renderSidebar();
      renderContent();
      showToast(`Imported ${data.credentials.length} credentials`, 'success');
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
  });
  input.click();
}

// ═══════════════════════════════════════════════════════
// TAG INPUT
// ═══════════════════════════════════════════════════════
function handleAddTag() {
  const input = document.getElementById('tag-input');
  if (!input) return;

  const value = input.value.trim().toLowerCase();
  if (!value) return;

  // Check for duplicates
  const existing = document.querySelectorAll('.tag-pill');
  for (const pill of existing) {
    if (pill.textContent.replace('×', '').trim().toLowerCase() === value) {
      input.value = '';
      return;
    }
  }

  const pill = document.createElement('span');
  pill.className = 'tag-pill';
  pill.innerHTML = `${escapeHtml(value)}<button class="tag-pill-remove" data-action="remove-tag" data-tag="${escapeHtml(value)}">×</button>`;

  const container = document.getElementById('tag-container');
  container.insertBefore(pill, input);
  input.value = '';
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function getCredentialFormData() {
  // Collect tags from pills
  const tags = [];
  document.querySelectorAll('#tag-container .tag-pill').forEach(pill => {
    const text = pill.textContent.replace('×', '').trim();
    if (text) tags.push(text);
  });

  return {
    title: document.getElementById('cred-title')?.value?.trim() || '',
    username: document.getElementById('cred-username')?.value?.trim() || '',
    password: document.getElementById('cred-password')?.value || '',
    token: document.getElementById('cred-token')?.value?.trim() || '',
    loginUrl: document.getElementById('cred-url')?.value?.trim() || 'https://login.salesforce.com',
    orgType: document.getElementById('cred-orgtype')?.value || 'Production',
    folderId: document.getElementById('cred-folder')?.value || null,
    alias: document.getElementById('cred-alias')?.value?.trim() || '',
    orgId: document.getElementById('cred-orgid')?.value?.trim() || '',
    notes: document.getElementById('cred-notes')?.value || '',
    tags
  };
}

/** Synchronous version of getFolderPath using cached state */
function getFolderPathSync(folderId) {
  const path = [];
  let current = state.folders.find(f => f.id === folderId);
  while (current) {
    path.unshift(current.name);
    current = current.parentId ? state.folders.find(f => f.id === current.parentId) : null;
  }
  return path;
}
