import React, { useState, useEffect } from 'react';
import { showToast } from '../toastUtils';
import { Modal, Button, Form } from 'react-bootstrap';
import SVGComponent from '../SVGComponent';
import { getBaseUrl } from '@/Config.js';


const PagoStatusButton = ({ idCuota, currentStatus, onStatusChange }) => {
  const [mensaje, setMensaje] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [showError, setShowError] = useState(false);
  const [toastType, setToastType] = useState(null);

  const handlePagoStatusChange = () => {
    // console.log('Current status:', currentStatus); // Verificación
    if (currentStatus === 6) { // Pendiente
      setShowConfirmModal(true);
    } else if (currentStatus === 5) { // Pagado
      setShowMotivoModal(true);
    }
  };

  const handleConfirmChange = async () => {
    setShowConfirmModal(false);
    await updatePagoStatus(5); // Cambia el estado a Pagado
  };
  
  const handleMotivoChange = async () => {
    if (motivo.trim() === '') {
      showToast('error', 'Ingresa un motivo');
      return;
    }
    setShowMotivoModal(false);
    await updatePagoStatus(6, motivo);
  };
  

  const updatePagoStatus = async (newStatus, motivo = '') => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/updatePagoStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCuota, newStatus, motivo }),
      });


      const data = await response.json();
      toast.success('Estado actualizado!');
      setToastType('success');
  
      if (!response.ok) {
        throw new Error(data.message || 'Hubo un problema al actualizar el estado.');
      }
      onStatusChange(idCuota, newStatus, data.newFPago);
    } catch (error) {
      console.error('Error al actualizar el estado de pago:', error);
      showToast('error', 'Hugo un problema al actualizar!');
    }
  };
  
  
  return (
    <div>
      <button type="button" className="btn btn-sm btn-warning custom-svg-btn" onClick={handlePagoStatusChange} 
      style={{ height:'25px', width:'35px', background:'none', border:'none'}}
      >
      
        <SVGComponent 
    src={currentStatus === 5 ? './assets/credit_check.svg' : currentStatus === 6 ? './assets/pending.svg' : './assets/default_icon.svg'} 
    color={currentStatus === 5 ? '#23c45e' : currentStatus === 6 ? '#ff3d3d' : 'black'} 
  />
      </button>
      {mensaje && <p>{mensaje}</p>}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas realizar el pago?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={handleConfirmChange}>Sí</Button>
          <Button variant="outline-dark" onClick={() => setShowConfirmModal(false)}>No</Button>
        </Modal.Footer>
      </Modal>

      <Modal
      show={showMotivoModal}
      onHide={() => setShowMotivoModal(false)}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Motivo del Cambio</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Por favor, ingresa tu motivo para cambiar el estado de pago a Pendiente:</p>
        {showError && (
            <div style={{display:'inline-block'}}>
             <SVGComponent src="./assets/info!.svg" className="error-icon" color="red"/>El motivo es requerido!
            </div>
          )}
        <Form.Group>
          <Form.Control
            as="textarea"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            style={{
              resize: 'none'
            }}
            
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="warning" onClick={handleMotivoChange}>Aceptar</Button>
        <Button variant="outline-dark" onClick={() => setShowMotivoModal(false)}>Cancelar</Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
};

export default PagoStatusButton;
