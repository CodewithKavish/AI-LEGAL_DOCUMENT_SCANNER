from services.nim_client import chat_completion

SYSTEM_PROMPT = (
    "You are a legal document Q&A assistant. Answer the user's question using "
    "only the provided document context. Be direct, clear, and concise. "
    "If the context does not contain enough information to answer, say so "
    "plainly instead of guessing. Do not give formal legal advice; frame "
    "answers as informational explanations of the document's contents."
)


async def answer_question(context: str, question: str) -> str:
    user_prompt = f"""Document context:
\"\"\"
{context}
\"\"\"

Question: {question}

Answer the question using only the context above."""

    answer = await chat_completion(
        SYSTEM_PROMPT, user_prompt, max_tokens=350, temperature=0.2
    )
    return answer.strip()