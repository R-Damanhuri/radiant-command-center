#!/bin/bash
# Command Center Startup Script

# Explicitly set PATH to include npm
export PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/bin:/usr/bin:/bin

# Navigate to command-center directory
cd /home/ubuntu/.openclaw/workspace/command-center

# Run Next.js dev server (let it use default port 3000)
/home/linuxbrew/.linuxbrew/bin/npm run dev
