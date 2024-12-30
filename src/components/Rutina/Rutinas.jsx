import React, { useState } from 'react';
import { getBaseUrl } from '@/Config.js';

const CrearRutina = ({ alumnoId, onRutinaCreada }) => {
  const [nombreRutina, setNombreRutina] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCrearRutina = () => {
    setLoading(true);
    fetch(`${getBaseUrl()}/api/rutinas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ IdAlumno: alumnoId, NombreRutina: nombreRutina }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setLoading(false);
        onRutinaCreada(data); // Llamar al callback con la rutina creada
        setNombreRutina(''); // Limpiar el campo de entrada
      })
      .catch(error => {
        console.error('Error al crear rutina:', error);
        setLoading(false);
      });
  };

  return (
    <div className="crear-rutina">
      <input
        type="text"
        value={nombreRutina}
        onChange={e => setNombreRutina(e.target.value)}
        placeholder="Nombre de la Rutina"
      />
      <button onClick={handleCrearRutina} disabled={loading || !nombreRutina}>
        {loading ? 'Creando...' : 'Crear Rutina'}
      </button>
    </div>
  );
};

export default CrearRutina;
