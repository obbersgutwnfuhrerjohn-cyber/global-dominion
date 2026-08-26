import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { GameProvider } from "../context/GameContext";
import { COLORS } from "../constants/colors";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: { backgroundColor: COLORS.background },
          }}
        />
      </GameProvider>
    </AuthProvider>
  );
}
