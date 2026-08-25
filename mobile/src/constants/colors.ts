export const COLORS = {
  background: "#05080D",
  surface: "#0A1018",
  surfaceElevated: "#101923",
  surfacePressed: "#16212D",

  textPrimary: "#F2F5F7",
  textSecondary: "#AAB4C0",
  textMuted: "#6F7D8A",
  textDisabled: "#4D5966",

  border: "#1C2935",
  borderStrong: "#2A3A49",

  accent: "#6F8295",
  accentBright: "#9BAFC2",

  success: "#4CAF7D",
  warning: "#D7A84A",
  danger: "#D35C5C",
  info: "#5D91C7",

  mapOcean: "#08121B",
  mapLand: "#18231F",
  mapLandSelected: "#344A3E",
  mapBorder: "#52645B",

  transparent: "transparent",
  white: "#FFFFFF",
  black: "#000000"
} as const;

export type ColorName = keyof typeof COLORS;