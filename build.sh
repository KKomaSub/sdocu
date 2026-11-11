#!/bin/sh
set -eu

# Keep Pages Functions in the repository root, outside the static output directory.
rm -rf dist
mkdir -p dist/assets
cp index.html dist/index.html
cp _headers dist/_headers
cp assets/matchmaking.js dist/assets/matchmaking.js
cp assets/i18n.js dist/assets/i18n.js
cp assets/keyboard-guide.js dist/assets/keyboard-guide.js
