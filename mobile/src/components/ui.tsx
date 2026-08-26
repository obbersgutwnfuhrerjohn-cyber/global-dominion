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
  variant?: "primary" | "secondary" | "danger" | "ghost" | "gold";
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
          : variant === "gold"
            ? styles.btnGold
            : styles.btnGhost;

  const textStyle =
    variant === "ghost"
      ? styles.btnGhostText
      : variant === "gold"
        ? styles.btnGoldText
        : styles.btnText;

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
  gold,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  gold?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          accent && styles.statAccent,
          gold && styles.statGold,
        ]}
      >
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
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "gold";
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
            : tone === "gold"
              ? COLORS.accentGold
              : COLORS.surfacePressed;

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

export function ProgressBar({
  value,
  max = 100,
  color = COLORS.accentBright,
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={styles.progressTrack}>
      <View
        style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]}
      />
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
    letterSpacing: 0.8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 4,
  },
  muted: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  btn: {
    height: 48,
    borderRadius: 8,
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
  btnGold: {
    backgroundColor: COLORS.accentGoldDim,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
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
    letterSpacing: 0.5,
  },
  btnGoldText: {
    color: COLORS.paper,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
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
    borderRadius: 8,
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
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  statAccent: {
    color: COLORS.accentBright,
  },
  statGold: {
    color: COLORS.accentGold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surfacePressed,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});
