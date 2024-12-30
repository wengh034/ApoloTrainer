import React, { useState } from 'react';
import { getBaseUrl } from '@/Config.js';

const AgregarEjercicio = ({ diaId, onEjercicioGuardado }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ejercicio, setEjercicio] = useState('');
  const [peso, setPeso] = useState('');
  const [serie, setSerie] = useState('');
  const [repe, setRepe] = useState('');
  const [comentario, setComentario] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevoEjercicio = {
      Dia: diaId,
      Ejercicio: ejercicio,
      Peso: peso,
      Serie: serie,
      Repe: repe,
      Comentario: comentario,
    };

    try {
      const response = await fetch(`${getBaseUrl()}/api/ejercicios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoEjercicio),
      });

      if (response.ok) {
        // Limpiar los campos del formulario y ocultar el formulario
        setEjercicio('');
        setPeso('');
        setSerie('');
        setRepe('');
        setComentario('');
        setMostrarFormulario(false);

        // Notificar al componente padre que se guardó un ejercicio
        if (onEjercicioGuardado) {
          onEjercicioGuardado();
        }
      } else {
        console.error('Error al agregar ejercicio');
      }
    } catch (error) {
      console.error('Error al agregar ejercicio:', error);
    }
  };

  const handleAgregarClick = (e) => {
    if (mostrarFormulario) {
      // Si el formulario está visible, intentar guardar el ejercicio
      handleSubmit(e); // Pasa el evento `e` al handleSubmit
    } else {
      // Si el formulario no está visible, mostrar el formulario
      setMostrarFormulario(true);
    }
  };

  return (
    <div>
      <button onClick={handleAgregarClick}>
        {mostrarFormulario ? 'Guardar' : 'Agregar Ejercicio'}
      </button>
      {mostrarFormulario && (
        <form onSubmit={handleSubmit}> {/* Agrega onSubmit al formulario */}
          <div>
            <input
              type="text"
              placeholder="Ejercicio"
              value={ejercicio}
              onChange={(e) => setEjercicio(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Peso"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Serie"
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Repeticiones"
              value={repe}
              onChange={(e) => setRepe(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default AgregarEjercicio;
