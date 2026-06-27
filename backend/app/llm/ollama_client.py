import os
import json
import httpx
import logging
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

from app.core.config import settings

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")

# Fallback NVIDIA API Configurations
NVIDIA_API_KEY = settings.NVIDIA_API_KEY
NVIDIA_CHAT_MODEL = settings.NVIDIA_CHAT_MODEL
NVIDIA_BASE_URL = settings.NVIDIA_BASE_URL

def get_headers():
    headers = {"Content-Type": "application/json"}
    if OLLAMA_API_KEY:
        headers["Authorization"] = f"Bearer {OLLAMA_API_KEY}"
    return headers

async def check_ollama_online() -> bool:
    if OLLAMA_API_KEY:
        return True
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(OLLAMA_BASE_URL, timeout=1.0)
            return res.status_code == 200
    except Exception:
        return False

async def generate(prompt: str, system: str = "") -> str:
    ollama_online = await check_ollama_online()
    ollama_success = False

    if ollama_online:
        logger.info(f"Ollama is online. Attempting generation with model {OLLAMA_MODEL}...")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": OLLAMA_MODEL,
                        "prompt": prompt,
                        "system": system,
                        "stream": False
                    },
                    headers=get_headers(),
                    timeout=120.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if "error" not in data:
                        return data.get("response", "")
                    else:
                        logger.error(f"Ollama generation error: {data['error']}")
                else:
                    logger.warning(f"Ollama API returned status {response.status_code}. Trying fallback.")
        except Exception as e:
            logger.warning(f"Ollama generation failed with exception: {e}. Trying fallback.")

    if NVIDIA_API_KEY:
        logger.info(f"Using NVIDIA completions API fallback with model {NVIDIA_CHAT_MODEL}...")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    NVIDIA_BASE_URL,
                    json={
                        "model": NVIDIA_CHAT_MODEL,
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.2,
                        "max_tokens": 1024,
                        "stream": False
                    },
                    headers={
                        "Authorization": f"Bearer {NVIDIA_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    timeout=120.0
                )
                if response.status_code == 200:
                    choices = response.json().get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "")
                else:
                    error_detail = response.text
                    logger.error(f"NVIDIA API returned error status {response.status_code}: {error_detail}")
        except Exception as e:
            logger.exception(f"NVIDIA fallback generation call failed: {e}")

    return "Error: Could not connect to any AI backend or both Ollama and NVIDIA generation failed."


async def stream(prompt: str, system: str = "") -> AsyncGenerator[str, None]:
    ollama_online = await check_ollama_online()
    ollama_success = False

    if ollama_online:
        logger.info(f"Ollama is online. Attempting streaming generation with model {OLLAMA_MODEL}...")
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": OLLAMA_MODEL,
                        "prompt": prompt,
                        "system": system,
                        "stream": True
                    },
                    headers=get_headers(),
                    timeout=120.0
                ) as response:
                    if response.status_code == 200:
                        ollama_success = True
                        async for chunk in response.aiter_lines():
                            if chunk:
                                try:
                                    data = json.loads(chunk)
                                    if "error" in data:
                                        logger.error(f"Ollama streaming generation error: {data['error']}")
                                        ollama_success = False
                                        break
                                    yield data.get("response", "")
                                    if data.get("done"):
                                        break
                                except json.JSONDecodeError:
                                    pass
                    else:
                        logger.warning(f"Ollama API returned status {response.status_code}. Will try fallback.")
        except Exception as e:
            logger.warning(f"Ollama streaming failed with exception: {e}. Will try fallback.")

    if not ollama_success:
        if NVIDIA_API_KEY:
            logger.info(f"Using NVIDIA completions API fallback with model {NVIDIA_CHAT_MODEL}...")
            try:
                async with httpx.AsyncClient() as client:
                    async with client.stream(
                        "POST",
                        NVIDIA_BASE_URL,
                        json={
                            "model": NVIDIA_CHAT_MODEL,
                            "messages": [
                                {"role": "system", "content": system},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.2,
                            "top_p": 0.7,
                            "max_tokens": 1024,
                            "stream": True
                        },
                        headers={
                            "Authorization": f"Bearer {NVIDIA_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        timeout=120.0
                    ) as response:
                        if response.status_code == 200:
                            async for line in response.aiter_lines():
                                if line.startswith("data: "):
                                    data_str = line[6:].strip()
                                    if data_str == "[DONE]":
                                        break
                                    try:
                                        data = json.loads(data_str)
                                        choices = data.get("choices", [])
                                        if choices:
                                            delta = choices[0].get("delta", {})
                                            content = delta.get("content", "")
                                            if content:
                                                yield content
                                    except json.JSONDecodeError:
                                        pass
                            return
                        else:
                            error_detail = await response.aread()
                            logger.error(f"NVIDIA API returned error status {response.status_code}: {error_detail.decode('utf-8', errors='ignore')}")
            except Exception as e:
                logger.exception(f"NVIDIA fallback streaming call failed: {e}")

        # If both fail
        yield "Error: Unable to generate response. Ollama is offline or returned an error, and the NVIDIA fallback model failed or was not configured."
