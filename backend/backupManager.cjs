const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

let database = null;

function setDb(dbInstance) {
  database = dbInstance;
}

// Ruta de la base de datos actual
const dbPath = path.join(__dirname, 'database.db');

// Directorio para las copias de seguridad
const backupDir = path.join(__dirname, 'backups');

// Crear el directorio de backups si no existe
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Función para gestionar el límite de copias de seguridad
function manageBackupLimit() {
  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('database_backup_'))  // Solo archivos de backup
    .map(file => ({
      name: file,
      time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
    }))
    .sort((a, b) => a.time - b.time);  // Ordenar por fecha (de más antigua a más reciente)

  // Si hay más de dos copias, eliminar las más antiguas
  while (files.length >= 2) {
    const oldest = files.shift();  // Eliminar la más antigua
    fs.unlinkSync(path.join(backupDir, oldest.name));
    console.log(`Deleted old backup: ${oldest.name}`);
  }
}

// // Función para crear una copia de seguridad de la base de datos
// function backupDatabase() {
//   manageBackupLimit();  // Gestionar el límite antes de crear la copia

//   const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
//   const backupPath = path.join(backupDir, `database_backup_${timestamp}.db`);
  
//   fs.copyFile(dbPath, backupPath, (err) => {
//     if (err) {
//       console.error('Error creating backup:', err.message);
//     } else {
//       console.log('Backup created at:', backupPath);
//     }
//   });
// }
// Función para crear una copia de seguridad de la base de datos
function backupDatabase(db, res) {
  manageBackupLimit(); // Gestionar el límite antes de crear la copia

  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  const backupPath = path.join(backupDir, `database_backup_${timestamp}.db`);
  
  fs.copyFile(dbPath, backupPath, (err) => {
    if (err) {
      console.error('Error creating backup:', err.message);
      if (res) res.status(500).send('Error creating backup');
    } else {
      // console.log('Backup created at:', backupPath);
      
      // Actualizar lastBackup en la tabla Backups
      const lastBackupDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const updateSql = 'UPDATE Backups SET lastBackup = ?';

      db.run(updateSql, [lastBackupDate], function (err) {
        if (err) {
          console.error('Error updating lastBackup:', err.message);
          if (res) res.status(500).send('Error updating lastBackup');
        } else {
          console.log('lastBackup updated to:', lastBackupDate);
          if (res) res.send('Backup created successfully');
        }
      });
    }
  });
}

// Función para consultar los archivos de copia de seguridad
const getBackupFiles = (req, res) => {
  fs.readdir(backupDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error al leer el directorio de copias de seguridad');
    }
    // Filtrar archivos que terminen en '.db'
    const backupFiles = files.filter(file => file.endsWith('.db'));
    res.json(backupFiles);
  });
};

// Función para restaurar la base de datos desde un archivo de copia de seguridad
function restoreDatabase(backupFileName, res) {
  const backupPath = path.join(backupDir, backupFileName);
  
  if (!fs.existsSync(backupPath)) {
    console.error('Backup file does not exist:', backupPath);
    if (res) res.status(404).send('Backup file does not exist');
    return;
  }
  
  fs.copyFile(backupPath, dbPath, (err) => {
    if (err) {
      console.error('Error restoring database:', err.message);
      if (res) res.status(500).send('Error restoring database');
    } else {
      // console.log('Database restored from:', backupPath);
      if (res) res.send('Database restored successfully');
    }
  });
}

// Función para consultar el último backup y el intervalo de días
const getBackupInfo = (db) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT lastBackup, backupInterval FROM Backups WHERE IdBackups = 1`;

    db.get(query, (err, row) => {
      if (err) {
        console.error('Error fetching backup settings:', err.message);
        reject('Error fetching backup settings');
      } else {
        resolve(row);
      }
    });
  });
};
//Función para Verificar y Ejecutar Respaldo Automático
// const checkAndRunBackup = (db) => {
//   return new Promise((resolve, reject) => {
//     const query = `SELECT lastBackup, backupInterval FROM Backups WHERE IdBackups = 1`;

//     db.get(query, (err, row) => {
//       if (err) {
//         console.error('Error fetching backup settings:', err.message);
//         reject('Error fetching backup settings');
//         return;
//       }
      
//       const { lastBackup, backupInterval } = row;
//       const lastBackupDate = dayjs(lastBackup);
//       const currentDate = dayjs();
      
//       if (currentDate.diff(lastBackupDate, 'day') >= backupInterval) {
//         backupDatabase(db); // Llama a la función de respaldo ya definida

//         const updateQuery = `UPDATE Backups SET lastBackup = ? WHERE IdBackups = 1`;
//         db.run(updateQuery, [currentDate.format('YYYY-MM-DD')], (updateErr) => {
//           if (updateErr) {
//             console.error('Error updating last backup date:', updateErr.message);
//             reject('Error updating last backup date');
//           } else {
//             resolve('Backup created and last backup date updated');
//           }
//         });
//       } else {
//         resolve('No backup needed');
//       }
//     });
//   });
// };
const checkAndRunBackup = (db) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT lastBackup, backupInterval FROM Backups WHERE IdBackups = 1`;

    db.get(query, (err, row) => {
      if (err) {
        console.error('Error fetching backup settings:', err.message);
        reject({ success: false, message: 'Error fetching backup settings' });
        return;
      }
      
      const { lastBackup, backupInterval } = row;
      const lastBackupDate = dayjs(lastBackup);
      const currentDate = dayjs();

      if (currentDate.diff(lastBackupDate, 'day') >= backupInterval) {
        backupDatabase(db); // Llama a la función de respaldo ya definida

        const updateQuery = `UPDATE Backups SET lastBackup = ? WHERE IdBackups = 1`;
        db.run(updateQuery, [currentDate.format('YYYY-MM-DD')], (updateErr) => {
          if (updateErr) {
            console.error('Error updating last backup date:', updateErr.message);
            reject({ success: false, message: 'Error updating last backup date' });
          } else {
            resolve({ success: true, message: 'Backup created and last backup date updated' });
          }
        });
      } else {
        resolve({ success: false, message: 'No backup needed' });
      }
    });
  });
};


const getBackupInterval = (db, res) => {
  const sql = 'SELECT backupInterval FROM Backups LIMIT 1';
  db.get(sql, [], (err, row) => {
      if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Error retrieving backup interval' });
      }
      res.json({ backupInterval: row ? row.backupInterval : null });
  });
};

const updateBackupInterval = (db, newInterval, res) => {
  if (newInterval == null) {
      return res.status(400).json({ error: 'Backup interval is required' });
  }

  const sql = 'UPDATE Backups SET backupInterval = ?';
  db.run(sql, [newInterval], function (err) {
      if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Error updating backup interval' });
      }
      res.json({ message: 'Backup interval updated successfully' });
  });
};




module.exports = {
  backupDatabase,
  restoreDatabase,
  getBackupFiles,
  getBackupInfo,
  checkAndRunBackup,
  getBackupInterval,
  updateBackupInterval
};