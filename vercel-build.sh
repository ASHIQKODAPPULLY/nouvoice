#!/bin/bash

echo "Starting Vercel build process..."

# Install dependencies with legacy peer deps flag
npm install --legacy-peer-deps

# Build the Next.js application
npm run build

echo "Build process completed!"
