import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface MilitaryServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type MilitaryBranch =
  | "army"
  | "air_force"
  | "navy"
  | "marines"
  | "special_forces"
  | "strategic_forces";

export type UnitType =
  | "infantry"
  | "mechanized"
  | "armor"
  | "artillery"
  | "air_defense"
  | "reconnaissance"
  | "special_forces"
  | "fighter"
  | "bomber"
  | "transport_aircraft"
  | "helicopter"
  | "drone"
  | "frigate"
  | "destroyer"
  | "cruiser"
  | "carrier"
  | "submarine"
  | "landing_ship";

export type UnitStatus =
  | "forming"
  | "training"
  | "ready"
  | "deployed"
  | "engaged"
  | "damaged"
  | "destroyed"
  | "disbanded";

export type PersonnelRole =
  | "soldier"
  | "officer"
  | "commander"
  | "pilot"
  | "sailor"
  | "engineer"
  | "medic"
  | "logistics"
  | "intelligence";

export interface ArmedForces {
  countryId: CountryId;

  totalPersonnel: number;

  activePersonnel: number;

  reservePersonnel: number;

  armyPersonnel: number;

  airForcePersonnel: number;

  navyPersonnel: number;

  specialForcesPersonnel: number;

  militaryBudgetPerDay: number;

  readiness: number;

  morale: number;

  experience: number;

  updatedAt: string;
}

export interface MilitaryUnit {
  id: string;

  countryId: CountryId;

  name: string;

  branch: MilitaryBranch;

  type: UnitType;

  commanderPlayerId: PlayerId | null;

  personnel: number;

  personnelCapacity: number;

  equipment: Record<string, number>;

  readiness: number;

  morale: number;

  experience: number;

  supplyLevel: number;

  health: number;

  status: UnitStatus;

  latitude: number | null;

  longitude: number | null;

  regionId: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface MilitaryBase {
  id: string;

  countryId: CountryId;

  name: string;

  regionId: string;

  latitude: number;

  longitude: number;

  type:
    | "army_base"
    | "air_base"
    | "naval_base"
    | "training_base"
    | "logistics_base"
    | "research_base";

  capacity: number;

  level: number;

  condition: number;

  defenseLevel: number;

  active: boolean;

  createdAt: string;
}

export interface EquipmentStockpile {
  countryId: CountryId;

  equipmentId: string;

  quantity: number;

  operationalQuantity: number;

  damagedQuantity: number;

  reservedQuantity: number;

  updatedAt: string;
}

export interface MilitaryEquipment {
  id: string;

  name: string;

  category:
    | "small_arms"
    | "vehicle"
    | "armor"
    | "aircraft"
    | "naval"
    | "artillery"
    | "air_defense"
    | "drone"
    | "logistics"
    | "protective";

  technologyRequired: string[];

  productionResourceRequirements: Record<
    string,
    number
  >;

  manpowerRequired: number;

  maintenanceCostPerDay: number;

  effectiveness: number;
}

export interface MilitaryPersonnel {
  playerId: PlayerId;

  countryId: CountryId;

  branch: MilitaryBranch;

  role: PersonnelRole;

  unitId: string | null;

  rank: string;

  experience: number;

  skillLevel: number;

  morale: number;

  active: boolean;

  enlistedAt: string;
}

export interface RecruitmentCampaign {
  id: string;

  countryId: CountryId;

  branch: MilitaryBranch;

  targetPersonnel: number;

  recruitedPersonnel: number;

  dailyCost: number;

  active: boolean;

  startedAt: string;

  completedAt: string | null;
}

export interface Deployment {
  id: string;

  unitId: string;

  originRegionId: string;

  destinationRegionId: string;

  latitude: number;

  longitude: number;

  status:
    | "planned"
    | "moving"
    | "arrived"
    | "cancelled";

  startedAt: string;

  estimatedArrivalAt: string;

  completedAt: string | null;
}

export interface LogisticsRoute {
  id: string;

  countryId: CountryId;

  originBaseId: string;

  destinationUnitId: string;

  resourceType:
    | "food"
    | "fuel"
    | "ammunition"
    | "medical"
    | "equipment";

  quantityPerDay: number;

  capacity: number;

  reliability: number;

  active: boolean;

  updatedAt: string;
}

export interface MilitaryOrder {
  id: string;

  countryId: CountryId;

  issuedByPlayerId: PlayerId;

  unitId: string;

  orderType:
    | "move"
    | "hold"
    | "patrol"
    | "train"
    | "defend"
    | "support"
    | "retreat";

  targetRegionId: string | null;

  latitude: number | null;

  longitude: number | null;

  priority: number;

  active: boolean;

  createdAt: string;
}

function requirePlayer(
  options: MilitaryServiceOptions,
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

export class MilitaryService {
  private readonly options: MilitaryServiceOptions;

  constructor(
    options: MilitaryServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getArmedForces(
    countryId: CountryId,
  ): Promise<ArmedForces> {
    return apiClient.get<ArmedForces>(
      `/military/countries/${encodeURIComponent(
        countryId,
      )}/armed-forces`,
    );
  }

  public async getUnits(
    countryId: CountryId,
  ): Promise<MilitaryUnit[]> {
    return apiClient.get<MilitaryUnit[]>(
      `/military/countries/${encodeURIComponent(
        countryId,
      )}/units`,
    );
  }

  public async getUnit(
    unitId: string,
  ): Promise<MilitaryUnit> {
    return apiClient.get<MilitaryUnit>(
      `/military/units/${encodeURIComponent(
        unitId,
      )}`,
    );
  }

  public async createUnit(
    request: {
      countryId: CountryId;

      name: string;

      branch: MilitaryBranch;

      type: UnitType;

      baseId?: string | null;
    },
  ): Promise<MilitaryUnit> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<MilitaryUnit>(
      "/military/units",
      {
        playerId,

        request,
      },
    );
  }

  public async disbandUnit(
    unitId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/military/units/${encodeURIComponent(
        unitId,
      )}/disband`,
      {
        playerId,
      },
    );
  }

  public async getBases(
    countryId: CountryId,
  ): Promise<MilitaryBase[]> {
    return apiClient.get<MilitaryBase[]>(
      `/military/countries/${encodeURIComponent(
        countryId,
      )}/bases`,
    );
  }

  public async createBase(
    request: {
      countryId: CountryId;

      name: string;

      regionId: string;

      type: MilitaryBase["type"];
    },
  ): Promise<MilitaryBase> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<MilitaryBase>(
      "/military/bases",
      {
        playerId,

        request,
      },
    );
  }

  public async upgradeBase(
    baseId: string,
  ): Promise<MilitaryBase> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<MilitaryBase>(
      `/military/bases/${encodeURIComponent(
        baseId,
      )}/upgrade`,
      {
        playerId,
      },
    );
  }

  public async getEquipment(
    countryId: CountryId,
  ): Promise<EquipmentStockpile[]> {
    return apiClient.get<EquipmentStockpile[]>(
      `/military/countries/${encodeURIComponent(
        countryId,
      )}/equipment`,
    );
  }

  public async getEquipmentCatalog(): Promise<
    MilitaryEquipment[]
  > {
    return apiClient.get<MilitaryEquipment[]>(
      "/military/equipment",
    );
  }

  public async recruit(
    request: {
      countryId: CountryId;

      branch: MilitaryBranch;

      targetPersonnel: number;
    },
  ): Promise<RecruitmentCampaign> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<RecruitmentCampaign>(
      "/military/recruitment",
      {
        playerId,

        request,
      },
    );
  }

  public async enlist(
    countryId: CountryId,
    branch: MilitaryBranch,
  ): Promise<MilitaryPersonnel> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<MilitaryPersonnel>(
      "/military/personnel/enlist",
      {
        playerId,

        countryId,

        branch,
      },
    );
  }

  public async leaveMilitary(): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      "/military/personnel/discharge",
      {
        playerId,
      },
    );
  }

  public async getMyMilitaryRole(): Promise<
    MilitaryPersonnel | null
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<
      MilitaryPersonnel | null
    >(
      `/military/personnel/players/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async assignCommander(
    unitId: string,
    commanderPlayerId: PlayerId,
  ): Promise<MilitaryUnit> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<MilitaryUnit>(
      `/military/units/${encodeURIComponent(
        unitId,
      )}/commander`,
      {
        playerId,

        commanderPlayerId,
      },
    );
  }

  public async deployUnit(
    request: {
      unitId: string;

      destinationRegionId: string;

      latitude: number;

      longitude: number;
    },
  ): Promise<Deployment> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Deployment>(
      "/military/deployments",
      {
        playerId,

        request,
      },
    );
  }

  public async getDeployments(
    countryId: CountryId,
  ): Promise<Deployment[]> {
    return apiClient.get<Deployment[]>(
      `/military/countries/${encodeURIComponent(
        countryId,
      )}/deployments`,
    );
  }

  public async issueOrder(
    request: {
      countryId: CountryId;

      unitId: string;

      orderType: MilitaryOrder["orderType"];

      targetRegionId?: string | null;

      latitude?: number | null;

      longitude?: number | null;

      priority?: number;
    },
  ): Promise<MilitaryOrder> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<MilitaryOrder>(
      "/military/orders",
      {
        playerId,

        request,
      },
    );
  }

  public async getOrders(
    unitId: string,
  ): Promise<MilitaryOrder[]> {
    return apiClient.get<MilitaryOrder[]>(
      `/military/units/${encodeURIComponent(
        unitId,
      )}/orders`,
    );
  }

  public async cancelOrder(
    orderId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/military/orders/${encodeURIComponent(
        orderId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async getLogisticsRoutes(
    countryId: CountryId,
  ): Promise<LogisticsRoute[]> {
    return apiClient.get<LogisticsRoute[]>(
      `/military/countries/${encodeURIComponent(
        countryId,
      )}/logistics`,
    );
  }

  public async createLogisticsRoute(
    request: {
      countryId: CountryId;

      originBaseId: string;

      destinationUnitId: string;

      resourceType: LogisticsRoute["resourceType"];

      quantityPerDay: number;
    },
  ): Promise<LogisticsRoute> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<LogisticsRoute>(
      "/military/logistics",
      {
        playerId,

        request,
      },
    );
  }
}

export const militaryService =
  new MilitaryService();