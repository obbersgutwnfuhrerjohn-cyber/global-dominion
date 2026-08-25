import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";
import { Button } from "../components/ui";

export default function WelcomeScreen() {
  const { isLoading, isAuthenticated, enterDemo } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.accentBright} />
        <Text style={styles.status}>INITIALIZING WORLD…</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>GLOBAL</Text>
        <Text style={styles.title}>DOMINION</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>
          A persistent geopolitical world.{"\n"}
          Build nations. Command armies. Shape history.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Enter Demo World"
            onPress={async () => {
              await enterDemo();
              router.replace("/(tabs)");
            }}
          />
          <View style={{ height: 12 }} />
          <Button
            title="Sign In"
            variant="secondary"
            onPress={() => router.push("/(auth)/login")}
          />
          <View style={{ height: 8 }} />
          <Button
            title="Create Account"
            variant="ghost"
            onPress={() => router.push("/(auth)/register")}
          />
        </View>
      </View>

      <Text style={styles.version}>GLOBAL DOMINION • 1.0.0 • DEMO MODE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  logo: {
    color: COLORS.textMuted,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 8,
    marginBottom: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 5,
  },
  divider: {
    width: 90,
    height: 2,
    backgroundColor: COLORS.accent,
    marginVertical: 28,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
  },
  actions: {
    width: "100%",
  },
  status: {
    marginTop: 16,
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  version: {
    position: "absolute",
    bottom: 28,
    color: COLORS.textDisabled,
    fontSize: 10,
    letterSpacing: 1,
  },
});
