import React from 'react';
import dayjs from 'dayjs';

const HistorialEstadisticas = ({ historial }) => {

  return (
    <div className="historial-estadisticas-container">
      {HistorialEstadisticas.length === 0 ? (
        <div style={{margin:'auto'}}>No hay estadísticas registradas aún.</div>
      ) : (
        <div style={{ maxHeight: '400px', overflow: 'auto', color:'#464646', backgroundColor:'#fffffe', border: '1px solid #ccc',
          borderRadius: '5px' }}>
          <table style={{ width: '90%', fontSize: '11pt', borderCollapse: 'collapse', margin:'auto'}}>
            <thead>
              <tr>
                <th style={{padding: '8px' }}>Fecha</th>
                <th style={{padding: '8px' }}>Peso(kg)</th>
                <th style={{padding: '8px' }}>Grasa</th>
                <th style={{padding: '8px' }}>Líquido</th>
                <th style={{padding: '8px' }}>Masa</th>
                <th style={{padding: '8px' }}>IMC</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(estadistica => (
                <tr key={estadistica.IdEstadistica} style={{ borderBottom: '1px solid #ddd', fontSize: '11pt' }}>
                  <td style={{ padding: '8px' }}>{dayjs(estadistica.FAct).format('DD/MM/YYYY')}</td> 
                  <td style={{ padding: '8px' }}>{estadistica.Peso}</td>
                  <td style={{ padding: '8px' }}>{estadistica.Grasa}</td>
                  <td style={{ padding: '8px' }}>{estadistica.Liquido}</td>
                  <td style={{ padding: '8px' }}>{estadistica.Masa}</td>
                  <td style={{ padding: '8px' }}>{estadistica.IMC}</td>  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistorialEstadisticas;
