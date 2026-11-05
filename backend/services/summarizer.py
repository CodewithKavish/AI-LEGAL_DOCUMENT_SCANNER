from services.nim_client import chat_completion

SYSTEM_PROMPT = (
    "You are a legal document analysis assistant. You summarize contracts and "
    "legal documents in clear, plain English for a non-lawyer audience. "
    "Be concise and accurate. Never invent facts, parties, dates, or terms that "
    "are not present in the document."
)

# Keep prompts within a safe context budget. Increase if your NIM model
# supports a larger context window and your docs are long.
MAX_CHARS = 12000


async def summarize_text(text: str) -> str:
    truncated = text[:MAX_CHARS]

    user_prompt = f"""Summarize the following legal document for someone with no legal background.

Return the summary in this format:
1. A short 2-3 sentence overview of what the document is and its overall purpose.
2. A bullet list of key points: parties involved, main obligations, important dates, and amounts of money if mentioned.

Document:
\"\"\"
{truncated}
\"\"\""""

    summary = await chat_completion(
        SYSTEM_PROMPT, user_prompt, max_tokens=450, temperature=0.2
    )
    return summary.strip()