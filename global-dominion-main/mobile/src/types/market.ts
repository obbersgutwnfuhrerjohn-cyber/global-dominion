import type {
  CountryId,
  ResourceType
} from "./game";

import type {
  CompanyId,
  FactoryId
} from "./economy";

export type MarketType =
  | "national"
  | "international"
  | "resource"
  | "industrial"
  | "consumer"
  | "military";

export type EconomicEventType =
  | "inflation"
  | "deflation"
  | "recession"
  | "boom"
  | "shortage"
  | "surplus"
  | "market_crash"
  | "resource_discovery"
  | "supply_disruption"
  | "trade_disruption";

export interface MarketItem {
  id: string;

  name: string;

  category:
    | "food"
    | "resource"
    | "industrial"
    | "consumer"
    | "military";

  basePrice: number;

  currentPrice: number;

  totalSupply: number;

  totalDemand: number;

  productionPerTick: number;

  consumptionPerTick: number;

  updatedAt: string;
}

export interface MarketPrice {
  itemId: string;

  countryId: CountryId | null;

  price: number;

  supply: number;

  demand: number;

  volume: number;

  timestamp: string;
}

export interface CompanyMarketPosition {
  companyId: CompanyId;

  marketShare: number;

  unitsSold: number;

  revenue: number;

  productionCost: number;

  profit: number;

  updatedAt: string;
}

export interface NationalEconomy {
  countryId: CountryId;

  gdp: number;

  gdpGrowthRate: number;

  treasury: number;

  taxRevenue: number;

  governmentSpending: number;

  inflationRate: number;

  unemploymentRate: number;

  averageWage: number;

  consumerSpending: number;

  industrialOutput: number;

  agriculturalOutput: number;

  energyProduction: number;

  exportValue: number;

  importValue: number;

  tradeBalance: number;

  debt: number;

  debtToGdp: number;

  economicStability: number;

  updatedAt: string;
}

export interface TaxPolicy {
  countryId: CountryId;

  incomeTaxRate: number;

  corporateTaxRate: number;

  salesTaxRate: number;

  importTaxRate: number;

  exportTaxRate: number;

  resourceTaxRate: number;

  updatedAt: string;
}

export interface WagePolicy {
  countryId: CountryId;

  minimumWage: number;

  publicSectorWageMultiplier: number;

  unemploymentBenefits: number;

  updatedAt: string;
}

export interface TradeRoute {
  id: string;

  originCountryId: CountryId;

  destinationCountryId: CountryId;

  itemId: string;

  quantityPerTick: number;

  valuePerTick: number;

  active: boolean;

  disrupted: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface ResourceMarketState {
  resource: ResourceType;

  globalSupply: number;

  globalDemand: number;

  globalPrice: number;

  countryProduction: Record<CountryId, number>;

  countryConsumption: Record<CountryId, number>;

  updatedAt: string;
}

export interface FactoryMarketDemand {
  factoryId: FactoryId;

  requiredResources: Partial<Record<ResourceType, number>>;

  availableResources: Partial<Record<ResourceType, number>>;

  shortagePercentage: number;

  updatedAt: string;
}

export interface EconomicEvent {
  id: string;

  countryId: CountryId | null;

  type: EconomicEventType;

  title: string;

  description: string;

  economicImpact: number;

  marketImpact: number;

  startedAt: string;

  endedAt: string | null;

  active: boolean;
}

export interface EconomicTick {
  tickId: number;

  timestamp: string;

  countriesProcessed: number;

  factoriesProcessed: number;

  companiesProcessed: number;

  marketsProcessed: number;

  tradesProcessed: number;

  productionValue: number;

  tradeValue: number;

  taxRevenueGenerated: number;
}