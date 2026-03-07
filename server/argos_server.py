#!/usr/bin/env python3
"""FastAPI translation server using Google translate endpoint."""

import argparse
import logging
import os

import requests
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"
REQUEST_TIMEOUT_SECONDS = 15

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="StudyExplain AI Translate API", version="2.0.0")

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]
has_wildcard_origin = "*" in allowed_origins or not allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=not has_wildcard_origin,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranslateRequest(BaseModel):
    text: str
    source: str = "en"
    target: str = "ml"


class TranslateResponse(BaseModel):
    translatedText: str


def translate_with_google(text: str, source: str, target: str) -> str:
    params = {
        "client": "gtx",
        "sl": source,
        "tl": target,
        "dt": "t",
        "q": text,
    }

    try:
        response = requests.get(
            GOOGLE_TRANSLATE_URL,
            params=params,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        logger.exception("Google translate request failed")
        raise HTTPException(status_code=502, detail=f"Translation request failed: {exc}") from exc
    except ValueError as exc:
        logger.exception("Google translate returned non-JSON response")
        raise HTTPException(status_code=502, detail="Translation service returned invalid JSON") from exc

    try:
        translated = "".join(segment[0] for segment in data[0] if segment and segment[0]).strip()
    except (TypeError, IndexError) as exc:
        logger.exception("Unexpected Google translate payload")
        raise HTTPException(status_code=502, detail="Unexpected translation response format") from exc

    if not translated:
        raise HTTPException(status_code=502, detail="Translation service returned empty text")

    return translated


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "google-translate-endpoint",
    }

@app.get("/ping")
def ping():
    return {"status": "alive"}

@app.post("/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest) -> TranslateResponse:
    text = payload.text.strip()
    source = payload.source.strip() or "en"
    target = payload.target.strip() or "ml"

    if not text:
        raise HTTPException(status_code=400, detail="Missing text")

    logger.info("Translating text: source=%s target=%s chars=%s", source, target, len(text))
    translated = translate_with_google(text, source, target)
    return TranslateResponse(translatedText=translated)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
