// app/tabs/audios.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import RecordingItem from "../../types/recordingItem";
import { getAllAudios, saveAudio, transcribeAudio } from "../../hooks/useApi";

export default function Audios() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);

  const recordingOptions = {
    android: {
      extension: ".m4a",
      outputFormat: 2,
      audioEncoder: 3,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      audioQuality: 127,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {},
  };

  useEffect(() => {
    // Obtener todos los audios al cargar el componente
    const fetchAudios = async () => {
      try {
        const response = await getAllAudios();
        setRecordings(
          response.audios.map((audio: any) => ({
            id: audio.file_path,
            title: audio.name,
            uri: audio.file_path,
            transcribed: false,
          }))
        );
      } catch (error) {
        console.error("Error al cargar audios:", error);
      }
    };

    fetchAudios();
  }, []);

  const startRecording = async () => {
    try {
      // Solicitar permisos
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permisos de grabación denegados");
        return;
      }

      // Configuración de la grabación
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Iniciar la grabación
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Error al iniciar la grabación:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const fileName = `Audio ${recordings.length + 1}`;
        const file = await fetch(uri).then((res) => res.blob());

        // Guardar el audio en la base de datos
        const formFile = new File([file], fileName, { type: "audio/m4a" });
        await saveAudio(formFile, fileName);

        setRecordings([
          ...recordings,
          { id: uri, title: fileName, uri, transcribed: false },
        ]);
      }

      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error("Error al detener la grabación:", error);
    }
  };

  const deleteRecording = (id: string) => {
    Alert.alert(
      "Eliminar Audio",
      "¿Estás seguro de que quieres eliminar este audio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setRecordings(
              recordings.filter((recording) => recording.id !== id)
            );
          },
        },
      ]
    );
  };

  const transcribeRecording = async (id: string) => {
    try {
      const result = await transcribeAudio(id);
      setRecordings((prevRecordings) =>
        prevRecordings.map((recording) =>
          recording.id === id ? { ...recording, transcribed: true } : recording
        )
      );
      Alert.alert("Transcripción completada", result.transcription);
    } catch (error) {
      console.error("Error al transcribir el audio:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Audios
      </Text>

      {isRecording ? (
        <Button title="Detener Grabación" onPress={stopRecording} />
      ) : (
        <Button title="Iniciar Grabación" onPress={startRecording} />
      )}

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 8,
            }}
          >
            <Text style={{ flex: 1 }}>{item.title}</Text>
            <TouchableOpacity onPress={() => transcribeRecording(item.id)}>
              <Text style={{ color: "blue" }}>
                {item.transcribed ? "Ver Transcripción" : "Transcribir"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteRecording(item.id)}>
              <Text style={{ color: "red", marginLeft: 16 }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
