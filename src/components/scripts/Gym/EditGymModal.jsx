import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditGymModal = ({ show, onHide, gym, jobTypes, onSave }) => {
  const [gymName, setGymName] = React.useState(gym?.GymName || '');
  const [selectedJobType, setSelectedJobType] = React.useState(gym?.JobType || '');
  const [salary, setSalary] = React.useState(gym?.Salary || '');

  const isExternal = selectedJobType === '2';


  // Se actualizan los valores al abrir el modal con un gimnasio específico
  React.useEffect(() => {
    if (gym) {
      setGymName(gym.GymName);
      const matchedJobType = jobTypes.find((job) => job.Type === gym.JobType);
      setSelectedJobType(matchedJobType ? matchedJobType.IdJobType : '');
      setSalary(gym.Salary);
    }
  }, [gym, jobTypes]);
  

  const handleSave = () => {
    // Invocar la función de guardar cambios
    onSave({ ...gym, GymName: gymName, JobType: selectedJobType, Salary: salary });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Gimnasio</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{minHeight:'270px'}}>
        <Form>
          {/* Input para el nombre del gimnasio */}
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
                value={selectedJobType} // Aquí se almacena el IdJobType
                onChange={(e) => setSelectedJobType(e.target.value)} // Almacenar el IdJobType
            >
                
                {jobTypes.map((job) => (
                <option key={job.IdJobType} value={job.IdJobType}>
                    {job.Type} {/* Mostrar el nombre del tipo */}
                </option>
                ))}
            </Form.Control>
          </Form.Group>

          {/* Input para el salario */}
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
        <Button variant="primary" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditGymModal;
