import React, { useState, useEffect } from 'react';
import MenuBar from './components/MenuFold/Menu';
import GreetingOne from './components/scripts/Greeting';
import Alumnos from './components/scripts/Alumnos';
import Finanzas from './components/Finanzas/mainFinanzas';
import Settings from './components/scripts/Settings';
import GymManager from './components/scripts/Gym/GymManager';
import VersionDisplay from './components/versions/displayVersions';
import ClosingBoot from './components/Periodos/ClosingBoot';
import SVGComponent from './components/SVGComponent';
import UpdateNotification from './components/Updates';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './AppStyles.css';

function App() {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedAlumnoName, setSelectedAlumnoName] = useState('');
  const [activeTabName, setActiveTabName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false);
  const [isUpdateFailed, setIsUpdateFailed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const { ipcRenderer } = window.electron;

    ipcRenderer.on('update-available', (_, data) => {
      setIsUpdateAvailable(data.update);
    });

    ipcRenderer.on('update-downloaded', () => {
      setIsUpdateDownloaded(true); // Actualiza cuando la descarga se completa
    });
    ipcRenderer.on('update-error', () => {
      setIsUpdateFailed(true); // Actualiza cuando la descarga se completa
    });

    return () => {
      ipcRenderer.removeAllListeners('update-available');
      ipcRenderer.removeAllListeners('update-downloaded');
    };
  }, []);

  useEffect(() => {
    const alumnoNameElement = document.getElementById("spanName");
    
    if (selectedMenu !== 2) { // '2' representa el ID del componente Alumnos
      setSelectedAlumnoName(''); // Limpia el nombre cuando no estás en Alumnos o Cuotas
      if (alumnoNameElement) {
        alumnoNameElement.hidden = true; // Oculta el span
      }
    } else {
      if (alumnoNameElement) {
        alumnoNameElement.hidden = false; // Muestra el span si estás en Alumnos
      }
    }
  }, [selectedMenu]);
  
  const handleMenuClick = (menuId) => {
    if (selectedMenu === menuId) {
      // Si el menú ya está seleccionado, lo desmonta y lo remonta
      setSelectedMenu(null); // Desmonta el componente
      setTimeout(() => setSelectedMenu(menuId), 0); // Remonta el componente
    } else {
      setSelectedMenu(menuId); // Cambia directamente al nuevo menú
    }
  };


  const renderContent = () => {
    switch (selectedMenu) {
      case 2:
        return <Alumnos onAlumnoSeleccionado={setSelectedAlumnoName} />;
      case 3:
        return <GymManager />;
      case 4:
        return <Finanzas />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Toaster position="top-right" />
      <div className="left-Sidebar" style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
        <div className="logo" style={{ borderRadius: '10px 0 0 0' }}>
          <SVGComponent src="./assets/logo-1.svg" color="#1f2937" width="14em" height="10em" padding="10px" />
        </div>
        <div className="navBar-content">
          <MenuBar onMenuClick={handleMenuClick} />

        </div>
        <div className="versions" style={{ width: '100%', textAlign: 'right', marginTop: 'auto' }}>
          <VersionDisplay />
        </div>
      </div>

      <div className="home" style={{ display: 'flex', flexDirection: 'column', flex: '5' }}>
        <div className="headerHome">
          <span style={{ marginLeft: '2em' }}>{activeTabName}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginRight: '1em', minHeight: '2.5em' }}>
            <span style={{ margin: 'auto' }}>
              <GreetingOne />
            </span>
            <button
              onClick={() => setShowSettings((prev) => !prev)}
              style={{ border: 'none', background: 'none', padding: '0', margin: '10px 0' }}
            >
              <SVGComponent src="./assets/settings.svg" color="#cccccc" />
            </button>
          </div>
        </div>

        {selectedMenu !== null && (
          <div className="row bodyHome">
            <span id="spanName" style={{ fontFamily: 'Calibri' }}>
              <h3>{selectedAlumnoName || activeTabName}</h3>
            </span>
            {renderContent()}
          </div>
        )}
        {showSettings && <Settings onClose={() => setShowSettings(false)} show={showSettings} />}
      </div>

      <ClosingBoot />

      <UpdateNotification
        isUpdateAvailable={isUpdateAvailable}
        isUpdateDownloaded={isUpdateDownloaded}
        isUpdateFailed={isUpdateFailed}
      />
    </div>
  );
}

export default App;
