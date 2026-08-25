export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || "0.0.0.0",
  jwtSecret: process.env.JWT_SECRET || "gd-dev-secret-change-in-production",
  jwtExpiresIn: "30d",
  refreshExpiresIn: "60d",
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["*"],
  tickIntervalMs: 10_000,
  worldName: "Global Dominion",
  version: "1.0.0",
} as const;
