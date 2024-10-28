import whisper
import os

model = whisper.load_model("base")

def transcribe_audio(file_path: str) -> str:
    result = model.transcribe(file_path)
    os.remove(file_path)  # Opcional: Elimina el archivo temporal
    return result["text"]
