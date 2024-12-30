import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import YearSelector from './YearSelector';
import LoadingScreen from '../../loadingScreen';
import { getBaseUrl } from '@/Config.js';

const Chart = ({ alumnoId }) => {
  const chartRef = useRef(null);
  const [hasEnoughData, setHasEnoughData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const chartContainerRef = useRef(null); // Referencia al contenedor
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndRenderData = async (alumnoId, selectedYear) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/estadisticas/${alumnoId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error fetching statistics');
      }

      const filteredData = selectedYear
        ? data.data.filter(item => new Date(item.FAct).getFullYear().toString() === selectedYear)
        : data.data;

      if (filteredData.length < 2) {
        setHasEnoughData(false);
        setIsLoading(false);
        return;
      }

      setHasEnoughData(true);

      // Ordenar los datos por fecha ascendente
      const sortedData = filteredData.sort((a, b) => {
        const dateA = new Date(a.FAct);
        const dateB = new Date(b.FAct);
        return dateA - dateB;
      });

      // Verifica si el contenedor tiene dimensiones válidas
      const chartDom = chartContainerRef.current;
      if (!chartDom || chartDom.clientWidth === 0 || chartDom.clientHeight === 0) {
        console.error("El contenedor del gráfico no tiene dimensiones válidas.");
        setIsLoading(false);
        return;
      }

      // Si ya existe una instancia de gráfico, elimínala
      if (chartRef.current) {
        chartRef.current.dispose();
      }

      const myChart = echarts.init(chartDom);
      chartRef.current = myChart;

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Peso', 'Grasa', 'Liquido', 'Masa', 'IMC']
        },
        xAxis: {
          type: 'category',
          data: sortedData.map(item => item.FAct)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Peso',
            type: 'line',
            stack: 'total',
            smooth: true,
            data: sortedData.map(item => item.Peso)
          },
          {
            name: 'Grasa',
            type: 'line',
            stack: 'total',
            smooth: true,
            data: sortedData.map(item => item.Grasa)
          },
          {
            name: 'Liquido',
            type: 'line',
            stack: 'total',
            smooth: true,
            data: sortedData.map(item => item.Liquido)
          },
          {
            name: 'Masa',
            type: 'line',
            stack: 'total',
            smooth: true,
            data: sortedData.map(item => item.Masa)
          },
          {
            name: 'IMC',
            type: 'line',
            stack: 'total',
            smooth: true,
            data: sortedData.map(item => item.IMC)
          }
        ]
      };

      myChart.setOption(option);
      setIsLoading(false); 
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${getBaseUrl()}/api/estadisticas/${alumnoId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error fetching statistics');
      }

      // Obtener los años disponibles
      const years = [...new Set(data.data.map(item => new Date(item.FAct).getFullYear().toString()))];
      setAvailableYears(years);

      // Espera un poco para asegurarse de que el contenedor tenga dimensiones
      setTimeout(() => fetchAndRenderData(alumnoId, selectedYear), 100);
    };

    fetchData();
  }, [alumnoId, selectedYear]);
  if (isLoading) {
    // Renderiza un estado de carga explícito mientras los datos están en proceso
    return <div style={{height:'100%',margin:'auto'}}><LoadingScreen/></div>;
  }

  return (
    <div className='chartsContent'>
        {hasEnoughData ? (
          <div style={{width:'100%', height:'100%'}}>
              <div style={{ display:'flex', justifyContent:'flex-end'}}>
                <YearSelector years={availableYears} selectedYear={selectedYear} onYearChange={setSelectedYear} />
              </div>
              <div ref={chartContainerRef} id="chart" style={{display:'flex', width:'100%', height:'93%', margin:'auto' }}></div>
          </div>
      ) : (
        <div style={{display:'flex', height:'90%', width:'100%'}}>
          <div style={{margin:'auto', fontFamily:'Calibri', textAlign:'center', color:'#1f2937'}}>
            <h3>Aún no hay suficientes datos para mostrar el gráfico.</h3>
            <p style={{maxWidth:'27rem', margin:'auto'}}>Cuando haya al menos dos registros, el gráfico se mostrará aquí.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Chart;
