#!/bin/sh
set -eu

# Pages Functions stay at the repository root, outside the static output.
rm -rf dist
mkdir -p dist
cp index.html manifest.webmanifest _headers _redirects dist/
cp -R assets .well-known dist/
