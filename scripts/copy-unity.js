const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(process.cwd(), 'public', 'Build');
const DEST_DIR = path.join(process.cwd(), 'dist', 'Build');

// Asegurarse de que el directorio de destino existe
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Copiar todos los archivos del directorio Build
fs.readdirSync(SOURCE_DIR).forEach(file => {
  const sourcePath = path.join(SOURCE_DIR, file);
  const destPath = path.join(DEST_DIR, file);
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copiado: ${file}`);
  } catch (error) {
    console.error(`Error al copiar ${file}:`, error);
  }
});

console.log('Proceso de copia completado'); 