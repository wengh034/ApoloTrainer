import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const CrearRutinaModal = ({ isOpen, onClose, onSubmit }) => {
  const [nombreRutina, setNombreRutina] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(nombreRutina);
    setNombreRutina('');
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Crear Rutina</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className='row'>
            <div className='col'>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre:</Form.Label>
            <Form.Control
              type="text"
              name="Nombre"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              required
            />
          </Form.Group>
            </div>
          </div>

          <div className='row'>
            <div className='col mt-2' style={{textAlign:'right'}}>
              <Button variant='btn btn-sm btn-warning' type='submit'>Crear</Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CrearRutinaModal;
