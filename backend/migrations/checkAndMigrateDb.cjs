const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { version: currentVersion } = require('../package.json');

const log = (...args) => process.send && process.send({ log: args.join(' ') });

const getNewVersionFromPackage = () => {
  const newPackagePath = path.join(process.resourcesPath, 'backend', 'package.json');
  if (fs.existsSync(newPackagePath)) {
    const newPackageJson = require(newPackagePath);
    return newPackageJson.version;
  }
  return null;
};

const shouldMigrate = (currentVersion, newVersion) => {
  if (!newVersion) {
    log('No new version found. Migration cannot proceed.');
    return false;
  }
  return semver.neq(currentVersion, newVersion); // Verifica si las versiones son diferentes
};

const ignoreNewDatabaseIfVersionsMatch = () => {
  const newDbPath = path.join(process.resourcesPath, 'backend', 'newDatabase.db');
  const oldDbPath = path.join(process.resourcesPath, 'backend', 'oldDatabase.db');

  if (fs.existsSync(newDbPath)) {
    log('Versions are equal. Ignoring the new database and keeping the old one.');
    fs.unlinkSync(newDbPath); // Elimina la base de datos nueva
    log('New database ignored.');
  } else {
    log('New database does not exist. Nothing to ignore.');
  }
};

const runMigration = () => {
  const migrationScriptPath = path.join(__dirname, 'migrateDb.js');
  if (fs.existsSync(migrationScriptPath)) {
    const migrationProcess = require('child_process').fork(migrationScriptPath);
    migrationProcess.on('message', (message) => {
      log(`Migration process message: ${message}`);
    });
    migrationProcess.on('exit', (code) => {
      if (code === 0) {
        log('Migration completed successfully.');
        process.exit(0); // Éxito
      } else {
        log('Migration failed.');
        process.exit(1); // Error
      }
    });
  } else {
    log('Migration script not found!');
    process.exit(1);
  }
};

const checkAndMigrate = () => {
  const newVersion = getNewVersionFromPackage();

  if (!newVersion) {
    log('New version not found. Exiting migration process.');
    process.exit(1);
  }

  // Si las versiones son iguales, ignorar la nueva base de datos
  if (semver.eq(currentVersion, newVersion)) {
    ignoreNewDatabaseIfVersionsMatch();
    process.exit(0);
  }

  // Si las versiones son diferentes, realizar la migración
  if (shouldMigrate(currentVersion, newVersion)) {
    runMigration();
  } else {
    log('No migration needed.');
    process.exit(0);
  }
};

checkAndMigrate();
