import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function copyFolderRecursiveSync(source, target) {
    // Verificar si el directorio fuente existe
    if (!existsSync(source)) {
        console.error(`Source directory does not exist: ${source}`);
        return false;
    }

    // Crear el directorio de destino si no existe
    try {
        mkdirSync(target, { recursive: true });
    } catch (err) {
        console.error(`Error creating target directory ${target}:`, err);
        return false;
    }

    try {
        // Leer todos los archivos del directorio fuente
        const files = readdirSync(source);
        console.log(`Files in ${source}:`, files);

        // Copiar cada archivo
        files.forEach(file => {
            const sourcePath = join(source, file);
            const targetPath = join(target, file);

            try {
                const stat = statSync(sourcePath);

                if (stat.isFile()) {
                    copyFileSync(sourcePath, targetPath);
                    console.log(`Copied file: ${sourcePath} -> ${targetPath}`);
                } else if (stat.isDirectory()) {
                    mkdirSync(targetPath, { recursive: true });
                    copyFolderRecursiveSync(sourcePath, targetPath);
                }
            } catch (err) {
                console.error(`Error processing ${sourcePath}:`, err);
            }
        });
        return true;
    } catch (err) {
        console.error(`Error reading source directory ${source}:`, err);
        return false;
    }
}

try {
    // Listar el contenido del directorio actual
    console.log('Current working directory:', process.cwd());
    console.log('Contents of current directory:', readdirSync('.'));
    console.log('Contents of src directory:', existsSync('src') ? readdirSync('src') : 'src directory not found');
    console.log('Contents of src/public directory:', existsSync('src/public') ? readdirSync('src/public') : 'src/public directory not found');

    const sourceDir = join(rootDir, 'src', 'public', 'Build');
    const targetDir = join(rootDir, 'dist', 'Build');

    console.log('Source directory:', sourceDir);
    console.log('Target directory:', targetDir);
    console.log('Source directory exists:', existsSync(sourceDir));

    // Intentar diferentes rutas si la principal no funciona
    const possibleSourceDirs = [
        sourceDir,
        join(process.cwd(), 'src', 'public', 'Build'),
        join(process.cwd(), 'src', 'Build'),
        join(process.cwd(), 'public', 'Build'),
        join(process.cwd(), 'Build')
    ];

    let success = false;
    for (const dir of possibleSourceDirs) {
        console.log(`Trying directory: ${dir}`);
        if (existsSync(dir)) {
            console.log(`Found Build directory at: ${dir}`);
            success = copyFolderRecursiveSync(dir, targetDir);
            if (success) break;
        }
    }

    if (!success) {
        throw new Error('Could not find or copy Unity build files');
    }

    console.log('Unity files copied successfully!');
} catch (error) {
    console.error('Error copying Unity files:', error);
    process.exit(1);
} 