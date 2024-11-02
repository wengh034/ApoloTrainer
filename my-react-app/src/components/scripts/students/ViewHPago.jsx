import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MostrarHistorialPagos = ({ alumnoId }) => {
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchHistorialPagos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/historial-pagos/${alumnoId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHistorial(data.data);
      } catch (error) {
        setMensaje('Hubo un error al obtener el historial de pagos.');
        console.error('Error fetching historial de pagos:', error);
      }
    };
  
    fetchHistorialPagos();
  }, [alumnoId]);
  

  return (
    <div className='mostrarHistorialPagos' style={{maxHeight:'70vh', overflow:'auto', backgroundColor:'#fffffe', color:'#464646', border: '1px solid #ccc',
      borderRadius: '5px'}}>
      {mensaje && <p>{mensaje}</p>}
        <table style={{ width: '90%', fontSize: '11pt', borderCollapse: 'collapse', margin:'auto'}}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Actualización</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Motivo</th>
            </tr>
          </thead>   
            <tbody>
              {historial.map(entry=> (
                <tr key={entry.IdHistorial} style={{ borderBottom: '1px solid #ddd', fontSize: '11pt' }}>
                  <td style={{ padding: '8px' }}>{entry.FechaCambio}</td>
                  <td style={{ padding: '8px' }}>{entry.Motivo}</td>
                </tr>
              ))}
            </tbody>
        </table>
        
    </div>
  );
};

export default MostrarHistorialPagos;
