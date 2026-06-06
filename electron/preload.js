const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onLockScreen: (callback) => ipcRenderer.on('lock-screen', callback),
  onOpenGate: (callback) => ipcRenderer.on('open-gate', callback),
  onCloseGate: (callback) => ipcRenderer.on('close-gate', callback),
  onCapture: (callback) => ipcRenderer.on('capture', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback)
});
