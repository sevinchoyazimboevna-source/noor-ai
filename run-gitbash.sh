#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ ! -d .venv ]; then py -m venv .venv; fi
source .venv/Scripts/activate
pip install -r requirements.txt
[ -f .env ] || cp .env.example .env
start http://127.0.0.1:8000
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
