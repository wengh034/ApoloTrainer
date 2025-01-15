import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '@/Config.js';
import SVGComponent from '../../SVGComponent';
const GymSalaryManager = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/gyms`); // Usa la ruta definida en el backend
        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }
        const data = await response.json();
        // Filtrar los registros donde JobType = "De piso"
        const filteredGyms = data.filter(gym => gym.JobType === "De piso");
        setGyms(filteredGyms);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumberWithDots = (number) => {
    if (!number) return '';
    return number.toLocaleString('de-DE');
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{display:'block', overflowY: 'auto', height: '100%'}}>
      {gyms.length > 0 ? (
      <div className="card" style={{color:'#c3c5c9', background:'#111827' }}>
        {gyms.map(gym => (
          <div key={gym.IdGym} className="card" style={{display:'flex', marginTop:'10px'}}>
            <div className="card-header">
            <h5>{gym.GymName}</h5>
            </div>
            <div className="card-body" style={{ padding: '10px' }}>
              <div style={{ display: 'flex', marginBottom: '15px' }}>
                <span style={{ marginRight: '10px' }}>
                  <SVGComponent src="./assets/attach_money.svg" color="#717785" />
                </span>
                <span>{formatNumberWithDots(gym.Salary)} Gs.</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>
                  <SVGComponent src="./assets/person_single.svg" color="#717785" />
                </span>
                <span> {gym.StudentCount} estudiantes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <p>No hay sueldos disponibles. ¡Agrega uno en el apartado de gimnasios!</p>
      )}
    </div>
  );
};

export default GymSalaryManager;
