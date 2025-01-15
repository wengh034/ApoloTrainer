const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  minimizeSplash: () => ipcRenderer.send('splash:minimize'),
  closeSplash: () => ipcRenderer.send('splash:close'),
   // Métodos para manejar las actualizaciones
   ipcRenderer: {
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    restartApp: () => ipcRenderer.send('restart-app'),
    on: (channel, callback) => ipcRenderer.on(channel, callback), // Para escuchar eventos
    send: (channel, data) => ipcRenderer.send(channel, data),    // Para enviar eventos
    once: (channel, callback) => ipcRenderer.once(channel, callback), // Para escuchar solo una vez
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel); // Elimina todos los listeners para el canal
    },
  },
  getBaseUrl: () => {
    const defaultPort = 5000;
    const port = process.env.BACKEND_PORT || defaultPort;
    const host = process.env.NODE_ENV === 'development' ? 'http://localhost' : 'http://127.0.0.1';
    return `${host}:${port}`;
  },
  
});

