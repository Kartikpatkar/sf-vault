/**
 * SF Vault+ — Storage Service
 * Wraps chrome.storage.local with a clean async API.
 * Foundation layer — all other services use this.
 */

const StorageService = {
  /**
   * Get a value by key from local storage
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    const result = await chrome.storage.local.get(key);
    return result[key];
  },

  /**
   * Set a key-value pair in local storage
   * @param {string} key
   * @param {any} value
   */
  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
  },

  /**
   * Remove a key from local storage
   * @param {string} key
   */
  async remove(key) {
    await chrome.storage.local.remove(key);
  },

  /**
   * Get all stored data
   * @returns {Promise<Object>}
   */
  async getAll() {
    return await chrome.storage.local.get(null);
  },

  /**
   * Clear all stored data
   */
  async clear() {
    await chrome.storage.local.clear();
  }
};

export default StorageService;
