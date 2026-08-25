import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface InventoryServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type InventoryOwnerType =
  | "player"
  | "company";

export interface InventoryItem {
  id: string;

  ownerPlayerId: PlayerId | null;

  companyId: string | null;

  itemId: string;

  itemName: string;

  category: string;

  quantity: number;

  unit: string;

  locationId: string | null;

  locationName: string | null;

  condition: number;

  createdAt: string;

  updatedAt: string;
}

export interface InventoryLocation {
  id: string;

  ownerPlayerId: PlayerId | null;

  companyId: string | null;

  name: string;

  type:
    | "personal"
    | "warehouse"
    | "factory"
    | "vehicle"
    | "building"
    | "resource_site";

  capacity: number;

  usedCapacity: number;

  countryId: string;

  cityId: string | null;

  active: boolean;

  createdAt: string;
}

export interface InventoryTransfer {
  id: string;

  itemId: string;

  itemName: string;

  quantity: number;

  fromLocationId: string;

  toLocationId: string;

  ownerPlayerId: PlayerId;

  status:
    | "pending"
    | "completed"
    | "cancelled";

  createdAt: string;

  completedAt: string | null;
}

function requirePlayer(
  options: InventoryServiceOptions,
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

export class InventoryService {
  private readonly options: InventoryServiceOptions;

  constructor(
    options: InventoryServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMyInventory(): Promise<
    InventoryItem[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<InventoryItem[]>(
      `/inventory/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getCompanyInventory(
    companyId: string,
  ): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(
      `/inventory/company/${encodeURIComponent(
        companyId,
      )}`,
    );
  }

  public async getItem(
    inventoryItemId: string,
  ): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(
      `/inventory/items/${encodeURIComponent(
        inventoryItemId,
      )}`,
    );
  }

  public async getLocations(): Promise<
    InventoryLocation[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<InventoryLocation[]>(
      `/inventory/locations/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async createLocation(
    request: {
      name: string;

      type: InventoryLocation["type"];

      capacity: number;

      countryId: string;

      cityId?: string | null;
    },
  ): Promise<InventoryLocation> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<InventoryLocation>(
      "/inventory/locations",
      {
        playerId,

        request,
      },
    );
  }

  public async transferItem(
    request: {
      inventoryItemId: string;

      quantity: number;

      fromLocationId: string;

      toLocationId: string;
    },
  ): Promise<InventoryTransfer> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<InventoryTransfer>(
      "/inventory/transfers",
      {
        playerId,

        request,
      },
    );
  }

  public async getTransfers(): Promise<
    InventoryTransfer[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<InventoryTransfer[]>(
      `/inventory/transfers/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const inventoryService =
  new InventoryService();