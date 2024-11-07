// app/tabs/_layout.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Audios from "./audios";
import Transcriptions from "./transcriptions";

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Audios" component={Audios} />
      <Tab.Screen name="Transcriptions" component={Transcriptions} />
      {/* Puedes añadir más pestañas aquí si las necesitas */}
    </Tab.Navigator>
  );
}
