import React, { useState } from 'react';
import { showToast } from '../toastUtils';
import { Modal, Button, Form } from 'react-bootstrap';
import dayjs from 'dayjs';

const PeriodBootModal = ({ show, onHide, onSave }) => {
  const [startDate, setStartDate] = useState('');
  const [showWarning, setShowWarning] = useState(false); // Estado para mostrar la advertencia

  // Función para manejar el cambio de fecha
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setStartDate(selectedDate);
    
    // Obtener el día del mes seleccionado usando dayjs para asegurar la consistencia
    const selectedDay = dayjs(selectedDate).date();
    
    // Mostrar advertencia si el día es 29, 30 o 31
    setShowWarning([29, 30, 31].includes(selectedDay));
  };

  // Función para guardar la fecha seleccionada
  const handleSave = () => {
    if (startDate) {
      onSave(startDate); // Llama a la función onSave pasada desde ClosingBoot.js con la fecha seleccionada
      
    } else {
      showToast('error', 'Selecciona una fecha válida!');
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Configuración Inicial</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formStartDate">
            <Form.Label>
              <p>
                Lea los términos y condiciones <a href="#">Aquí</a>.
              </p>
              <p>Para acceder al manual da click <a href="#">Aquí.</a></p>
              <p>Seleccione la Fecha de Inicio del Primer Periodo.</p> 
            </Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={handleDateChange}
            />
            {/* Mostrar advertencia inmediatamente al seleccionar 29, 30 o 31 */}
            {showWarning && (
              <Form.Text className="text-danger mt-2">
                <img src="./src/assets/warning.svg" alt="warning" /> <strong>Aviso:</strong> Evita seleccionar los días 29, 30 y 31, ya que son fechas irregulares y pueden causar ajustes automáticos inesperados o incómodos.
                <a href="/manual-usuario#fechas-irregulares"> Más información aquí</a>.
              </Form.Text>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="btn btn-sm btn-secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="btn btn-sm btn-primary" onClick={handleSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PeriodBootModal;
