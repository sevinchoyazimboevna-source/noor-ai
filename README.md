# NOOR AI

An English AI assistant with a private FastAPI backend and a polished browser chat UI.

## Run on Windows

1. Open `.env` and put your OpenAI API key after `OPENAI_API_KEY=`.
2. Double-click `run-windows.bat`.
3. Open `http://127.0.0.1:8000` if the browser does not open automatically.

The API key remains on your computer; it is never sent to the browser.

## Features

- English-only assistant behavior
- Persistent local chat history in the browser
- Responsive dark UI
- Copy answers and clear conversations
- Backend health endpoint at `/api/health`

## Important

This project uses the OpenAI API and needs an API key with available billing/credits. Do not commit `.env` to GitHub.
