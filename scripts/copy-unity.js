import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function copyFolderRecursiveSync(source, target) {
    // Crear el directorio de destino si no existe
    if (!statSync(target).isDirectory()) {
        mkdirSync(target, { recursive: true });
    }

    // Leer todos los archivos del directorio fuente
    const files = readdirSync(source);

    // Copiar cada archivo
    files.forEach(file => {
        const sourcePath = join(source, file);
        const targetPath = join(target, file);

        const stat = statSync(sourcePath);

        if (stat.isFile()) {
            try {
                copyFileSync(sourcePath, targetPath);
                console.log(`Copied: ${sourcePath} -> ${targetPath}`);
            } catch (err) {
                console.error(`Error copying file ${sourcePath}:`, err);
            }
        } else if (stat.isDirectory()) {
            try {
                mkdirSync(targetPath, { recursive: true });
                copyFolderRecursiveSync(sourcePath, targetPath);
            } catch (err) {
                console.error(`Error creating directory ${targetPath}:`, err);
            }
        }
    });
}

try {
    const sourceDir = join(rootDir, 'public', 'Build');
    const targetDir = join(rootDir, 'dist', 'Build');

    console.log('Current directory:', process.cwd());
    console.log('Source directory:', sourceDir);
    console.log('Target directory:', targetDir);

    // Crear el directorio de destino
    mkdirSync(targetDir, { recursive: true });

    // Copiar los archivos
    copyFolderRecursiveSync(sourceDir, targetDir);

    console.log('Unity files copied successfully!');
} catch (error) {
    console.error('Error copying Unity files:', error);
    process.exit(1);
} 