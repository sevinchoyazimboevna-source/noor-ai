@echo off
title NOOR AI
cd /d "%~dp0"
if not exist .venv (
  py -m venv .venv
)
call .venv\Scripts\activate
pip install -r requirements.txt
if not exist .env copy .env.example .env
start "NOOR AI" http://127.0.0.1:8000
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
