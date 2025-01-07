import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

const UpdateNotification = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false);

  useEffect(() => {
    ipcRenderer.on('update-available', (event, data) => {
      setIsUpdateAvailable(data.update);
    });

    ipcRenderer.on('update-downloaded', () => {
      setIsUpdateDownloaded(true);
    });

    return () => {
      ipcRenderer.removeAllListeners('update-available');
      ipcRenderer.removeAllListeners('update-downloaded');
    };
  }, []);

  const handleRestart = () => {
    ipcRenderer.send('restart-app');
  };

  return (
    <div>
      {isUpdateAvailable && !isUpdateDownloaded && (
        <div className="update-modal">
          <p>There is a new update available!</p>
          <button onClick={handleRestart} disabled={isUpdateDownloaded}>
            {isUpdateDownloaded ? 'Restart Now' : 'Downloading...'}
          </button>
        </div>
      )}
      {!isUpdateAvailable && !isUpdateDownloaded && (
        <div>
          <p>No updates available at this moment.</p>
        </div>
      )}
    </div>
  );
};

export default UpdateNotification;
