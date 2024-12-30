import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { showToast } from '../toastUtils';
import PagoStatusButton from '../scripts/payStatus';
import SVGComponent from '../SVGComponent'
import dayjs from 'dayjs';
import { getBaseUrl } from '@/Config.js';

const Cuotas = ({ selectedAlumno, cuotas, onStatusChange, onUpdateAlumno, handleDeleteClick }) => {
  const [cuotasActualizadas, setCuotasActualizadas] = useState(cuotas);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const [alumno, setAlumno] = useState(null);


  const [formData, setFormData] = useState({
    Nombre: '',
    Apellido: '',
    CI: '',
    Tel: '',
    FInsc: '',
    Cuota: '',
    Altura: '',
    Sexo: ''
  });

  useEffect(() => {
    const fetchCuotas = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/cuotas/${selectedAlumno.idAlumno}`);
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setCuotasActualizadas(result.data);
        } else {
          console.error('Los datos no son un array:', result);
        }
      } catch (error) {
        console.error('Error al obtener las cuotas:', error);
      }
    };

    if (selectedAlumno) {
      fetchCuotas();
    }
  }, [selectedAlumno]);


  useEffect(() => {
    setCuotasActualizadas(cuotas);
  }, [cuotas]);

  useEffect(() => {

    if (selectedCuota && selectedAlumno) {
      setFormData({
        Nombre: selectedAlumno.Nombre || '',
        Apellido: selectedAlumno.Apellido || '',
        CI: selectedAlumno.CI || '',
        Tel: selectedAlumno.Tel || '',
        Altura: selectedAlumno.Altura || '',
        FInsc: selectedCuota.FInsc || '',
        Cuota: selectedCuota.Cuota || '',
        Sexo: selectedAlumno.Sexo || ''
      });
    }
  }, [selectedCuota, selectedAlumno]);

  const handleDelete = async () => {
    if (selectedAlumno) {
      try {
        await handleDeleteClick(selectedAlumno.idAlumno); // Llama a la función de Alumnos
        // onAlumnoDeleted();  // Notifica al componente padre (Alumnos)
        setShowModal(false)
        showToast('success', 'Alumno Eliminado!');
      } catch (error) {
        console.error('Error al eliminar alumno:', error);
      }
    }
  };

  const handleStatusChange = (idCuota, newStatus, newFPago) => {
    setCuotasActualizadas(prevCuotas =>
      prevCuotas.map(cuota =>
        cuota.IdCuota === idCuota ? { ...cuota, PagoStatus: newStatus, FPago: newFPago } : cuota
      )
    );
  };

   const StatusDesc = (status) => (
     <span style={{ color: status === 5 ? '#23c45e' : status === 6 ? '#ff3d3d' : 'black' }}>
       {status === 5 ? 'Pagado' : status === 6 ? 'Pendiente' : 'Desconocido'}
     </span>
   );

  const SexInfo = (Sexo) => Sexo === 1 ? 'Fem' : Sexo === 2 ? 'Masc' : 'Desconocido';


  const handleEditClick = (cuota) => {
    setSelectedCuota(cuota);
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${getBaseUrl()}/api/cuotas/${selectedCuota.IdCuota}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();

        // Actualiza el estado de cuotasActualizadas
        setCuotasActualizadas(prevCuotas =>
          prevCuotas.map(cuota =>
            cuota.IdCuota === result.IdCuota ? result : cuota
          )
        );

        // Llama a la función pasada desde el componente padre para actualizar selectedAlumno
        onUpdateAlumno({
          ...selectedAlumno,
          Nombre: formData.Nombre,
          Apellido: formData.Apellido,
          CI: formData.CI,
          Tel: formData.Tel,
          Altura: formData.Altura,
          Sexo: formData.Sexo
        });
        showToast('success', 'Datos actualizados!');
        setShowEditModal(false);
      } else {
        throw new Error('Error al actualizar la cuota');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const formatNumberWithDots = (number) => {
    if (!number) return '';
    return number.toLocaleString('de-DE');
  };

  return (
    <div className='card' style={{ width: '100%', color:'#c3c5c9', background:'#111827' }}>
      <div className='card-header' style={{minHeight:'147.25'}}>
        <div>
        <div className="card-title" style={{display:'flex', fontWeight: 'bolder', marginBottom:'0', justifyContent:'space-between', padding:'10px'}}>
         
         <div style={{display:'flex'}}>
          <span style={{fontFamily:'Calibri'}}>
          <h3>{selectedAlumno ? `${selectedAlumno.Nombre} ${selectedAlumno.Apellido}` : ''}</h3></span>
         <span>
          <Button
              variant="btn btn-sm btn-outline-warning custom-svg-btn"
              onClick={() => handleEditClick(cuotasActualizadas[0])}
              style={{width: '25px', border:'none', background:'none', marginLeft:'10px' }}
            >
              <SVGComponent src="./assets/edit.svg" color="#ffc107" width="20px" height="20px"/>
            </Button>
          </span>
          </div>
         <span>
         <Button variant="btn btn-outline-secondary" onClick={() => setShowModal(true)}>
         <SVGComponent src="./assets/delete.svg" color="#c3c5c9"/>
          </Button>
         </span>
        </div>
        </div>

      </div>

      <div className='card-body'style={{minHeight:'158px'}}>

        <div style={{display:'flex', marginBottom:'15px'}}>
          <span style={{marginRight:'10px'}}><SVGComponent src="./assets/person_single.svg" color="#717785" /></span>
          <span>{selectedAlumno ? formatNumberWithDots(selectedAlumno.CI) : ''}</span>
        </div>
        <div className='' style={{display:'flex', marginBottom:'15px'}}>
          <span style={{marginRight:'10px'}}><SVGComponent src="./assets/phone_number.svg" color="#717785" /></span>
          <span > {selectedAlumno ? selectedAlumno.Tel : ''}</span>
        </div>
        <div className='' style={{display:'flex', marginBottom:'15px'}}>
          <span style={{marginRight:'10px'}}><SVGComponent src="./assets/height.svg" color="#717785" /></span>
            {selectedAlumno ? selectedAlumno.Altura : ''}cm
        </div>

        <div style={{display:'flex', marginBottom:'15px'}}>
          <span style={{marginRight:'10px'}}><SVGComponent src="./assets/omniGender.svg" color="#717785" /></span>
          <span>{selectedAlumno ? SexInfo(selectedAlumno.Sexo) : ''}</span>
        </div>
        {cuotasActualizadas.map((cuota) => (
          <div key={cuota.IdCuota}>
              <div style={{display:'flex', marginBottom:'15px'}}>
                <span style={{marginRight:'10px'}}><SVGComponent src="./assets/calendar_today.svg" color="#717785" /></span>
                <span>Inscripción: {dayjs(cuota.FInsc).format('DD/MM/YYYY')}</span>
              </div>
              <div style={{display:'flex', marginBottom:'20px'}}>
                <span style={{marginRight:'10px'}}><SVGComponent src="./assets/calendar_today.svg" color="#717785" /></span>
                <span>Próximo Pago: { cuota.FPago !== null ? dayjs(cuota.FPago).format('DD/MM/YYYY') : " Aún no se registra primer pago" }
                </span>
              </div>
            <div className='card' style={{padding: '10px', background:'#1f2937'}}>
              <div className='cardCuotaContent' style={{display:'flex', justifyContent:'space-between'}}>
                <div>
                <span className='CuBoTt' style={{color:'#c3c5c9'}}>Cuota: </span> <h2 style={{color:'#ffc107'}}>{formatNumberWithDots(cuota.Cuota)} Gs.</h2>
              </div>
              <div style={{display:'flex', alignItems:'center'}}>
                <span className='CuBoTt' style={{paddingRight:'10px'}}>{StatusDesc(cuota.PagoStatus)} </span>
                <PagoStatusButton
                    idCuota={cuota.IdCuota}
                    currentStatus={cuota.PagoStatus}
                    onStatusChange={(idCuota, newStatus, newFPago) => handleStatusChange(idCuota, newStatus, newFPago)}
                  />
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cuota</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <div className='row'>
              <div className='col'>
                <Form.Group controlId="formNombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="Nombre"
                    value={formData.Nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className='col'>
                <Form.Group controlId="formApellido">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="Apellido"
                    value={formData.Apellido}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <div className='row'>
              <div className='col-4'>
                <Form.Group controlId="formCI">
                  <Form.Label>CI</Form.Label>
                  <Form.Control
                    type="text"
                    name="CI"
                    value={formData.CI}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className='col-6'>
                <Form.Group controlId="formFInsc">
                  <Form.Label>Fecha Inscripción</Form.Label>
                  <Form.Control
                    type="date"
                    name="FInsc"
                    value={formData.FInsc}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className='col-2'>
                <Form.Group controlId="formAltura">
                  <Form.Label>Altura</Form.Label>
                  <Form.Control
                    type="text"
                    name="Altura"
                    value={formData.Altura}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <div className='row'>
              <div className='col'>
                <Form.Group controlId="formTel">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="Tel"
                    value={formData.Tel}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className='col'>
                <Form.Group controlId="formCuota">
                  <Form.Label>Cuota</Form.Label>
                  <Form.Control
                    type="text"
                    name="Cuota"
                    value={formData.Cuota}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <div className='row'>
              <div className='col' style={{ marginTop: '1em', textAlign: 'right' }}>
                <Button variant="btn btn-warning" type="submit">
                  Guardar
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showModal} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>Confirmar eliminación</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p style={{ fontWeight: 'bolder' }}>¿Está seguro de que desea eliminar este usuario?</p>
    <p>Esta acción no se puede deshacer y elimina todos los datos relacionados.</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary"  onClick={() => setShowModal(false)}
    //  onClick={handleClose}
     >
      Cancelar
    </Button>
    <Button
      variant="danger"
      onClick={() => handleDelete()}
      >
      Eliminar
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default Cuotas;
