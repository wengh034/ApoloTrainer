import React, { useEffect, useState, useRef } from 'react';
import PeriodBootModal from './PeriodBootModal'; // Asegúrate de que esta ruta sea correcta

const ClosingBoot = () => {
  const [showPeriodBootModal, setShowPeriodBootModal] = useState(false);
  const isInitialRender = useRef(true); // Ref para evitar duplicaciones
  const [backupSettings, setBackupSettings] = useState(null);

  // Función para recuperar configuraciones de respaldo
  const fetchBackupSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/backup-info');
      if (!response.ok) {
        throw new Error('Error al recuperar configuraciones de respaldo.');
      }
      const data = await response.json();
      console.log('Backup Settings:', data);
      setBackupSettings(data); // Guardar los datos de configuración en el estado
    } catch (error) {
      console.error('Error fetching backup settings:', error);
    }
  };
  // Función para verificar si PeriodControl está vacío
  const checkPeriodControl = async () => {
    try {
      const response = await fetch('/api/periodcontrol/check-empty');
      if (!response.ok) {
        throw new Error('Error al verificar PeriodControl.');
      }
      const data = await response.json();

      if (data.isEmpty) {
        // Caso cuando PeriodControl está vacío
        setShowPeriodBootModal(true);
      } else {
        // Caso cuando PeriodControl no está vacío
        handleExistingPeriods();
      }
    } catch (error) {
      console.error('Error al verificar PeriodControl:', error);
    }
  };

  // Función para manejar los periodos existentes en PeriodControl
  const handleExistingPeriods = async () => {
    try {
      const response = await fetch('/api/periodcontrol/last-period');
      if (!response.ok) {
        throw new Error('Error al obtener el último periodo.');
      }
      const lastPeriod = await response.json();

      const today = new Date();
      const start = new Date(lastPeriod.IniPer);
      const end = new Date(lastPeriod.FinPer);

      // Verificar si la fecha actual está dentro del rango del último periodo
      if (today >= start && today <= end) {
         console.log('El periodo actual sigue abierto.');
      } else {
         console.log('El periodo anterior ya cerró.');

        // Segunda verificación: Comparar today con NextIniPer para abrir el siguiente periodo
        const nextStart = new Date(lastPeriod.NextIniPer);
        if (today >= nextStart) {
           console.log('Es tiempo de verificar StatePayCheck.');
          // Verificar el estado de StatePayCheck
          if (lastPeriod.StatePayCheck === 2) {
            // Si es 2 (No)
            //  console.log(
            //    'StatePayCheck es "No", ejecutar cambio de estado de pagos antes de cerrar el periodo.'
            //  );
            await regPendientes(lastPeriod.IdPeriod);
            // Aquí podrías ejecutar la lógica para cambiar el estado de pago de los alumnos, por ahora solo lo documentamos
          } else if (lastPeriod.StatePayCheck === 1) {
            // Si es 1 (Sí)
            console.log(
               'StatePayCheck es "Sí", procediendo a cerrar el periodo y abrir uno nuevo.'
            );
            await openNewPeriod(lastPeriod);
          }
        } else {
           console.log('El siguiente periodo aún no debe abrirse.');
        }
      }
    } catch (error) {
      console.error('Error al manejar periodos existentes:', error);
    }
  };

  // Función para abrir un nuevo periodo y cerrar el anterior
  const openNewPeriod = async (lastPeriod) => {
    try {
      // Calcular las fechas para el nuevo periodo
      const newStartDate = lastPeriod.NextIniPer;
      const newEndDate = dayjs(newStartDate)
        .add(1, 'month')
        .subtract(1, 'day')
        .format('YYYY-MM-DD');
      const nextNextIniPer = dayjs(newStartDate).add(1, 'month').format('YYYY-MM-DD');

      // Usar el endpoint existente para crear un nuevo periodo
      const response = await fetch('/api/periodcontrol/crear-periodo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: newStartDate,
          endDate: newEndDate,
          closingDate: nextNextIniPer,
          statePayCheck: 2, // Iniciar el nuevo periodo con StatePayCheck como "No"
          periodState: 3, // Periodo Abierto
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el nuevo periodo.');
      }

      // Actualizar el último periodo a "Cerrado"
      await fetch('/api/periodcontrol/close-period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lastPeriod.IdPeriod }),
      });

      console.log('Nuevo periodo abierto con éxito.');
    } catch (error) {
      console.error('Error al abrir el nuevo periodo:', error);
    }
  };

  const handleSavePeriod = async (startDate) => {
    try {
      const response = await fetch('/api/periodcontrol/init-period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate }),
      });

      if (!response.ok) {
        throw new Error('Error al inicializar el periodo.');
      } else {
        const result = await response.json();
        console.log('guardado'); // Mensaje de éxito
        setShowPeriodBootModal(false); // Ocultar el modal después de guardar
      }
    } catch (error) {
      console.error('Error al inicializar el periodo:', error);
    }
  };

  // useEffect para llamar a la función de verificación al montar el componente
  useEffect(() => {
    if (isInitialRender.current) {
      checkPeriodControl();
      fetchBackupSettings();
      isInitialRender.current = false; // Marcar que ya se ejecutó
    }
  }, []);
// Función para registrar pagos pendientes (hace la call al endpoint que creamos)
const regPendientes = async (idPeriod) => {
  try {
    const response = await fetch('/api/periodcontrol/registrar-pendientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idPeriod }), // Envía el id del periodo
    });

    if (!response.ok) {
      throw new Error('Error al registrar los pagos pendientes.');
    }

    const result = await response.json();
    console.log(result.message); // Muestra el mensaje de éxito en la consola
  } catch (error) {
    console.error('Error al registrar pagos pendientes:', error);
  }
};

  return (
    <div>
      {/* Renderiza el modal solo si showPeriodBootModal es true */}
      <PeriodBootModal
        show={showPeriodBootModal}
        onHide={() => setShowPeriodBootModal(false)}
        onSave={handleSavePeriod}
      />
    </div>
  );
};



export default ClosingBoot;
