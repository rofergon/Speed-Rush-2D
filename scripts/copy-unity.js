import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fs = require('fs');

const SOURCE_DIR = join(process.cwd(), 'public', 'Build');
const DEST_DIR = join(process.cwd(), 'dist', 'Build');

// Asegurarse de que el directorio de destino existe
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Copiar todos los archivos del directorio Build
fs.readdirSync(SOURCE_DIR).forEach(file => {
  const sourcePath = join(SOURCE_DIR, file);
  const destPath = join(DEST_DIR, file);
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copiado: ${file}`);
  } catch (error) {
    console.error(`Error al copiar ${file}:`, error);
  }
});

console.log('Proceso de copia completado'); 