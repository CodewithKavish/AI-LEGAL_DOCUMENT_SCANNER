from services.nim_client import chat_completion_json

SYSTEM_PROMPT = (
    "You are a legal risk analysis assistant. You review contracts and legal "
    "documents to flag clauses that could be risky or disadvantageous to the "
    "signing party (e.g. one-sided terms, unusual liability, auto-renewals, "
    "non-refundable payments). You only flag risks that are genuinely supported "
    "by the text — never invent risks that aren't there. "
    "You always respond with valid JSON and nothing else: no preamble, no "
    "markdown code fences, no commentary."
)

RISK_TYPES = ["high_liability", "auto_renewal", "no_refund", "one_sided_termination"]

MAX_CHARS = 12000


async def analyze_risks(text: str) -> dict:
    truncated = text[:MAX_CHARS]

    user_prompt = f"""Analyze the legal document below for these risk categories:
{", ".join(RISK_TYPES)}

For each risk category, return up to 3 findings. For each finding include:
- "excerpt": the exact or near-exact text from the document that raises the risk
- "severity": one of "low", "medium", "high"
- "explanation": a one-sentence plain-English explanation of why this matters

If a risk category is not present, omit its key entirely from the JSON output.

Respond ONLY with a JSON object in this exact shape (no other text):
{{
  "high_liability": [{{"excerpt": "...", "severity": "...", "explanation": "..."}}],
  "auto_renewal": [...],
  "no_refund": [...],
  "one_sided_termination": [...]
}}

Document:
\"\"\"
{truncated}
\"\"\""""

    result = await chat_completion_json(
        SYSTEM_PROMPT, user_prompt, max_tokens=900, temperature=0.1
    )
    return result