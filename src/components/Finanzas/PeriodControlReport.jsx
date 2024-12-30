import React, { useEffect, useState } from 'react';
import SVGComponent from '../SVGComponent';
import InformeMensual from '../Reports/FinanceReport';
import { getBaseUrl } from '@/Config.js';

const PeriodCards = () => {
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    // Endpoint para obtener los periodos
    const fetchPeriods = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/periods`);
        const data = await response.json();
        setPeriods(data);
      } catch (error) {
        console.error('Error fetching periods:', error);
      }
    };

    fetchPeriods();
  }, []);

  return (
    <div className="period-cards-container"  style={{ height: '75vh', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px', marginTop:'1em' }}>
      {periods.map((period) => (
        <div key={period.IdPeriod} className="custom-card" style={{display:'flex', justifyContent:'space-between'}}>
          <div className="Pending-cardBody">
            <h3 style={{ color: '#ffffff' }}>Periodo: {period.Period}</h3>
            <div style={{display:'flex'}}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '10px', padding: '10px' }}>
              <SVGComponent src="./assets/calendar_month.svg" color="#A1A1AA" />
              <div style={{ display: 'flex', marginLeft: '10px' }}>
                        <div>desde: {period.IniPer}</div>&nbsp; &nbsp; 
                        <div>a: {period.FinPer}</div>
                    </div>
              </div>
            </div>
          </div>
          <div>
            <InformeMensual periodId={period.IdPeriod} />
          
          </div>

        </div>
      ))}
    </div>
  );
};

export default PeriodCards;
