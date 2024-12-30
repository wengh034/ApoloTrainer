import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap';
import SVGComponent from '../SVGComponent';
import { showToast } from '../toastUtils';
import { getBaseUrl } from '@/Config.js';

const BackupModal = ({ show, onClose }) => {
  const [backupFiles, setBackupFiles] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [backupInterval, setBackupInterval] = useState(0);

  // Función para obtener la lista de archivos de respaldo
  const fetchBackupFiles = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/backup/files`); // Cambia la URL según tu API
      const files = await response.json();
      setBackupFiles(files);
    } catch (error) {
      console.error('Error fetching backup files:', error);
    }
  };

  // Función para crear una copia de seguridad
  const backupDatabase = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/backup`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Copia de seguridad creada con éxito!');
        showToast('success', 'Respaldo exitoso!');
        fetchBackupFiles(); // Refresca la lista de archivos de respaldo
      } else {
        toast.error('Error al crear la copia de seguridad.');
        showToast('error', 'Respaldo fallido!');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Error en el respaldo.');
    }
  };

  // Función para restaurar una copia de seguridad
  const restoreDatabase = async (backupFile) => {
    try {
      const response = await fetch(`${getBaseUrl()}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupFileName: backupFile }),
      });
      if (response.ok) {
        showToast('success', 'Restauración exitosa!');
      } else {
        toast.error('Restauración fallida');
      }
    } catch (error) {
      console.error('Error restoring database:', error);
      toast.error('Restauración fallida');
    }
  };

  // Llamar a fetchBackupFiles cuando el modal se abra
  useEffect(() => {
    if (show) {
      fetchBackupFiles();
    }
  }, [show]);

  const handleRestore = () => {
    if (selectedBackup) {
      restoreDatabase(selectedBackup);
    } else {
      showToast('error', 'Selecciona un archivo de respaldo!');
    }
  };

  // Actualizar el backupInterval
const updateBackupInterval = async (newInterval) => {
  try {
      const response = await fetch(`${getBaseUrl()}/backup/updateBackupInterval`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ backupInterval: newInterval }),
      });
      const data = await response.json();
      showToast('success', 'Intervalo actualizado!');
  } catch (error) {
      console.error('Error updating backupInterval:', error);
      toast.error('Error al actualizar el intervalo.');
  }
};

// Obtener el backupInterval
const getBackupInterval = async () => {
  try {
      const response = await fetch(`${getBaseUrl()}/backup/backupInterval`);
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching backupInterval:', error);
      return { backupInterval: 0 }; //Valor por defecto en caso de error
  }
};

// Llama a getBackupInterval cuando el componente se monte
useEffect(() => {
  const fetchBackupInterval = async () => {
      const data = await getBackupInterval();
      setBackupInterval(data.backupInterval); // Actualiza el estado con el valor obtenido
  };
  fetchBackupInterval();
}, []);


  // Maneja la actualización al hacer clic en el botón
  const handleUpdate = async () => {
      await updateBackupInterval(backupInterval);
  };

  return (
    <Modal show={show} onHide={onClose} centered size='lg' backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title style={{fontFamily:'Calibri'}}>Configuraciones</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{height:'68vh'}}>
        <div style={{display:'flex', padding:'1em 2em', fontFamily:'Calibri', color:'#1f2937'}}>
          <div style={{display:'flex', marginRight:'5em'}}>
            <div>
              <div style={{display:'flex'}}>
                <div> <SVGComponent src="./assets/cloud.svg" color="#1f2937" /></div>
                <div style={{ marginLeft: '3px'}}> <b>Datos y Respaldo:</b></div>
                
              </div>
              
              <span style={{fontWeight:'bolder'}}>Intervalo de Respaldo Automático (días):</span>
              <div style={{display:'flex', alignItems:'center', marginBottom:'15px'}}>
                <span>
                <Form.Group>
                <Form.Control
                  type="text"
                  name="Cuota"
                  value={backupInterval}
                  onChange={(e) => setBackupInterval(e.target.value)}
                  required
                  style={{width:'4em', marginRight:'10px', padding:'4px'}}
                />
              </Form.Group>
                </span>
                <span>
                <Button variant="btn btn-sm btn-light" onClick={handleUpdate}>
                <SVGComponent src="./assets/update.svg" color="#1f2937" />
                </Button>
                </span>
                <span>
                </span>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end'}}>
              <Button variant='btn btn-sm btn-light' onClick={backupDatabase}>
                  <div style={{ display: 'flex', alignItems:'center'}}>
                    <div><SVGComponent src="./assets/backup.svg" color="#1f2937" /></div>
                    <div style={{ fontSize:'16px', marginLeft: '3px', color:'#1f2937'}}> <b>Respaldo Manual</b></div>
                  </div>
                </Button>
              </div>
              </div>
          </div>

          <div>
            <div style={{display:'flex', alignItems:'center'}}>
              <div><SVGComponent src="./assets/backup_restore.svg" color="#1f2937" /></div>
              <div style={{marginLeft:'3px'}}> <b>Restaurar</b></div>
            </div>
          <span><b>Selecciona un archivo de respaldo:</b> </span>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="backupDropdown" style={{ fontWeight: 'bold' }}>
              {selectedBackup || '-- Selecciona un respaldo --'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSelectedBackup('') } style={{ fontWeight: 'bold' }}>
                -- Selecciona un respaldo --
              </Dropdown.Item>
              {backupFiles.map((file) => (
                <Dropdown.Item key={file} onClick={() => setSelectedBackup(file)} style={{ fontWeight: 'bold' }}>
                  {file}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <div style={{display:'flex', justifyContent:'flex-end'}}>
            <Button variant='btn btn-sm btn-light' onClick={handleRestore} style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SVGComponent src="./assets/backup_restore.svg" color="#1f2937" />
                <span style={{ marginLeft: '3px', fontSize:'14px',fontWeight:'bolder', color:'#1f2937'}}>Restaurar</span>
              </div>
            </Button>
          </div>
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
        </div>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BackupModal;
