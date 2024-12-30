import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import SVGComponent from '../SVGComponent';
import html2pdf from 'html2pdf.js';
import { getBaseUrl } from '@/Config.js';

const RutinaDetail = ({ IdRutina, NombreRutina, Alumno }) => {
  const [dias, setDias] = useState([]);
  const [ejercicios, setEjercicios] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = async () => {
    setShowModal(true);
    await fetchRutinaData(); // Llama a la función para buscar datos
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setDias([]); // Limpia los datos si es necesario
    setEjercicios({});
  };

  const fetchRutinaData = async () => {
    setLoading(true);
    try {
      const responseDias = await fetch(`${getBaseUrl()}/api/rutinas/${IdRutina}/dias`);
      const dataDias = await responseDias.json();
      setDias(dataDias.data);

      const ejerciciosPromises = dataDias.data.map(async (dia) => {
        const responseEjercicios = await fetch(`${getBaseUrl()}/api/dias/${dia.IdDia}/ejercicios`);
        const dataEjercicios = await responseEjercicios.json();
        return { [dia.IdDia]: dataEjercicios.data };
      });

      const ejerciciosData = await Promise.all(ejerciciosPromises);
      const ejerciciosMap = ejerciciosData.reduce((acc, cur) => ({ ...acc, ...cur }), {});
      setEjercicios(ejerciciosMap);
    } catch (error) {
      setError('Error al obtener los datos de la rutina.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('pdfContent');
    const options = {
      margin: [1, 0.8, 2, 0.8],
      filename: `informe_cierre_${NombreRutina}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
  
    html2pdf()
      .from(element)
      .set(options)
      .toPdf()
      .get('pdf')
      .then(async (pdf) => {
        const pageCount = pdf.internal.getNumberOfPages();
        const watermarkImage = './assets/Logo.png'; // Cambia a tu ruta correcta
  
        const img = new Image();
        img.src = watermarkImage;
  
        // Cargar la imagen de forma asíncrona
        img.onload = async () => {
          const imgRatio = img.width / img.height;
  
          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
  
            const watermarkWidth = pageWidth * 0.60; // 60% del ancho de la página
            const watermarkHeight = watermarkWidth / imgRatio;
  
            const xPosition = (pageWidth - watermarkWidth) / 2; // Centrado horizontalmente
            const yPosition = (pageHeight - watermarkHeight) / 2; // Centrado verticalmente
  
            // Crear un canvas para ajustar la opacidad
            const canvas = document.createElement('canvas');
            const scaleFactor = 4; // Aumenta el factor de escala para mejorar la calidad
            canvas.width = watermarkWidth * scaleFactor;  // Aumentar resolución
            canvas.height = watermarkHeight * scaleFactor; // Aumentar resolución
  
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.2; // Establecer la opacidad deseada
  
            // Dibujar la imagen en el canvas, escalando para mantener la calidad
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
            // Agregar la imagen del canvas al PDF
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xPosition, yPosition, watermarkWidth, watermarkHeight);
          }
  
                  // Guardar el PDF una vez que se haya terminado de agregar la marca de agua
        pdf.save(`informe_cierre_${NombreRutina}.pdf`); // Especificar el nombre del archivo aquí
      };
  
        img.onerror = () => {
          console.error('Error loading watermark image');
        };
      });
  };
  
  


  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <Button onClick={handleOpenModal} variant="btn btn-sm btn-secondary" style={{background: 'none'}}>
        <SVGComponent src="./assets/print.svg" color="#c3c5c9" />
      </Button>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista previa</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: '70vh', overflowY: 'auto' }}>
          <div
            style={{
              color: '#464646',
              width: '200mm', // Ancho de la página
              paddingLeft: '2em',
              marginTop: '3em',
              fontSize: '12pt',
              fontFamily: 'Calibri, Calibri Light, sans-serif',
              backgroundColor: '#fffffe',
            }}
            id="pdfContent"
          >
                        <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', fontFamily: 'Calibri Light', marginBottom:'1em' }}>
              Plan de Entrenamiento Personalizado
            </h1>

            <div style={{display:'flex', justifyContent:'space-between', textAlign: 'left'}}>
              <div style={{display:'flex', textAlign: 'left'}}>
                <div>
              <span style={{ fontSize: '14pt', fontWeight: 'bold', fontFamily: 'Calibri', marginRight:'0.5em'}}>
                Alumno: 
              </span>
            </div>
                <div style={{ fontSize: '14pt', fontFamily: 'Calibri Light' }}> <p> {Alumno}</p>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '12pt', fontWeight: 'bold', fontFamily: 'Calibri', marginRight:'0.5em'}}>Descansos entre: </span>
                  <ul style={{paddingLeft:'1em', listStyle:'inside', fontSize: '12pt'}}>
                    <li>Repeticiones: 1'</li>
                    <li>Series: 2'</li>
                    </ul>
                </div>
              <div>
                <div>
                <span style={{ fontSize: '12pt', fontWeight: 'bold', fontFamily: 'Calibri'}}>Calentamiento:</span>
                <ul style={{paddingLeft:'1em', listStyle:'inside', fontSize: '12pt'}}>
                  <li>Trote 10'</li>
                  <li>Caminata 15'</li>
                  <li>Bicicleta 10'</li>
                </ul>
                </div>
              </div>
            </div>
            {dias.map((dia, index) => (
  <div
    key={dia.IdDia}
    className="pdfPage"
    style={{ marginTop: '20px', position: 'relative',  pageBreakAfter: index === dias.length - 1 ? 'auto' : 'always', }} // Forzar salto de página
  >
    <h5>Día {dia.NumDia}</h5>
    <div>
      {ejercicios[dia.IdDia] && ejercicios[dia.IdDia].map((ejercicio) => (
        <div key={ejercicio.IdEjercicio} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>{ejercicio.Ejercicio}</h3>
            <span style={{ fontSize: '14px', color: '#666', backgroundColor: '#e9e9e9', padding: '2px 6px', borderRadius: '4px' }}>
              {!isNaN(ejercicio.Peso) && ejercicio.Peso.trim() !== '' ? `${ejercicio.Peso} kg` : ejercicio.Peso} | {ejercicio.Serie} series | {ejercicio.Repe} repeticiones
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>{ejercicio.Comentario}</p>
        </div>
      ))}
    </div>
  </div>
))}

          </div>
        </Modal.Body>
        <Modal.Footer>
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

export default RutinaDetail;
