from services.nim_client import chat_completion_json

SYSTEM_PROMPT = (
    "You are a legal clause extraction assistant. You read legal documents and "
    "identify clauses of specific types, quoting the relevant text and explaining "
    "it in plain English. You only report clauses that are actually present in "
    "the document — never invent or infer clauses that aren't there. "
    "You always respond with valid JSON and nothing else: no preamble, no "
    "markdown code fences, no commentary."
)

CLAUSE_TYPES = ["termination", "payment", "confidentiality", "liability"]

MAX_CHARS = 12000


async def detect_clauses(text: str) -> dict:
    truncated = text[:MAX_CHARS]

    user_prompt = f"""Analyze the legal document below and extract clauses of these types:
{", ".join(CLAUSE_TYPES)}

For each clause type, return up to 3 relevant clauses. For each clause found, include:
- "excerpt": the exact or near-exact text from the document
- "explanation": a one-sentence plain-English explanation of what it means

If a clause type is not present in the document, return an empty list for it.

Respond ONLY with a JSON object in this exact shape (no other text):
{{
  "termination": [{{"excerpt": "...", "explanation": "..."}}],
  "payment": [{{"excerpt": "...", "explanation": "..."}}],
  "confidentiality": [{{"excerpt": "...", "explanation": "..."}}],
  "liability": [{{"excerpt": "...", "explanation": "..."}}]
}}

Document:
\"\"\"
{truncated}
\"\"\""""

    result = await chat_completion_json(
        SYSTEM_PROMPT, user_prompt, max_tokens=900, temperature=0.1
    )

    # Defensive fallback: guarantee all expected keys exist even if the
    # model omitted one, so the frontend doesn't have to guard against it.
    if "error" not in result:
        for clause_type in CLAUSE_TYPES:
            result.setdefault(clause_type, [])

    return result