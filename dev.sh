#!/bin/bash
# Dev script: builds dist/ and serves it locally

set -e

# Build
mkdir -p dist/styles dist/scripts dist/images dist/datasets
npm run build
cp src/index.html dist/
cp src/scripts/components.js src/scripts/main.js dist/scripts/
cp src/images/* dist/images/
cp src/datasets/* dist/datasets/

echo ""
echo "Build complete. Serving dist/ on http://localhost:3000"
echo "Press Ctrl+C to stop."
echo ""

# Serve
bunx serve dist -l 3000
