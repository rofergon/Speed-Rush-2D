const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BUILD_DIR = path.join(process.cwd(), 'public', 'Build');

// Lista de archivos a procesar
const files = [
  'build.framework.js.br',
  'build.data.br',
  'build.wasm.br'
];

// Función para descomprimir un archivo
async function decompressFile(inputPath) {
  const outputPath = inputPath.replace('.br', '');
  
  try {
    const input = fs.readFileSync(inputPath);
    const decompressed = zlib.brotliDecompressSync(input);
    fs.writeFileSync(outputPath, decompressed);
    console.log(`Descomprimido: ${outputPath}`);
  } catch (error) {
    console.error(`Error al descomprimir ${inputPath}:`, error);
  }
}

// Procesar todos los archivos
async function processFiles() {
  for (const file of files) {
    const filePath = path.join(BUILD_DIR, file);
    if (fs.existsSync(filePath)) {
      await decompressFile(filePath);
    } else {
      console.warn(`Archivo no encontrado: ${filePath}`);
    }
  }
}

// Ejecutar el proceso
processFiles().catch(console.error); 