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
let mainWindow;
let isMainWindowReady = false;
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
  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    frame: false,
    backgroundColor: '#111827',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173/');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    isMainWindowReady = true;
    checkAndShowMainWindow();
  });

  mainWindow.webContents.once('did-finish-load', () => {
    isContentLoaded = true;
    checkAndShowMainWindow();
  });
}

function checkAndShowMainWindow() {
  if (isMainWindowReady && isContentLoaded) {
    splashWindow.close();
    mainWindow.maximize();
    setupWindowControls(mainWindow);
    mainWindow.show();
  }
}

app.on('ready', () => {
  log.info('App is ready. Starting backend and checking updates.');

  // Start backend process
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'server.cjs')
    : path.join(__dirname, 'backend', 'server.cjs');

  if (fs.existsSync(backendPath)) {
    backendProcess = fork(backendPath, {
      env: { ...process.env, BACKEND_PORT: 5000 },
    });

    backendProcess.on('message', (message) => log.info(`Backend: ${message}`));
    backendProcess.on('error', (err) => log.error('Backend error:', err));
    backendProcess.on('exit', (code, signal) => log.info(`Backend exited: code=${code}, signal=${signal}`));
  } else {
    log.error('Backend not found:', backendPath);
  }

  // Create splash window
  createSplashWindow();

  // Check for updates
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';
  autoUpdater.checkForUpdatesAndNotify();
});

// Update events
// Evento para cuando se detecta que hay una actualización disponible
autoUpdater.on('update-available', () => {
  log.info('Update available.');
  if (mainWindow) {
    // Enviar el estado de la actualización a la aplicación frontend
    mainWindow.webContents.send('update-available', { update: true });
  }
});

// Evento para cuando no hay actualización disponible
autoUpdater.on('update-not-available', () => {
  log.info('No update available.');
  if (mainWindow) {
    // Enviar el estado a la aplicación frontend
    mainWindow.webContents.send('update-available', { update: false });
  }
});
// Evento para cuando la actualización ha sido descargada
// autoUpdater.on('update-downloaded', () => {
//   log.info('Update downloaded.');
  
//   if (mainWindow) {
//     // Enviar el evento para notificar que la actualización está lista
//     mainWindow.webContents.send('update-downloaded');
//   }
// });

// Evento para cuando la actualización ha sido descargada
autoUpdater.on('update-downloaded', async () => {
  log.info('Update downloaded.');

  try {
    log.info('Checking and migrating database if necessary...');
    
    // Ejecutar el script de migración desde el contexto del backend
    const migrationProcess = require('child_process').fork(
      path.join(__dirname, 'backend', 'migrations', 'checkAndMigrateDb.cjs'), {
        cwd: path.join(__dirname, 'backend') // Establecer el directorio de trabajo del backend
      }
    );

    migrationProcess.on('message', (message) => {
      log.info('Migration process message:', message);
    });

    migrationProcess.on('exit', (code) => {
      if (code === 0) {
        log.info('Migration completed successfully.');
        
        // Notificar al frontend que la actualización está lista para reiniciar
        if (mainWindow) {
          mainWindow.webContents.send('update-downloaded'); // Notificar que la actualización se descargó
        }
      } else {
        log.error('Migration failed.');
        if (mainWindow) {
          mainWindow.webContents.send('update-error', {
            message: 'Migration failed. Update cannot proceed.',
          });
        }
      }
    });

    migrationProcess.on('error', (error) => {
      log.error('Error during migration process:', error);
      if (mainWindow) {
        mainWindow.webContents.send('update-error');
      }
    });

  } catch (error) {
    log.error('Error during migration:', error);
    if (mainWindow) {
      mainWindow.webContents.send('update-error');
    }
  }
});


// Evento para cuando ocurre un error en la verificación de la actualización
autoUpdater.on('update-error', (error) => {
  log.error('Update verification failed:', error);

  if (mainWindow) {
    // Enviar el mensaje al frontend para mostrar el toast de error
    mainWindow.webContents.send('update-error', {
      message: 'Verificación fallida. Revise su conexión',  // Mensaje para el usuario
    });
  }
});

// Escuchar para reiniciar la app cuando el usuario lo decida
ipcMain.on('restart-app', () => {
  log.info('Restarting to install update.');
  autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
    log.info('Backend process killed.');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
