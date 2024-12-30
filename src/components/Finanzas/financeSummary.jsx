import React, { useState, useEffect } from 'react';
import RingChart from './SummaryChart';
import SVGComponent from '../SVGComponent';
import { getBaseUrl } from '@/Config.js';

const FinanceSummary = () => {
  const [totalMonto, setTotalMonto] = useState(0);
  const [montoPendiente, setMontoPendiente] = useState(0);
  const [montoIngresado, setMontoIngresado] = useState(0);
  const [gymsInternos, setGymsInternos] = useState([]);

  const formatNumberWithDots = (number) => {
    if (!number) return '';
    return number.toLocaleString('de-DE');
  };
   // Función para obtener los datos de gimnasios De Piso
   const fetchGymsInternos = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/gyms/internos`);
      if (!response.ok) {
        throw new Error('Error al obtener gimnasios internos');
      }
      const data = await response.json();
      setGymsInternos(data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
   useEffect(() => {
     fetchGymsInternos();
   }, []);
  const sumSalaries = (gyms) => {
    return gyms.reduce((total, gym) => total + (gym.Salary || 0), 0);
  };

  useEffect(() => {
    const fetchCuotas = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/cuotas`);
        const data = await response.json();

        if (response.ok) {
          setTotalMonto(data.totalMonto);
          setMontoPendiente(data.montoPendiente);
          setMontoIngresado(data.montoIngresado);
        } else {
          console.error('Error fetching cuotas:', data.message);
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
      }
    };

    fetchCuotas();
  }, []);

  return (
    <div className="finance-container">
      <div className="finance-header">
        {/* <h1>Finanzas</h1> */}
      </div>
      <div className="finance-body">
        {/* Primer conjunto de elementos flex */}
        <div className="flex-row" style={{ marginBottom: '2em', display: 'flex', alignItems: 'flex-start' }}>
          <div className="major-card">
            <div style={{ padding: '3.5em 1em 0 2em', fontWeight:'500' }}>Ingreso Actual</div>
                <div style={{ padding: '0.5em 2em 2em 2em' }}>
                <h1>{montoIngresado > 0 ? formatNumberWithDots(montoIngresado) : 0} Gs.</h1>
            </div>            
          </div>
          <div className="statistics">
            <RingChart totalMonto={totalMonto} montoPendiente={montoPendiente} montoIngresado={montoIngresado} />
          </div>
        </div>
        {/* Segundo conjunto de elementos flex */}
        <div className="flex-row" style={{ marginBottom: '2em', display: 'flex' }}>
            <div className="sub-card">
                <div style={{display:'flex', alignItems:'center', marginRight:'10px'}}>
                    <SVGComponent src="./assets/query_stats.svg" color="#111827" width="32px" height="32px"/>
                </div>
                <div style={{width:'100%'}}>
                    <span>Estimado</span>
                    <h4>{formatNumberWithDots(totalMonto)} Gs.</h4>
                </div>
            </div>
            
          <div className="sub-card">
            <div style={{display:'flex', alignItems:'center', marginRight:'10px'}}>
                <SVGComponent src="./assets/schedule.svg" color="#111827" width="32px" height="32px"/>
            </div>
            <div style={{width:'100%'}}>
                <span>Pendiente</span>
                
                <h4>{montoPendiente === 0 
                  ? 0
                  :  `${formatNumberWithDots(montoPendiente)}`} Gs.</h4>
            </div>
          </div>
          <div className="sub-card">
            <div style={{display:'flex', alignItems:'center', marginRight:'10px'}}>
                <SVGComponent src="./assets/pin.svg" color="#111827" width="32px" height="32px"/>
            </div>
            <div style={{width:'100%'}}>
                <span>Fijo</span>
                
                <h4>{formatNumberWithDots(sumSalaries(gymsInternos))} Gs.</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceSummary;
