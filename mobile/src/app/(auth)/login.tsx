import { useEffect, useState } from "react";
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
import { Button, Input, Screen, Title, Subtitle } from "../../components/ui";
import { COLORS } from "../../constants/colors";

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
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
          <Title>Sign In</Title>
          <Subtitle>Return to the world of Global Dominion.</Subtitle>

          <View style={styles.form}>
            <Input
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="commander@nation.gov"
            />
            <Input
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Sign In" onPress={onSubmit} loading={loading} />
            <View style={{ height: 12 }} />
            <Button
              title="Create an account"
              variant="ghost"
              onPress={() => router.replace("/(auth)/register")}
            />
          </View>

          <Text style={styles.hint}>
            Works offline on this device. Connects to the live server automatically when available.
          </Text>
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
  error: {
    color: COLORS.danger,
    marginBottom: 12,
    fontSize: 13,
  },
  hint: {
    marginTop: 32,
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
