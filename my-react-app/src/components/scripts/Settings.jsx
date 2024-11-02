import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap';
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
    <Modal show={show} onHide={onClose} centered size='lg' backdrop="static">
      <Toaster position='top-right'/>
      <Modal.Header closeButton>
        <Modal.Title style={{fontFamily:'Calibri'}}>Configuraciones</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{height:'68vh'}}>
        <div style={{display:'flex', padding:'1em 2em', fontFamily:'Calibri', color:'#1f2937'}}>
          <div style={{display:'flex', marginRight:'5em'}}>
            <div>
              <div style={{display:'flex'}}>
                <div> <SVGComponent src="./src/assets/cloud.svg" color="#1f2937" /></div>
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
                <SVGComponent src="./src/assets/update.svg" color="#1f2937" />
                </Button>
                </span>
                <span>
                </span>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end'}}>
              <Button variant='btn btn-sm btn-light' onClick={backupDatabase}>
                  <div style={{ display: 'flex', alignItems:'center'}}>
                    <div><SVGComponent src="./src/assets/backup.svg" color="#1f2937" /></div>
                    <div style={{ fontSize:'16px', marginLeft: '3px', color:'#1f2937'}}> <b>Respaldo Manual</b></div>
                  </div>
                </Button>
              </div>
              </div>
          </div>

          <div>
            <div style={{display:'flex', alignItems:'center'}}>
              <div><SVGComponent src="./src/assets/backup_restore.svg" color="#1f2937" /></div>
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
                <SVGComponent src="./src/assets/backup_restore.svg" color="#1f2937" />
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
