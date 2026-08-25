import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface IndustryServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type FactorySector =
  | "agriculture"
  | "food"
  | "mining"
  | "energy"
  | "steel"
  | "manufacturing"
  | "automotive"
  | "aerospace"
  | "shipbuilding"
  | "defense"
  | "electronics"
  | "pharmaceutical"
  | "construction"
  | "technology";

export type JobType =
  | "worker"
  | "engineer"
  | "technician"
  | "manager"
  | "researcher"
  | "security"
  | "logistics"
  | "driver"
  | "pilot"
  | "mechanic"
  | "administrator";

export type ProductionCategory =
  | "food"
  | "consumer"
  | "industrial"
  | "vehicle"
  | "armor"
  | "aircraft"
  | "naval"
  | "weapon"
  | "ammunition"
  | "protective"
  | "construction"
  | "electronics";

export interface Company {
  id: string;

  ownerPlayerId: PlayerId;

  countryId: CountryId;

  name: string;

  description: string;

  sector: FactorySector;

  employeeCount: number;

  factoryCount: number;

  revenuePerDay: number;

  expensesPerDay: number;

  profitPerDay: number;

  valuation: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface Factory {
  id: string;

  companyId: string;

  ownerPlayerId: PlayerId;

  countryId: CountryId;

  regionId: string;

  name: string;

  sector: FactorySector;

  level: number;

  condition: number;

  efficiency: number;

  employeeCapacity: number;

  employeeCount: number;

  productionCapacity: number;

  powerConsumption: number;

  active: boolean;

  damaged: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface Job {
  id: string;

  factoryId: string;

  companyId: string;

  title: string;

  type: JobType;

  description: string;

  salaryPerDay: number;

  requiredLevel: number;

  requiredSkills: string[];

  availablePositions: number;

  filledPositions: number;

  active: boolean;

  createdAt: string;
}

export interface Employment {
  id: string;

  jobId: string;

  factoryId: string;

  companyId: string;

  playerId: PlayerId;

  salaryPerDay: number;

  startedAt: string;

  active: boolean;
}

export interface ProductionItem {
  id: string;

  name: string;

  category: ProductionCategory;

  description: string;

  resourceInputs: Record<
    string,
    number
  >;

  productionTimeHours: number;

  baseValue: number;

  civilian: boolean;

  military: boolean;

  researchRequired: number;
}

export interface ProductionQueueItem {
  id: string;

  factoryId: string;

  productionItemId: string;

  quantity: number;

  completedQuantity: number;

  progress: number;

  startedAt: string;

  estimatedCompletionAt: string;

  priority: number;

  active: boolean;
}

export interface FactoryUpgrade {
  id: string;

  factoryId: string;

  type:
    | "capacity"
    | "efficiency"
    | "storage"
    | "power"
    | "security"
    | "automation"
    | "research";

  level: number;

  cost: number;

  constructionTimeHours: number;

  progress: number;

  completed: boolean;

  startedAt: string | null;

  completedAt: string | null;
}

export interface FactoryInventory {
  factoryId: string;

  resourceId: string;

  quantity: number;

  capacity: number;

  updatedAt: string;
}

export interface FactoryProductionReport {
  factoryId: string;

  productionPerDay: number;

  productionValuePerDay: number;

  materialCostPerDay: number;

  wagesPerDay: number;

  energyCostPerDay: number;

  profitPerDay: number;

  efficiency: number;

  downtimeHours: number;

  updatedAt: string;
}

function requirePlayer(
  options: IndustryServiceOptions,
): PlayerId {
  const playerId =
    options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class IndustryService {
  private readonly options: IndustryServiceOptions;

  constructor(
    options: IndustryServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getCompanies(
    countryId?: CountryId,
  ): Promise<Company[]> {
    if (countryId) {
      return apiClient.get<Company[]>(
        `/industry/countries/${encodeURIComponent(
          countryId,
        )}/companies`,
      );
    }

    return apiClient.get<Company[]>(
      "/industry/companies",
    );
  }

  public async getMyCompanies(): Promise<Company[]> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<Company[]>(
      `/industry/players/${encodeURIComponent(
        playerId,
      )}/companies`,
    );
  }

  public async getCompany(
    companyId: string,
  ): Promise<Company> {
    return apiClient.get<Company>(
      `/industry/companies/${encodeURIComponent(
        companyId,
      )}`,
    );
  }

  public async createCompany(
    request: {
      countryId: CountryId;

      name: string;

      description: string;

      sector: FactorySector;
    },
  ): Promise<Company> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Company>(
      "/industry/companies",
      {
        playerId,

        request,
      },
    );
  }

  public async renameCompany(
    companyId: string,
    name: string,
  ): Promise<Company> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<Company>(
      `/industry/companies/${encodeURIComponent(
        companyId,
      )}`,
      {
        playerId,

        name,
      },
    );
  }

  public async getFactories(
    companyId?: string,
  ): Promise<Factory[]> {
    if (companyId) {
      return apiClient.get<Factory[]>(
        `/industry/companies/${encodeURIComponent(
          companyId,
        )}/factories`,
      );
    }

    return apiClient.get<Factory[]>(
      "/industry/factories",
    );
  }

  public async getMyFactories(): Promise<Factory[]> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<Factory[]>(
      `/industry/players/${encodeURIComponent(
        playerId,
      )}/factories`,
    );
  }

  public async getFactory(
    factoryId: string,
  ): Promise<Factory> {
    return apiClient.get<Factory>(
      `/industry/factories/${encodeURIComponent(
        factoryId,
      )}`,
    );
  }

  public async createFactory(
    request: {
      companyId: string;

      countryId: CountryId;

      regionId: string;

      name: string;

      sector: FactorySector;
    },
  ): Promise<Factory> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Factory>(
      "/industry/factories",
      {
        playerId,

        request,
      },
    );
  }

  public async upgradeFactory(
    factoryId: string,
    type: FactoryUpgrade["type"],
  ): Promise<FactoryUpgrade> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<FactoryUpgrade>(
      `/industry/factories/${encodeURIComponent(
        factoryId,
      )}/upgrades`,
      {
        playerId,

        type,
      },
    );
  }

  public async getFactoryUpgrades(
    factoryId: string,
  ): Promise<FactoryUpgrade[]> {
    return apiClient.get<FactoryUpgrade[]>(
      `/industry/factories/${encodeURIComponent(
        factoryId,
      )}/upgrades`,
    );
  }

  public async getJobs(
    factoryId?: string,
  ): Promise<Job[]> {
    if (factoryId) {
      return apiClient.get<Job[]>(
        `/industry/factories/${encodeURIComponent(
          factoryId,
        )}/jobs`,
      );
    }

    return apiClient.get<Job[]>(
      "/industry/jobs",
    );
  }

  public async createJob(
    request: {
      factoryId: string;

      title: string;

      type: JobType;

      description: string;

      salaryPerDay: number;

      requiredLevel?: number;

      requiredSkills?: string[];

      availablePositions: number;
    },
  ): Promise<Job> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Job>(
      "/industry/jobs",
      {
        playerId,

        request,
      },
    );
  }

  public async applyForJob(
    jobId: string,
  ): Promise<Employment> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Employment>(
      `/industry/jobs/${encodeURIComponent(
        jobId,
      )}/apply`,
      {
        playerId,
      },
    );
  }

  public async leaveJob(
    employmentId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/industry/employment/${encodeURIComponent(
        employmentId,
      )}/leave`,
      {
        playerId,
      },
    );
  }

  public async getMyEmployment(): Promise<
    Employment[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<Employment[]>(
      `/industry/players/${encodeURIComponent(
        playerId,
      )}/employment`,
    );
  }

  public async getProductionItems(): Promise<
    ProductionItem[]
  > {
    return apiClient.get<ProductionItem[]>(
      "/industry/production/items",
    );
  }

  public async getProductionItem(
    productionItemId: string,
  ): Promise<ProductionItem> {
    return apiClient.get<ProductionItem>(
      `/industry/production/items/${encodeURIComponent(
        productionItemId,
      )}`,
    );
  }

  public async queueProduction(
    request: {
      factoryId: string;

      productionItemId: string;

      quantity: number;

      priority?: number;
    },
  ): Promise<ProductionQueueItem> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<ProductionQueueItem>(
      "/industry/production/queue",
      {
        playerId,

        request,
      },
    );
  }

  public async getProductionQueue(
    factoryId: string,
  ): Promise<ProductionQueueItem[]> {
    return apiClient.get<ProductionQueueItem[]>(
      `/industry/factories/${encodeURIComponent(
        factoryId,
      )}/production`,
    );
  }

  public async cancelProduction(
    productionId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/industry/production/${encodeURIComponent(
        productionId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async getInventory(
    factoryId: string,
  ): Promise<FactoryInventory[]> {
    return apiClient.get<FactoryInventory[]>(
      `/industry/factories/${encodeURIComponent(
        factoryId,
      )}/inventory`,
    );
  }

  public async getProductionReport(
    factoryId: string,
  ): Promise<FactoryProductionReport> {
    return apiClient.get<FactoryProductionReport>(
      `/industry/factories/${encodeURIComponent(
        factoryId,
      )}/report`,
    );
  }

  public async sellFactory(
    factoryId: string,
    buyerPlayerId?: PlayerId,
  ): Promise<Factory> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Factory>(
      `/industry/factories/${encodeURIComponent(
        factoryId,
      )}/sell`,
      {
        playerId,

        buyerPlayerId:
          buyerPlayerId ?? null,
      },
    );
  }
}

export const industryService =
  new IndustryService();