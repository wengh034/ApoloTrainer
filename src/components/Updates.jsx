import React from 'react';
import {Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { showToast } from './toastUtils';

const UpdateNotification = ({
  isUpdateAvailable,
  isUpdateDownloaded,
  isUpdateFailed
}) => {
  const handleRestart = () => {
    window.electron.ipcRenderer.send('restart-app');
    toast.dismiss(); // Cierra el toast
  };

  const showUpdateToast = () => {
    if (isUpdateAvailable) {
      if (isUpdateDownloaded) {
        showToast(
          'custom',
          ({ id }) => (
            <div
            style={{
              padding: '10px',
              backgroundColor: '#f4f4f9',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <p>Se ha descargado una actualización. Reinicie el sistema para aplicarla.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleRestart}
                  style={{
                    marginRight: '10px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  Reiniciar
                </button>
                <button
                  onClick={() => toast.dismiss(id)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  Más tarde
                </button>
              </div>
            </div>
          ),
        );
      } else {
        showToast('success', 'Actualización disponible. Descargando...', {
          icon: '⏳',
        });
      }
    }
  };
  const showErrorToast = () => {
    if (isUpdateFailed) {
      showToast('error', 'Verificación fallida. Revise su conexión');
    }
  };

  React.useEffect(() => {
    if (isUpdateAvailable) {
      showUpdateToast();
    }
    if (isUpdateFailed) {
      showErrorToast();
    }
  }, [isUpdateAvailable, isUpdateDownloaded, isUpdateFailed]);

  return null; // El componente no renderiza nada directamente
};

export default UpdateNotification;
