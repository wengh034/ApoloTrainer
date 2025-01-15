import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getBaseUrl } from '@/Config.js';
import { showToast } from '../toastUtils';
import { Button, Card } from 'react-bootstrap';
import SVGComponent from '../SVGComponent';

const DragAndDropUploader = () => {
  const [directory, setDirectory] = useState('');
  // Fetch para obtener el directorio dinámico
  useEffect(() => {
    fetch(`${getBaseUrl()}/get-directory`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener el directorio');
        }
        return response.json();
      })
      .then((data) => {
        setDirectory(data.directory); // Asume que el endpoint devuelve { directory: '/illustrations' }
      })
      .catch((error) => {
        console.error('Error al obtener el directorio:', error);
        showToast('error', 'No se pudo obtener el directorio');
      });
  }, []);
  const handleOpenDirectory = () => {
    if (directory) {
      window.open(directory, '_blank'); // Abre la URL en una nueva pestaña si es accesible
    } else {
      showToast('error', 'Directorio no disponible');
    }
  };
  const onDrop = useCallback((acceptedFiles) => {
    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append('files', file);
    });

    fetch(`${getBaseUrl()}/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          // Leer el cuerpo de la respuesta en caso de error
          return response.json().then((errorData) => {
            throw new Error(errorData.message || 'Error al subir los archivos');
          });
        }
        return response.json();
      })
      .then((data) => {
        showToast('success', 'Imágenes subidas correctamente');
        console.log('Archivos subidos:', data);
      })
      .catch((error) => {
        if (error.message.includes('ya existe')) {
          // Error específico: archivo duplicado
          showToast('error', 'El archivo ya existe.');
        } else {
          // Error general
          showToast('error', 'Error al subir los archivos');
        }
        console.error('Error al subir los archivos:', error);
      });
  }, []); 

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpeg', '.jpg', '.png']},});
  return (
    <div
      
    >
      <div
      {...getRootProps()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: isDragActive ? '#f0f0f0' : '#fff',
        cursor: 'pointer',
      }}>
      <input {...getInputProps()} />
        {isDragActive ? (
          <p>Suelta las imágenes aquí...</p>
        ) : (
          <p>Arrastra y suelta tus imágenes aquí, o haz clic para seleccionarlas.</p>
      )}
      </div>
      <div style={{ display:'flex', alignItems:'center', margin:'10px'}}>
    {directory && (
      <>
      <Button
          onClick={handleOpenDirectory}
          variant="btn btn-light"
          style={{padding:'2px 5px', marginRight:'10px'}}
        >
           <SVGComponent src="./assets/folder.svg" color="#1f2937"/>
        </Button>
        <Card style={{fontSize:'11pt', alignItems:'center', padding:'2px 3px'}}>{directory}</Card>
        
      </>
    )}
  </div>

    </div>
    
  );
};

export default DragAndDropUploader;
