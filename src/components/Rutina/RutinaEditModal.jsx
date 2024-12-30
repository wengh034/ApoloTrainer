import React, { useState } from 'react';
import Modal from 'react-modal';
import { getBaseUrl } from '@/Config.js';

const EditDiaModal = ({ isOpen, onRequestClose, diaId, ejercicios, onSave }) => {
  const [updatedEjercicios, setUpdatedEjercicios] = useState([...ejercicios]);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newEjercicios = [...updatedEjercicios];
    newEjercicios[index] = {
      ...newEjercicios[index],
      [name]: value
    };
    setUpdatedEjercicios(newEjercicios);
  };

  const handleSave = () => {
    // Hacer una llamada para actualizar cada ejercicio
    Promise.all(updatedEjercicios.map(ejercicio => {
      return fetch(`${getBaseUrl()}/api/ejercicios/${ejercicio.IdEjercicio}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ejercicio),
      });
    }))
      .then(responses => {
        if (responses.some(response => !response.ok)) {
          throw new Error('Failed to update some exercises');
        }
        return Promise.all(responses.map(response => response.json()));
      })
      .then(data => {
        onSave(updatedEjercicios);
      })
      .catch(error => {
        console.error('Error al guardar los ejercicios:', error);
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Editar Día"
    >
      <h2>Editar Ejercicios</h2>
      {updatedEjercicios.map((ejercicio, index) => (
        <div key={ejercicio.IdEjercicio}>
          <input
            type="text"
            name="Ejercicio"
            value={ejercicio.Ejercicio}
            onChange={(event) => handleInputChange(index, event)}
          />
          <input
            type="text"
            name="Peso"
            value={ejercicio.Peso}
            onChange={(event) => handleInputChange(index, event)}
          />
          <input
            type="text"
            name="Serie"
            value={ejercicio.Serie}
            onChange={(event) => handleInputChange(index, event)}
          />
          <input
            type="text"
            name="Repe"
            value={ejercicio.Repe}
            onChange={(event) => handleInputChange(index, event)}
          />
          <input
            type="text"
            name="Comentario"
            value={ejercicio.Comentario}
            onChange={(event) => handleInputChange(index, event)}
          />
        </div>
      ))}
      <button onClick={handleSave}>Guardar</button>
      <button onClick={onRequestClose}>Cancelar</button>
    </Modal>
  );
};

export default EditDiaModal;
