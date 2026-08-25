import type {
  CountryId,
  PlayerId,
  ResourceType
} from "./game";

export type CompanyId = string;
export type FactoryId = string;
export type JobId = string;
export type ProductionOrderId = string;

export type CompanyType =
  | "private"
  | "public"
  | "government"
  | "military";

export type IndustryType =
  | "agriculture"
  | "food"
  | "mining"
  | "energy"
  | "steel"
  | "construction"
  | "automotive"
  | "electronics"
  | "chemical"
  | "medical"
  | "textile"
  | "logistics"
  | "shipbuilding"
  | "aerospace"
  | "defense"
  | "industrial";

export type JobType =
  | "worker"
  | "engineer"
  | "mechanic"
  | "technician"
  | "driver"
  | "logistics_worker"
  | "farmer"
  | "miner"
  | "scientist"
  | "accountant"
  | "manager"
  | "security"
  | "factory_manager"
  | "researcher";

export type ProductionCategory =
  | "food"
  | "industrial"
  | "civilian"
  | "military";

export type FactoryStatus =
  | "planned"
  | "construction"
  | "operational"
  | "paused"
  | "damaged"
  | "destroyed";

export interface PlayerWallet {
  currency: number;
  bankBalance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface PlayerEmployment {
  jobId: JobId;
  companyId: CompanyId;
  factoryId: FactoryId;

  jobType: JobType;

  salary: number;
  salaryFrequency: "hourly" | "daily" | "weekly";

  skillLevel: number;
  experience: number;

  startedAt: string;
}

export interface PlayerCompanyOwnership {
  companyId: CompanyId;
  ownershipPercentage: number;
  role: "owner" | "co_owner" | "executive";
}

export interface Company {
  id: CompanyId;

  countryId: CountryId;

  name: string;

  ownerPlayerId: PlayerId | null;

  type: CompanyType;

  industryTypes: IndustryType[];

  capital: number;

  valuation: number;

  employeeCapacity: number;
  employeeCount: number;

  factoryIds: FactoryId[];

  reputation: number;

  foundedAt: string;
  updatedAt: string;
}

export interface FactoryLocation {
  latitude: number;
  longitude: number;

  cityId: string | null;
}

export interface Factory {
  id: FactoryId;

  companyId: CompanyId;

  countryId: CountryId;

  name: string;

  industryType: IndustryType;

  location: FactoryLocation;

  status: FactoryStatus;

  employeeCapacity: number;
  employeeCount: number;

  productionCapacity: number;

  efficiency: number;

  health: number;

  securityLevel: number;

  resourceStorage: Partial<Record<ResourceType, number>>;

  productionOrderIds: ProductionOrderId[];

  constructionProgress: number;

  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: JobId;

  companyId: CompanyId;
  factoryId: FactoryId;

  title: string;
  type: JobType;

  salary: number;

  requiredSkillLevel: number;

  availablePositions: number;

  filledPositions: number;

  experiencePerWorkCycle: number;

  active: boolean;
}

export interface ProductionRecipe {
  id: string;

  name: string;

  category: ProductionCategory;

  industryType: IndustryType;

  requiredResources: Partial<Record<ResourceType, number>>;

  workforceRequired: number;

  productionTimeMinutes: number;

  outputAmount: number;

  outputItemId: string;

  researchRequired: string | null;

  factoryLevelRequired: number;
}

export interface ProductionOrder {
  id: ProductionOrderId;

  factoryId: FactoryId;

  recipeId: string;

  quantity: number;

  quantityCompleted: number;

  progress: number;

  status: "queued" | "producing" | "completed" | "cancelled";

  startedAt: string | null;

  estimatedCompletionAt: string | null;

  createdByPlayerId: PlayerId | null;
}

export interface FactoryUpgrade {
  id: string;

  factoryId: FactoryId;

  name: string;

  description: string;

  cost: number;

  constructionTimeMinutes: number;

  productionBonus: number;

  employeeCapacityBonus: number;

  efficiencyBonus: number;

  unlocked: boolean;
}

export interface MarketListing {
  id: string;

  sellerCompanyId: CompanyId;

  sellerPlayerId: PlayerId | null;

  itemId: string;

  quantity: number;

  remainingQuantity: number;

  pricePerUnit: number;

  currency: string;

  countryId: CountryId;

  createdAt: string;

  active: boolean;
}

export interface GovernmentContract {
  id: string;

  countryId: CountryId;

  companyId: CompanyId;

  itemId: string;

  quantity: number;

  deliveredQuantity: number;

  pricePerUnit: number;

  totalValue: number;

  deadline: string;

  status:
    | "offered"
    | "accepted"
    | "in_production"
    | "partially_delivered"
    | "completed"
    | "cancelled";
}

export interface CompanyFinancials {
  companyId: CompanyId;

  revenue: number;

  expenses: number;

  wages: number;

  resourceCosts: number;

  maintenanceCosts: number;

  taxes: number;

  profit: number;

  updatedAt: string;
}

export interface FactoryWorkCycle {
  factoryId: FactoryId;

  workersPresent: number;

  workforceEfficiency: number;

  resourcesAvailable: boolean;

  productionOutput: number;

  revenueGenerated: number;

  wagesPaid: number;

  completedAt: string;
}