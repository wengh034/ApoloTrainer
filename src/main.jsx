import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// const { ipcRenderer } = window.require('electron');
const { ipcRenderer } = window.electron;

// Configura los listeners una vez que el contenido esté montado
window.addEventListener('DOMContentLoaded', () => {
  const minimizeBtn = document.getElementById('minimizeBtn');
  const maximizeBtn = document.getElementById('maximizeBtn');
  const closeBtn = document.getElementById('closeBtn');
  const maximizeIcon = maximizeBtn.querySelector('img'); // Selecciona el ícono de maximizar

  if (minimizeBtn && maximizeBtn && closeBtn) {
    minimizeBtn.addEventListener('click', () => ipcRenderer.send('minimize-window'));
    maximizeBtn.addEventListener('click', () => ipcRenderer.send('toggle-maximize-window'));
    closeBtn.addEventListener('click', () => ipcRenderer.send('close-window'));

    // Cambia el ícono del botón según el estado de la ventana
    ipcRenderer.on('window-maximized', () => {
      maximizeIcon.src = './assets/windowMode.svg'; // Cambia al ícono de restaurar
    });

    ipcRenderer.on('window-restored', () => {
      maximizeIcon.src = './assets/maximize.svg'; // Cambia al ícono de maximizar
    });
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
