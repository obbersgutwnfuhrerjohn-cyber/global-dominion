import type {
  CountryId,
  PlayerId,
  WarId,
} from "../types/game";

export type RealtimeConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export type RealtimeEventType =
  | "world.tick"
  | "world.country.updated"
  | "world.territory.updated"
  | "world.border.updated"
  | "world.event"
  | "politics.election.updated"
  | "politics.government.updated"
  | "politics.party.updated"
  | "diplomacy.relation.updated"
  | "diplomacy.agreement.updated"
  | "diplomacy.war.declared"
  | "diplomacy.peace.proposed"
  | "military.unit.updated"
  | "military.unit.moved"
  | "military.battle.started"
  | "military.battle.updated"
  | "military.battle.ended"
  | "military.front.updated"
  | "military.territory.captured"
  | "military.order.updated"
  | "economy.market.updated"
  | "economy.factory.updated"
  | "economy.production.updated"
  | "economy.trade.updated"
  | "player.updated"
  | "player.job.updated"
  | "notification.created"
  | "chat.message"
  | "system.maintenance"
  | "system.announcement";

export interface RealtimeEvent<T = unknown> {
  id: string;

  type: RealtimeEventType;

  timestamp: string;

  worldTick: number;

  countryId: CountryId | null;

  playerId: PlayerId | null;

  warId: WarId | null;

  payload: T;
}

export interface WorldTickEvent {
  tick: number;

  serverTime: string;

  activePlayers: number;

  activeCountries: number;

  activeWars: number;

  activeBattles: number;
}

export interface TerritoryUpdateEvent {
  territoryId: string;

  countryId: CountryId;

  previousCountryId: CountryId | null;

  controlPercentage: number;

  contested: boolean;

  captured: boolean;

  latitude: number;

  longitude: number;

  updatedAt: string;
}

export interface BorderUpdateEvent {
  countryId: CountryId;

  affectedCountryIds: CountryId[];

  changedTerritoryIds: string[];

  updatedAt: string;
}

export interface UnitUpdateEvent {
  unitId: string;

  countryId: CountryId;

  latitude: number;

  longitude: number;

  heading: number;

  status:
    | "idle"
    | "moving"
    | "engaged"
    | "retreating"
    | "destroyed";

  personnel: number;

  readiness: number;

  morale: number;

  supplyPercentage: number;

  updatedAt: string;
}

export interface BattleUpdateEvent {
  battleId: string;

  warId: WarId;

  latitude: number;

  longitude: number;

  attackerCountryId: CountryId;

  defenderCountryId: CountryId;

  attackerStrength: number;

  defenderStrength: number;

  attackerLosses: number;

  defenderLosses: number;

  progress: number;

  status:
    | "forming"
    | "active"
    | "decisive"
    | "ended";

  updatedAt: string;
}

export interface FactoryUpdateEvent {
  factoryId: string;

  companyId: string;

  countryId: CountryId;

  operational: boolean;

  productionType: string;

  productionRate: number;

  employeeCount: number;

  updatedAt: string;
}

export interface RealtimeSubscription {
  id: string;

  unsubscribe: () => void;
}

export interface RealtimeServiceOptions {
  getAccessToken?: () => Promise<string | null>;

  getPlayerId?: () => PlayerId | null;

  getSessionId?: () => string | null;

  reconnectDelayMs?: number;

  maxReconnectDelayMs?: number;
}

type EventListener<T = unknown> = (
  event: RealtimeEvent<T>,
) => void;

type ConnectionListener = (
  state: RealtimeConnectionState,
) => void;

const DEFAULT_RECONNECT_DELAY = 2000;

const DEFAULT_MAX_RECONNECT_DELAY = 30000;

export class RealtimeService {
  private readonly options: RealtimeServiceOptions;

  private socket: WebSocket | null = null;

  private state: RealtimeConnectionState =
    "idle";

  private reconnectTimer: ReturnType<
    typeof setTimeout
  > | null = null;

  private reconnectDelay: number;

  private manuallyDisconnected = false;

  private connectionListeners =
    new Set<ConnectionListener>();

  private eventListeners =
    new Map<
      RealtimeEventType,
      Set<EventListener>
    >();

  private genericListeners =
    new Set<EventListener>();

  constructor(
    options: RealtimeServiceOptions = {},
  ) {
    this.options = options;

    this.reconnectDelay =
      options.reconnectDelayMs ??
      DEFAULT_RECONNECT_DELAY;
  }

  public getConnectionState():
    RealtimeConnectionState {
    return this.state;
  }

  public subscribeToConnectionState(
    listener: ConnectionListener,
  ): RealtimeSubscription {
    this.connectionListeners.add(listener);

    listener(this.state);

    return {
      id: `connection-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`,

      unsubscribe: () => {
        this.connectionListeners.delete(
          listener,
        );
      },
    };
  }

  public subscribe<T = unknown>(
    type: RealtimeEventType,
    listener: EventListener<T>,
  ): RealtimeSubscription {
    let listeners =
      this.eventListeners.get(type);

    if (!listeners) {
      listeners = new Set();

      this.eventListeners.set(
        type,
        listeners,
      );
    }

    listeners.add(
      listener as EventListener,
    );

    return {
      id: `event-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`,

      unsubscribe: () => {
        listeners?.delete(
          listener as EventListener,
        );
      },
    };
  }

  public subscribeToAll(
    listener: EventListener,
  ): RealtimeSubscription {
    this.genericListeners.add(listener);

    return {
      id: `all-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`,

      unsubscribe: () => {
        this.genericListeners.delete(
          listener,
        );
      },
    };
  }

  public async connect(
    websocketUrl: string,
  ): Promise<void> {
    this.manuallyDisconnected = false;

    if (
      this.socket &&
      this.socket.readyState ===
        WebSocket.OPEN
    ) {
      return;
    }

    if (
      this.socket &&
      this.socket.readyState ===
        WebSocket.CONNECTING
    ) {
      return;
    }

    this.setState("connecting");

    try {
      const accessToken =
        await this.options.getAccessToken?.();

      const playerId =
        this.options.getPlayerId?.();

      const sessionId =
        this.options.getSessionId?.();

      const url =
        this.buildWebSocketUrl(
          websocketUrl,
          accessToken,
          playerId,
          sessionId,
        );

      this.socket = new WebSocket(url);

      this.socket.onopen =
        this.handleOpen;

      this.socket.onmessage =
        this.handleMessage;

      this.socket.onerror =
        this.handleError;

      this.socket.onclose =
        this.handleClose;
    } catch {
      this.setState("error");

      this.scheduleReconnect(
        websocketUrl,
      );
    }
  }

  public disconnect(): void {
    this.manuallyDisconnected = true;

    this.clearReconnectTimer();

    if (this.socket) {
      this.socket.onopen = null;

      this.socket.onmessage = null;

      this.socket.onerror = null;

      this.socket.onclose = null;

      this.socket.close();

      this.socket = null;
    }

    this.setState("disconnected");
  }

  public send(
    type: string,
    payload: unknown = {},
  ): boolean {
    if (
      !this.socket ||
      this.socket.readyState !==
        WebSocket.OPEN
    ) {
      return false;
    }

    this.socket.send(
      JSON.stringify({
        type,

        payload,

        timestamp: new Date().toISOString(),
      }),
    );

    return true;
  }

  public subscribeWorld(
    viewport: {
      north: number;

      south: number;

      east: number;

      west: number;
    },
    layers: string[],
  ): boolean {
    return this.send(
      "world.subscribe",
      {
        viewport,

        layers,
      },
    );
  }

  public unsubscribeWorld(): boolean {
    return this.send(
      "world.unsubscribe",
      {},
    );
  }

  public subscribeCountry(
    countryId: CountryId,
  ): boolean {
    return this.send(
      "country.subscribe",
      {
        countryId,
      },
    );
  }

  public unsubscribeCountry(
    countryId: CountryId,
  ): boolean {
    return this.send(
      "country.unsubscribe",
      {
        countryId,
      },
    );
  }

  public subscribeWar(
    warId: WarId,
  ): boolean {
    return this.send(
      "war.subscribe",
      {
        warId,
      },
    );
  }

  public unsubscribeWar(
    warId: WarId,
  ): boolean {
    return this.send(
      "war.unsubscribe",
      {
        warId,
      },
    );
  }

  private readonly handleOpen =
    (): void => {
      this.setState("connected");

      this.reconnectDelay =
        this.options.reconnectDelayMs ??
        DEFAULT_RECONNECT_DELAY;

      this.send(
        "session.identify",
        {
          playerId:
            this.options.getPlayerId?.() ??
            null,

          sessionId:
            this.options.getSessionId?.() ??
            null,
        },
      );
    };

  private readonly handleMessage =
    (message: MessageEvent): void => {
      try {
        const event =
          this.parseEvent(message.data);

        if (!event) {
          return;
        }

        this.dispatchEvent(event);
      } catch {
        // Invalid server messages are ignored.
        // They must never crash the game client.
      }
    };

  private readonly handleError =
    (): void => {
      this.setState("error");
    };

  private readonly handleClose =
    (): void => {
      this.socket = null;

      if (this.manuallyDisconnected) {
        this.setState("disconnected");

        return;
      }

      this.setState("reconnecting");

      const websocketUrl =
        this.getLastWebsocketUrl();

      if (websocketUrl) {
        this.scheduleReconnect(
          websocketUrl,
        );
      }
    };

  private lastWebsocketUrl: string | null =
    null;

  private getLastWebsocketUrl():
    string | null {
    return this.lastWebsocketUrl;
  }

  private buildWebSocketUrl(
    baseUrl: string,
    accessToken: string | null | undefined,
    playerId: PlayerId | null,
    sessionId: string | null,
  ): string {
    this.lastWebsocketUrl = baseUrl;

    const separator =
      baseUrl.includes("?")
        ? "&"
        : "?";

    const params = new URLSearchParams();

    if (accessToken) {
      params.set(
        "accessToken",
        accessToken,
      );
    }

    if (playerId) {
      params.set(
        "playerId",
        playerId,
      );
    }

    if (sessionId) {
      params.set(
        "sessionId",
        sessionId,
      );
    }

    const query = params.toString();

    return query
      ? `${baseUrl}${separator}${query}`
      : baseUrl;
  }

  private scheduleReconnect(
    websocketUrl: string,
  ): void {
    if (
      this.manuallyDisconnected ||
      this.reconnectTimer
    ) {
      return;
    }

    this.reconnectTimer =
      setTimeout(() => {
        this.reconnectTimer = null;

        void this.connect(
          websocketUrl,
        );
      }, this.reconnectDelay);

    this.reconnectDelay =
      Math.min(
        this.reconnectDelay * 2,
        this.options
          .maxReconnectDelayMs ??
          DEFAULT_MAX_RECONNECT_DELAY,
      );
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(
        this.reconnectTimer,
      );

      this.reconnectTimer = null;
    }
  }

  private parseEvent(
    rawData: unknown,
  ): RealtimeEvent | null {
    if (
      typeof rawData !== "string"
    ) {
      return null;
    }

    const parsed: unknown =
      JSON.parse(rawData);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    const value =
      parsed as Record<
        string,
        unknown
      >;

    if (
      typeof value.id !== "string" ||
      typeof value.type !== "string" ||
      typeof value.timestamp !==
        "string"
    ) {
      return null;
    }

    return {
      id: value.id,

      type:
        value.type as RealtimeEventType,

      timestamp:
        value.timestamp,

      worldTick:
        typeof value.worldTick ===
        "number"
          ? value.worldTick
          : 0,

      countryId:
        typeof value.countryId ===
        "string"
          ? (value.countryId as CountryId)
          : null,

      playerId:
        typeof value.playerId ===
        "string"
          ? (value.playerId as PlayerId)
          : null,

      warId:
        typeof value.warId ===
        "string"
          ? (value.warId as WarId)
          : null,

      payload: value.payload,
    };
  }

  private dispatchEvent(
    event: RealtimeEvent,
  ): void {
    const listeners =
      this.eventListeners.get(
        event.type,
      );

    listeners?.forEach(
      listener => {
        listener(event);
      },
    );

    this.genericListeners.forEach(
      listener => {
        listener(event);
      },
    );
  }

  private setState(
    state: RealtimeConnectionState,
  ): void {
    this.state = state;

    this.connectionListeners.forEach(
      listener => {
        listener(state);
      },
    );
  }
}

export const realtimeService =
  new RealtimeService();