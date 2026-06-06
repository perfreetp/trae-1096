const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onLockScreen: (callback) => {
    const listener = (_event, ...args) => callback(...args);
    ipcRenderer.on('lock-screen', listener);
    return () => ipcRenderer.removeListener('lock-screen', listener);
  },
  onOpenGate: (callback) => {
    const listener = (_event, ...args) => callback(...args);
    ipcRenderer.on('open-gate', listener);
    return () => ipcRenderer.removeListener('open-gate', listener);
  },
  onCloseGate: (callback) => {
    const listener = (_event, ...args) => callback(...args);
    ipcRenderer.on('close-gate', listener);
    return () => ipcRenderer.removeListener('close-gate', listener);
  },
  onCapture: (callback) => {
    const listener = (_event, ...args) => callback(...args);
    ipcRenderer.on('capture', listener);
    return () => ipcRenderer.removeListener('capture', listener);
  },
  onShowAbout: (callback) => {
    const listener = (_event, ...args) => callback(...args);
    ipcRenderer.on('show-about', listener);
    return () => ipcRenderer.removeListener('show-about', listener);
  }
});
