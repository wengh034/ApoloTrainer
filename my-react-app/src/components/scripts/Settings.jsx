import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import SVGComponent from '../SVGComponent';
import toast, { Toaster } from 'react-hot-toast';

const BackupModal = ({ show, onClose }) => {
  const [backupFiles, setBackupFiles] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [backupInterval, setBackupInterval] = useState(0);
  const [toastType, setToastType] = useState(null);

  const playSound = (sound) => {
    const audio = new Audio(sound);
    audio.play();
  };
  useEffect(() => {
    if (toastType) {
      const sound = toastType === 'success' ? './src/assets/sounds/Pop-1.m4a' : './src/assets/sounds/Pop-1.m4a';
      playSound(sound);
      setToastType(null);
    }
  }, [toastType]);
  // Función para obtener la lista de archivos de respaldo
  const fetchBackupFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/backup/files'); // Cambia la URL según tu API
      const files = await response.json();
      setBackupFiles(files);
    } catch (error) {
      console.error('Error fetching backup files:', error);
      // alert('Error al obtener los archivos de respaldo');
    }
  };

  // Función para crear una copia de seguridad
  const backupDatabase = async () => {
    try {
      const response = await fetch('http://localhost:5000/backup', {
        method: 'POST',
      });
      if (response.ok) {
        // alert('Copia de seguridad creada con éxito.');
        toast.success('Copia de seguridad creada con éxito!');
        setToastType('success');
        fetchBackupFiles(); // Refresca la lista de archivos de respaldo
      } else {
        // alert('Error al crear la copia de seguridad.');
        toast.error('Error al crear la copia de seguridad.');
        setToastType('err');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Error al crear la copia de seguridad.');
      setToastType('err');
    }
  };

  // Función para restaurar una copia de seguridad
  const restoreDatabase = async (backupFile) => {
    try {
      const response = await fetch(`http://localhost:5000/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupFileName: backupFile }),
      });
      if (response.ok) {
        // alert('Base de datos restaurada con éxito.');
        toast.success('Restaurada con éxito!');
        setToastType('success');
      } else {
        // alert('Error al restaurar la base de datos.');
        toast.error('Error al restaurar...');
        setToastType('err');
      }
    } catch (error) {
      console.error('Error restoring database:', error);
      // alert('Error al restaurar la base de datos');
      toast.error('Error al restaurar...');
      setToastType('err');
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
      restoreDatabase(selectedBackup); // Llama a la función de restauración con el archivo seleccionado
    } else {
      // alert('Por favor, selecciona un archivo de respaldo para restaurar.');
      toast.error('Selecciona una opción de respaldo!');
      setToastType('err');
    }
  };

  // Actualizar el backupInterval
const updateBackupInterval = async (newInterval) => {
  try {
      const response = await fetch('http://localhost:5000/backup/updateBackupInterval', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ backupInterval: newInterval }),
      });
      const data = await response.json();
      // console.log(data.message);
      toast.success('Intervalo actualizado!');
      setToastType('success');
  } catch (error) {
      console.error('Error updating backupInterval:', error);
      toast.error('Error al actualizar el intervalo.');
      setToastType('err');
  }
};

// Obtener el backupInterval
const getBackupInterval = async () => {
  try {
      const response = await fetch('http://localhost:5000/backup/backupInterval');
      const data = await response.json();
      // console.log('Current backupInterval:', data.backupInterval);
      return data; // Retorna el objeto completo para su uso posterior
  } catch (error) {
      console.error('Error fetching backupInterval:', error);
      return { backupInterval: 0 }; // Retorna un valor por defecto en caso de error
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
    <Modal show={show} onHide={onClose} centered size='lg'>
      <Toaster position='top-right'/>
      <Modal.Header closeButton>
        <Modal.Title>Configuraciones</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{height:'68vh'}}>
        <p><b>Datos y Respaldo:</b></p>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
                <Button variant='btn btn-sm' onClick={backupDatabase}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SVGComponent src="./src/assets/backup.svg" color="#1f2937" />
                    <span style={{ marginLeft: '3px' }}>Guardar</span>
                  </div>
                </Button>
              </div>
              <div style={{display:'flex',alignItems:'center'}}>
                <span style={{marginRight:'15px'}}>Intervalo de Respaldo Automático:</span>
                <Form.Group>
                <Form.Control
                  type="text"
                  name="Cuota"
                  value={backupInterval}
                  onChange={(e) => setBackupInterval(e.target.value)}
                  required
                  style={{width:'3em', marginRight:'10px'}}
                />
              </Form.Group>
              <Button variant="btn btn-sm btn-warning" onClick={handleUpdate}>
                <SVGComponent src="./src/assets/update.svg" color="#1f2937" />
                </Button>
            </div>
        </div>
       
       
        

        
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="backupSelect">Selecciona un archivo de respaldo:</label>
          <select
            id="backupSelect"
            value={selectedBackup}
            onChange={(e) => setSelectedBackup(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="">-- Selecciona un respaldo --</option>
            {backupFiles.map((file) => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>
        <Button variant='btn btn-sm' onClick={handleRestore} style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SVGComponent src="./src/assets/backup_restore.svg" color="#1f2937" />
            <span style={{ marginLeft: '3px' }}>Restaurar</span>
          </div>
        </Button>
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
