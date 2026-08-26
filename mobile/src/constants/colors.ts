/**
 * Global Dominion — The Man in the High Castle inspired palette
 * Dark, oppressive, imperial. Blood-red authority, gold hierarchy,
 * charcoal surveillance aesthetics of an alternate 1962.
 */
export const COLORS = {
  // Core surfaces
  background: "#0A0A0C",
  surface: "#121216",
  surfaceElevated: "#1A1A20",
  surfacePressed: "#24242C",

  // Text
  textPrimary: "#F4F0E6",
  textSecondary: "#B8B0A0",
  textMuted: "#7A7468",
  textDisabled: "#4A4640",

  // Borders
  border: "#2A2824",
  borderStrong: "#3E3A34",

  // Authority accents (Reich red + imperial gold)
  accent: "#8B1A1A",
  accentBright: "#C41E1E",
  accentGold: "#C9A227",
  accentGoldDim: "#8A7020",

  // Status
  success: "#3D7A4A",
  warning: "#C9A227",
  danger: "#C41E1E",
  info: "#5A6B7A",

  // Map
  mapOcean: "#0C1014",
  mapLand: "#1C1E18",
  mapLandSelected: "#2A3228",
  mapBorder: "#4A5248",
  mapReich: "#5C1212",
  mapPacific: "#1A2A1A",
  mapNeutral: "#3A3428",
  mapRocky: "#2A2A30",

  // Utility
  transparent: "transparent",
  white: "#FFFFFF",
  black: "#000000",
  propagandaRed: "#9B1B1B",
  paper: "#E8E0D0",
} as const;

export type ColorName = keyof typeof COLORS;
