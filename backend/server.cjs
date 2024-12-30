const path = require('path');
// Construye la ruta absoluta al node_modules del backend.
const nodeModulesPath = path.join(__dirname, 'node_modules');

// Establece esta ruta para resolver módulos locales.
require('module').Module._initPaths();
process.env.NODE_PATH = nodeModulesPath;
require('module').Module._initPaths();

const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const dayjs = require('dayjs');

const fs = require('fs');
const { router: periodControlRoutes, setDb } = require('./ClosingPeriod/PeriodControlBack.cjs');
const { 
  backupDatabase, 
  restoreDatabase, 
  getBackupFiles, 
  getBackupInfo, 
  checkAndRunBackup, 
  getBackupInterval, 
  updateBackupInterval 
} = require('./backupManager.cjs');

const app = express();
const port = process.env.BACKEND_PORT || 5000; // Puerto dinámico o 5000 como valor por defecto

// Configuración para redirigir logs a un archivo en producción
const logPath = path.join(__dirname, 'backend.log');
const logStream = fs.createWriteStream(logPath, { flags: 'a' });
console.log = (...args) => {
  const timestamp = `[${new Date().toISOString()}]`;
  logStream.write(`${timestamp} ${args.join(' ')}\n`);
};

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a la base de datos SQLite
const dbPath = path.join(__dirname, 'database.db'); // Ruta absoluta a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
  // Habilitar las claves foráneas para permitir la eliminación en cascada
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
      console.error('Error enabling foreign keys:', err.message);
    } else {
      console.log('Foreign key support enabled');
    }
  });
});
setDb(db);

// Endpoint para obtener la lista de alumnos con el nombre de la categoría
app.get('/api/alumnos', (req, res) => {
  db.all(`
    SELECT a.idAlumno, a.Nombre, a.Apellido, a.CI, a.Tel, a.Altura, a.Sexo, c.Cat AS Categoria, g.GymName AS Gym
    FROM Alumno a
    JOIN Categoria c ON a.Cat = c.IdCat
    JOIN Gym g ON a.Gimnasio = g.IdGym
  `, [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});
// Endpoint para actualizar un alumno por su idAlumno
app.put('/api/alumnos/:idAlumno', (req, res) => {
  const { idAlumno } = req.params;
  const { Nombre, Apellido, CI, Tel, Cat, Sexo, Gimnasio } = req.body;

  const updateQuery = `
    UPDATE Alumno
    SET Nombre = ?,
        Apellido = ?,
        CI = ?,
        Tel = ?,
        Cat= ?,
        Sexo= ?
        Gimnasio= ?
    WHERE idAlumno = ?`;

  db.run(updateQuery, [Nombre, Apellido, CI, Tel, Cat, Sexo, Gimnasio, idAlumno], (err) => {
    if (err) {
      console.error('Error updating alumno:', err);
      res.status(500).json({ message: 'Database error', error: err });
    } else {
      res.json({ message: 'Alumno actualizado satisfactoriamente' });
    }
  });
});

// Endpoint para obtener las cuotas de un alumno específico
app.get('/api/cuotas/:alumnoId', (req, res) => {
  const { alumnoId } = req.params;
  const query = 'SELECT * FROM Cuota WHERE Alumno = ?';

  db.all(query, [alumnoId], (err, rows) => {
    if (err) {
      console.error('Error fetching cuotas:', err);
      res.status(500).json({ message: 'Database error', error: err });
    } else {
      res.json({
        message: 'success',
        data: rows
      });
    }
  });
});

// Endpoint para actualizar el estado de pago de una cuota
app.post('/api/updatePagoStatus', (req, res) => {
  const { idCuota, newStatus, motivo } = req.body;

  const selectQuery = 'SELECT FPago, Cuota FROM Cuota WHERE idCuota = ?';

  db.get(selectQuery, [idCuota], (err, row) => {
    if (err) {
      console.error('Error al obtener la fecha de pago y cuota:', err.message);
      return res.status(500).json({ error: 'Error al obtener la fecha de pago y cuota', message: err.message });
    }

    if (!row) {
      console.error('Cuota no encontrada');
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const currentDate = dayjs(row.FPago);
    const newFPago = newStatus === 5 
      ? currentDate.add(1, 'month').format('YYYY-MM-DD') 
      : currentDate.subtract(1, 'month').format('YYYY-MM-DD');
    
    const cuota = row.Cuota;

    const updateQuery = `
      UPDATE Cuota
      SET FPago = ?, 
          PagoStatus = ?
      WHERE idCuota = ?
    `;

    db.run(updateQuery, [newFPago, newStatus, idCuota], function(err) {
      if (err) {
        console.error('Error al actualizar el estado de pago:', err.message);
        return res.status(500).json({ error: 'Error al actualizar el estado de pago', message: err.message });
      }

      // Insertar en HPago con el monto vacío si el estado es 6
      const insertHPagoQuery = `
        INSERT INTO HPago (idCuota, FechaCambio, Motivo, Monto)
        VALUES (?, ?, ?, ?)
      `;
      
      const currentDateTime = dayjs().format('YYYY-MM-DD hh:mm A');
      const values = [idCuota, currentDateTime, motivo, newStatus === 6 ? null : cuota]; // Monto vacío si es 6

      db.run(insertHPagoQuery, values, function(err) {
        if (err) {
          console.error('Error al insertar en HPago:', err.message);
          return res.status(500).json({ error: 'Error al insertar en HPago', message: err.message });
        }

        res.json({ message: 'Estado de pago actualizado correctamente', newFPago });
      });
    });
  });
});


// //new endpoint for delete student

app.delete('/api/alumnos/:idAlumno', (req, res) => {
  const { idAlumno } = req.params;

  db.run('DELETE FROM Alumno WHERE idAlumno = ?', idAlumno, (err) => {
    if (err) {
      console.error('Error deleting alumno:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.json({ message: 'Alumno eliminado satisfactoriamente' });
  });
});



// Endpoint para agregar estadísticas
app.post('/api/estadisticas', (req, res) => {
  const { Alumno, Peso, Grasa, Liquido, Masa, IMC } = req.body;
  
  // Obtenemos la fecha actual en formato YYYY-MM-DD
  const FAct = new Date().toISOString().split('T')[0];

  const insertQuery = `
    INSERT INTO Estadistica (Alumno, FAct, Peso, Grasa, Liquido, Masa, IMC)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [Alumno, FAct, Peso, Grasa, Liquido, Masa, IMC];

  db.run(insertQuery, values, function(err) {
    if (err) {
      console.error('Error al insertar estadística:', err.message);
      return res.status(500).json({ error: 'Error al insertar estadística', message: err.message });
    }
    
    res.json({ message: 'Estadística agregada correctamente' });
  });
});

// Endpoint para obtener historial de estadísticas por alumnoId
app.get('/api/historial-estadisticas/:alumnoId', (req, res) => {
  const { alumnoId } = req.params;

  const query = `
    SELECT IdEstadistica, FAct, Peso, Grasa, Liquido, Masa, IMC
    FROM Estadistica
    WHERE Alumno = ?
    ORDER BY FAct DESC
  `;

  db.all(query, [alumnoId], (err, rows) => {
    if (err) {
      console.error('Error al obtener historial de estadísticas:', err.message);
      return res.status(500).json({ error: 'Error al obtener historial de estadísticas', message: err.message });
    }

    res.json({ message: 'Historial de estadísticas obtenido correctamente', data: rows });
  });
});


// Endpoint para obtener historial de pagos por alumnoId
app.get('/api/historial-pagos/:alumnoId', (req, res) => {
  const { alumnoId } = req.params;

  const query = `
    SELECT HP.IdHistorial, HP.FechaCambio, HP.Motivo
    FROM HPago HP
    INNER JOIN Cuota C ON HP.idCuota = C.idCuota
    WHERE C.Alumno = ?
    ORDER BY HP.FechaCambio DESC
  `;

  db.all(query, [alumnoId], (err, rows) => {
    if (err) {
      console.error('Error al obtener historial de pagos:', err.message);
      return res.status(500).json({ error: 'Error al obtener historial de pagos', message: err.message });
    }

    res.json({ message: 'Historial de pagos obtenido correctamente', data: rows });
  });
});

// Endpoint para obtener todos los registros de estadísticas de un alumno
app.get('/api/estadisticas/:alumnoId', (req, res) => {
  const { alumnoId } = req.params;

  const query = `
    SELECT FAct, Peso, Grasa, Liquido, Masa, IMC
    FROM Estadistica
    WHERE Alumno = ?
    ORDER BY FAct ASC
  `;

  db.all(query, [alumnoId], (err, rows) => {
    if (err) {
      console.error('Error al obtener los registros de estadísticas:', err.message);
      return res.status(500).json({ error: 'Error al obtener los registros de estadísticas', message: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron estadísticas para el alumno' });
    }

    res.json({ message: 'Registros de estadísticas obtenidos correctamente', data: rows });
  });
});

// Endpoint para agregar un nuevo alumno y su cuota
app.post('/api/alumnos', async (req, res) => {
  const { Nombre, Apellido, CI, Tel, Cuota, Altura, Sexo, Cat, Gimnasio } = req.body;
  
  // Obtener la fecha actual en formato ISO para FInsc
  const fechaActual = new Date().toISOString().split('T')[0];

  // Iniciar una transacción para asegurar la atomicidad
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insertar el nuevo alumno en la tabla Alumno
    const insertAlumnoQuery = `
      INSERT INTO Alumno (Nombre, Apellido, CI, Tel, Altura, Sexo, Cat, Gimnasio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const alumnoValues = [Nombre, Apellido, CI, Tel, Altura, Sexo, Cat, Gimnasio];

    db.run(insertAlumnoQuery, alumnoValues, function(err) {
      if (err) {
        console.error('Error al insertar alumno:', err.message);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Error al insertar alumno', message: err.message });
      }

      // Obtener el ID del nuevo alumno insertado
      const alumnoId = this.lastID;

      // Insertar la cuota para el nuevo alumno en la tabla Cuota
      const insertCuotaQuery = `
        INSERT INTO Cuota (FInsc, Cuota, PagoStatus, Alumno)
        VALUES (?, ?, ?, ?)
      `;
      const cuotaValues = [fechaActual, Cuota, 6, alumnoId];

      db.run(insertCuotaQuery, cuotaValues, function(err) {
        if (err) {
          console.error('Error al insertar cuota para el alumno:', err.message);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error al insertar cuota para el alumno', message: err.message });
        }

        // Confirmar la transacción si todo fue exitoso
        db.run('COMMIT');

        // Consultar nuevamente para obtener el alumno recién insertado
        const selectQuery = `
          SELECT A.*, C.Cat 
          FROM Alumno A
          JOIN Categoria C ON A.Cat = C.IdCat
          WHERE idAlumno = ?
        `;
        db.get(selectQuery, [alumnoId], (err, row) => {
          if (err) {
            console.error('Error al obtener el alumno insertado:', err.message);
            return res.status(500).json({ error: 'Error al obtener el alumno insertado', message: err.message });
          }
          // console.log(row);
          res.json({ message: 'Alumno y cuota agregados correctamente', data: row });
        });
      });
    });
  });
});

// Endpoint para obtener todos los sexos para el form agregar alumnos
app.get('/api/sexos', (req, res) => {
  const selectQuery = 'SELECT IdSexo, Sexo FROM Sexo';

  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener los sexos:', err.message);
      return res.status(500).json({ error: 'Error al obtener los sexos', message: err.message });
    }

    res.json(rows);
  });
});

// Endpoint para obtener todas las categorías para el form agregar alumnos
app.get('/api/categorias', (req, res) => {
  const selectQuery = 'SELECT IdCat, Cat FROM Categoria';

  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener las categorías:', err.message);
      return res.status(500).json({ error: 'Error al obtener las categorías', message: err.message });
    }

    res.json(rows);
  });
});

// Endpoint para obtener todos los gimnasios para el form agregar alumnos
app.get('/api/gym', (req, res) => {
  const selectQuery = 'SELECT IdGym, GymName FROM Gym';

  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener las categorías:', err.message);
      return res.status(500).json({ error: 'Error al obtener las categorías', message: err.message });
    }

    res.json(rows);
  });
});

//NUEVOS ENDPOINT CREAR RUTINAS

// Endpoint para obtener todas las rutinas de un alumno específico
app.get('/api/alumnos/:idAlumno/rutinas', (req, res) => {
  const { idAlumno } = req.params;

  const query = `
    SELECT R.IdRutina, R.NombreRutina
    FROM Rutina R
    WHERE R.Alumno = ?
  `;

  db.all(query, [idAlumno], (err, rows) => {
    if (err) {
      console.error('Error al obtener las rutinas del alumno:', err.message);
      return res.status(500).json({ error: 'Error al obtener las rutinas del alumno', message: err.message });
    }

    res.json({ message: 'Rutinas obtenidas correctamente', data: rows });
  });
});
// api para crear una rutina
app.post('/api/rutinas', (req, res) => {
  const { Alumno, NombreRutina } = req.body;
  const query = 'INSERT INTO Rutina (Alumno, NombreRutina) VALUES (?, ?)';
  db.run(query, [Alumno, NombreRutina], function(err) {
    if (err) {
      res.status(500).send({ message: 'Error al crear la rutina' });
    } else {
      res.status(201).send({ IdRutina: this.lastID, Alumno, NombreRutina });
    }
  });
});
//Endpoint para obtener las rutinas de un alumno
app.get('/api/alumnos/:alumnoId/rutinas', (req, res) => {
  const { alumnoId } = req.params;
  const query = 'SELECT * FROM Rutina WHERE Alumno = ?';
  db.all(query, [alumnoId], (err, rows) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener rutinas' });
    } else {
      res.send({ data: rows });
    }
  });
});
//Endpoint para agregar un nuevo día a una rutina
app.post('/api/rutinas/:rutinaId/dias', (req, res) => {
  const { rutinaId } = req.params;
  const queryMaxNumDia = 'SELECT MAX(NumDia) as maxNumDia FROM Dia WHERE Rutina = ?';
  
  db.get(queryMaxNumDia, [rutinaId], (err, row) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el número de día más alto' });
      return;
    }
    
    const nextNumDia = (row.maxNumDia || 0) + 1;
    const queryInsertDia = 'INSERT INTO Dia (Rutina, NumDia) VALUES (?, ?)';
    
    db.run(queryInsertDia, [rutinaId, nextNumDia], function(err) {
      if (err) {
        res.status(500).send({ message: 'Error al agregar el día' });
      } else {
        res.send({ IdDia: this.lastID, Rutina: rutinaId, NumDia: nextNumDia });
      }
    });
  });
});
// Endpoint para obtener los días relacionados con una rutina
app.get('/api/rutinas/:rutinaId/dias', (req, res) => {
  const { rutinaId } = req.params;
  const query = 'SELECT * FROM Dia WHERE Rutina = ? ORDER BY NumDia ASC';
  db.all(query, [rutinaId], (err, rows) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener días' });
    } else {
      res.send({ data: rows });
    }
  });
});
// Endpoint para agregar un nuevo ejercicio
app.post('/api/dias/:diaId/ejercicios', (req, res) => {
  const { diaId } = req.params;
  const { ejercicio, peso, serie, repe, comentario } = req.body;
  const query = 'INSERT INTO Ejercicio (Dia, Ejercicio, Peso, Serie, Repe, Comentario) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(query, [diaId, ejercicio, peso, serie, repe, comentario], function (err) {
    if (err) {
      res.status(500).send({ message: 'Error al agregar el ejercicio' });
    } else {
      res.send({ IdEjercicio: this.lastID, Dia: diaId, Ejercicio: ejercicio, Peso: peso, Serie: serie, Repe: repe, Comentario: comentario });
    }
  });
});
// Endpoint para obtener los ejercicios de un día específico
app.get('/api/dias/:diaId/ejercicios', (req, res) => {
  const { diaId } = req.params;
  const query = 'SELECT * FROM Ejercicio WHERE Dia = ?';
  db.all(query, [diaId], (err, rows) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener los ejercicios' });
    } else {
      res.send({ data: rows });
    }
  });
});
// Endpoint para actualizar un ejercicio
app.put('/api/ejercicios/:id', (req, res) => {
  const { id } = req.params;
  const { Ejercicio, Peso, Serie, Repe, Comentario } = req.body;

  if (!Ejercicio || !Peso || !Serie || !Repe || !Comentario) {
    res.status(400).json({ error: 'Todos los campos son requeridos' });
    return;
  }

  const sql = `
    UPDATE Ejercicio
    SET Ejercicio = ?, Peso = ?, Serie = ?, Repe = ?, Comentario = ?
    WHERE IdEjercicio = ?
  `;
  const params = [Ejercicio, Peso, Serie, Repe, Comentario, id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Ejercicio no encontrado' });
      return;
    }
    res.json({
      message: 'success',
      data: {
        IdEjercicio: id,
        Ejercicio,
        Peso,
        Serie,
        Repe,
        Comentario
      },
    });
  });
});

// Eliminar una Rutina junto con sus Días y Ejercicios
app.delete('/api/rutinas/:idRutina', (req, res) => {
    const { idRutina } = req.params;

    db.serialize(() => {
        // Primero eliminar los ejercicios relacionados
        db.run(
            `DELETE FROM Ejercicio WHERE Dia IN (SELECT IdDia FROM Dia WHERE Rutina = ?)`,
            [idRutina],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Luego eliminar los días relacionados
                db.run(
                    `DELETE FROM Dia WHERE Rutina = ?`,
                    [idRutina],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        // Finalmente eliminar la rutina
                        db.run(
                            `DELETE FROM Rutina WHERE IdRutina = ?`,
                            [idRutina],
                            function(err) {
                                if (err) {
                                    return res.status(500).json({ error: err.message });
                                }

                                res.json({ message: 'Rutina eliminada con éxito' });
                            }
                        );
                    }
                );
            }
        );
    });
});

// Eliminar un Día junto con sus Ejercicios
app.delete('/api/dias/:idDia', (req, res) => {
    const { idDia } = req.params;

    db.serialize(() => {
        // Primero eliminar los ejercicios relacionados
        db.run(
            `DELETE FROM Ejercicio WHERE Dia = ?`,
            [idDia],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Luego eliminar el día
                db.run(
                    `DELETE FROM Dia WHERE IdDia = ?`,
                    [idDia],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        res.json({ message: 'Día eliminado con éxito' });
                    }
                );
            }
        );
    });
});

// Eliminar un Ejercicio
app.delete('/api/ejercicios/:idEjercicio', (req, res) => {
    const { idEjercicio } = req.params;

    db.run(
        `DELETE FROM Ejercicio WHERE IdEjercicio = ?`,
        [idEjercicio],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Ejercicio eliminado con éxito' });
        }
    );
});
// FIN NUEVOS ENDPOINT CREAR RUTINAS


//CUOTAS CARD
// Endpoint para actualizar los datos de la cuota
app.put('/api/cuotas/:idCuota', (req, res) => {
  const idCuota = req.params.idCuota;
  const { Nombre, Apellido, CI, Tel, Altura, FInsc, Cuota } = req.body;

  // Primero, actualizamos los datos del alumno
  db.run(
    `UPDATE Alumno
     SET Nombre = ?, Apellido = ?, CI = ?, Tel = ?, Altura = ?
     WHERE idAlumno = (SELECT Alumno FROM Cuota WHERE IdCuota = ?)`,
    [Nombre, Apellido, CI, Tel, Altura, idCuota],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Luego, actualizamos los datos de la cuota
      db.run(
        `UPDATE Cuota
         SET FInsc = ?, Cuota = ?
         WHERE IdCuota = ?`,
        [FInsc, Cuota, idCuota],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Enviamos la respuesta con los datos actualizados
          db.get(
            `SELECT * FROM Cuota WHERE IdCuota = ?`,
            [idCuota],
            (err, cuota) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              // Enviamos la respuesta con los datos de la cuota actualizados
              res.json(cuota);
            }
          );
        }
      );
    }
  );
});
// FIN CUOTAS CARD


// FINANZAS
// Endpoint para obtener las cuotas de todos los alumnos
app.get('/api/cuotas', (req, res) => {
  const query = 'SELECT Cuota, PagoStatus FROM Cuota';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching cuotas:', err);
      res.status(500).json({ message: 'Database error', error: err });
    } else {
      // Inicializar los montos
      let totalMonto = 0;
      let montoPendiente = 0;
      let montoIngresado = 0;

      // Calcular los montos
      rows.forEach(row => {
        totalMonto += row.Cuota; // Sumar el monto total
        if (row.PagoStatus === 6) {
          montoPendiente += row.Cuota; // Sumar monto pendiente
        } else if (row.PagoStatus === 5) {
          montoIngresado += row.Cuota; // Sumar monto ingresado
        }
      });

      // Enviar la respuesta
      res.json({
        message: 'success',
        totalMonto,
        montoPendiente,
        montoIngresado,
      });
    }
  });
});

// Endpoint para obtener todos los pagos pendientes 

app.get('/api/pending-payments', (req, res) => {
  const query = `
    SELECT 
      PendingPayment.IdPendPayment,
      PendingPayment.IdStates,
      PendingPayment.OweAmount,
      Alumno.nombre || ' ' || Alumno.apellido AS AlumnoNombre,
      Alumno.CI AS AlumnoCI,  -- Campo CI de la tabla Alumno
      PeriodControl.Period AS Periodo,
      PeriodControl.IniPer,   -- Campo IniPer de la tabla PeriodControl
      PeriodControl.FinPer,   -- Campo FinPer de la tabla PeriodControl
      PendingPayment.ResolveDate  -- Campo ResolveDate de la tabla PendingPayment
    FROM PendingPayment
    JOIN Alumno ON PendingPayment.IdAlumno = Alumno.idAlumno
    JOIN PeriodControl ON PendingPayment.IdPeriod = PeriodControl.IdPeriod
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching pending payments:', err);
      res.status(500).json({ message: 'Database error', error: err });
    } else {
      res.json({
        message: 'success',
        data: rows
      });
    }
  });
});

//Actualiza el estado de pago en PendingPayment (Resuelto o No Resuelto)
app.put('/api/pending-payments/:idPendPayment/resolve', (req, res) => {
  const { idPendPayment } = req.params;

  const query = `
    UPDATE PendingPayment 
    SET IdStates = 5, ResolveDate = CURRENT_DATE 
    WHERE IdPendPayment = ?
  `;

  db.run(query, [idPendPayment], function(err) {
    if (err) {
      console.error('Error updating pending payment:', err);
      res.status(500).json({ message: 'Error en la base de datos', error: err });
    } else {
      res.json({ message: 'Pago resuelto correctamente' });
    }
  });
});

//Recupera todos los datos de la tabla PeriodControl
app.get('/api/periods', (req, res) => {
    const sql = 'SELECT * FROM PeriodControl';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
// //Recupera los alumnos pendientes y resueltos (este último por rango de fecha) para el informe de un periodo específico

app.get('/api/filtered-payments/:idPeriod', (req, res) => {
  const { idPeriod } = req.params;

  const query = `
    SELECT 
      PendingPayment.IdPendPayment,
      PendingPayment.IdStates,
      Alumno.nombre || ' ' || Alumno.apellido AS AlumnoNombre,
      Alumno.CI AS AlumnoCI,
      PeriodControl.Period AS Periodo,
      PeriodControl.IniPer,
      PeriodControl.FinPer,
      PendingPayment.ResolveDate,
      Categoria.Cat AS Categoria 
    FROM PendingPayment
    JOIN Alumno ON PendingPayment.IdAlumno = Alumno.idAlumno
    LEFT JOIN PeriodControl ON PendingPayment.IdPeriod = PeriodControl.IdPeriod
    LEFT JOIN Categoria ON Alumno.Cat = Categoria.IdCat
    WHERE 
      PendingPayment.IdStates = 6
      OR 
      (PendingPayment.IdStates = 5 
       AND PendingPayment.ResolveDate BETWEEN 
           (SELECT IniPer FROM PeriodControl WHERE IdPeriod = ?) 
           AND 
           (SELECT FinPer FROM PeriodControl WHERE IdPeriod = ?))
  `;

  db.all(query, [idPeriod, idPeriod], (err, rows) => {
    if (err) {
      console.error('Error fetching payments:', err);
      res.status(500).json({ message: 'Database error', error: err });
    } else {
      res.json({
        message: 'success',
        data: rows
      });
    }
  });
});


//Recupera datos para el resumen del informe de un periodo específico ##RESUELTO##
app.get('/api/filtered-payments-summary/:idPeriod', (req, res) => {
  const { idPeriod } = req.params;

  const query = `
SELECT 
  (SELECT SUM(Monto) 
   FROM HPago 
   WHERE FechaCambio BETWEEN PeriodControl.IniPer AND PeriodControl.FinPer
  ) AS montoIngresado,
    (SELECT SUM(OweAmount) FROM PendingPayment
      WHERE ResolveDate BETWEEN PeriodControl.IniPer AND PeriodControl.FinPer) As totalOweAmount,
  PeriodControl.Ingresos AS totalMonto,
  PeriodControl.Period AS nombrePeriodo
FROM PeriodControl
WHERE PeriodControl.IdPeriod = ?

  `;

  db.get(query, [idPeriod], (err, row) => {
    if (err) {
      console.error('Error fetching payment summary:', err);
      res.status(500).json({ message: 'Database error', error: err });
    } else {
      const montoIngresado = row.montoIngresado || 0;
      const totalMonto = row.totalMonto || 0;
      const totalOweAmount = row.totalOweAmount || 0; 
      const montoPendiente = totalMonto - montoIngresado || 0;
      const nombrePeriodo = row.nombrePeriodo || 'Revisa si existe el nombre';

      res.json({
        message: 'success',
        data: {
          montoIngresado,
          totalMonto,
          totalOweAmount,
          montoPendiente,
          nombrePeriodo  // Incluir el nombre del periodo en la respuesta
        }
      });
    }
  });
});



// FIN FINANZAS



// BACKUPS
// Ruta para crear una copia de seguridad
app.post('/backup', (req, res) => {
  backupDatabase(db, res);
});

// Ruta para restaurar la base de datos desde una copia de seguridad
app.post('/restore', (req, res) => {
  const { backupFileName } = req.body;

  if (!backupFileName) {
    res.status(400).send('Backup file name is required');
    return;
  }

  restoreDatabase(backupFileName, res);
});
// Ruta para consultar los archivos de copia
app.get('/backup/files', getBackupFiles);

// Ruta para obtener información de respaldo
app.get('/backup-info', async (req, res) => {
  try {
    const backupInfo = await getBackupInfo(db);
    res.json(backupInfo);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Ruta para verificar y ejecutar respaldo automático
app.post('/backup/check-and-run', async (req, res) => {
  try {
    const message = await checkAndRunBackup(db);
    res.send(message);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint para obtener el backupInterval
app.get('/backup/backupInterval', (req, res) => {
  getBackupInterval(db, res);
});

// Endpoint para actualizar el backupInterval
app.put('/backup/updateBackupInterval', (req, res) => {
  const { backupInterval } = req.body;
  updateBackupInterval(db, backupInterval, res);
});


//GYM MANAGER INICIO
// Endpoint para obtener todos los gyms con el número de alumnos asociados
app.get('/gyms', (req, res) => {
  db.all(`
    SELECT 
      g.IdGym, 
      g.GymName, 
      g.Salary, 
      j.Type AS JobType,
      COUNT(a.idAlumno) AS StudentCount
    FROM Gym g
    JOIN JobType j ON g.Type = j.IdJobType
    LEFT JOIN Alumno a ON a.Gimnasio = g.IdGym
    GROUP BY g.IdGym
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Endpoint para obtener todos los registros de JobType
app.get('/jobtypes', (req, res) => {
  const query = 'SELECT * FROM JobType';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});
// Endpoint para crear un nuevo gimnasio
app.post('/gyms', (req, res) => {
  const { GymName, JobType, Salary } = req.body;

  // Validar que los datos requeridos estén presentes
  if (!GymName || !JobType || Salary === undefined) {
    return res.status(400).json({ error: 'GymName, JobType (IdJobType), and Salary are required' });
  }

  // Insertar el nuevo gimnasio en la tabla Gym
  const query = `
    INSERT INTO Gym (GymName, Type, Salary)
    VALUES (?, ?, ?)
  `;

  db.run(query, [GymName, JobType, Salary], function (err) {
    if (err) {
      console.error('Error creando gimnasio:', err.message);
      return res.status(500).json({ error: 'Error creating the gym' });
    }

    res.status(201).json({
      message: 'Gym created successfully',
      createdGym: { IdGym: this.lastID, GymName, JobType, Salary },
    });
  });
});

// Endpoint para actualizar los detalles de un gimnasio
app.put('/gyms/:id', (req, res) => {
  const { id } = req.params; // ID del gimnasio
  const { GymName, JobType, Salary } = req.body; // Datos enviados por el frontend

  // Validar datos
  if (!GymName || !JobType || Salary === undefined) {
    return res.status(400).json({ error: 'GymName, JobType (IdJobType), and Salary are required' });
  }

  // Actualizar los campos en la tabla Gym
  const query = `
    UPDATE Gym
    SET GymName = ?, Type = ?, Salary = ?
    WHERE IdGym = ?
  `;

  db.run(query, [GymName, JobType, Salary, id], function (err) {
    if (err) {
      console.error('Error actualizando el gimnasio:', err.message);
      return res.status(500).json({ error: 'Error updating the gym' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    res.json({ message: 'Gym updated successfully', updatedGym: { IdGym: id, GymName, JobType, Salary } });
  });
});

// Endpoint para eliminar un gimnasio por su ID
app.delete('/gyms/:id', (req, res) => {
  const { id } = req.params;

  // Actualizar los alumnos asociados al gimnasio eliminado
  const updateStudentsQuery = 'UPDATE Alumno SET Gimnasio = 1 WHERE Gimnasio = ?';
  db.run(updateStudentsQuery, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: `Error updating students: ${err.message}` });
    }

    // Eliminar el gimnasio una vez actualizados los alumnos
    const deleteGymQuery = 'DELETE FROM Gym WHERE IdGym = ?';
    db.run(deleteGymQuery, [id], function (err) {
      if (err) {
        return res.status(500).json({ error: `Error deleting gym: ${err.message}` });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Gym not found' });
      }

      // Responder con un mensaje de éxito
      res.json({
        message: `Gym with IdGym ${id} deleted successfully. Students reassigned to Gym Id 1.`,
      });
    });
  });
});

// Endpoint para obtener gimnasios de tipo "interno" (Uso de Finance Report)
app.get('/gyms/internos', (req, res) => {
  const query = `
    SELECT g.IdGym, g.GymName, g.Salary, j.Type AS JobType
    FROM Gym g
    JOIN JobType j ON g.Type = j.IdJobType
    WHERE g.Type = 1
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

//GYM MANAGER FIN

// CIERRE INICIO
// Usar las rutas de cierre
app.use('/api/periodcontrol', periodControlRoutes);
// CIERRE FIN
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});