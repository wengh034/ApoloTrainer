import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import YearSelector from './YearSelector';

const Chart = ({ alumnoId }) => {
  const chartRef = useRef(null);
  const [hasEnoughData, setHasEnoughData] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const chartContainerRef = useRef(null); // Referencia al contenedor

  const fetchAndRenderData = async (alumnoId, selectedYear) => {
    try {
      const response = await fetch(`http://localhost:5000/api/estadisticas/${alumnoId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error fetching statistics');
      }

      const filteredData = selectedYear
        ? data.data.filter(item => new Date(item.FAct).getFullYear().toString() === selectedYear)
        : data.data;

      if (filteredData.length < 2) {
        setHasEnoughData(false);
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
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:5000/api/estadisticas/${alumnoId}`);
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

  return (
    <div className='chartsContent'>
      <div style={{width:'100%', textAlign:'right'}}>
        <YearSelector years={availableYears} selectedYear={selectedYear} onYearChange={setSelectedYear} />
      </div>
        {hasEnoughData ? (
        <div ref={chartContainerRef} id="chart" style={{display:'flex', width: '100%', height: '93%', margin:'auto' }}></div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', margin: 'auto', color:'#191919' }}>
          Aún no se tienen suficientes datos para mostrar la gráfica.
        </div>
      )}

    </div>
  );
};

export default Chart;
