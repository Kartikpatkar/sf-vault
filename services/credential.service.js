/**
 * SF Vault+ — Credential Service
 * Manages credential CRUD, search, favorites, and tags.
 */

import StorageService from './storage.service.js';
import { generateId } from '../utils/utils.js';

const CREDENTIALS_KEY = 'sf_vault_credentials';

const CredentialService = {
  /** Get all credentials */
  async getAllCredentials() {
    return (await StorageService.get(CREDENTIALS_KEY)) || [];
  },

  /** Save the full credentials array */
  async saveCredentials(credentials) {
    await StorageService.set(CREDENTIALS_KEY, credentials);
  },

  /** Create a new credential */
  async createCredential(data) {
    const credentials = await this.getAllCredentials();

    const credential = {
      id: generateId(),
      folderId: data.folderId || null,
      title: (data.title || '').trim(),
      username: (data.username || '').trim(),
      password: data.password || '',
      token: data.token || '',
      loginUrl: (data.loginUrl || 'https://login.salesforce.com').trim(),
      alias: (data.alias || '').trim(),
      orgId: (data.orgId || '').trim(),
      notes: data.notes || '',
      tags: data.tags || [],
      color: data.color || null,
      isFavorite: false,
      orgType: data.orgType || 'Production',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    credentials.push(credential);
    await this.saveCredentials(credentials);
    return credential;
  },

  /** Update an existing credential (partial update) */
  async updateCredential(id, data) {
    const credentials = await this.getAllCredentials();
    const idx = credentials.findIndex(c => c.id === id);
    if (idx === -1) return null;

    credentials[idx] = {
      ...credentials[idx],
      ...data,
      updatedDate: new Date().toISOString()
    };
    await this.saveCredentials(credentials);
    return credentials[idx];
  },

  /** Delete a credential by ID */
  async deleteCredential(id) {
    const credentials = await this.getAllCredentials();
    await this.saveCredentials(credentials.filter(c => c.id !== id));
  },

  /** Get credentials belonging to a specific folder */
  async getCredentialsByFolder(folderId) {
    const credentials = await this.getAllCredentials();
    return credentials.filter(c => c.folderId === folderId);
  },

  /** Toggle the favorite status of a credential */
  async toggleFavorite(id) {
    const credentials = await this.getAllCredentials();
    const cred = credentials.find(c => c.id === id);
    if (!cred) return null;

    cred.isFavorite = !cred.isFavorite;
    cred.updatedDate = new Date().toISOString();
    await this.saveCredentials(credentials);
    return cred;
  },

  /** Get all favorited credentials */
  async getFavorites() {
    const credentials = await this.getAllCredentials();
    return credentials.filter(c => c.isFavorite);
  },

  /**
   * Search credentials across title, username, alias, orgId, notes, and tags.
   * Returns matching credentials.
   */
  async searchCredentials(query) {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    const credentials = await this.getAllCredentials();

    return credentials.filter(c =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.username && c.username.toLowerCase().includes(q)) ||
      (c.alias && c.alias.toLowerCase().includes(q)) ||
      (c.orgId && c.orgId.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
    );
  },

  /** Get credentials matching a specific tag */
  async getCredentialsByTag(tag) {
    const credentials = await this.getAllCredentials();
    return credentials.filter(c => c.tags && c.tags.includes(tag));
  },

  /** Get all unique tags across every credential, sorted */
  async getAllTags() {
    const credentials = await this.getAllCredentials();
    const tagSet = new Set();
    for (const c of credentials) {
      if (c.tags) c.tags.forEach(t => tagSet.add(t));
    }
    return [...tagSet].sort();
  }
};

export default CredentialService;
