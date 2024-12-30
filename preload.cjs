const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  minimizeSplash: () => ipcRenderer.send('splash:minimize'),
  closeSplash: () => ipcRenderer.send('splash:close')
});
