// hooks/useApi.ts

const API_URL = "http://127.0.0.1:8000"; // Cambia a la URL de tu servidor si es necesario

export const testNeo4j = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/neo4j-test`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error connecting to Neo4J endpoint:", error);
    throw error;
  }
};

// Función para guardar un audio
export const saveAudio = async (file: File, name: string): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  try {
    const response = await fetch(`${API_URL}/audios/save`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error guardando el audio:", error);
    throw error;
  }
};

// Función para obtener todos los audios
export const getAllAudios = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/audios`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo los audios:", error);
    throw error;
  }
};

export const transcribeAudio = async (audioId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/transcribe/${audioId}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al transcribir el audio:", error);
    throw error;
  }
};

export const queryLangChain = async (question: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error connecting to LangChain endpoint:", error);
    throw error;
  }
};

export const getAllTranscriptions = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/transcriptions`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo las transcripciones:", error);
    throw error;
  }
};
