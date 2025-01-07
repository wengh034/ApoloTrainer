import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getBaseUrl } from '@/Config.js';
import { showToast } from '../toastUtils';

const DragAndDropUploader = () => {
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
      {...getRootProps()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: isDragActive ? '#f0f0f0' : '#fff',
        cursor: 'pointer',
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Suelta las imágenes aquí...</p>
      ) : (
        <p>Arrastra y suelta tus imágenes aquí, o haz clic para seleccionarlas.</p>
      )}
    </div>
  );
};

export default DragAndDropUploader;
