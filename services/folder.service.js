/**
 * SF Vault+ — Folder Service
 * Manages folder CRUD operations with unlimited nesting support.
 */

import StorageService from './storage.service.js';
import CryptoService from './crypto.service.js';
import { generateId } from '../utils/utils.js';

const FOLDERS_KEY = 'sf_vault_folders';

const FolderService = {
  /** Get all folders as a flat array */
  async getFolders() {
    const raw = await StorageService.get(FOLDERS_KEY);
    if (!raw) return [];
    
    const isSet = await CryptoService.isMasterPasswordSet();
    if (isSet) {
      const unlocked = await CryptoService.isUnlocked();
      if (!unlocked) return [];
      try {
        const decrypted = await CryptoService.decrypt(raw);
        return JSON.parse(decrypted);
      } catch (e) {
        console.error('SF Vault+: Failed to decrypt folders:', e);
        return [];
      }
    }
    return raw;
  },

  /** Save the full folders array */
  async saveFolders(folders) {
    const isSet = await CryptoService.isMasterPasswordSet();
    if (isSet) {
      const unlocked = await CryptoService.isUnlocked();
      if (!unlocked) throw new Error('Vault is locked. Cannot save.');
      const serialized = JSON.stringify(folders);
      const encrypted = await CryptoService.encrypt(serialized);
      await StorageService.set(FOLDERS_KEY, encrypted);
    } else {
      await StorageService.set(FOLDERS_KEY, folders);
    }
  },

  /** Create a new folder */
  async createFolder(name, parentId = null) {
    const folders = await this.getFolders();
    const siblings = folders.filter(f => f.parentId === parentId);

    const folder = {
      id: generateId(),
      name: name.trim(),
      parentId,
      color: null,
      order: siblings.length,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    folders.push(folder);
    await this.saveFolders(folders);
    return folder;
  },

  /** Rename a folder */
  async renameFolder(id, newName) {
    const folders = await this.getFolders();
    const folder = folders.find(f => f.id === id);
    if (folder) {
      folder.name = newName.trim();
      folder.updatedDate = new Date().toISOString();
      await this.saveFolders(folders);
    }
    return folder;
  },

  /**
   * Delete a folder.
   * @param {string} id - Folder ID
   * @param {boolean} deleteContents - If true, delete all credentials inside.
   *   If false, move credentials and child folders to the parent.
   */
  async deleteFolder(id, deleteContents = false) {
    let folders = await this.getFolders();
    const folder = folders.find(f => f.id === id);
    if (!folder) return;

    // Gather all descendant folder IDs (recursive)
    const descendantIds = this._getDescendantIds(id, folders);
    const allIdsToRemove = [id, ...descendantIds];

    // Lazy-import CredentialService to avoid circular dependency
    const { default: CredentialService } = await import('./credential.service.js');

    if (deleteContents) {
      // Delete every credential in these folders
      const allCreds = await CredentialService.getAllCredentials();
      const credsToDelete = allCreds.filter(c => allIdsToRemove.includes(c.folderId));
      for (const cred of credsToDelete) {
        await CredentialService.deleteCredential(cred.id);
      }
    } else {
      // Move credentials in deleted folders up to parent
      const allCreds = await CredentialService.getAllCredentials();
      const credsToMove = allCreds.filter(c => allIdsToRemove.includes(c.folderId));
      for (const cred of credsToMove) {
        await CredentialService.updateCredential(cred.id, { folderId: folder.parentId });
      }

      // Move immediate child folders up to parent
      folders = await this.getFolders(); // re-read in case cred ops mutated
      for (const f of folders) {
        if (f.parentId === id) {
          f.parentId = folder.parentId;
          f.updatedDate = new Date().toISOString();
        }
      }
    }

    // Remove the folder(s) themselves
    const remaining = folders.filter(f => !allIdsToRemove.includes(f.id));
    await this.saveFolders(remaining);
  },

  /** Recursively collect descendant folder IDs */
  _getDescendantIds(parentId, folders) {
    const children = folders.filter(f => f.parentId === parentId);
    let ids = children.map(c => c.id);
    for (const child of children) {
      ids = ids.concat(this._getDescendantIds(child.id, folders));
    }
    return ids;
  },

  /**
   * Build a nested tree from a flat folder list.
   * Each node gains a `children` array, sorted by `order`.
   */
  buildTree(folders) {
    const map = {};
    const roots = [];

    // Index all folders
    for (const f of folders) {
      map[f.id] = { ...f, children: [] };
    }

    // Link children to parents
    for (const f of folders) {
      if (f.parentId && map[f.parentId]) {
        map[f.parentId].children.push(map[f.id]);
      } else {
        roots.push(map[f.id]);
      }
    }

    // Recursively sort children
    const sortChildren = (nodes) => {
      nodes.sort((a, b) => a.order - b.order);
      nodes.forEach(n => sortChildren(n.children));
    };
    sortChildren(roots);

    return roots;
  },

  /** Get the breadcrumb path for a folder (array of names) */
  async getFolderPath(id) {
    const folders = await this.getFolders();
    const path = [];
    let current = folders.find(f => f.id === id);
    while (current) {
      path.unshift(current.name);
      current = current.parentId ? folders.find(f => f.id === current.parentId) : null;
    }
    return path;
  },

  /** Move a folder to a new parent (prevents circular moves) */
  async moveFolder(id, newParentId) {
    const folders = await this.getFolders();
    const folder = folders.find(f => f.id === id);
    if (!folder) return false;

    // Prevent moving into own descendant
    if (newParentId) {
      const descendantIds = this._getDescendantIds(id, folders);
      if (descendantIds.includes(newParentId) || id === newParentId) return false;
    }

    folder.parentId = newParentId;
    folder.updatedDate = new Date().toISOString();
    await this.saveFolders(folders);
    return true;
  }
};

export default FolderService;
