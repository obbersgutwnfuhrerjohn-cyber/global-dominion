export const GAME_CONFIG = {
  name: "Global Dominion",
  version: "1.0.0",

  world: {
    tickIntervalMs: 1000,
    simulationIntervalMs: 5000,
    maxPlayersPerCountry: 100000,
    defaultCountryId: null
  },

  player: {
    startingLevel: 1,
    startingExperience: 0,
    maxLevel: 100,
    startingPrestige: 0,
    startingCurrency: 1000
  },

  authentication: {
    requireEmailVerification: true,
    allowUnverifiedGameplay: false,
    requireUniqueEmail: true,
    enforceAccountAbuseDetection: true,
    enforceDeviceAssociation: true,
    enforceNetworkAbuseDetection: true
  },

  politics: {
    minimumVotingAge: 18,
    electionCycleDays: 30,
    campaignDurationDays: 7,
    parliamentTermDays: 30
  },

  diplomacy: {
    relationMinimum: -100,
    relationMaximum: 100,
    defaultRelation: 0
  },

  military: {
    minimumUnitSize: 1,
    maximumCommandLevel: 6,
    supplyEnabled: true,
    moraleEnabled: true,
    fogOfWarEnabled: true
  },

  economy: {
    economyTickIntervalMs: 60000,
    startingTreasury: 1000000,
    inflationEnabled: true,
    globalMarketEnabled: true
  }
} as const;

export const PLAYER_RANKS = [
  {
    level: 1,
    name: "Citizen"
  },
  {
    level: 5,
    name: "Party Member"
  },
  {
    level: 10,
    name: "Local Official"
  },
  {
    level: 20,
    name: "Parliament Member"
  },
  {
    level: 35,
    name: "Minister"
  },
  {
    level: 50,
    name: "Senior Commander"
  },
  {
    level: 70,
    name: "National Leader"
  },
  {
    level: 90,
    name: "Global Statesman"
  }
] as const;

export const MILITARY_BRANCHES = [
  "army",
  "air_force",
  "navy",
  "special_forces",
  "intelligence"
] as const;

export type MilitaryBranch = (typeof MILITARY_BRANCHES)[number];

export const GOVERNMENT_POSITIONS = [
  "citizen",
  "party_member",
  "local_official",
  "parliament_member",
  "minister",
  "prime_minister",
  "president"
] as const;

export type GovernmentPosition =
  (typeof GOVERNMENT_POSITIONS)[number];

export const RESOURCE_TYPES = [
  "food",
  "oil",
  "gas",
  "coal",
  "iron",
  "uranium",
  "rare_earths",
  "electronics",
  "industrial_materials",
  "energy"
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];