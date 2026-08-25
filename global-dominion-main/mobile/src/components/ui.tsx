import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { COLORS } from "../constants/colors";

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}) {
  const variantStyle =
    variant === "primary"
      ? styles.btnPrimary
      : variant === "secondary"
        ? styles.btnSecondary
        : variant === "danger"
          ? styles.btnDanger
          : styles.btnGhost;

  const textStyle =
    variant === "ghost" ? styles.btnGhostText : styles.btnText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        variantStyle,
        (disabled || loading) && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.textPrimary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Input({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={styles.inputWrap}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, error ? styles.inputError : null]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && styles.statAccent]}>
        {value}
      </Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function Badge({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const bg =
    tone === "success"
      ? COLORS.success
      : tone === "warning"
        ? COLORS.warning
        : tone === "danger"
          ? COLORS.danger
          : tone === "info"
            ? COLORS.info
            : COLORS.surfaceElevated;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 4,
  },
  muted: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  btn: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  btnPrimary: {
    backgroundColor: COLORS.accent,
  },
  btnSecondary: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  btnDanger: {
    backgroundColor: COLORS.danger,
  },
  btnGhost: {
    backgroundColor: "transparent",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnGhostText: {
    color: COLORS.accentBright,
    fontSize: 14,
    fontWeight: "600",
  },
  inputWrap: {
    marginBottom: 14,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  stat: {
    flex: 1,
    minWidth: 90,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  statAccent: {
    color: COLORS.accentBright,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
