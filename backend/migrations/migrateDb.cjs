const fs = require('fs');
const path = require('path');

// Log de mensajes enviados al proceso principal (Electron)
const log = (...args) => process.send && process.send({ log: args.join(' ') });

const migrateDatabase = () => {
  const appDataDir = path.join(process.cwd(), 'backend'); // Donde está la db actual en ejecución
  const oldDbPath = path.join(appDataDir, 'database.db'); // Base de datos actual
  const oldDbBackupPath = path.join(appDataDir, 'database_current.db'); // Respaldo
  const newDbPath = path.join(process.resourcesPath, 'backend', 'database.db'); // Nueva base de datos

  try {
    log('Starting database migration...');

    // Verificar si la base de datos actual existe
    if (!fs.existsSync(oldDbPath)) {
      log('No existing database found. Migration skipped.');
      return false;
    }

    // Crear un respaldo de la base de datos actual
    log('Creating a backup of the current database...');
    fs.copyFileSync(oldDbPath, oldDbBackupPath);
    log('Backup created:', oldDbBackupPath);

    // Verificar si la nueva base de datos existe
    if (!fs.existsSync(newDbPath)) {
      log('New database not found in the update. Migration aborted.');
      return false;
    }

    // Migrar datos (aquí se asume que ambas bases de datos tienen la misma estructura)
    log('Migrating data from the current database to the new database...');
    const oldData = fs.readFileSync(oldDbPath, 'utf-8');
    fs.writeFileSync(newDbPath, oldData);
    log('Data migration completed successfully.');

    // Eliminar el respaldo después de una migración exitosa
    log('Cleaning up backup...');
    fs.unlinkSync(oldDbBackupPath);

    log('Migration completed successfully.');
    return true;
  } catch (error) {
    log(`Migration error: ${error.message}`);

    // Restaurar desde el respaldo en caso de error
    if (fs.existsSync(oldDbBackupPath)) {
      log('Restoring database from backup...');
      fs.copyFileSync(oldDbBackupPath, oldDbPath);
      log('Restoration completed.');
    }
    return false;
  }
};

// Ejecutar migración y notificar el resultado al proceso principal
const success = migrateDatabase();
process.exit(success ? 0 : 1);
