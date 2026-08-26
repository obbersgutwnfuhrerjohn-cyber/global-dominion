import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";
import { Button, Input, Screen, Title, Subtitle } from "../../components/ui";
import { COLORS } from "../../constants/colors";

export default function RegisterScreen() {
  const { register } = useAuth();
  const { countries } = useGame();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [countryId, setCountryId] = useState(countries[0]?.id ?? "country_jps");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await register(
        email.trim(),
        password,
        displayName.trim(),
        username.trim(),
        countryId
      );
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        setError(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.back} onPress={() => router.back()}>
            ← Back
          </Text>
          <Title>Create Account</Title>
          <Subtitle>Join the persistent world as a new citizen.</Subtitle>

          <View style={styles.form}>
            <Input
              label="DISPLAY NAME"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Commander Vale"
            />
            <Input
              label="USERNAME"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="vale_cmd"
            />
            <Input
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="vale@nation.gov"
            />
            <Input
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />

            <Text style={styles.label}>STARTING NATION</Text>
            <View style={styles.chips}>
              {countries.slice(0, 6).map((c) => (
                <Text
                  key={c.id}
                  onPress={() => setCountryId(c.id)}
                  style={[
                    styles.chip,
                    countryId === c.id && styles.chipActive,
                  ]}
                >
                  {c.code}
                </Text>
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Create Account" onPress={onSubmit} loading={loading} />
            <View style={{ height: 12 }} />
            <Button
              title="Already have an account"
              variant="ghost"
              onPress={() => router.replace("/(auth)/login")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 48,
    paddingBottom: 40,
  },
  back: {
    color: COLORS.accentBright,
    fontSize: 14,
    marginBottom: 24,
  },
  form: {
    marginTop: 28,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    overflow: "hidden",
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    color: COLORS.textPrimary,
  },
  error: {
    color: COLORS.danger,
    marginBottom: 12,
    fontSize: 13,
  },
});
