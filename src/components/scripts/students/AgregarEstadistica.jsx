import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import SVGComponent from '../../SVGComponent';
import { showToast } from '../../toastUtils';
import { getBaseUrl } from '@/Config.js';

const AgregarEstadistica = ({ alumnoId, onEstadisticaAgregada }) => {
  const [peso, setPeso] = useState('');
  const [grasa, setGrasa] = useState('');
  const [liquido, setLiquido] = useState('');
  const [masa, setMasa] = useState('');
  const [imc, setImc] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleAgregarEstadistica = async () => {
    if (!peso && !grasa && !liquido && !masa && !imc) {
      showToast('error', 'Evita campos vacíos!');
      return;
    }

    const fechaActual = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch(`${getBaseUrl()}/api/estadisticas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Alumno: alumnoId,
          Fecha: fechaActual,
          Peso: peso,
          Grasa: grasa,
          Liquido: liquido,
          Masa: masa,
          IMC: imc
        })

      });
      

      if (!response.ok) {
        throw new Error('Error al agregar estadística');
      }

      if (typeof onEstadisticaAgregada === 'function') {
        onEstadisticaAgregada();
      }

      // Limpiar los campos después de agregar la estadística
      setPeso('');
      setGrasa('');
      setLiquido('');
      setMasa('');
      setImc('');
      showToast('success', 'Actualizado!');
      setShowModal(false); // Cerrar el modal después de agregar la estadística

    } catch (error) {
      console.error('Error al agregar estadística:', error);
    }
  };

  return (
    <div className="agregar-estadistica-container" style={{ textAlign: 'center' }}>
      <Button variant="brn btn-sm btn-warning" onClick={() => setShowModal(true)}>
        <SVGComponent src="./assets/add_chart.svg" color="#534314"/>
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{fontFamily:'Calibri'}}>Agregar Estadística</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div style={{display:'flex'}}>
              <div>
              <Form.Group controlId="formPeso" style={{marginRight:'10px'}}>
              <Form.Label style={{fontWeight:'700'}}>Peso(kg)</Form.Label>
              <Form.Control type="text" value={peso} onChange={(e) => setPeso(e.target.value)} />
              </Form.Group>
              </div>
              <div>
                <Form.Group controlId="formGrasa" style={{marginRight:'10px'}}>
                <Form.Label style={{fontWeight:'700'}}>Grasa</Form.Label>
                <Form.Control type="text" value={grasa} onChange={(e) => setGrasa(e.target.value)} />
              </Form.Group>
              </div>
              <div>
                <Form.Group controlId="formLiquido" style={{marginRight:'10px'}}>
                <Form.Label style={{fontWeight:'700'}}>Líquido</Form.Label>
                <Form.Control type="text" value={liquido} onChange={(e) => setLiquido(e.target.value)} />
              </Form.Group>
              </div>
              <div>
                <Form.Group controlId="formMasa" style={{marginRight:'10px'}}>
                <Form.Label style={{fontWeight:'700'}}>Masa</Form.Label>
                <Form.Control type="text" value={masa} onChange={(e) => setMasa(e.target.value)} />
              </Form.Group>
              </div>
              <div>
                <Form.Group controlId="formImc">
                <Form.Label style={{fontWeight:'700'}}>IMC</Form.Label>
                <Form.Control type="text" value={imc} onChange={(e) => setImc(e.target.value)} />
              </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="btn btn-sm btn-warning" onClick={handleAgregarEstadistica}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AgregarEstadistica;
