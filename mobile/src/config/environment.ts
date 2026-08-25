export type EnvironmentName =
  | "development"
  | "staging"
  | "production";

export interface EnvironmentConfig {
  name: EnvironmentName;

  api: {
    baseUrl: string;
    websocketUrl: string;
    timeoutMs: number;
  };

  firebase: {
    enabled: boolean;
  };

  maps: {
    styleUrl: string;
    satelliteEnabled: boolean;
  };

  features: {
    realtimeWorld: boolean;
    elections: boolean;
    diplomacy: boolean;
    economy: boolean;
    industry: boolean;
    military: boolean;
    research: boolean;
    multiplayer: boolean;
    /** When true, client runs fully offline with mock data */
    demoMode: boolean;
  };

  logging: {
    enabled: boolean;
    verbose: boolean;
  };
}

const development: EnvironmentConfig = {
  name: "development",

  api: {
    baseUrl: "http://localhost:3000/api",
    websocketUrl: "ws://localhost:3000/ws",
    timeoutMs: 15000,
  },

  firebase: {
    enabled: true,
  },

  maps: {
    styleUrl: "",
    satelliteEnabled: true,
  },

  features: {
    realtimeWorld: true,
    elections: true,
    diplomacy: true,
    economy: true,
    industry: true,
    military: true,
    research: true,
    multiplayer: true,
    demoMode: true,
  },

  logging: {
    enabled: true,
    verbose: true,
  },
};

const staging: EnvironmentConfig = {
  name: "staging",

  api: {
    baseUrl:
      (typeof process !== "undefined" &&
        process.env?.EXPO_PUBLIC_API_URL) ||
      "https://staging-api.globaldominion.game/api",
    websocketUrl:
      (typeof process !== "undefined" &&
        process.env?.EXPO_PUBLIC_WS_URL) ||
      "wss://staging-api.globaldominion.game/ws",
    timeoutMs: 15000,
  },

  firebase: {
    enabled: true,
  },

  maps: {
    styleUrl: "",
    satelliteEnabled: true,
  },

  features: {
    realtimeWorld: true,
    elections: true,
    diplomacy: true,
    economy: true,
    industry: true,
    military: true,
    research: true,
    multiplayer: true,
    demoMode: true,
  },

  logging: {
    enabled: true,
    verbose: false,
  },
};

const production: EnvironmentConfig = {
  name: "production",

  api: {
    // Set at build time: EXPO_PUBLIC_API_URL / EXPO_PUBLIC_WS_URL
    baseUrl:
      (typeof process !== "undefined" &&
        process.env?.EXPO_PUBLIC_API_URL) ||
      "https://api.globaldominion.game/api",
    websocketUrl:
      (typeof process !== "undefined" &&
        process.env?.EXPO_PUBLIC_WS_URL) ||
      "wss://api.globaldominion.game/ws",
    timeoutMs: 15000,
  },

  firebase: {
    enabled: true,
  },

  maps: {
    styleUrl: "",
    satelliteEnabled: true,
  },

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
  },

  logging: {
    enabled: false,
    verbose: false,
  },
};

const environments: Record<
  EnvironmentName,
  EnvironmentConfig
> = {
  development,
  staging,
  production,
};

const currentEnvironment: EnvironmentName =
  __DEV__ ? "development" : "production";

export const ENVIRONMENT =
  environments[currentEnvironment];

export const IS_DEVELOPMENT =
  ENVIRONMENT.name === "development";

export const IS_STAGING =
  ENVIRONMENT.name === "staging";

export const IS_PRODUCTION =
  ENVIRONMENT.name === "production";