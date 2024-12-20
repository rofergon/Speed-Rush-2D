#!/bin/bash

# Mostrar el directorio actual y su contenido
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Mostrar el contenido del directorio public
echo "Contents of public directory:"
ls -la public/

# Build the React app
echo "Building React app..."
npm run build

# Create the Build directory in dist if it doesn't exist
echo "Creating dist/Build directory..."
mkdir -p dist/Build

# Verificar si existe el directorio public/Build
if [ -d "public/Build" ]; then
    echo "Copying Unity files..."
    cp -rv public/Build/* dist/Build/
else
    echo "Warning: public/Build directory not found"
    # Listar el contenido del directorio public para debug
    echo "Contents of public directory:"
    ls -la public/
    exit 1
fi

# Verificar que los archivos se copiaron correctamente
echo "Contents of dist/Build directory:"
ls -la dist/Build/