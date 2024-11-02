import React, { useState } from 'react';

const RutinaCard = ({ rutina, onDiaAgregado }) => {
  const { IdRutina, NombreRutina } = rutina;
  const [loading, setLoading] = useState(false);

  const handleAgregarDia = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/dias/max/${IdRutina}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const maxNumDia = data.maxNumDia || 0; // Obtener el máximo NumDia o 0 si no hay días aún
        const nuevoNumDia = maxNumDia + 1;

        // Crear un nuevo día asociado a la rutina actual
        fetch(`http://localhost:5000/api/dias`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Rutina: IdRutina,
            NumDia: nuevoNumDia,
          }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            setLoading(false);
            onDiaAgregado(); // Llamar a la función para actualizar las rutinas después de agregar un día
          })
          .catch(error => {
            console.error('Error al agregar día:', error);
            setLoading(false);
          });
      })
      .catch(error => {
        console.error('Error al obtener el máximo NumDia:', error);
        setLoading(false);
      });
  };

  return (
    <div className="rutina-card">
      <div className='rutinaCard-header' style={{display:'flex'}}>
        <span style={{flex:'1'}}>
          <h4>{NombreRutina}</h4>
        </span>
        <span style={{flex:'1'}}>
          <button onClick={handleAgregarDia} disabled={loading}>
            {loading ? 'Agregando...' : 'Agregar Día'}
          </button>
        </span>
      </div>
    </div>
  );
};

export default RutinaCard;
