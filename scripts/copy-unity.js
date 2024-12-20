import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function copyFolderRecursiveSync(source, target) {
    if (!existsSync(source)) {
        console.error(`Source directory does not exist: ${source}`);
        return false;
    }

    try {
        mkdirSync(target, { recursive: true });
        const files = readdirSync(source);
        
        files.forEach(file => {
            const sourcePath = join(source, file);
            const targetPath = join(target, file);

            try {
                const stat = statSync(sourcePath);
                if (stat.isFile()) {
                    copyFileSync(sourcePath, targetPath);
                    console.log(`Copied file: ${sourcePath} -> ${targetPath}`);
                } else if (stat.isDirectory()) {
                    copyFolderRecursiveSync(sourcePath, targetPath);
                }
            } catch (err) {
                console.error(`Error processing ${sourcePath}:`, err);
            }
        });
        return true;
    } catch (err) {
        console.error(`Error copying files:`, err);
        return false;
    }
}

try {
    // Mover archivos de src/public/Build a public/Build
    const sourceDir = join(rootDir, 'src', 'public', 'Build');
    const intermediateDir = join(rootDir, 'public', 'Build');
    const targetDir = join(rootDir, 'dist', 'Build');

    // Primero, copiar a public/Build
    if (existsSync(sourceDir)) {
        console.log('Copying files from src/public/Build to public/Build');
        copyFolderRecursiveSync(sourceDir, intermediateDir);
    }

    // Luego, asegurarse de que los archivos estén en dist/Build
    if (existsSync(intermediateDir)) {
        console.log('Copying files from public/Build to dist/Build');
        copyFolderRecursiveSync(intermediateDir, targetDir);
    }

    console.log('Unity files copied successfully!');
} catch (error) {
    console.error('Error copying Unity files:', error);
    process.exit(1);
} 