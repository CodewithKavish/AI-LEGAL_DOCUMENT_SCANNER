from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from dotenv import load_dotenv
load_dotenv()  # loads NVIDIA_API_KEY (and optional NIM_MODEL) from .env

from services.extractor import extract_text_from_pdf
from services.summarizer import summarize_text
from services.clause_detector import detect_clauses
from services.risk_analyzer import analyze_risks
from services.embedding_service import get_embeddings
from services.vector_store import VectorStore
from services.qa_services import answer_question

from fastapi import HTTPException

from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    username: str
    password: str

from services.auth import (

    fake_users_db,

    hash_password,

    verify_password,

    create_access_token

)

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Global vector store (for demo purpose)
vector_store = None


# ✅ Chunking function (PUT IT HERE)
def chunk_text(text, chunk_size=500):
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]


# 📄 Upload Endpoint
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    global vector_store

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    text = extract_text_from_pdf(file_path)

    # Generate summary (now an LLM call via NIM — must be awaited)
    summary = await summarize_text(text)

    # Detect clauses (now an LLM call via NIM — must be awaited)
    clauses = await detect_clauses(text)

    # Analyze risks (now an LLM call via NIM — must be awaited)
    risks = await analyze_risks(text)

    # 🔥 Build vector store for chat
    chunks = chunk_text(text)
    embeddings = get_embeddings(chunks)

    vector_store = VectorStore(len(embeddings[0]))
    vector_store.add(embeddings, chunks)

    return {
        "filename": file.filename,
        "summary": summary,
        "clauses": clauses,
        "risks": risks
    }


# 💬 Chat Endpoint
@app.post("/chat/")
async def chat_with_doc(question: str = Body(...)):
    global vector_store

    if vector_store is None:
        return {"error": "Please upload a document first."}

    # Convert question to embedding
    query_embedding = get_embeddings([question])[0]

    # Retrieve relevant chunks
    relevant_chunks = vector_store.search(query_embedding)

    context = " ".join(relevant_chunks)

    # Generate answer (now an LLM call via NIM — must be awaited)
    answer = await answer_question(context, question)

    return {
        "question": question,
        "answer": answer
    }

@app.post("/register/")
def register(user: User):

    if user.username in fake_users_db:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    fake_users_db[user.username] = {
        "username": user.username,
        "password": hash_password(user.password)
    }

    return {
        "message": "User registered successfully"
    }

@app.post("/login/")
def login(user: User):

    db_user = fake_users_db.get(user.username)

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username"
        )

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "sub": user.username
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }