import React, { useEffect, useState } from 'react';
import { showToast } from '../toastUtils';
import Cuotas from '../CuotasFolder/Cuotas';
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
import AgregarEstadistica from './students/AgregarEstadistica';
import LoadingScreen from '../loadingScreen';
import { getBaseUrl } from '@/Config.js';

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
  const handleShow = () => setShowModal(true);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const [activeTabName, setActiveTabName] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' para ascendente, 'desc' para descendente
  const [categoryFilter, setCategoryFilter] = useState(''); // Filtro por categoría

  const [historialEstadisticas, setHistorialEstadisticas] = useState([]);

  const handleToggle = (index) => {
    setActiveIndex(index);
  };
  
  const handleTabChange = (activeTabIndex) => {
    const tabNames = ['Estadísticas', 'Rutinas', 'Macrociclos', 'Pagos', 'Info'];
    const tabName = tabNames[activeTabIndex];
    setActiveTabName(tabName);
    onTabChange(tabName); 
  };

  const formatNumberWithDots = (number) => {
    if (!number) return '';  // Si el número es null o undefined, retorna un string vacío
    return number.toLocaleString('de-DE');  // Formato alemán que usa puntos como separador de miles
  };
  const fetchAlumnos = async () => {
    return fetch(`${getBaseUrl()}/api/alumnos`)
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
    fetchAlumnos();
  }, []);

  //ELIMINAR ALUMNO
  const handleDeleteClick = async (idAlumno) => {
    // handleClose(); // Si es necesario cerrar un modal o similar
    try {
      const response = await fetch(`${getBaseUrl()}/api/alumnos/${idAlumno}`, {
        method: 'DELETE',
      });
      fetchAlumnos()
      if (!response.ok) {
        throw new Error('Error al eliminar el alumno');
      }
      
      // Actualiza la lista de alumnos
      setAlumnos(prevAlumnos => prevAlumnos.filter(alumno => alumno.idAlumno !== idAlumno));
      
      if (selectedAlumno && selectedAlumno.idAlumno === idAlumno) {
        setSelectedAlumno(null); // Deja de mostrar cuotas
        onAlumnoSeleccionado(null);
      }
    } catch (error) {
      showToast('error', 'Hubo un problema al eliminar el alumno');
    }
  };
  
  const handleAlumnoClick = (alumno) => {
    setSelectedAlumno(alumno);

    fetch(`${getBaseUrl()}/api/cuotas/${alumno.idAlumno}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setCuotas(data.data);
        setShowCuotas(true);

        const nombreCompleto = `${alumno.Nombre} ${alumno.Apellido}`;
        onAlumnoSeleccionado(nombreCompleto); 

      })
      .catch(error => {
        setError(error);
      });

    fetch(`${getBaseUrl()}/api/alumnos/${alumno.idAlumno}/rutinas`)
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

  const fetchHistorialEstadisticas = async (alumnoId) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/historial-estadisticas/${alumnoId}`);
      if (!response.ok) throw new Error("Error al obtener el historial de estadísticas");
      const data = await response.json();
      setHistorialEstadisticas(data.data);
    } catch (error) {
      console.error("Error al obtener el historial de estadísticas:", error);
    }
  };
  useEffect(() => {
    if (selectedAlumno) {
      fetchHistorialEstadisticas(selectedAlumno.idAlumno);
    }
  }, [selectedAlumno]);

  const handleAlumnoAgregado = (nuevoAlumno) => {
    setAlumnos([...alumnos, nuevoAlumno]);
    fetchAlumnos()
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
     fetchHistorialEstadisticas(selectedAlumno.idAlumno);
   };

  const handleRutinaCreada = (nuevaRutina) => {
    setRutinas(prevRutinas => [...prevRutinas, nuevaRutina]);
  };

  const handleRutinaActualizada = () => {
    fetch(`${getBaseUrl()}/api/alumnos/${selectedAlumno.idAlumno}/rutinas`)
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
    fetch(`${getBaseUrl()}/api/rutinas`, {
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
        showToast('success', 'Rutina creada!');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  // Función para manejar la eliminación de una rutina###########################################################
  const handleEliminarRutina = async (idRutina) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/rutinas/${idRutina}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar la rutina');
      }
      // Actualiza la lista de rutinas
      setRutinas(prevRutinas => prevRutinas.filter(rutina => rutina.IdRutina !== idRutina));
      showToast('success', 'Rutina eliminada!');
    } catch (error) {
      console.error('Error al eliminar la rutina:', error);
    }
  };
  

  if (loading) {
    return <div>
      <LoadingScreen/>
    </div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='Alumnos' style={{ flex:'1', paddingTop: '10px', height: '95%', width:'100%' }}>
      {selectedAlumno ? (

  <div style={{ height: '100%', flex: '0 0 75%', display: 'flex', flexDirection: 'column', width:'100%' }}>
  <Tabs
  tabLabels={['Estadísticas', 'Rutinas', 'Macrociclos', 'Pagos', 'Info']}
  tabContents={[
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {historialEstadisticas.length > 0 ?(
      <Sidebar
        labels={[
          <div style={{ display: 'flex', alignItems: 'center' }}>
              <SVGComponent src="./assets/list.svg" color="#000000" />
              <span style={{ marginLeft: '8px' }}>Historial</span>
            </div>,
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SVGComponent src="./assets/show_chart.svg" color="#000000" />
              <span style={{ marginLeft: '8px' }}>Gráficos</span>
            </div>
        ]}
        contents={[
          <HistorialEstadisticas historial={historialEstadisticas} alumnoId={selectedAlumno.idAlumno} key={historialActualizado ? 'actualizado' : 'no-actualizado'} />,
          <Chart alumnoId={selectedAlumno.idAlumno} />
          
        ]}
        activeIndex={activeIndex} 
        onToggle={handleToggle} 
          //Props para agregar estadísticas
        alumnoId={selectedAlumno.idAlumno}
        onEstadisticaAgregada={handleEstadisticaAgregada} 
      />):(
        <div style={{display:'flex', height:'100%', width:'90%'}}>
          <div style={{margin:'auto', fontFamily:'Calibri', textAlign:'center'}}>
            <h3>Aún no existen estadísticas para este alumno</h3>
            <p>Puedes comenzar agregando ahora.</p>
            <AgregarEstadistica alumnoId={selectedAlumno.idAlumno} onEstadisticaAgregada={handleEstadisticaAgregada} />
          </div>
        </div>
      )
      }
    </div> 
,
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {rutinas.length >0 ?(
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding:'5px'}}>
        <Button variant='btn btn-sm btn_warning' style={{ backgroundColor: '#FFC107', border: 'none', cursor: 'pointer' }} onClick={openModal}>
        <SVGComponent src="./assets/note_add.svg" color="#534314"/>
        </Button>
      </div>
      ):('')}
      
      <CrearRutinaModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleCreateRutina} />
       <div style={{ height:'70vh', width:'100%', overflow:'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
       {rutinas.length === 0 ? (
        <div style={{display:'flex', height:'100%', width:'100%'}}>
          <div style={{margin:'auto', fontFamily:'Calibri', textAlign:'center'}}>
            <h3>Aún no hay rutinas para este alumno.</h3>
            <p style={{maxWidth:'25rem', margin:'auto'}}>Puedes comenzar agregando una rutina.</p>
            <Button variant="btn btn-sm btn-warning" onClick={openModal}>
              <SVGComponent src="./assets/note_add.svg" color="#534314"/>
            </Button>
          </div>
        </div>
) : (
  rutinas.map((rutina) => (
    <RutinaCard
    key={rutina.IdRutina}
    rutina={rutina}
    onDiaAgregado={handleRutinaActualizada}
    onEliminarRutina={handleEliminarRutina}
    NombreAlumno={`${selectedAlumno.Nombre} ${selectedAlumno.Apellido}`}
    AlumnoCat={selectedAlumno.Categoria}
    />
  ))
)}

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
    setActiveTabName(tabName);
  }}
/>
  </div>
  ) : (
    <>
      <div style={{ alignItems: 'center' }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center'}}>
            <h5>Lista de Alumnos</h5>
          </div>

          <div style={{display:'flex'}}>
            <div className="input-group-sm">
            <input
              type="text"
              placeholder="Buscar alumno"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom-input"
            />
            </div>
            <div style={{marginLeft:'5px'}}>
              <AgregarAlumnoForm onAlumnoAgregado={handleAlumnoAgregado} />
            </div>
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
          <SVGComponent src="./assets/sort_by_alpha.svg" color=""/>
        </Button>
       </div> 
        
      </div>
      {alumnos.length === 0 ? (
  <div className='NoHaveStudent-Screen'>
    <div style={{display:'flex', alignItems:'center', margin:'auto', flexDirection:'column'}}>
      <h5>No hay alumnos registrados</h5>
      <p style={{width:'60%', textAlign:'center'}}>Aún no se han registrado alumnos en el sistema. Comienza agregando tu primer alumno.</p>
      <div><AgregarAlumnoForm onAlumnoAgregado={handleAlumnoAgregado}/></div>
    </div>
        
  </div>
) : (
  <div className='admin-student'>
  <div className='student'>
    <table style={{width: '95%', borderCollapse:'collapse', color: '#464646', textAlign:'center', margin:'auto'}}>
      <thead>
        <tr>
          <th style={{ padding: '8px',textAlign:'left' }}>Nombre </th>
          <th style={{ padding: '8px',textAlign:'left' }}>Apellido</th>
          <th style={{padding: '8px' }}>CI</th>
          <th style={{padding: '8px' }}>Categoría</th>
          <th>Gimnasio</th>
          
        </tr>
      </thead>
      <tbody>
        {filteredAlumnos.map((alumno) => (
          <tr key={alumno.idAlumno} onClick={() => handleAlumnoClick(alumno)} style={{ cursor: 'pointer', borderBottom: '1px solid #ddd', fontSize:'15px'}}>
            
            <td style={{ padding: '8px', textAlign:'left'}}>{alumno.Nombre}</td>
            <td style={{ padding: '8px', textAlign:'left'}}>{alumno.Apellido}</td>
            <td style={{ padding: '8px'}}>{formatNumberWithDots(alumno.CI)}</td>
            <td>
              <Badge 
                className={alumno.Categoria === 'Presencial' ? 'bg-primary' : 'bg-secondary'} 
                style={{ color: '#fff' }}>
                {alumno.Categoria}
              </Badge>
            </td>
            <td>{alumno.Gym}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
)}
     
    </>
  )}
  
</div>

  );
};

export default Alumnos;
