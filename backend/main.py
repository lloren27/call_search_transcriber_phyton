from fastapi import FastAPI, UploadFile, File
import os

# Importar las funciones de los módulos
from app.database import run_query, close_connection
from app.transcriber import transcribe_audio
from app.langchain_utils import query_langchain

app = FastAPI()

# Ruta de prueba para Neo4J
@app.get("/neo4j-test")
def test_neo4j():
    query = "MATCH (n) RETURN n LIMIT 5"
    result = run_query(query)
    return {"result": result}

# Ruta para transcribir archivos de audio con Whisper
@app.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    transcription = transcribe_audio(file_path)
    return {"transcription": transcription}

# Ruta para realizar preguntas con LangChain
@app.post("/query")
async def query_langchain_endpoint(question: str):
    response = query_langchain(question)
    return {"response": response}

# Cerrar la conexión a Neo4J al apagar el servidor
@app.on_event("shutdown")
def shutdown_event():
    close_connection()
