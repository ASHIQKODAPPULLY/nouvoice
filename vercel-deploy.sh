#!/bin/bash

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel if needed
vercel login

# Deploy the project
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!"
