import React, { useState, useEffect } from 'react';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { showToast } from '../toastUtils';
import SVGComponent from '../SVGComponent';
import { getBaseUrl } from '@/Config.js';

const PendingPayments = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); 

  
  const formatNumberWithDots = (number) => {
    if (!number) return '';  // Si el número es null o undefined, retorna un string vacío
    return number.toLocaleString('de-DE');  // Formato alemán que usa puntos como separador de miles
  };

  // Función para determinar la descripción del estado
  const StatusDesc = (status) => status === 5 ? 'Resuelto' : status === 6 ? 'Resolver' : 'Desconocido';

  // Fetch de los pagos pendientes
  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/pending-payments`);
        const data = await response.json();

        if (response.ok) {
          setPendingPayments(data.data);  // Asignamos los datos a nuestro estado
        } else {
          console.error('Error fetching pending payments:', data.message);
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
      }
    };

    fetchPendingPayments();
  }, []);

  // Función para abrir el modal con el pago seleccionado
  const handleResolveClick = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  // Función para confirmar la resolución
  const handleConfirmResolve = async () => {
    if (selectedPayment) {
      try {
        const response = await fetch(`${getBaseUrl()}/api/pending-payments/${selectedPayment.IdPendPayment}/resolve`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (response.ok) {
          const currentDate = new Date().toISOString().split('T')[0]; 
  
          // Actualizar el estado localmente
          setPendingPayments(prevPayments =>
            prevPayments.map(payment =>
              payment.IdPendPayment === selectedPayment.IdPendPayment
                ? { ...payment, IdStates: 5, ResolveDate: currentDate }
                : payment
            )
          );
          showToast('success', 'Pago realizado!');
        } else {
          console.error('Error resolving payment');
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
      }
    }
    setShowModal(false);
  };
  

  // Función para filtrar los pagos pendientes + orden alfabetico
  const filteredPayments = pendingPayments.filter(payment => {
    if (filter === 'resuelto') {
      return payment.IdStates === 5; 
    } else if (filter === 'no resuelto') {
      return payment.IdStates === 6; 
    }
    return true; // Sin filtro
  }).sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.AlumnoNombre.localeCompare(b.AlumnoNombre); // Orden ascendente
    } else {
      return b.AlumnoNombre.localeCompare(a.AlumnoNombre); // Orden descendente
    }
  });
  

  return (
    <div style={{textAlign:'right'}}>
<div style={{display:'flex',width:'100%', alignItems:'center', justifyContent:'flex-end'}}>
<Dropdown>
      <Dropdown.Toggle variant="warning" size="sm" id="dropdown-basic" style={{ fontWeight: 'bold' }}>
        {filter || 'Todos'}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => setFilter('')} style={{ fontWeight: 'bold' }}>Todos</Dropdown.Item>
        <Dropdown.Item onClick={() => setFilter('resuelto')} style={{ fontWeight: 'bold' }}>
          Resueltos
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setFilter('no resuelto')} style={{ fontWeight: 'bold' }}>
          No Resueltos
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
    <Button onClick={() => setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
          <SVGComponent src="./assets/sort_by_alpha.svg" color=""/>
        </Button>
</div>
    

      <div className="pending-payments-container">
        <div style={{ height: '73vh', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
          {filteredPayments.map((payment) => (
            <div key={payment.IdPendPayment} className="custom-card">
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div><h3 style={{ color: '#ffffff' }}>{payment.AlumnoNombre}</h3></div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5em' }}>
                    <SVGComponent src="./assets/person_single.svg" color="#A1A1AA" />
                    <div style={{ marginLeft: '5px' }}>{formatNumberWithDots(payment.AlumnoCI)}</div>
                  </div>
                </div>
                <div>
                  <div style={{marginBottom:'10px'}}>
                  {payment.IdStates === 5 ? (
                    <span className='CuBoTt' style={{ color: '#ffc107', padding: '4px 10px' }}>Resuelto</span>
                  ) : (
                    <Button 
                      variant="btn btn-sm btn-warning" 
                      onClick={() => handleResolveClick(payment)} 
                      className='CuBoTt'
                      style={{ color: '#111827' }}
                    >
                      Resolver
                    </Button>
                  )}
                </div>
                <div>
                <h2 style={{color:'#ffc107', fontFamily:'Calibri Light'}}>{formatNumberWithDots(payment.OweAmount)}</h2>
                </div>
                </div>
                
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: '1em' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}> <span style={{marginRight:'10px'}}> Periodo: </span><h5>{payment.Periodo}</h5></div>
                  <div>
                  <div>{payment.IdStates === 5 && (
                        <div>Resuelto el: {payment.ResolveDate}</div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '0', padding: '0' }}>
                    <SVGComponent src="./assets/calendar_month.svg" color="#A1A1AA" />

                    <div style={{ display: 'flex', marginLeft: '10px' }}>
                        <div>desde: {payment.IniPer}</div>&nbsp; &nbsp; 
                        <div>a: {payment.FinPer}</div>
                    </div>
                    </div>
                  </div>

              </div>
            </div>
          ))}

          {/* Modal de confirmación */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmar Resolución</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              ¿Estás seguro de que quieres resolver este pago pendiente?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleConfirmResolve}>
                Confirmar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default PendingPayments;
