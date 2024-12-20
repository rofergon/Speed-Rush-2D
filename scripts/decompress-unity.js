import { createReadStream, createWriteStream } from 'fs';
import { createBrotliDecompress } from 'zlib';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function decompressFile(inputPath, outputPath) {
    try {
        await pipeline(
            createReadStream(inputPath),
            createBrotliDecompress(),
            createWriteStream(outputPath)
        );
        console.log(`Successfully decompressed ${inputPath} to ${outputPath}`);
    } catch (error) {
        console.error(`Error decompressing ${inputPath}:`, error);
        throw error;
    }
}

async function main() {
    const buildDir = join(rootDir, 'src', 'public', 'Build');
    const files = [
        ['build-run.data.br', 'build-run.data'],
        ['build-run.framework.js.br', 'build-run.framework.js'],
        ['build-run.wasm.br', 'build-run.wasm']
    ];

    for (const [brFile, outputFile] of files) {
        const inputPath = join(buildDir, brFile);
        const outputPath = join(buildDir, outputFile);
        await decompressFile(inputPath, outputPath);
    }
}

main().catch(console.error); 