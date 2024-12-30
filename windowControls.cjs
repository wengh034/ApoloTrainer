const { ipcMain } = require('electron');

function setupWindowControls(window) {
  ipcMain.on('minimize-window', () => window.minimize());
  ipcMain.on('toggle-maximize-window', () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });
  ipcMain.on('close-window', () => window.close());

  // Enviar mensajes para actualizar el ícono
  window.on('maximize', () => window.webContents.send('window-maximized'));
  window.on('unmaximize', () => window.webContents.send('window-restored'));
}

module.exports = { setupWindowControls };
