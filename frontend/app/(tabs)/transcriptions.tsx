// app/tabs/transcriptions.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { getAllTranscriptions } from "../../hooks/useApi";

export default function Transcriptions() {
  const [transcriptions, setTranscriptions] = useState<
    { name: string; transcription: string; date: string }[]
  >([]);

  useEffect(() => {
    // Cargar todas las transcripciones al montar el componente
    const fetchTranscriptions = async () => {
      try {
        const response = await getAllTranscriptions();
        setTranscriptions(response.transcriptions);
      } catch (error) {
        console.error("Error al cargar las transcripciones:", error);
      }
    };

    fetchTranscriptions();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Transcripciones
      </Text>

      <FlatList
        data={transcriptions}
        keyExtractor={(item) => item.name + item.date}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            <Text style={{ color: "gray", marginBottom: 4 }}>
              {new Date(item.date).toLocaleString()}
            </Text>
            <Text>{item.transcription}</Text>
          </View>
        )}
      />
    </View>
  );
}
