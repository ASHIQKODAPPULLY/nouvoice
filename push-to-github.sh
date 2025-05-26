#!/bin/bash

# Add all changes
git add .

# Commit changes with timestamp
git commit -m "Update $(date +"%Y-%m-%d %H:%M:%S")"

# Push to GitHub
git push -u origin main
