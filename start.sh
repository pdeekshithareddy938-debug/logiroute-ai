#!/usr/bin/env bash
# LogiRoute Fast Delivery Platform - Local Startup (Mac/Linux)

cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is not found. Please install Node.js v18+."
    exit 1
fi

node start-local.js
