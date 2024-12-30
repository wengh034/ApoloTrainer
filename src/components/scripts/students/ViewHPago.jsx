import React, { useState, useEffect } from 'react';
import { getBaseUrl } from '@/Config.js';

const MostrarHistorialPagos = ({ alumnoId }) => {
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchHistorialPagos = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/historial-pagos/${alumnoId}`);
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
    <div className='mostrarHistorialPagos' 
    style={{height:'70vh', width:'90%', color:'#464646'}}>
      {mensaje && <p>{mensaje}</p>}
     
        {historial.length > 0 ? (
           <div style={{height:'100%', backgroundColor:'#fffffe', borderRadius: '5px', overflow:'auto'}}>
        <table style={{width:'95%', margin:'auto', fontSize: '11pt', borderCollapse: 'collapse'}}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fffffe', zIndex: 1 }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Actualización</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Motivo</th>
            </tr>
          </thead>   
            <tbody>
              {historial.map(entry=> (
                <tr key={entry.IdHistorial} style={{ borderBottom: '1px solid #ddd', fontSize: '11pt' }}>
                  <td style={{ padding: '8px', width: '40%'}}>{entry.FechaCambio}</td>
                  <td style={{ padding: '8px' }}>{entry.Motivo}</td>
                </tr>
              ))}
            </tbody>
        </table>
        </div>
        ) : (
          <div style={{ display:'flex', height:'100%' }}>
            <div style={{margin:'auto', fontFamily:'Calibri', textAlign:'center', color:'#cccccc'}}>
              <h3>No hay datos disponibles para mostrar.</h3>
              <p style={{maxWidth:'25rem', margin:'auto'}}>Cuando haya información de pagos disponible, aparecerá en esta sección.</p>
            </div>
          </div>
        )}
      </div>
  );
};

export default MostrarHistorialPagos;
