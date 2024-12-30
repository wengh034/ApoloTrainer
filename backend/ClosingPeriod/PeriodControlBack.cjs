const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');

// Variable para almacenar la conexión a la base de datos
let db;

function setDb(database) {
  db = database;
}

// Endpoint para verificar si PeriodControl está vacío
router.get('/check-empty', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM PeriodControl', (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Error al verificar PeriodControl.' });
    } else {
      const isEmpty = row.count === 0;
      res.json({ isEmpty });
    }
  });
});

// Endpoint para obtener todos los periodos
router.get('/check', (req, res) => {
  db.all('SELECT * FROM PeriodControl', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Error al obtener los periodos.' });
    } else {
      res.json(rows);
    }
  });
});




// Endpoint para inicializar el primer periodo
router.post('/init-period', (req, res) => {
  const { startDate } = req.body;

  // Calcular la fecha de fin del periodo y la siguiente fecha de inicio
  const endDate = dayjs(startDate).add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');
  const nextIniPer = dayjs(startDate).add(1, 'month').format('YYYY-MM-DD');

  // Calcular el nombre del periodo (Ene-Feb, Feb-Mar, etc.)
  const startMonth = dayjs(startDate).format('MMM');  // Obtener el nombre del mes
  const nextMonth = dayjs(startDate).add(1, 'month').format('MMM'); // Mes siguiente
  const period = `${startMonth}-${nextMonth}`; // Formatear el nombre del periodo

  db.run(
    'INSERT INTO PeriodControl (IniPer, FinPer, NextIniPer, Period, StatePayCheck, PeriodState) VALUES (?, ?, ?, ?, ?, ?)',
    [startDate, endDate, nextIniPer, period, 2, 3], // 'No' y 'Abierto' se representan como 2 y 3 en States
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al crear el periodo.' });
      } else {
        res.json({ message: 'Periodo inicializado con éxito.' });
      }
    }
  );
});

// Endpoint para obtener el último periodo registrado
 router.get('/last-period', (req, res) => {
   const query = 'SELECT * FROM PeriodControl ORDER BY IdPeriod DESC LIMIT 1';
   db.get(query, [], (err, row) => {
     if (err) {
       res.status(500).json({ error: 'Error al obtener el último periodo.' });
     } else {
       if (row) {
         res.json(row);
       } else {
         res.status(404).json({ message: 'No se encontró ningún periodo.' });
       }
     }
   });
 });

// Endpoint para crear un nuevo periodo (si se necesitara en el futuro)
router.post('/crear-periodo', (req, res) => {
  const { startDate, endDate, statePayCheck, periodState } = req.body;

  // Calcular el nombre del periodo
  const startMonth = dayjs(startDate).format('MMM');
  const nextMonth = dayjs(startDate).add(1, 'month').format('MMM');
  const period = `${startMonth}-${nextMonth}`;

  db.run(
    'INSERT INTO PeriodControl (IniPer, FinPer, Period, StatePayCheck, PeriodState) VALUES (?, ?, ?, ?, ?)',
    [startDate, endDate, period, statePayCheck, periodState],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al crear el periodo.' });
      } else {
        res.json({ message: 'Periodo creado con éxito.' });
      }
    }
  );
});

// Endpoint para manejar los pagos pendientes y actualizar los estados de pago
// router.post('/registrar-pendientes', async (req, res) => {
//   try {
//     const { idPeriod } = req.body; // El periodo que se está cerrando

//     // Primero, obtener a los alumnos con PagoStatus = 6
//     const pendingStudents = await new Promise((resolve, reject) => {
//       db.all('SELECT Alumno FROM Cuota WHERE PagoStatus = 6', (err, rows) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(rows); // rows es un array de objetos
//         }
//       });
//     });

//     if (pendingStudents.length === 0) {
//       return res.status(404).json({ message: 'No hay alumnos con pagos pendientes.' });
//     }

//     // Registrar a los alumnos pendientes en la tabla PendingPayment
//     const stmt = db.prepare(
//       'INSERT INTO PendingPayment (IdAlumno, IdPeriod, IdStates) VALUES (?, ?, ?)'
//     );

//     for (const student of pendingStudents) {
//       stmt.run(student.Alumno, idPeriod, 6); // Se registra con el estado 6 (Pendiente)
//     }

//     stmt.finalize();

//     // Segundo, actualizar el PagoStatus de todos los alumnos a 6 en la tabla Cuota
//     await new Promise((resolve, reject) => {
//       db.run('UPDATE Cuota SET PagoStatus = 6', (err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });

//     res.json({ message: 'Alumnos registrados en pagos pendientes y estados actualizados a 6.' });
//   } catch (error) {
//     console.error('Error al registrar pagos pendientes:', error);
//     res.status(500).json({ error: 'Error al registrar pagos pendientes.' });
//   }
// });



          // Endpoint para manejar los pagos pendientes y actualizar los estados de pago
// router.post('/registrar-pendientes', async (req, res) => {
//   try {
//     const { idPeriod } = req.body; // El periodo que se está cerrando

//     // Primero, obtener a los alumnos con PagoStatus = 6
//     const pendingStudents = await new Promise((resolve, reject) => {
//       db.all('SELECT Alumno FROM Cuota WHERE PagoStatus = 6', (err, rows) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(rows);
//         }
//       });
//     });

//     if (pendingStudents.length === 0) {
//       return res.status(404).json({ message: 'No hay alumnos con pagos pendientes.' });
//     }

//     // Registrar a los alumnos pendientes en la tabla PendingPayment
//     const stmt = db.prepare(
//       'INSERT INTO PendingPayment (IdAlumno, IdPeriod, IdStates) VALUES (?, ?, ?)'
//     );
//     for (const student of pendingStudents) {
//       stmt.run(student.Alumno, idPeriod, 6); // Se registra con el estado 6 (Pendiente)
//     }
//     stmt.finalize();

//     // Actualizar el PagoStatus de todos los alumnos a 6 en la tabla Cuota
//     await new Promise((resolve, reject) => {
//       db.run('UPDATE Cuota SET PagoStatus = 6', (err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });

// // Actualizar el StatePayCheck de 3 a 4 y PeriodState a 4 (Cerrado) para el periodo actual
// await new Promise((resolve, reject) => {
//   db.run('UPDATE PeriodControl SET StatePayCheck = 4, PeriodState = 4 WHERE IdPeriod = ?', [idPeriod], (err) => {
//     if (err) {
//       reject(err);
//     } else {
//       resolve();
//     }
//   });
// });


//     // Ahora creamos el nuevo periodo
//     const lastPeriod = await new Promise((resolve, reject) => {
//       db.get('SELECT * FROM PeriodControl WHERE IdPeriod = ?', [idPeriod], (err, row) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(row);
//         }
//       });
//     });

//     const newStartDate = lastPeriod.NextIniPer;
//     const newEndDate = dayjs(newStartDate).add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');
//     const nextNextIniPer = dayjs(newStartDate).add(1, 'month').format('YYYY-MM-DD');
//     const startMonth = dayjs(newStartDate).format('MMM');
//     const nextMonth = dayjs(newStartDate).add(1, 'month').format('MMM');
//     const newPeriod = `${startMonth}-${nextMonth}`;

//     // Insertar el nuevo periodo
//     await new Promise((resolve, reject) => {
//       db.run(
//         'INSERT INTO PeriodControl (IniPer, FinPer, NextIniPer, Period, StatePayCheck, PeriodState) VALUES (?, ?, ?, ?, ?, ?)',
//         [newStartDate, newEndDate, nextNextIniPer, newPeriod, 2, 3], // Nuevo periodo empieza con StatePayCheck = 2 (No), PeriodState = 3 (Abierto)
//         (err) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve();
//           }
//         }
//       );
//     });

//     res.json({ message: 'Pagos pendientes registrados, periodo cerrado y nuevo periodo creado.' });
//   } catch (error) {
//     console.error('Error al registrar pagos pendientes:', error);
//     res.status(500).json({ error: 'Error al registrar pagos pendientes.' });
//   }
// });
// es el endpoint actualizado del de arriba de este (este incluye el registro de ingreso total)
router.post('/registrar-pendientes', async (req, res) => {
  try {
    const { idPeriod } = req.body; // El periodo que se está cerrando

    // Primero, obtener a los alumnos con PagoStatus = 6
    const pendingStudents = await new Promise((resolve, reject) => {
      db.all('SELECT Alumno, Cuota FROM Cuota WHERE PagoStatus = 6', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    

    if (pendingStudents.length === 0) {
      return res.status(200).json({ message: 'No hay alumnos con pagos pendientes.' });
    }

    // Registrar a los alumnos pendientes en la tabla PendingPayment
    const stmt = db.prepare(
      'INSERT INTO PendingPayment (IdAlumno, IdPeriod, IdStates, OweAmount) VALUES (?, ?, ?, ?)'
    );
    for (const student of pendingStudents) {
      stmt.run(student.Alumno, idPeriod, 6, student.Cuota);
    }
    stmt.finalize();

    // Actualizar el PagoStatus de todos los alumnos a 6 en la tabla Cuota
    await new Promise((resolve, reject) => {
      db.run('UPDATE Cuota SET PagoStatus = 6', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Obtener la suma de las cuotas
    const totalIngresos = await new Promise((resolve, reject) => {
      db.get('SELECT SUM(Cuota) AS total FROM Cuota', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.total || 0); // Si no hay cuotas, retorna 0
        }
      });
    });

    // Actualizar el Ingresos en PeriodControl
    await new Promise((resolve, reject) => {
      db.run('UPDATE PeriodControl SET Ingresos = ? WHERE IdPeriod = ?', [totalIngresos, idPeriod], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Actualizar el StatePayCheck de 3 a 4 y PeriodState a 4 (Cerrado) para el periodo actual
    await new Promise((resolve, reject) => {
      db.run('UPDATE PeriodControl SET StatePayCheck = 4, PeriodState = 4 WHERE IdPeriod = ?', [idPeriod], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Ahora creamos el nuevo periodo
    const lastPeriod = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM PeriodControl WHERE IdPeriod = ?', [idPeriod], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    const newStartDate = lastPeriod.NextIniPer;
    const newEndDate = dayjs(newStartDate).add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');
    const nextNextIniPer = dayjs(newStartDate).add(1, 'month').format('YYYY-MM-DD');
    const startMonth = dayjs(newStartDate).format('MMM');
    const nextMonth = dayjs(newStartDate).add(1, 'month').format('MMM');
    const newPeriod = `${startMonth}-${nextMonth}`;

    // Insertar el nuevo periodo
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO PeriodControl (IniPer, FinPer, NextIniPer, Period, StatePayCheck, PeriodState) VALUES (?, ?, ?, ?, ?, ?)',
        [newStartDate, newEndDate, nextNextIniPer, newPeriod, 2, 3], // Nuevo periodo empieza con StatePayCheck = 2 (No), PeriodState = 3 (Abierto)
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    res.json({ message: 'Pagos pendientes registrados, periodo cerrado, nuevo periodo creado y ingresos registrados.' });
  } catch (error) {
    console.error('Error al registrar pagos pendientes:', error);
    res.status(500).json({ error: 'Error al registrar pagos pendientes.' });
  }
});


// Exporta el router y la función para configurar la base de datos
module.exports = { router, setDb };
