import os
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import AsyncOpenAI
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"
load_dotenv(ROOT / ".env")

app = FastAPI(title="NOOR AI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are NOOR AI, a capable, friendly English AI assistant.
Always answer in clear English. Be helpful with learning, programming, writing,
planning, and everyday questions. Use concise structure unless the user requests
detail. Never claim you performed actions you did not perform."""


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=12000)


class ChatRequest(BaseModel):
    messages: list[Message] = Field(min_length=1, max_length=30)


class ChatResponse(BaseModel):
    reply: str


def get_client() -> tuple[AsyncOpenAI, str]:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key or api_key == "paste_your_key_here":
        raise HTTPException(
            status_code=503,
            detail="AI is not connected yet. Add OPENAI_API_KEY to the .env file, then restart the app.",
        )
    return AsyncOpenAI(api_key=api_key), os.getenv("OPENAI_MODEL", "gpt-4.1-mini")


@app.get("/api/health")
async def health() -> dict:
    configured = bool(os.getenv("OPENAI_API_KEY", "").strip()) and os.getenv("OPENAI_API_KEY") != "paste_your_key_here"
    return {"ok": True, "assistant": "NOOR AI", "ai_configured": configured}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    client, model = get_client()
    try:
        completion = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *[{"role": message.role, "content": message.content} for message in payload.messages],
            ],
            temperature=0.7,
        )
        reply = completion.choices[0].message.content or "I could not generate a response. Please try again."
        return ChatResponse(reply=reply)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"The AI provider returned an error: {str(error)}") from error


app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="frontend")
