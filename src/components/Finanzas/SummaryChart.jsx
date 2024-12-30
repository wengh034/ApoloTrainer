import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const RingChart = ({ totalMonto, montoPendiente, montoIngresado }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Inicializa el gráfico solo cuando haya datos disponibles
    const chartInstance = echarts.init(chartRef.current);
    
    const option = {
      title: {
        text: 'Distribución de Cuotas',
        // subtext: 'Total, Pendiente, Ingresado',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: 'Cuotas',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold',
            },
          },
          data: [
            { value: montoPendiente, name: 'Pendiente' },
            { value: montoIngresado, name: 'Ingresado' },
            // { value: totalMonto - (montoPendiente + montoIngresado), name: 'Total' },
          ],
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      ],
    };

    chartInstance.setOption(option);

    // Ajusta el gráfico al redimensionar la ventana
    const resizeChart = () => chartInstance.resize();
    window.addEventListener('resize', resizeChart);

    return () => {
      window.removeEventListener('resize', resizeChart);
      chartInstance.dispose(); // Limpia la instancia al desmontar
    };
  }, [totalMonto, montoPendiente, montoIngresado]); // Se ejecuta cuando cambian los datos

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%'}} />
  );
};

export default RingChart;
