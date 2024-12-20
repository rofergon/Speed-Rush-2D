#!/bin/bash

# Build the React app
npm run build

# Create the Build directory in dist if it doesn't exist
mkdir -p dist/Build

# Copy Unity files
cp -r public/Build/* dist/Build/ 