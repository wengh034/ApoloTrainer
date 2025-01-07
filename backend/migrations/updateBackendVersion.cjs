// node updateBackendVersion.cjs major   # Incrementa la versión mayor
// node updateBackendVersion.cjs minor   # Incrementa la versión menor
// node updateBackendVersion.cjs patch   # Incrementa el patch (por defecto)

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { version } = require('../package.json');  // Versión actual del backend

// Función para incrementar la versión (major, minor o patch)
const incrementVersion = (version, incrementType) => {
    let [major, minor, patch] = version.split('.').map(Number);

    if (incrementType === 'major') {
        major++;
        minor = 0;
        patch = 0;
    } else if (incrementType === 'minor') {
        minor++;
        patch = 0;
    } else if (incrementType === 'patch') {
        patch++;
    }

    return `${major}.${minor}.${patch}`;
};

// Actualiza la versión en la base de datos
const updateDbVersion = (dbPath, newVersion) => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error al abrir la base de datos:', err);
            return;
        }

        // Actualizar la versión de la base de datos
        db.run("UPDATE Meta SET value = ? WHERE key = 'db_version'", [newVersion], (err) => {
            if (err) {
                console.error('Error al actualizar la versión de la base de datos:', err);
                return;
            }
            console.log(`Versión de la base de datos actualizada a: ${newVersion}`);
            db.close();
        });
    });
};

// Actualiza la versión en el package.json del backend
const updateBackendVersionInPackageJson = (newVersion) => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = require(packageJsonPath);

    // Actualizar la versión del package.json
    packageJson.version = newVersion;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2)); // Escribir el package.json con la nueva versión
    console.log(`Versión del backend actualizada a: ${newVersion}`);
};

// Leer el tipo de incremento (major, minor, patch) desde los argumentos
const incrementType = process.argv[2] || 'patch'; // Por defecto incrementa el patch

// Obtener la nueva versión incrementada
const newVersion = incrementVersion(version, incrementType);

// Ruta de la base de datos
const dbPath = path.join(__dirname, '..', 'database.db');

// Ejecutar las actualizaciones
updateDbVersion(dbPath, newVersion);
updateBackendVersionInPackageJson(newVersion);
