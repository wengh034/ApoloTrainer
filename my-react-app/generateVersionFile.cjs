const fs = require('fs');
const path = require('path');
const { version } = require('./package.json');

const content = `export const appVersion = "${version}";\n`;

fs.writeFileSync(path.join(__dirname, 'src', 'version.js'), content);
console.log(`Version file generated with version: ${version}`);

/*
npm version patch Para incrementar la versión de parche (de 1.0.0 a 1.0.1)
npm version minor Para incrementar la versión menor (de 1.0.0 a 1.1.0)
npm version major Para incrementar la versión mayor (de 1.0.0 a 2.0.0)
 */