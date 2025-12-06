/**
 * Tandem Desktop - Preload Script
 * Safely exposes Electron APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electron', {
  // Platform info
  platform: process.platform,

  // Menu events
  onMenuNewFile: (callback) => {
    ipcRenderer.on('menu:new-file', callback);
  },
  onMenuSync: (callback) => {
    ipcRenderer.on('menu:sync', callback);
  },

  // App info
  getVersion: () => {
    return process.env.npm_package_version || '1.0.0';
  }
});

console.log('Tandem preload script loaded');
