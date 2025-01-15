const { ipcMain } = require('electron');

function setupUpdateControls() {
  // Escuchar eventos de actualización
  ipcMain.on('update-available', (event, updateData) => {
    // Aquí puedes manejar la lógica cuando haya una actualización disponible
    console.log('Actualización disponible:', updateData);
    // Emitir cualquier evento o notificación al renderizador
    event.sender.send('update-available', updateData);
  });

  ipcMain.on('update-downloaded', () => {
    // Maneja el evento cuando la actualización se haya descargado
    console.log('Actualización descargada');
  });

  ipcMain.on('restart-app', () => {
    // Maneja el reinicio de la aplicación
    console.log('Reiniciando la aplicación...');
    // Aquí podrías reiniciar la aplicación si es necesario
  });
}

module.exports = { setupUpdateControls };
