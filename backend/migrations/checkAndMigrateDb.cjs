const fs = require('fs');
const path = require('path');
const semver = require('semver');  // Necesitamos este paquete para comparar versiones
const { version: currentVersion } = require('../package.json');  // Versión actual del backend

const getNewVersionFromPackage = () => {
  // Aquí asumimos que el nuevo package.json es el que ha sido actualizado y descargado
  const newPackagePath = path.join(process.resourcesPath, 'backend', 'package.json');
  if (fs.existsSync(newPackagePath)) {
    const newPackageJson = require(newPackagePath);
    return newPackageJson.version;
  }
  return null;  // Si no se encuentra el package.json nuevo, retornamos null
};

// Verificar si la migración es necesaria comparando versiones
const shouldMigrate = (currentVersion, newVersion) => {
  if (!newVersion) {
    console.error('No new version found. Migration cannot proceed.');
    return false;
  }
  
  // Si la nueva versión tiene un número mayor en alguna de las partes (major, minor, patch), se debe hacer la migración
  return semver.lt(currentVersion, newVersion);
};

// Ejecutar migración si es necesario
const runMigration = () => {
  // Lógica de migración aquí
  console.log('Running database migration...');
  // Ejecutar el script de migración
  // Reemplaza con el path correcto a tu script de migración
  const migrationScriptPath = path.join(__dirname, 'migrateDb.js');

  if (fs.existsSync(migrationScriptPath)) {
    const migrationProcess = require('child_process').fork(migrationScriptPath);

    migrationProcess.on('message', (message) => {
      console.log(`Migration process message: ${message}`);
    });

    migrationProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('Migration completed successfully.');
        // Aquí podrías seguir con la ejecución de la app si la migración es exitosa
      } else {
        console.error('Migration failed.');
      }
    });
  } else {
    console.error('Migration script not found!');
  }
};

// Función principal
const checkAndMigrate = () => {
  const newVersion = getNewVersionFromPackage();

  // Comparar versiones y ejecutar migración si es necesario
  if (shouldMigrate(currentVersion, newVersion)) {
    runMigration();
  } else {
    console.log('No migration needed. Versions are up-to-date.');
  }
};

checkAndMigrate();
