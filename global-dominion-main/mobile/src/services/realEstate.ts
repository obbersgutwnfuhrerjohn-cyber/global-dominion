import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface RealEstateServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type PropertyType =
  | "apartment"
  | "house"
  | "office"
  | "shop"
  | "warehouse"
  | "factory"
  | "land"
  | "hotel";

export type PropertyStatus =
  | "available"
  | "listed"
  | "sold"
  | "rented"
  | "under_construction";

export interface Property {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  ownerPlayerId: PlayerId | null;

  ownerCompanyId: string | null;

  type: PropertyType;

  status: PropertyStatus;

  areaSqm: number;

  bedrooms: number;

  quality: number;

  marketValue: number;

  rentalValue: number;

  propertyTax: number;

  currency: string;

  latitude: number;

  longitude: number;

  createdAt: string;

  updatedAt: string;
}

export interface PropertyListing {
  id: string;

  propertyId: string;

  sellerPlayerId: PlayerId;

  askingPrice: number;

  currency: string;

  listedAt: string;

  expiresAt: string | null;

  active: boolean;
}

export interface PropertyTransaction {
  id: string;

  propertyId: string;

  buyerPlayerId: PlayerId;

  sellerPlayerId: PlayerId;

  price: number;

  currency: string;

  transactionType:
    | "purchase"
    | "sale"
    | "rent";

  createdAt: string;
}

export interface RealEstateStats {
  countryId: string;

  averagePropertyPrice: number;

  averageRent: number;

  totalProperties: number;

  propertiesForSale: number;

  propertiesForRent: number;

  constructionDemand: number;

  housingDemand: number;

  housingSupply: number;

  priceGrowthRate: number;

  updatedAt: string;
}

function requirePlayer(
  options: RealEstateServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class RealEstateService {
  private readonly options: RealEstateServiceOptions;

  constructor(
    options: RealEstateServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getProperties(
    countryId?: string,
    cityId?: string,
    type?: PropertyType,
  ): Promise<Property[]> {
    return apiClient.get<Property[]>(
      "/real-estate/properties",
      {
        countryId,
        cityId,
        type,
      },
    );
  }

  public async getProperty(
    propertyId: string,
  ): Promise<Property> {
    return apiClient.get<Property>(
      `/real-estate/properties/${encodeURIComponent(
        propertyId,
      )}`,
    );
  }

  public async getListings(
    countryId?: string,
    cityId?: string,
  ): Promise<PropertyListing[]> {
    return apiClient.get<PropertyListing[]>(
      "/real-estate/listings",
      {
        countryId,
        cityId,
      },
    );
  }

  public async listProperty(
    request: {
      propertyId: string;

      askingPrice: number;

      currency: string;
    },
  ): Promise<PropertyListing> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<PropertyListing>(
      "/real-estate/listings",
      {
        playerId,
        request,
      },
    );
  }

  public async purchaseProperty(
    propertyId: string,
  ): Promise<PropertyTransaction> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<PropertyTransaction>(
      "/real-estate/purchases",
      {
        playerId,
        propertyId,
      },
    );
  }

  public async getMyProperties(): Promise<
    Property[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Property[]>(
      `/real-estate/properties/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getStats(
    countryId: string,
  ): Promise<RealEstateStats> {
    return apiClient.get<RealEstateStats>(
      `/real-estate/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }
}

export const realEstateService =
  new RealEstateService();