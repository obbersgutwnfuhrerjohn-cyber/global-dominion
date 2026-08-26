import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { GameProvider } from "../context/GameContext";
import { ShopProvider } from "../context/ShopContext";
import { COLORS } from "../constants/colors";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameProvider>
        <ShopProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              contentStyle: {
                backgroundColor: COLORS.background,
              },
            }}
          />
        </ShopProvider>
      </GameProvider>
    </AuthProvider>
  );
}
