export const GAME_CONFIG = {
  world: {
    tickIntervalMs: 1000,

    mapUpdateIntervalMs: 1000,

    economyTickIntervalMs: 10000,

    militaryTickIntervalMs: 1000,

    researchTickIntervalMs: 10000,

    maximumWorldEventsPerRequest: 100,

    maximumMapZoom: 18,

    minimumMapZoom: 1,
  },

  player: {
    startingLevel: 1,

    startingExperience: 0,

    startingPrestige: 0,

    minimumUsernameLength: 3,

    maximumUsernameLength: 24,

    minimumDisplayNameLength: 1,

    maximumDisplayNameLength: 32,

    maximumBiographyLength: 500,

    avatarMaximumSizeBytes: 10 * 1024 * 1024,
  },

  authentication: {
    requireEmailVerification: true,

    sessionDurationDays: 30,

    passwordResetTokenMinutes: 30,

    emailVerificationTokenMinutes: 30,

    maximumLoginAttempts: 5,

    loginAttemptWindowMinutes: 15,

    accountCreationRateLimitMinutes: 60,

    additionalVerificationRiskThreshold: 70,

    automaticRestrictionRiskThreshold: 90,
  },

  citizenship: {
    defaultVotingRights: true,

    defaultPoliticalRights: true,

    defaultEmploymentRights: true,

    defaultMilitaryServiceAllowed: true,

    defaultBusinessOwnershipAllowed: true,

    minimumCitizenshipCooldownDays: 30,
  },

  elections: {
    minimumCampaignDurationHours: 24,

    minimumVotingDurationHours: 24,

    minimumElectionParticipationLevel: 1,

    minimumElectionParticipationPrestige: 0,

    minimumCandidateAgeDays: 7,

    minimumGovernmentApproval: 0,

    maximumCampaignFundsWithoutVerification: 1000000,
  },

  economy: {
    startingPlayerCurrency: 1000,

    startingBankBalance: 0,

    minimumWage: 1,

    maximumTaxRate: 100,

    minimumTaxRate: 0,

    marketTickIntervalMs: 10000,

    economicTickIntervalMs: 10000,
  },

  industry: {
    maximumFactoriesPerPlayer: 100,

    maximumCompaniesPerPlayer: 50,

    maximumEmployeesPerPlayerCompany: 100000,

    factoryCreationCooldownHours: 24,

    companyCreationCooldownHours: 24,
  },

  military: {
    minimumRecruitmentLevel: 1,

    minimumOfficerLevel: 10,

    maximumUnitOrdersPerMinute: 30,

    militaryUpdateIntervalMs: 1000,

    maximumBattleParticipants: 1000,

    minimumUnitReadiness: 0,

    maximumUnitReadiness: 100,

    minimumUnitMorale: 0,

    maximumUnitMorale: 100,
  },

  research: {
    researchTickIntervalMs: 10000,

    maximumActiveProjectsPerInstitution: 10,

    maximumResearchLevel: 100,
  },

  moderation: {
    imageMaximumSizeBytes: 10 * 1024 * 1024,

    maximumReportsPerMinute: 10,

    automaticSpamThreshold: 20,

    automaticChatMuteMinutes: 30,
  },

  networking: {
    requestTimeoutMs: 15000,

    heartbeatIntervalMs: 10000,

    reconnectDelayMs: 2000,

    maximumReconnectAttempts: 10,

    eventBatchSize: 100,
  },
} as const;

export type GameConfig = typeof GAME_CONFIG;