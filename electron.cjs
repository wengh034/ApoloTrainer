const { app, BrowserWindow, ipcMain } = require('electron');
const { setupWindowControls } = require('./windowControls.cjs');
const path = require('path');
const { fork } = require('child_process');
const log = require('electron-log');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

ipcMain.on('splash:minimize', () => {
  splashWindow.minimize();
});

ipcMain.on('splash:close', () => {
  app.quit();
});

app.disableHardwareAcceleration();
let splashWindow;
let window;
let isWindowReady = false;
let isContentLoaded = false;
let backendProcess;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 440,
    height: 250,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'dist', 'splash.html'));

  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
    createMainWindow();
  });
}

function createMainWindow() {
  window = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    frame: false,
    backgroundColor: '#111827',
    icon: path.join(__dirname, 'assets', 'ApT.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      disableInitialBlankWindow: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    window.loadURL('http://localhost:5173/');
  } else {
    window.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  window.once('ready-to-show', () => {
    isWindowReady = true;
    checkAndShowMainWindow();
  });

  window.webContents.once('did-finish-load', () => {
    isContentLoaded = true;
    checkAndShowMainWindow();
  });
}

function checkAndShowMainWindow() {
  if (isWindowReady && isContentLoaded) {
    splashWindow.close();
    window.maximize();
    setupWindowControls(window);
    window.show();
  }
}

app.on('ready', () => {
  log.info('App is ready. Attempting to start the backend server.');

  const backendPath = app.isPackaged 
  ? path.join(process.resourcesPath, 'backend', 'server.cjs') 
  : path.join(__dirname, 'backend', 'server.cjs');
  log.info(`Backend path: ${backendPath}`);

  if (!fs.existsSync(backendPath)) {
    log.error(`Backend file not found at: ${backendPath}`);
    return;
  }

  try {
    backendProcess = fork(backendPath, {
      env: { ...process.env, BACKEND_PORT: 5000 }, // Configura variables de entorno si es necesario
    });

    backendProcess.on('message', (message) => {
      log.info(`Message from backend: ${message}`);
    });

    backendProcess.on('error', (err) => log.error('Error in backend process:', err));
    backendProcess.on('exit', (code, signal) => {
      log.info(`Backend process exited with code: ${code}, signal: ${signal}`);
    });

    log.info('Backend process started successfully.');
  } catch (err) {
    log.error('Failed to start backend process:', err);
  }

  createSplashWindow();

  // Chequear actualizaciones al iniciar la app
  log.info('Checking for updates...');
  autoUpdater.checkForUpdates();
});

// Escuchar eventos de actualizaciones
autoUpdater.on('update-available', () => {
  log.info('Update available.');
  // Enviar a React para que se muestre el modal
  if (window) {
    window.webContents.send('update-available', { update: true });
  }
});

autoUpdater.on('update-not-available', () => {
  log.info('No update available.');
  if (window) {
    window.webContents.send('update-available', { update: false });
  }
});

autoUpdater.on('update-downloaded', () => {
  log.info('Update downloaded. Ready to install.');
  // Enviar a React que la actualización está descargada
  if (window) {
    window.webContents.send('update-downloaded');
  }
});

ipcMain.on('restart-app', () => {
  log.info('Restarting app to install update...');
  autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill();
      log.info('Backend process killed.');
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
