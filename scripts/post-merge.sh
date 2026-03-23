#!/bin/bash
set -e

echo "=== Post-merge setup ==="

echo "Installing dependencies..."
npm install --no-audit --no-fund < /dev/null

echo "Building project..."
npm run build < /dev/null

echo "=== Post-merge setup complete ==="
