import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, Linking, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";
import { Button } from "../components/ui";
import { ENVIRONMENT, IS_PRODUCTION } from "../config/environment";

export default function WelcomeScreen() {
  const { isLoading, isAuthenticated, enterDemo } = useAuth();
  const router = useRouter();
  const allowDemo = ENVIRONMENT.features.demoMode && !IS_PRODUCTION;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.accentBright} />
        <Text style={styles.status}>CONNECTING TO WORLD SERVER…</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>THE ORDERED WORLD</Text>
        <Text style={styles.title}>GLOBAL</Text>
        <Text style={styles.titleMain}>DOMINION</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>
          1962. The Axis holds the planet.{"\n"}
          Serve. Rise. Shape the empire.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Create Account"
            onPress={() => router.push("/(auth)/register")}
          />
          <View style={{ height: 12 }} />
          <Button
            title="Sign In"
            variant="secondary"
            onPress={() => router.push("/(auth)/login")}
          />
          <View style={{ height: 12 }} />
          <Button
            title="Theme Song"
            variant="ghost"
            onPress={() => Linking.openURL("https://youtu.be/DsPnSs5wHGk?is=uj02YFVv9tKFc_jt")}
          />
          {allowDemo ? (
            <>
              <View style={{ height: 16 }} />
              <Button
                title="Developer Offline Mode"
                variant="ghost"
                onPress={async () => {
                  await enterDemo();
                  router.replace("/(tabs)");
                }}
              />
            </>
          ) : null}
        </View>
      </View>

      <Text style={styles.version}>
        GLOBAL DOMINION · v1.0.0 ·{" "}
        {IS_PRODUCTION ? "PRODUCTION" : ENVIRONMENT.name.toUpperCase()}
      </Text>
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
    color: COLORS.accentGold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 12,
  },
  title: {
    color: COLORS.textMuted,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 8,
  },
  titleMain: {
    color: COLORS.textPrimary,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 6,
  },
  divider: {
    width: 90,
    height: 3,
    backgroundColor: COLORS.accentBright,
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
