import React, { useState, useEffect } from 'react';
import EditGymModal from './EditGymModal'; // Asegúrate de importar el modal
import { Button, Modal } from 'react-bootstrap';
import CreateGymModal from './CreateGymModal';
import { showToast } from '../../toastUtils';
import SVGComponent from '../../SVGComponent';
import { getBaseUrl } from '@/Config.js';

const GymManager = () => {
  const [gyms, setGyms] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [gymToDelete, setGymToDelete] = useState(null);

  const formatNumberWithDots = (number) => {
    if (!number) return '';
    return number.toLocaleString('de-DE');
  };

  const handleOpenDeleteModal = (id) => {
    setGymToDelete(id);
    setShowModalDelete(true);
  };

  const handleCloseDeleteModal = () => {
    setGymToDelete(null);
    setShowModalDelete(false);
  };

  // Función para obtener todos los gyms
  const fetchGyms = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/gyms`);
      const data = await response.json();
      setGyms(data);
    } catch (error) {
      console.error('Error fetching gyms');
    }
  };

  // Función para obtener los job types
  const fetchJobTypes = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/jobtypes`);
      const data = await response.json();
      setJobTypes(data);
    } catch (error) {
      console.error('Error fetching job types');
    }
  };

  // Cargar los datos al montar el componente
  useEffect(() => {
    fetchGyms();
    fetchJobTypes();
  }, []);

  // Función para manejar la edición de un gimnasio
  const handleEditGym = (gym) => {
    setSelectedGym(gym); // Pasar el gimnasio seleccionado al estado
    setShowEditModal(true); // Mostrar el modal
  };

  const handleCreateGym = async (newGym) => {
    try {
      const response = await fetch(`${getBaseUrl()}/gyms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGym),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating gym:', error);
        showToast('error', `${error.error}`);
        return;
      }
  
      const result = await response.json();
      showToast('success', 'Agregado!');
      fetchGyms(); 
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating gym:', error);
    }
  };
  

  // Función para guardar cambios desde el modal
  const handleSaveChanges = async (updatedGym) => {
    try {
      const response = await fetch(`${getBaseUrl()}/gyms/${updatedGym.IdGym}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          GymName: updatedGym.GymName, 
          JobType: updatedGym.JobType,
          Salary: updatedGym.Salary,
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Error saving gym changes:', error);
        return;
      }
      showToast('success', 'Cambios realizados!');
      fetchGyms();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving gym changes:', error);
    }
  };  

 const handleDelete = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/gyms/${gymToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGyms((prevGyms) => prevGyms.filter((gym) => gym.IdGym !== gymToDelete));
        showToast('success', 'Eliminada!');
        fetchGyms();
      } else {
        const error = await response.json();
        alert(`Error eliminando gimnasio: ${error.error}`);
        toast.error(`${error.error}`);
        setToastType('err');
      }
    } catch (error) {
      console.error('Error eliminando gimnasio:', error);
      showToast('error', 'Error eliminando gimnasio');
    } finally {
      handleCloseDeleteModal();
    }
  };

  return (
    <div>
      <div style={{display:'flex', alignItems:'center'}}>
        <h5>Tus Gimnasios</h5> 
        <Button
          variant="btn btn-sm btn-outline-light"
          onClick={() => setShowCreateModal(true)}
          style={{border:'none'}}
        >
           <SVGComponent src="./assets/add.svg" color="#ffc107" />
        </Button>
      </div>
      <CreateGymModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        jobTypes={jobTypes}
        onCreate={handleCreateGym}/>
      <div style={{height:'75vh', overflowY:'auto', marginTop:'10px'}}>
        {gyms.length > 0 ? (
          <div className="GymManager-table">
            <div>
            {gyms.map((gym) =>
              gym.IdGym === 1 ? (
                // Tarjeta especial para el gimnasio predeterminado
                <div
                  key={gym.IdGym}
                  style={{
                    width: '80%',
                    backgroundColor: '#e9ecef',
                    borderRadius: '5px',
                    margin: '5px 0',
                    padding: '0 0 15px 10px',
                    color: '#53575b'
                  }}
                >
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        display:'flex',
                        fontSize: '12px',
                        color: '#666',
                        backgroundColor: '#e9e9e9',
                        margin:'5px 50px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        alignItems:'center'
                      }}
                    >
                      {gym.StudentCount} <div style={{margin:'0 3px'}}><SVGComponent src="./assets/group.svg" color="#666" width="15px" height="16px"/></div> | {gym.JobType}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start'}}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <h5 style={{ margin: '0' }}>{gym.GymName}</h5>
                    </div>
                  </div>
                </div>
              ) : (
                // Tarjeta regular para los demás gimnasios
                <div
                  key={gym.IdGym}
                  style={{
                    width: '80%',
                    backgroundColor: '#fffffe',
                    borderRadius: '5px',
                    margin: '5px 0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      style={{ border: 'none', background: 'none' }}
                      onClick={() => handleOpenDeleteModal(gym.IdGym)}
                    >
                      <SVGComponent src="./assets/close.svg" color="#1f2937" />
                    </Button>
                  </div>
                  <div style={{ padding: '0 0 15px 10px' }}>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                      <span
                        style={{
                          display:'flex',
                          fontSize: '12px',
                          color: '#666',
                          backgroundColor: '#e9e9e9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginRight: '50px',
                          alignItems:'center'
                        }}
                      >
                        {gym.StudentCount}
                        <div style={{margin:'0 3px'}}>
                          <SVGComponent src="./assets/group.svg" color="#666" width="15px" height="16px"/>
                        </div>
                        {gym.JobType === 'Externo' 
                          ? `| ${gym.JobType}` 
                          : `| ${formatNumberWithDots(gym.Salary)} Gs.| ${gym.JobType}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', color: '#1f2937' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h5 style={{ margin: '0' }}>{gym.GymName}</h5>
                        <Button
                          variant="btn btn-sm btn-outline-Light-primary"
                          onClick={() => handleEditGym(gym)}
                        >
                          <SVGComponent src="./assets/edit.svg" color="#1f2937" width="20px" height="20px" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            </div>
            <Modal show={showModalDelete} onHide={handleCloseDeleteModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Confirmar eliminación</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h5 >¿Está seguro de que desea eliminar este gimnasio?</h5>
                <div style={{margin:'auto'}}>Esta acción no se puede deshacer. Todos los alumnos relacionados pasarán a ser parte del tipo predeterminado (Independiente).</div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="btn btn-sm btn-secondary" onClick={handleCloseDeleteModal}>
                  Cancelar
                </Button>
                <Button variant="btn btn-sm btn-danger" onClick={handleDelete}>
                  Eliminar
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        ) : (
          <p>No hay Gimnasios aún</p>
        )}
      </div>

      {/* Modal de edición */}
      {selectedGym && (
        <EditGymModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          gym={selectedGym}
          jobTypes={jobTypes}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );


};

export default GymManager;
