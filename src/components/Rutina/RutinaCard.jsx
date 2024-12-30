import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import RutinaDetail from '../Reports/RoutineReport';
import 'bootstrap/dist/css/bootstrap.min.css';
import { showToast } from '../toastUtils';
import SVGComponent from '../SVGComponent';
import { getBaseUrl } from '@/Config.js';

const RutinaCard = ({ rutina, onEliminarRutina, NombreAlumno, onClick}) => {
  const [dias, setDias] = useState([]);
  const [showAgregarDiaModal, setShowAgregarDiaModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDiaId, setSelectedDiaId] = useState(null);
  const [newEjercicio, setNewEjercicio] = useState({
    ejercicio: '',
    peso: '',
    serie: '',
    repe: '',
    comentario: ''
  });
  const [formDiaId, setFormDiaId] = useState(null);
  const [ejercicios, setEjercicios] = useState({});
  const [editDiaId, setEditDiaId] = useState(null);
  const [editEjercicio, setEditEjercicio] = useState([]);
  const [showConfirmDeleteDia, setShowConfirmDeleteDia] = useState(false);
  const [showConfirmDeleteRutina, setShowConfirmDeleteRutina] = useState(false);
  const [diaToDelete, setDiaToDelete] = useState(null);
  const [rutinaToDelete, setRutinaToDelete] = useState(null);
  const [ejerciciosAEliminar, setEjerciciosAEliminar] = useState([]);
  const { IdRutina } = rutina;
  
  const fetchDias = () => {
    fetch(`${getBaseUrl()}/api/rutinas/${rutina.IdRutina}/dias`)
        .then(response => response.json())
        .then(data => setDias(data.data))
        .catch(error => console.error('Error al obtener los días:', error));
};
    // Obtener los días al montar el componente
    useEffect(() => {
      fetchDias(); // Llamar a fetchDias
  }, [rutina.IdRutina]);

   const fetchEjercicios = () =>{
    dias.forEach(dia => {
      fetch(`${getBaseUrl()}/api/dias/${dia.IdDia}/ejercicios`)
        .then(response => response.json())
        .then(data => {
          setEjercicios(prevEjercicios => ({
            ...prevEjercicios,
            [dia.IdDia]: data.data
          }));
        })
        .catch(error => console.error('Error al obtener los ejercicios:', error));
    });
  }
  useEffect(() => {
    if (dias.length > 0) {
      fetchEjercicios();
    }
  }, [dias]);


  const handleAgregarDia = () => {
    fetch(`${getBaseUrl()}/api/rutinas/${rutina.IdRutina}/dias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta al agregar el día');
        }
        return response.json();
      })
      .then(data => {
        fetchDias();
        setShowAgregarDiaModal(false);
      })
      .catch(error => console.error('Error al agregar el día:', error));
  };
  
  const handleAgregarEjercicioClick = diaId => {
    setFormDiaId(diaId);
  };

  const handleInputChange = event => {
    const { name, value } = event.target;
    setNewEjercicio(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleGuardarEjercicio = () => {
    fetch(`${getBaseUrl()}/api/dias/${formDiaId}/ejercicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEjercicio),
    })
      .then(response => response.json())
      .then(data => {
        setEjercicios(prevEjercicios => ({
          ...prevEjercicios,
          [formDiaId]: [...(prevEjercicios[formDiaId] || []), data]
        }));
        setFormDiaId(null);
        setNewEjercicio({ ejercicio: '', peso: '', serie: '', repe: '', comentario: '' });
      })
      .catch(error => console.error('Error al agregar el ejercicio:', error));
  };

  const handleCancelar = () => {
    setFormDiaId(null);
    setNewEjercicio({ ejercicio: '', peso: '', serie: '', repe: '', comentario: '' });
  };

  const handleEditClick = async (diaId) => {
    try {
        const response = await fetch(`${getBaseUrl()}/api/dias/${diaId}/ejercicios`);
        const data = await response.json();
        setEditDiaId(diaId);
        setEditEjercicio(data.data); // Asigna los ejercicios al estado para edición
        setShowEditModal(true); // Muestra el modal de edición
    } catch (error) {
        console.error('Error al obtener los ejercicios para editar:', error);
    }
};

  const handleEditInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedEjercicio = [...editEjercicio];
    updatedEjercicio[index][name] = value;
    setEditEjercicio(updatedEjercicio);
  };

const handleGuardarEditEjercicio = async () => {
  try {
    // Procesa las actualizaciones de ejercicios
    const updatePromises = editEjercicio.map(ejercicio =>
      fetch(`${getBaseUrl()}/api/ejercicios/${ejercicio.IdEjercicio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ejercicio),
      })
    );

    // Procesa los ejercicios eliminados
    const deletePromises = ejerciciosAEliminar.map(idEjercicio =>
      fetch(`${getBaseUrl()}/api/ejercicios/${idEjercicio}`, {
        method: 'DELETE',
      })
    );

    // Ejecuta todas las promesas en paralelo
    await Promise.all([...updatePromises, ...deletePromises]);

    // Actualiza el estado con los cambios y cierra el modal
    setEjercicios(prevEjercicios => ({
      ...prevEjercicios,
      [editDiaId]: editEjercicio
    }));
    setEjerciciosAEliminar([]); // Limpia los ejercicios eliminados
    handleCloseEditModal();
    showToast('success', 'Cambios realizados!');
  } catch (error) {
    console.error('Error al guardar los ejercicios editados:', error);
    showToast('success', 'Error al guardar los ejercicios editados:', error);
  }
};

const handleCloseEditModal = () => {
  setShowEditModal(false);
  setEditDiaId(null);
  setEditEjercicio([]);
  setEjerciciosAEliminar([]); // Limpia la lista de ejercicios a eliminar
};

  const handleEliminarDia = (diaId) => {
    fetch(`${getBaseUrl()}/api/dias/${diaId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al eliminar el día');
      }
      setDias(prevDias => prevDias.filter(dia => dia.IdDia !== diaId));
    })
    .catch(error => console.error('Error:', error));
  };

  const handleDeleteClick = (idRutina) => {
    onEliminarRutina(idRutina);
  };

  const handleConfirmDeleteDia = (diaId) => {
    setDiaToDelete(diaId);
    setShowConfirmDeleteDia(true);
  };
  
  const handleConfirmDeleteRutina = (idRutina) => {
    setRutinaToDelete(idRutina);
    setShowConfirmDeleteRutina(true);
  };

  const confirmEliminarDia = () => {
    if (diaToDelete) {
      handleEliminarDia(diaToDelete);
    }
    setShowConfirmDeleteDia(false);
    setDiaToDelete(null);
  };

  const confirmEliminarRutina = () => {
    if (rutinaToDelete) {
      handleDeleteClick(rutinaToDelete);
    }
    setShowConfirmDeleteRutina(false);
    setRutinaToDelete(null);
  };

  const handleRemoveEjercicio = (idEjercicio, index) => {
    // Agrega el ejercicio al estado de ejercicios a eliminar
    setEjerciciosAEliminar(prev => [...prev, idEjercicio]);
  
    // Actualiza la UI removiendo el ejercicio temporalmente
    const updatedEjercicios = [...editEjercicio];
    updatedEjercicios.splice(index, 1);
    setEditEjercicio(updatedEjercicios);
  };
  
  return (
    <div className='marcador 3' style={{ margin:'auto', paddingTop:'30px'}}>
    <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{margin: '10px' }}>
            <h4>{rutina.NombreRutina}</h4>
        </div>
          <div style={{display:'flex'}}>
              <Button variant="btn btn-sm btn-warning" 
              onClick={() => setShowAgregarDiaModal(true)}
              style={{ marginRight:'10px'}}>

              <img className='svg-icon small' src="./assets/add.svg" alt="+Día" />
              <strong style={{color:'#464646'}}>Día</strong>
            </Button>
            <RutinaDetail IdRutina={IdRutina} NombreRutina={rutina.NombreRutina} Alumno={NombreAlumno}/>
            <Button variant="btn btn-sm btn-outline-secondary" 
              onClick={() => handleConfirmDeleteRutina(rutina.IdRutina)}
              style={{ marginLeft:'10px'}}>
                <SVGComponent src="./assets/close.svg" color="#c3c5c9"/>
            </Button>
          </div>
      </div>
      <ul>
        {dias.map(dia => (
          <li key={dia.IdDia} style={{ marginBottom: '20px' }}>
            <div className='card'>
              <div className='card-header'>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <div style={{display:'flex', alignItems:'center'}}>
                      <h5 style={{margin:'0 0.5em 0 1em'}}>Día {dia.NumDia}</h5>
                      <Button variant="btn btn-sm btn-warning custom-svg-btn" 
                        onClick={() => handleEditClick(dia.IdDia)} style={{border:'none', background:'none' }}>
                        <SVGComponent src="./assets/edit.svg" color="#ffc107"/>
                      </Button>  
                    </div>
                    <div style={{display:'flex'}}>
                      <Button className="btn btn-sm btn-warning custom-svg-btn" 
                        onClick={() => handleAgregarEjercicioClick(dia.IdDia)} style={{ height: '28px', width: '40px', marginRight:'10px' }}>
                        <img className='svg-icon small' src="./assets/add.svg" alt="add" />
                        <img className='' src="./assets/exercise.svg" alt="exercise" />
                      </Button>

                      <Button  variant="btn btn-sm btn-outline-danger" onClick={() => handleConfirmDeleteDia(dia.IdDia)}
                        style={{
                          border:'none', background:'none'
                        }}>
                          <SVGComponent src="./assets/close.svg" color="#111827"/>
                      </Button>
                    </div>
                </div>
              </div>
              <div className='card-body'>
                {ejercicios[dia.IdDia] && (
                  <table style={{ width: '90%', fontSize: '11pt', borderCollapse: 'collapse', margin:'auto'}}>
                    <thead>
                      <tr className='row'>
                        <th className='col-3' style={{ textAlign: 'left', padding: '8px' }}>Ejercicio</th>
                        <th className='col-2'style={{ textAlign: 'left', padding: '8px' }}>Peso</th>
                        <th className='col-1'style={{ textAlign: 'left', padding: '8px' }}>Serie</th>
                        <th className='col-2'style={{ textAlign: 'left', padding: '8px' }}>Repeticiones</th>
                        <th className='col-4'style={{ textAlign: 'left', padding: '8px' }}>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ejercicios[dia.IdDia].map(ejercicio => (
                        <tr key={ejercicio.IdEjercicio} className='row' style={{ borderBottom: '1px solid #ddd', fontSize: '11pt' }}>
                          <td className='col-3'style={{ padding: '8px' }}>{ejercicio.Ejercicio}</td>
                          <td className='col-2'style={{ padding: '8px' }}>{ejercicio.Peso}</td>
                          <td className='col-1'style={{ padding: '8px' }}>{ejercicio.Serie}</td>
                          <td className='col-2'style={{ padding: '8px' }}>{ejercicio.Repe}</td>
                          <td className='col-4'style={{ padding: '8px' }}>{ejercicio.Comentario}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <Modal show={showConfirmDeleteDia} onHide={() => setShowConfirmDeleteDia(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  ¿Estás seguro de que deseas eliminar este día?
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowConfirmDeleteDia(false)}>
                    Cancelar
                  </Button>
                  <Button variant="danger" onClick={confirmEliminarDia}>
                    Eliminar
                  </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={formDiaId === dia.IdDia} onHide={handleCancelar} >
              <Modal.Header closeButton>
                <Modal.Title>Agregar Ejercicio</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <div className='row'>
                    <div className='col'>
                  <Form.Group>
                    <Form.Label>Ejercicio</Form.Label>
                    <Form.Control
                      type="text"
                      name="ejercicio"
                      placeholder="Ejercicio"
                      value={newEjercicio.ejercicio}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                    </div>
                    <div className='col'>
                    <Form.Group>
                    <Form.Label>Peso</Form.Label>
                    <Form.Control
                        type="text"
                        name="peso"
                        placeholder="Peso"
                        value={newEjercicio.peso}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    </div>
                    <div className='col'>
                    <Form.Group>
                      <Form.Label>Serie</Form.Label>
                      <Form.Control
                        type="text"
                        name="serie"
                        placeholder="Serie"
                        value={newEjercicio.serie}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    </div>
                    <div className='col'>
                    <Form.Group>
                      <Form.Label>Repeticiones</Form.Label>
                      <Form.Control
                        type="text"
                        name="repe"
                        placeholder="Repeticiones"
                        value={newEjercicio.repe}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col'>
                    <Form.Group>
                      <Form.Label>Comentario</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="comentario"
                        placeholder="Comentario"
                        value={newEjercicio.comentario}
                        onChange={handleInputChange}
                        style={{
                          resize: 'none'
                        }}
                      />
                    </Form.Group>
                    </div>
                  </div>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="btn btn-sm btn-warning" onClick={handleGuardarEjercicio}>
                    Guardar
                  </Button>
                </Modal.Footer>
              </Modal>
            </li>
        ))}
        </ul>
      </div>
        <Modal show={showConfirmDeleteRutina} onHide={() => setShowConfirmDeleteRutina(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas eliminar esta rutina?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmDeleteRutina(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmEliminarRutina}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
        <Modal show={showAgregarDiaModal} onHide={() => setShowAgregarDiaModal(false)} centered size='sm'>
        <Modal.Header>
          <Modal.Title>Agregar Día</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Deseas agregar un nuevo día?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="btn btn-sm btn-warning" onClick={handleAgregarDia}>Aceptar</Button>
          <Button variant="btn btn-sm btn-outline-warning" onClick={() => setShowAgregarDiaModal(false)}>Cancelar</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title style={{fontFamily:'Calibri'}}>Modo Edición</Modal.Title>
        </Modal.Header>
        <Modal.Body className='custom-modal-body' style={{ maxHeight: '70vh', backgroundColor:'#f5f6f8' }}>
          {editEjercicio.map((ejercicio, index) => (
            <Form key={ejercicio.IdEjercicio} style={{ padding: '10px' }}>

              <div className='card onlyShadowCard'>
              <div style={{display:'flex', justifyContent:'flex-end'}}>
                  <Button variant='btn primary'
                    onClick={() => handleRemoveEjercicio(ejercicio.IdEjercicio, index)}
                    style={{
                      background:'none',
                      border:'none',
                      padding:'5px 7px 0 0'
                    }}>
                    <SVGComponent src="./assets/close.svg" color="#909090" />
                  </Button>
                </div>
                <div style={{display:'flex', padding:'0 1em 1m 1em', justifyContent:'space-around'}}>
                  <div style={{marginRight:'15px'}}>
                    <Form.Group>
                    <label for="exercise" style={{fontWeight:'700'}}>Ejercicio</label>
                      <Form.Control
                        id="exercise"
                        type="text"
                        name="Ejercicio"
                        style={{
                          width:'19em'
                        }}
                        value={ejercicio.Ejercicio}
                        onChange={event => handleEditInputChange(index, event)}
                      />
                    </Form.Group>
                  </div>
                  <div style={{marginRight:'15px'}}>
                    <Form.Group>
                    <label for="weight" style={{fontWeight:'700'}}>Peso</label>
                      <Form.Control
                        id="weight"
                        type="text"
                        name="Peso"
                        style={{
                          width:'7em'
                        }}
                        value={ejercicio.Peso}
                        onChange={event => handleEditInputChange(index, event)}
                      />
                   </Form.Group>
                  </div>
                  <div style={{marginRight:'15px'}}>
                    <Form.Group>
                    <label for="series" style={{fontWeight:'700'}}>Series</label>
                      <Form.Control
                        id="series"
                        type="text"
                        name="Serie"
                        style={{
                          width:'3em'
                        }}
                        value={ejercicio.Serie}
                        onChange={event => handleEditInputChange(index, event)}
                      />
                    </Form.Group>
                  </div>
                  <div style={{marginRight:'15px'}}>
                    <Form.Group>
                    <label for="repeat" style={{fontWeight:'700'}}>Repeticiones</label>
                      <Form.Control
                        id="repeat"
                        type="text"
                        name="Repe"
                        style={{
                          width:'5em'
                        }}
                        value={ejercicio.Repe}
                        onChange={event => handleEditInputChange(index, event)}
                      />
                    </Form.Group>
                  </div>
                </div>
                <div style={{padding:'0.5em 2em 1em 1em'}}>
                    <Form.Group>
                    <label for="comments" style={{fontWeight:'700'}}>Comentarios</label>
                    <Form.Control
                      id="comments"
                      as="textarea"
                      name="Comentario"
                      style={{
                        // width: '15em',
                        height: '5em',
                        resize: 'none'
                      }}
                      value={ejercicio.Comentario}
                      onChange={event => handleEditInputChange(index, event)}
                    />
                  </Form.Group>
                </div>
              </div>
            </Form>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <div className='row'>
            <div className='col'>
              <Button type='button' className="btn btn-warning" onClick={handleGuardarEditEjercicio}>Guardar</Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RutinaCard;