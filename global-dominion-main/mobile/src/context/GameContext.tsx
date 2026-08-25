import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEMO_COUNTRIES,
  DEMO_MARKET,
  DEMO_RESOURCES,
  DEMO_UNITS,
  DEMO_WORLD_EVENTS,
  type DemoCountry,
  type DemoResource,
  type DemoUnit,
} from "../data/mock";

interface GameContextValue {
  countries: DemoCountry[];
  resources: DemoResource[];
  units: DemoUnit[];
  events: typeof DEMO_WORLD_EVENTS;
  market: typeof DEMO_MARKET;
  selectedCountryId: string | null;
  setSelectedCountryId: (id: string | null) => void;
  tickCount: number;
  advanceTick: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [countries] = useState(DEMO_COUNTRIES);
  const [resources, setResources] = useState(DEMO_RESOURCES);
  const [units] = useState(DEMO_UNITS);
  const [events] = useState(DEMO_WORLD_EVENTS);
  const [market] = useState(DEMO_MARKET);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    "country_us"
  );
  const [tickCount, setTickCount] = useState(0);

  const advanceTick = () => {
    setTickCount((t) => t + 1);
    setResources((prev) =>
      prev.map((r) => {
        const delta = r.production - r.consumption;
        const noise = Math.floor(Math.random() * 5) - 2;
        return {
          ...r,
          amount: Math.max(0, r.amount + delta + noise),
        };
      })
    );
  };

  // Demo world auto-tick every 12s so the economy feels alive offline
  useEffect(() => {
    const id = setInterval(advanceTick, 12_000);
    return () => clearInterval(id);
  }, []);

  const value = useMemo(
    () => ({
      countries,
      resources,
      units,
      events,
      market,
      selectedCountryId,
      setSelectedCountryId,
      tickCount,
      advanceTick,
    }),
    [countries, resources, units, events, market, selectedCountryId, tickCount]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within GameProvider");
  }
  return ctx;
}
