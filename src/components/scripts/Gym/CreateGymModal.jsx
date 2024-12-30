import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { showToast } from '../../toastUtils';

const CreateGymModal = ({ show, onHide, jobTypes, onCreate }) => {
  const [gymName, setGymName] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [salary, setSalary] = useState('');

  const isExternal = selectedJobType === '2';

  const handleCreate = () => {
    // Validar que los datos requeridos estén presentes
    if (!gymName || !selectedJobType || (!salary && !isExternal)) {
      toast.error('Completa todos los campos ');
      showToast('error', 'Completa todos los campos');
      return;
    }

    // Invocar la función de creación
    onCreate({ GymName: gymName, JobType: selectedJobType, Salary: salary });

    // Limpiar los campos del formulario
    setGymName('');
    setSelectedJobType('');
    setSalary('');
    
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Gimnasio</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{minHeight:'270px'}}>
        <Form>
          <Form.Group controlId="gymName">
            <Form.Label>Nombre del Gimnasio</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese el nombre"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="jobType">
            <Form.Label>Tipo de Trabajo</Form.Label>
            <Form.Control
              as="select"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="">Seleccione</option>
              {jobTypes.map((job) => (
                <option key={job.IdJobType} value={job.IdJobType}>
                  {job.Type}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="salary">
            <Form.Label>Sueldo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese el sueldo"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              disabled={isExternal}
            />
            {isExternal && (
              <Form.Text className="text-muted">
                Este tipo no requiere un sueldo.
              </Form.Text>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleCreate}>
          Crear Gimnasio
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateGymModal;
