from fastapi import FastAPI, UploadFile, File, HTTPException
from datetime import datetime
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

# Endpoint para transcribir un audio existente usando su ID
@app.post("/transcribe/{audio_id}")
async def transcribe_audio_endpoint(audio_id: str):
    # Buscar el audio en la base de datos por su ID
    query = "MATCH (a:Audio {file_path: $audio_id}) RETURN a.file_path AS file_path"
    result = run_query(query, {"audio_id": audio_id})

    if not result:
        raise HTTPException(status_code=404, detail="Audio no encontrado")

    # Obtener la ruta del archivo de audio
    file_path = result[0]["file_path"]

    # Transcribir el archivo usando la función `transcribe_audio`
    transcription = transcribe_audio(file_path)

    # Guardar la transcripción en la base de datos
    update_query = """
    MATCH (a:Audio {file_path: $audio_id})
    SET a.transcription = $transcription, a.transcribed = true
    RETURN a
    """
    run_query(update_query, {"audio_id": audio_id, "transcription": transcription})

    return {"transcription": transcription}

# Ruta para realizar preguntas con LangChain
@app.post("/query")
async def query_langchain_endpoint(question: str):
    response = query_langchain(question)
    return {"response": response}


@app.post("/audios/save")
async def save_audio(file: UploadFile = File(...), name: str = None):
    # Crear un nombre de archivo único
    file_path = f"audio_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Guardar la referencia del archivo en la base de datos
    query = """
    CREATE (a:Audio {name: $name, file_path: $file_path, date: $date})
    RETURN a
    """
    params = {"name": name or file.filename, "file_path": file_path, "date": datetime.now().isoformat()}
    result = run_query(query, params)
    return {"message": "Audio guardado correctamente", "audio": result}

@app.get("/audios")
def get_all_audios():
    query = """
    MATCH (a:Audio)
    RETURN a.name AS name, a.file_path AS file_path, a.date AS date
    ORDER BY a.date DESC
    """
    result = run_query(query)
    return {"audios": result}

# Endpoint para obtener todas las transcripciones
@app.get("/transcriptions")
def get_all_transcriptions():
    query = """
    MATCH (a:Audio)
    WHERE a.transcribed = true
    RETURN a.name AS name, a.file_path AS file_path, a.transcription AS transcription, a.date AS date
    ORDER BY a.date DESC
    """
    result = run_query(query)
    return {"transcriptions": result}


# Cerrar la conexión a Neo4J al apagar el servidor
@app.on_event("shutdown")
def shutdown_event():
    close_connection()
