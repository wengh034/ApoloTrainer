  import React, { useEffect, useRef, useState } from 'react';
  import * as echarts from 'echarts';
  import { Modal, Button } from 'react-bootstrap';  // Importa modal y botón de react-bootstrap
  import Watermark from './WaterMark';
  import SVGComponent from '../SVGComponent';
  import html2pdf from 'html2pdf.js';
  import { getBaseUrl } from '@/Config.js';

  const InformeMensual = ({ periodId }) => {
    const chartRef = useRef(null);
    const [data, setData] = useState({
      totalMonto: 0,
      montoPendiente: 0,
      montoIngresado: 0,
    });
    const [pendingStudents, setPendingStudents] = useState([]);
    const [resolvedStudents, setResolvedStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [gymsInternos, setGymsInternos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formatNumberWithDots = (number) => {
      if (!number) return '';
      return number.toLocaleString('de-DE');
    };

    // Cerrar y abrir modal
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    useEffect(() => {
      const fetchCuotasData = async () => {
        setLoading(true);  // Comienza el estado de carga
        try {
          const response = await fetch(`${getBaseUrl()}/api/filtered-payments-summary/${periodId}`);
          const result = await response.json();
          if (response.ok) {
            setData(result.data);
            // console.log('OweAmount es ', data.totalOweAmount);
          } else {
            throw new Error(result.message);  // Maneja errores en la respuesta
          }
        } catch (error) {
          setError('Error al obtener datos de cuotas');  // Guarda el mensaje de error
        } finally {
          setLoading(false);  // Termina el estado de carga
        }
      };
    
      const fetchPendingPayments = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${getBaseUrl()}/api/filtered-payments/${periodId}`);
          const result = await response.json();
          if (response.ok) {
            setPendingStudents(result.data.filter(student => student.IdStates === 6));
            setResolvedStudents(result.data.filter(student => student.IdStates === 5));
          } else {
            throw new Error(result.message);
          }
        } catch (error) {
          setError('Error al obtener datos de pagos pendientes');
        } finally {
          setLoading(false);
        }
      };
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
    
      fetchCuotasData();
      fetchPendingPayments();
      fetchGymsInternos();
    }, [periodId]);

    const sumSalaries = (gyms) => {
      return gyms.reduce((total, gym) => total + (gym.Salary || 0), 0);
    };
    const pendienteTotal = sumSalaries(gymsInternos) + (data.totalMonto || 0);
    const ingresoTotal = sumSalaries(gymsInternos) + (data.montoIngresado || 0);
    
    useEffect(() => {
      if (chartRef.current) { 
        const chartInstance = echarts.init(chartRef.current);
    
        const pieChartOptions = {
          title: {
            text: 'Distribución de Ingresos',
            left: 'center',
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
              name: 'Ingresos',
              type: 'pie',
              radius: '40%',
              data: [
                // { value: data.montoIngresado, name: 'Ingresos' },
                { value: ingresoTotal, name: 'Ingresos' },
                { value: data.montoPendiente, name: 'Pendiente' },
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
        };
    
        chartInstance.setOption(pieChartOptions);
    
        // Limpia la instancia de gráfico cuando el componente se desmonte
        return () => {
          if (chartInstance) {
            chartInstance.dispose();
          }
        };
      }
    }, [data]);
    

    // Generar el PDF usando html2pdf.js
    const handleDownloadPDF = () => {
      const element = document.getElementById('pdfContent');
      const options = {
        margin: 0.2,   //Ajustar márgenes
        filename: `informe_cierre_${data.nombrePeriodo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3 },  // Aumentar la escala para mejorar la calidad
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },  // Asegúrate de usar tamaño A4
      };
    
      html2pdf().from(element).set(options).save();
    };
    

    return (
      <div>
        <Button onClick={handleOpenModal} variant="btn btn-sm btn-warning" style={{ margin: '20px 0', background:'none', border:'none' }}>
        <SVGComponent src="./assets/download.svg" color="#ffc107" />
        </Button>
        <Modal show={showModal} onHide={handleCloseModal} size="lg" onEntered={() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current);
      const pieChartOptions = {
        title: {
          text: 'Distribución de Ingresos',
          left: 'center',
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
            name: 'Ingresos',
            type: 'pie',
            radius: '50%',
            data: [
              // { value: data.montoIngresado, name: 'Ingresos' },
              { value: ingresoTotal, name: 'Ingresos' },
              { value: data.montoPendiente, name: 'Pendiente' },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
      chartInstance.setOption(pieChartOptions);
    }
  }}>

          <Modal.Header closeButton>
            <Modal.Title>Vista previa del Informe</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{height:'70vh', overflowY:'auto'}}>
          {loading && <p>Cargando datos...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && (
            <div
              style={{
                color: '#464646',
                width: '200mm',
                paddingLeft:'2em',
                marginTop:'3em',
                fontSize: '12pt',
                fontFamily: 'Calibri, Calibri Light, sans-serif',
                backgroundColor: '#fffffe'
              }}
              id="pdfContent"
            >


              <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', fontFamily:'Calibri Light' }}>
                Informe de Cierre
              </h1>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <div style={{ flex: '1' }}>
                  <div style={{ marginBottom: '1.5em' }}>
                    <h1 style={{ fontSize:'', fontFamily:'Calibri' }}>{data.nombrePeriodo}</h1>
                  </div>
                  <div style={{ fontFamily:'Calibri', padding: '0 0 1em 0.5em' }}>
                    <div >
                    Estimado: {formatNumberWithDots(pendienteTotal)} Gs.
                  </div>
                  <div>
                    Ingreso fijo: {formatNumberWithDots(sumSalaries(gymsInternos))} Gs.
                  </div>
                  <div >
                    Ingreso variable: {formatNumberWithDots(data.montoIngresado)} Gs.
                  </div>
                  <div >
                  {data.montoPendiente === 0 
                    ? 'No se registran pendientes este periodo'
                    :  `Pendiente: ${formatNumberWithDots(data.montoPendiente)}`}
                  </div>
                  <div>
                    {data.totalOweAmount === 0 
                    ? 'No se registraron resoluciones'
                    :  `Resueltos este periodo: ${formatNumberWithDots(data.totalOweAmount)}`}
                  </div>
                  </div>
                  
                </div>
                <div ref={chartRef} style={{ height: '300px', flex: '2.2' }} />
              </div>
              {resolvedStudents.length > 0 && (
              <>
              <h3 style={{ fontSize: '14pt', marginTop: '30px', fontFamily:'Calibri Light' }}>Alumnos Resueltos este periodo</h3>
              <table style={{ width: '90%', fontSize: '11pt', borderCollapse: 'collapse', fontFamily:'Calibri' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Nombre</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Categoría</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Periodo</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedStudents.map((student) => (
                    <tr key={student.IdPendPayment} style={{ borderBottom: '1px solid #ddd', fontSize: '11pt' }}>
                      <td style={{ padding: '8px' }}>{student.AlumnoNombre}</td>
                      <td style={{ padding: '8px' }}>{student.AlumnoCI}</td>
                      <td style={{ padding: '8px' }}>{student.Categoria}</td>
                      <td style={{ padding: '8px' }}>{student.Periodo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '10pt' }}>
                OBS: Los alumnos pendientes se registran en el apartado de Pendientes en cada periodo.
              </p> 
              </>
              )}
              {pendingStudents.length > 0 && (
              <>
              <h3 style={{ fontSize: '14pt', marginTop: '30px',  fontFamily:'Calibri Light' }}>Alumnos Pendientes</h3>
              <table style={{ width: '90%', fontSize: '11pt', borderCollapse: 'collapse', marginTop: '16px', fontFamily:'Calibri' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Nombre</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Categoría</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Periodo</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStudents.map((student) => (
                    <tr key={student.IdPendPayment} style={{ borderBottom: '1px solid #ddd', fontSize: '11pt' }}>
                      <td style={{ padding: '8px' }}>{student.AlumnoNombre}</td>
                      <td style={{ padding: '8px' }}>{student.AlumnoCI}</td>
                      <td style={{ padding: '8px' }}>{student.Categoria}</td>
                      <td style={{ padding: '8px' }}>{student.Periodo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </>
              )}
            </div>
          )}
          </Modal.Body>
          <Modal.Footer >
            <Button variant="btn btn-sm btn-secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
            <Button variant="btn btn-sm btn-primary" onClick={handleDownloadPDF}>
              Descargar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  export default InformeMensual;
