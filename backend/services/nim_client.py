import os
import json
from openai import AsyncOpenAI

# NVIDIA API Catalog is OpenAI-compatible.
# Set NVIDIA_API_KEY in your environment (or a .env file loaded via python-dotenv).
NIM_API_KEY = os.environ.get("NVIDIA_API_KEY")
NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"

# Fast, small instruct model by default. Override with NIM_MODEL env var
# if you want to try a larger model for better accuracy on complex documents.
NIM_MODEL = os.environ.get("NIM_MODEL", "meta/llama-3.1-8b-instruct")

if not NIM_API_KEY:
    raise RuntimeError(
        "NVIDIA_API_KEY is not set. Get a key from https://build.nvidia.com "
        "and set it as an environment variable before starting the app."
    )

_client = AsyncOpenAI(base_url=NIM_BASE_URL, api_key=NIM_API_KEY)


async def chat_completion(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 512,
    temperature: float = 0.2,
) -> str:
    """Single chat completion call against NIM. Returns raw text content."""
    response = await _client.chat.completions.create(
        model=NIM_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=0.9,
    )
    return response.choices[0].message.content or ""


def _strip_code_fence(raw: str) -> str:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
    return cleaned.strip()


async def chat_completion_json(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 800,
    temperature: float = 0.1,
) -> dict:
    """
    Chat completion call that expects a JSON object back.
    Falls back to a safe error dict if the model doesn't return valid JSON,
    so callers never crash on a parsing failure.
    """
    raw = await chat_completion(system_prompt, user_prompt, max_tokens, temperature)
    cleaned = _strip_code_fence(raw)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error": "model_did_not_return_valid_json", "raw": raw}