export type EnvironmentName = "development" | "staging" | "production";

export interface EnvironmentConfig {
  name: EnvironmentName;
  api: {
    baseUrl: string;
    websocketUrl: string;
    timeoutMs: number;
  };
  firebase: { enabled: boolean };
  maps: { styleUrl: string; satelliteEnabled: boolean };
  features: {
    realtimeWorld: boolean;
    elections: boolean;
    diplomacy: boolean;
    economy: boolean;
    industry: boolean;
    military: boolean;
    research: boolean;
    multiplayer: boolean;
    demoMode: boolean;
    iap: boolean;
  };
  logging: { enabled: boolean; verbose: boolean };
  iap: { validatePath: string };
}

function envFlag(key: string, fallback = false): boolean {
  if (typeof process === "undefined") return fallback;
  const v = process.env?.[key];
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return fallback;
}

function envStr(key: string, fallback: string): string {
  if (typeof process === "undefined") return fallback;
  return process.env?.[key] || fallback;
}

const production: EnvironmentConfig = {
  name: "production",
  api: {
    baseUrl: envStr("EXPO_PUBLIC_API_URL", "https://api.globaldominion.game/api"),
    websocketUrl: envStr("EXPO_PUBLIC_WS_URL", "wss://api.globaldominion.game/ws"),
    timeoutMs: 20000,
  },
  firebase: { enabled: true },
  maps: { styleUrl: "", satelliteEnabled: true },
  features: {
    realtimeWorld: true,
    elections: true,
    diplomacy: true,
    economy: true,
    industry: true,
    military: true,
    research: true,
    multiplayer: true,
    demoMode: false,
    iap: false,
  },
  logging: { enabled: false, verbose: false },
  iap: { validatePath: "/shop/validate" },
};

const staging: EnvironmentConfig = {
  ...production,
  name: "staging",
  api: {
    baseUrl: envStr("EXPO_PUBLIC_API_URL", "https://staging-api.globaldominion.game/api"),
    websocketUrl: envStr("EXPO_PUBLIC_WS_URL", "wss://staging-api.globaldominion.game/ws"),
    timeoutMs: 15000,
  },
  features: { ...production.features, demoMode: false },
  logging: { enabled: true, verbose: false },
  iap: { validatePath: "/shop/validate" },
};

const development: EnvironmentConfig = {
  name: "development",
  api: {
    baseUrl: envStr("EXPO_PUBLIC_API_URL", "http://localhost:3000/api"),
    websocketUrl: envStr("EXPO_PUBLIC_WS_URL", "ws://localhost:3000/ws"),
    timeoutMs: 8000,
  },
  firebase: { enabled: true },
  maps: { styleUrl: "", satelliteEnabled: true },
  features: {
    realtimeWorld: true,
    elections: true,
    diplomacy: true,
    economy: true,
    industry: true,
    military: true,
    research: true,
    multiplayer: true,
    demoMode: envFlag("EXPO_PUBLIC_ALLOW_DEMO", true),
    iap: envFlag("EXPO_PUBLIC_ENABLE_IAP", false),
  },
  logging: { enabled: true, verbose: true },
  iap: { validatePath: "/shop/validate" },
};

const environments: Record<EnvironmentName, EnvironmentConfig> = {
  development,
  staging,
  production,
};

const currentEnvironment: EnvironmentName = envStr(
  "EXPO_PUBLIC_ENV",
  typeof __DEV__ !== "undefined" && __DEV__ ? "development" : "production"
) as EnvironmentName;

export const ENVIRONMENT = environments[currentEnvironment] ?? production;
export const IS_DEVELOPMENT = ENVIRONMENT.name === "development";
export const IS_STAGING = ENVIRONMENT.name === "staging";
export const IS_PRODUCTION = ENVIRONMENT.name === "production";
