/**
 * SF Vault+ — Cryptography Service
 * Handles master password key derivation (PBKDF2) and AES-GCM encryption/decryption.
 * Handles lock/unlock states and secure session key storage.
 */

import StorageService from './storage.service.js';

const SALT_KEY = 'sf_vault_crypto_salt';
const VERIFY_KEY = 'sf_vault_crypto_verify';
const SESSION_KEY = 'sf_vault_session_key';
const REMEMBERED_KEY = 'sf_vault_remembered_key';

let activeKey = null;

const CryptoService = {
  /** Check if a master password has been set */
  async isMasterPasswordSet() {
    const salt = await StorageService.get(SALT_KEY);
    const verifyBlob = await StorageService.get(VERIFY_KEY);
    return !!(salt && verifyBlob);
  },

  /** Generate salt and set up the master password */
  async setupMasterPassword(password, rememberMe = false) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltBase64 = btoa(String.fromCharCode(...salt));
    await StorageService.set(SALT_KEY, saltBase64);

    const aesKey = await this._deriveKey(password, salt);
    
    // Encrypt verification token
    const verifyBlob = await this._encryptText('sf-vault-verified', aesKey);
    await StorageService.set(VERIFY_KEY, verifyBlob);

    // Save key in session storage and cache in-memory
    await this._saveKeyToSession(aesKey);
    activeKey = aesKey;

    if (rememberMe) {
      await this._saveKeyToRemembered(aesKey);
    } else {
      await StorageService.remove(REMEMBERED_KEY);
    }
    return true;
  },

  /** Unlock the vault using the master password */
  async unlock(password, rememberMe = false) {
    const saltBase64 = await StorageService.get(SALT_KEY);
    if (!saltBase64) throw new Error('No master password has been set.');

    const salt = new Uint8Array(atob(saltBase64).split('').map(c => c.charCodeAt(0)));
    const aesKey = await this._deriveKey(password, salt);

    const verifyBlob = await StorageService.get(VERIFY_KEY);
    if (!verifyBlob) throw new Error('Verification block missing.');

    try {
      const decrypted = await this._decryptText(verifyBlob, aesKey);
      if (decrypted === 'sf-vault-verified') {
        await this._saveKeyToSession(aesKey);
        activeKey = aesKey;

        if (rememberMe) {
          await this._saveKeyToRemembered(aesKey);
        } else {
          await StorageService.remove(REMEMBERED_KEY);
        }
        return true;
      }
    } catch (e) {
      // Decryption fail indicates wrong password
    }
    throw new Error('Incorrect master password.');
  },

  /** Lock the vault by discarding keys from memory, session, and local storage */
  async lock() {
    activeKey = null;
    await chrome.storage.session.remove(SESSION_KEY).catch(() => {});
    await StorageService.remove(REMEMBERED_KEY).catch(() => {});
  },

  /** Check if the master password key is remembered in local storage */
  async isRemembered() {
    const key = await StorageService.get(REMEMBERED_KEY);
    return !!key;
  },

  /** Clear the remembered master password key from local storage */
  async clearRemembered() {
    await StorageService.remove(REMEMBERED_KEY);
  },

  /** Save the currently active key to remembered storage */
  async rememberActiveKey() {
    if (activeKey) {
      await this._saveKeyToRemembered(activeKey);
    }
  },

  /** Check if vault is currently unlocked */
  async isUnlocked() {
    if (activeKey) return true;
    
    try {
      const sessionData = await chrome.storage.session.get(SESSION_KEY);
      let hexKey = sessionData[SESSION_KEY];

      if (!hexKey) {
        hexKey = await StorageService.get(REMEMBERED_KEY);
        if (hexKey) {
          await chrome.storage.session.set({ [SESSION_KEY]: hexKey }).catch(() => {});
        }
      }

      if (hexKey) {
        const keyBytes = new Uint8Array(hexKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        activeKey = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', true, ['encrypt', 'decrypt']);
        return true;
      }
    } catch (e) {
      console.warn('SF Vault+: Failed to import key from storage:', e);
    }
    return false;
  },

  /** Encrypt string data using the active key */
  async encrypt(plaintext) {
    const key = await this._getActiveKey();
    return await this._encryptText(plaintext, key);
  },

  /** Decrypt string data using the active key */
  async decrypt(ciphertext) {
    const key = await this._getActiveKey();
    return await this._decryptText(ciphertext, key);
  },

  /** Encrypt backup payload with a dedicated password */
  async encryptBackup(dataObj, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const aesKey = await this._deriveKey(password, salt);
    
    const plaintext = JSON.stringify(dataObj);
    const encryptedText = await this._encryptText(plaintext, aesKey);
    const [iv, ciphertext] = encryptedText.split(':');

    return {
      version: '1.0.0',
      encrypted: true,
      salt: btoa(String.fromCharCode(...salt)),
      iv,
      ciphertext
    };
  },

  /** Decrypt backup payload with a dedicated password */
  async decryptBackup(backupObj, password) {
    if (!backupObj.encrypted || !backupObj.salt || !backupObj.iv || !backupObj.ciphertext) {
      throw new Error('Invalid backup file structure.');
    }

    const salt = new Uint8Array(atob(backupObj.salt).split('').map(c => c.charCodeAt(0)));
    const aesKey = await this._deriveKey(password, salt);

    const payload = `${backupObj.iv}:${backupObj.ciphertext}`;
    const decryptedText = await this._decryptText(payload, aesKey);
    return JSON.parse(decryptedText);
  },

  // ═══════════════════════════════════════════════════════
  // INTERNAL CRYPTO METHODS
  // ═══════════════════════════════════════════════════════

  async _deriveKey(password, salt) {
    const enc = new TextEncoder();
    const pwBytes = enc.encode(password);
    const baseKey = await crypto.subtle.importKey('raw', pwBytes, 'PBKDF2', false, ['deriveKey', 'deriveBits']);
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  },

  async _encryptText(text, aesKey) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc.encode(text));
    
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const encBase64 = btoa(String.fromCharCode(...encryptedBytes));
    return `${ivBase64}:${encBase64}`;
  },

  async _decryptText(payload, aesKey) {
    const [ivBase64, encBase64] = payload.split(':');
    const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
    const ciphertext = new Uint8Array(atob(encBase64).split('').map(c => c.charCodeAt(0)));
    
    const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ciphertext);
    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  },

  async _getActiveKey() {
    if (!activeKey) {
      const unlocked = await this.isUnlocked();
      if (!unlocked) throw new Error('Vault is locked.');
    }
    return activeKey;
  },

  async _saveKeyToSession(aesKey) {
    const rawKeyBytes = await crypto.subtle.exportKey('raw', aesKey);
    const hexKey = Array.from(new Uint8Array(rawKeyBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
    await chrome.storage.session.set({ [SESSION_KEY]: hexKey });
  },

  async _saveKeyToRemembered(aesKey) {
    const rawKeyBytes = await crypto.subtle.exportKey('raw', aesKey);
    const hexKey = Array.from(new Uint8Array(rawKeyBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
    await StorageService.set(REMEMBERED_KEY, hexKey);
  }
};

export default CryptoService;
