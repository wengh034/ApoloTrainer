import React, { useState, useEffect } from 'react';
import AgregarEjercicio from './exercise';
import { getBaseUrl } from '@/Config.js';

const TablaEjercicios = ({ diaId }) => {
  const [ejerciciosGuardados, setEjerciciosGuardados] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEjercicios();
  }, [diaId]);

  const fetchEjercicios = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/ejercicios/dia/${diaId}`);
      if (response.status === 404) {
        setError('Ejercicios no encontrados');
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEjerciciosGuardados(data.data);
    } catch (error) {
      console.error('Error al obtener los ejercicios:', error);
      setError('Error al obtener los ejercicios');
    }
  };

  const handleEjercicioAgregado = () => {
    fetchEjercicios();
    setMostrarFormulario(false); // Ocultar el formulario después de agregar el ejercicio
  };

  const handleAgregarEjercicioClick = () => {
    setMostrarFormulario(!mostrarFormulario); // Mostrar u ocultar el formulario cuando se hace clic en "Agregar Ejercicio"
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h4>Ejercicios guardados:</h4>
      {ejerciciosGuardados.length === 0 ? (
        <p>No hay ejercicios guardados para este día.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ejercicio</th>
              <th>Peso</th>
              <th>Serie</th>
              <th>Repeticiones</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {ejerciciosGuardados.map((ejercicio, index) => (
              <tr key={index}>
                <td>{ejercicio.Ejercicio}</td>
                <td>{ejercicio.Peso}</td>
                <td>{ejercicio.Serie}</td>
                <td>{ejercicio.Repe}</td>
                <td>{ejercicio.Comentario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={handleAgregarEjercicioClick}>
        {mostrarFormulario ? 'Cerrar Formulario' : 'Agregar Ejercicio'}
      </button>
      {mostrarFormulario && (
        <AgregarEjercicio
          diaId={diaId}
          onEjercicioAgregado={handleEjercicioAgregado} // Pasar la función correctamente
        />
      )}
    </div>
  );
};

export default TablaEjercicios;
