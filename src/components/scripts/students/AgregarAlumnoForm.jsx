import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { showToast } from '../../toastUtils';
import { getBaseUrl } from '@/Config.js';

const AgregarAlumnoForm = ({ onAlumnoAgregado, sexos, categorias, gimnasios, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ci, setCI] = useState('');
  const [tel, setTel] = useState('');
  const [cuota, setCuota] = useState('');
  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState('');
  const [cat, setCat] = useState('')
  const [gym, setGym] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nuevoAlumno = {
      Nombre: nombre,
      Apellido: apellido,
      CI: ci,
      Tel: tel,
      Cuota: cuota,
      Altura: altura,
      Sexo: sexo,
      Cat: cat,
      Gimnasio: gym
    };

    try {
      const response = await fetch(`${getBaseUrl()}/api/alumnos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoAlumno),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el alumno');
      }

      const savedAlumno = await response.json();
      onAlumnoAgregado(savedAlumno.data);

      setNombre('');
      setApellido('');
      setCI('');
      setTel('');
      setCuota('');
      setAltura('');
      setSexo('');
      setCat('');
      setGym('');

      showToast('success', 'Alumno agregado!');
      onClose(); 
    } catch (error) {
      showToast('error', 'Hugo un error!', error);
      console.error('Error al guardar el alumno:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="add-alumno">
      <div className='row'>
        <div className='col'>
          <Form.Group className="mb-3" controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className='col'>
          <Form.Group className="mb-3" controlId="formApellido">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </Form.Group>
        </div>
      </div>
      <div className='row'>
        <div className='col'>
          <Form.Group className="mb-3" controlId="formCI">
            <Form.Label>CI</Form.Label>
            <Form.Control
              type="text"
              value={ci}
              onChange={(e) => setCI(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className='col'>
          <Form.Group className="mb-3" controlId="formTel">
            <Form.Label>Tel</Form.Label>
            <Form.Control
              type="text"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className='col'>
        <Form.Group className="mb-3" controlId="formCuota">
            <Form.Label>Cuota</Form.Label>
            <Form.Control
              type="text"
              value={cuota}
              onChange={(e) => setCuota(e.target.value)}
            />
          </Form.Group>
            
        </div>
      </div>
      <div className='row'>
        <div className='col-5'>
        <Form.Group className="mb-3" controlId="formSexo">
              <Form.Label>Sexo</Form.Label>
              <Form.Select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {sexos.map((sexo) => (
                  <option key={sexo.IdSexo} value={sexo.IdSexo}>
                    {sexo.Sexo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
        </div>
        <div className='col-7'>
        <Form.Group className="mb-3" controlId="formCategoria">
            <Form.Label>Categoria</Form.Label>
            <Form.Select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {categorias.map((categoria) => (
                <option key={categoria.IdCat} value={categoria.IdCat}>
                  {categoria.Cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className='col-3'>
          <Form.Group className="mb-3" controlId="formAltura">
            <Form.Label>Altura</Form.Label>
            <Form.Control
              type="text"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className='col-9'>
        <Form.Group controlId="formGym">
      <Form.Label>Gimnasio</Form.Label>
      <Form.Select
        value={gym}
        onChange={(e) => setGym(e.target.value)}>
        <option value="">Seleccione...</option>
        {gimnasios.map((gimnasio) => (
          <option key={gimnasio.IdGym} value={gimnasio.IdGym}>
            {gimnasio.GymName}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
        </div>
      </div>
      <div className='row'>
        <div className='col' style={{textAlign:'right'}}>
          <Button variant="warning" type="submit">
            Guardar
          </Button>
        </div>
      </div>
    </Form>
  );
};

const AgregarAlumnoModal = ({ onAlumnoAgregado }) => {
  const [show, setShow] = useState(false);
  const [sexos, setSexos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [gimnasios, setGimnasios] = useState([]);
  const [gym, setGym] = useState('');
  
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  useEffect(() => {
    const fetchSexos = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/sexos`);
        const data = await response.json();
        setSexos(data);
      } catch (error) {
        console.error('Error al obtener los sexos:', error);
      }
    };

    fetchSexos();
  }, []);
  
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/categorias`);
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };
    fetchCategorias();
    
    const fetchGyms = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/gym`);
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
        setGimnasios(data);  // Actualiza el estado con los gimnasios obtenidos
      } catch (error) {
        console.error('Hubo un error al obtener los gimnasios:', error);
      }
    };

    fetchGyms();
  }, []);

  return (
    <>
      <Button variant="btn btn-sm btn-warning" onClick={handleShow}>
        <img src="./assets/add_person.svg" alt="" />
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Alumno</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AgregarAlumnoForm onAlumnoAgregado={onAlumnoAgregado} sexos={sexos} categorias={categorias} gimnasios={gimnasios} onClose={handleClose}/>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AgregarAlumnoModal;
