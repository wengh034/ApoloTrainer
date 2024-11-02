import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Cuotas from '../CuotasFolder/Cuotas';
import BackButton from './backButton';
import Tabs from './tabs/Tabs';
import AgregarAlumnoForm from './students/AgregarAlumnoForm';
import MostrarHistorialPagos from './students/ViewHPago';
import HistorialEstadisticas from './tabs/HistorialEstadistica';
import Chart from './Charts/charts';
import RutinaCard from '../Rutina/RutinaCard';
import Sidebar from './tabs/sidebarOption';
import CrearRutinaModal from '../Rutina/NewRutina';
import { Modal, Button, Badge, Dropdown} from 'react-bootstrap';
import { ReactSVG } from 'react-svg';

const SVGComponent = ({ src, color }) => (
  <ReactSVG
      src={src}
      beforeInjection={(svg) => {
          svg.setAttribute('style', `fill: ${color}`);
      }}
  />
);

const Alumnos = ({onAlumnoEliminado, setIsSubView, onAlumnoSeleccionado}) => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [showCuotas, setShowCuotas] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [historialActualizado, setHistorialActualizado] = useState(false);
  const [rutinas, setRutinas] = useState([]);
  const [activeSidebarIndex, setActiveSidebarIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [toastType, setToastType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const handleShow = () => setShowModal(true);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const [activeTabName, setActiveTabName] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' para ascendente, 'desc' para descendente
  const [categoryFilter, setCategoryFilter] = useState(''); // Filtro por categoría

  const handleToggle = (index) => {
    setActiveIndex(index);
  };

  
  const handleTabChange = (activeTabIndex) => {
    const tabNames = ['Estadísticas', 'Rutinas', 'Macrociclos', 'Pagos', 'Info'];
    const tabName = tabNames[activeTabIndex];
    setActiveTabName(tabName); // Cambia en Alumnos
    onTabChange(tabName); // Informa a App del cambio
  };
  
  const playSound = (sound) => {
    const audio = new Audio(sound);
    audio.play();
  };

  const formatNumberWithDots = (number) => {
    if (!number) return '';  // Si el número es null o undefined, retorna un string vacío
    return number.toLocaleString('de-DE');  // Formato alemán que usa puntos como separador de miles
  };
  const fetchAlumnos = async () => {
    return fetch('http://localhost:5000/api/alumnos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setAlumnos(data.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  };
  useEffect(() => {
    if (toastType) {
      const sound = toastType === 'success' ? './src/assets/sounds/Pop-1.m4a' : './src/assets/sounds/Pop-1.m4a';
      playSound(sound);
      setToastType(null);
    }
  
    fetchAlumnos();
  }, [toastType]);
//################
  // const handleEditClick = () => {
  //   setIsEditing(!isEditing);
  // };
  // const handleEditClick = async () => {
  //   setIsEditing(!isEditing);
  //   setShowModal(true);  // Abre el modal
  //   fetchAlumnos();  // Llama a la API para buscar los alumnos
  // };
  //ELIMINAR ALUMNO
  const handleDeleteClick = async (idAlumno) => {
    // handleClose(); // Si es necesario cerrar un modal o similar
    try {
      const response = await fetch(`http://localhost:5000/api/alumnos/${idAlumno}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el alumno');
      }
      
      // Actualiza la lista de alumnos
      setAlumnos(prevAlumnos => prevAlumnos.filter(alumno => alumno.idAlumno !== idAlumno));
      // onAlumnoEliminado(idAlumno); // Si necesitas notificar a un padre
      if (selectedAlumno && selectedAlumno.idAlumno === idAlumno) {
        setSelectedAlumno(null); // Deja de mostrar cuotas
      }
    } catch (error) {
      console.error('Error al eliminar el alumno:', error);
      toast.error('Hubo un problema al eliminar el alumno');
    }
  };
  

  const handleAlumnoClick = (alumno) => {
    setSelectedAlumno(alumno);

    fetch(`http://localhost:5000/api/cuotas/${alumno.idAlumno}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setCuotas(data.data);
        setShowCuotas(true);
        //############################
        setSelectedAlumno(alumno);
        const nombreCompleto = `${alumno.Nombre} ${alumno.Apellido}`;
        onAlumnoSeleccionado(nombreCompleto);
        //############################
      })
      .catch(error => {
        setError(error);
      });

    fetch(`http://localhost:5000/api/alumnos/${alumno.idAlumno}/rutinas`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setRutinas(data.data);
      })
      .catch(error => {
        setError(error);
      });
      
  };

  // const handleBack = () => {
  //   setShowCuotas(false);
  //   setSelectedAlumno(null);
  //   setCuotas([]);
  //   setRutinas([]);
  // };

  const handleAlumnoAgregado = (nuevoAlumno) => {
    setAlumnos([...alumnos, nuevoAlumno]);
    // console.log(nuevoAlumno);
  };


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const isNumeric = (str) => {
    return /^\d+$/.test(str);
  };

  const filteredAlumnos = alumnos
  .filter(alumno => {
    // Filtrado por categoría
    if (categoryFilter && alumno.Categoria !== categoryFilter) {
      return false;
    }
    if (isNumeric(searchTerm)) {
      return alumno.CI && alumno.CI.toString().includes(searchTerm);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        (alumno.Apellido && alumno.Apellido.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (alumno.Nombre && alumno.Nombre.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
  })
.sort((a, b) => {
  const nameA = a.Nombre.toLowerCase();
  const nameB = b.Nombre.toLowerCase();

  if (sortOrder === 'asc') {
    return nameA.localeCompare(nameB);
  } else {
    return nameB.localeCompare(nameA);
  }
});

const toggleSortOrder = () => {
  const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  setSortOrder(newOrder);
};
  const handleStatusChange = (updatedAlumno) => {
    setSelectedAlumno(updatedAlumno);
    setAlumnos(prevAlumnos =>
      prevAlumnos.map(alumno =>
        alumno.idAlumno === updatedAlumno.idAlumno ? updatedAlumno : alumno
      )
    );
  };
  const handleUpdateAlumno = (updatedAlumno) => {
    setSelectedAlumno(updatedAlumno);
    setAlumnos(prevAlumnos =>
      prevAlumnos.map(alumno =>
        alumno.idAlumno === updatedAlumno.idAlumno ? updatedAlumno : alumno
      )
    );
  };

   const handleEstadisticaAgregada = () => {
     setHistorialActualizado(prev => !prev);
   };

  const handleRutinaCreada = (nuevaRutina) => {
    setRutinas(prevRutinas => [...prevRutinas, nuevaRutina]);
  };

  const handleRutinaActualizada = () => {
    fetch(`http://localhost:5000/api/alumnos/${selectedAlumno.idAlumno}/rutinas`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setRutinas(data.data);
      })
      .catch(error => {
        console.error('Error al actualizar las rutinas:', error);
      });
  };

  // Función para abrir el modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Función para manejar la creación de rutina###########################################################
  const handleCreateRutina = (nombreRutina) => {
    fetch('http://localhost:5000/api/rutinas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Alumno: selectedAlumno.idAlumno,
        NombreRutina: nombreRutina
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al crear la rutina');
        }
        return response.json();
        
      })
      .then(data => {
        handleRutinaCreada(data);
        closeModal();
        toast.success('Rutina creada!');
      
         setToastType('success');
        //       handleClose(true);
      })
      .catch(error => {
        console.error('Error:', error);
        toast.error('Hubo un problema!');
      
        setToastType('error');
      });
  };
  // Función para manejar la eliminación de una rutina###########################################################
  const handleEliminarRutina = async (idRutina) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rutinas/${idRutina}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar la rutina');
      }
      // Actualiza la lista de rutinas
      setRutinas(prevRutinas => prevRutinas.filter(rutina => rutina.IdRutina !== idRutina));
      toast.success('Rutina Eliminada!');
      setToastType('success');
    } catch (error) {
      console.error('Error al eliminar la rutina:', error);
      toast.error('Hubo un problema al eliminar la rutina');
      setToastType('error');
    }
  };
  

  if (loading) {
    return <div style={{display:'', margin:'auto'}}>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='Alumnos' style={{ flex:'1', paddingTop: '10px', height: '95%', width:'100%' }}>
      <Toaster position='top-right'/>
      {selectedAlumno ? (

  <div style={{ height: '100%', flex: '0 0 75%', display: 'flex', flexDirection: 'column', width:'100%' }}>
  <Tabs
  tabLabels={['Estadísticas', 'Rutinas', 'Macrociclos', 'Pagos', 'Info']}
  tabContents={[
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Sidebar
        labels={[
          <div style={{ display: 'flex', alignItems: 'center' }}>
              <SVGComponent src="./src/assets/list.svg" color="#000000" />
              <span style={{ marginLeft: '8px' }}>Historial</span>
            </div>,
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SVGComponent src="./src/assets/show_chart.svg" color="#000000" />
              <span style={{ marginLeft: '8px' }}>Gráficos</span>
            </div>
        ]}
        contents={[
          <HistorialEstadisticas alumnoId={selectedAlumno.idAlumno} key={historialActualizado ? 'actualizado' : 'no-actualizado'} />,
          <Chart alumnoId={selectedAlumno.idAlumno} />
          
        ]}
        activeIndex={activeIndex} 
        onToggle={handleToggle} 
          //Props para agregar estadísticas
        alumnoId={selectedAlumno.idAlumno}
        onEstadisticaAgregada={handleEstadisticaAgregada} 
      />
    </div> 
,
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
        <Button variant='btn btn-sm btn_warning' style={{ backgroundColor: '#FFC107', border: 'none', cursor: 'pointer' }} onClick={openModal}>
        <SVGComponent src="./src/assets/library_add.svg" color="#534314"/>
        </Button>
      </div>
      <CrearRutinaModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleCreateRutina} />
       <div style={{ height:'70vh', width:'100%', overflow:'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
        {rutinas.map(rutina => (
          <RutinaCard
            key={rutina.IdRutina}
            rutina={rutina}
            onDiaAgregado={handleRutinaActualizada}
            onEliminarRutina={handleEliminarRutina}
            NombreAlumno={`${selectedAlumno.Nombre} ${selectedAlumno.Apellido}`} 
          />
        ))}
      </div>
    </div>,
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Coming Soon</div>,
    <div style={{ height: '100%', overflow: 'auto', marginTop:'1em' }}>
      <MostrarHistorialPagos alumnoId={selectedAlumno.idAlumno} />
    </div>,
    <Cuotas selectedAlumno={selectedAlumno} cuotas={cuotas} onStatusChange={handleStatusChange} onUpdateAlumno={handleUpdateAlumno} handleDeleteClick={handleDeleteClick} />
  ]}
  onTabChange={(activeTabIndex) => {
    const tabName = ['Estadísticas', 'Rutinas', 'Macrociclos', 'Pagos', 'Info'][activeTabIndex];
    setActiveTabName(tabName);  // Actualizamos el nombre del tab activo
    // console.log('Pestaña activa:', tabName);   Solo para depuración
  }}
/>

  </div>

  ) : (
    <>

      <div style={{ alignItems: 'center' }}>
        <div className='row' style={{alignItems:'center'}}>
          <div className='col-8' style={{display:'flex', alignItems:'center'}}>
            <h5>Lista de Alumnos</h5>
            {/* <span style={{ padding: '8px' }}>
                <Button variant="primary" onClick={handleEditClick}
                  style={{
                    background:'none',
                    border:'none',
                  }}
                  >
                    <SVGComponent src="./src/assets/edit.svg" color="#ffc107"/>
                </Button>
            </span> */}
            </div>
          <div className='col-3'>
            <div className="input-group-sm">
            <input
              type="text"
              placeholder="Buscar alumno"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom-input"
            />
            </div>
          </div>
          <div className='col-1' style={{textAlign:'right',}}>
          <AgregarAlumnoForm onAlumnoAgregado={handleAlumnoAgregado} />
          </div>
        </div>

        <div style={{display:'flex',width:'100%', alignItems:'center', justifyContent:'flex-end'}}>
                <Dropdown>
          <Dropdown.Toggle variant="warning" size="sm" id="dropdown-basic" style={{ fontWeight: 'bold' }}>
            {categoryFilter || 'All'}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setCategoryFilter('') } style={{ fontWeight: 'bold' }}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => setCategoryFilter('Presencial')} style={{ fontWeight: 'bold' }}>
            
              {' '}Presencial
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setCategoryFilter('Virtual')} style={{ fontWeight: 'bold' }}>
             
              {' '}Virtual
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Button onClick={toggleSortOrder} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
          <SVGComponent src="./src/assets/sort_by_alpha.svg" color=""/>
        </Button>
       </div> 
        
      </div>
      <div className='admin-student'>
        <div className='student'>
          <table style={{width: '95%', borderCollapse:'collapse', color: '#464646', textAlign:'center', margin:'auto'}}>
            <thead>
              <tr>
                <th style={{ padding: '8px',textAlign:'left' }}>Nombre </th>
                <th style={{ padding: '8px',textAlign:'left' }}>Apellido</th>
                <th style={{padding: '8px' }}>CI</th>
                <th style={{padding: '8px' }}>Categoría</th>
                
              </tr>
            </thead>
            <tbody>
              {filteredAlumnos.map((alumno) => (
                <tr key={alumno.idAlumno} onClick={() => handleAlumnoClick(alumno)} style={{ cursor: 'pointer', borderBottom: '1px solid #ddd', fontSize:'15px'}}>
                  
                  <td style={{ padding: '8px', textAlign:'left'}}>{alumno.Nombre}</td>
                  <td style={{ padding: '8px', textAlign:'left'}}>{alumno.Apellido}</td>
                  <td style={{ padding: '8px'}}>{formatNumberWithDots(alumno.CI)}</td>
                  {/* <td className='custom-badge' style={{ padding: '8px'}}>{alumno.Categoria}</td> */}
                  <td>
              <Badge 
                className={alumno.Categoria === 'Presencial' ? 'bg-primary' : 'bg-secondary'} 
                style={{ color: '#fff' }}
              >
                {alumno.Categoria}
              </Badge>
            </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}
  
</div>

  );
};

export default Alumnos;
