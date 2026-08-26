import React, {
  createContext,
  useCallback,
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
  DEMO_WARS,
  DEMO_REVOLUTIONS,
  type DemoCountry,
  type DemoResource,
  type DemoUnit,
  type DemoWar,
  type DemoRevolution,
  type DemoBattle,
} from "../data/mock";

interface GameContextValue {
  countries: DemoCountry[];
  resources: DemoResource[];
  units: DemoUnit[];
  events: typeof DEMO_WORLD_EVENTS;
  market: typeof DEMO_MARKET;
  wars: DemoWar[];
  revolutions: DemoRevolution[];
  selectedCountryId: string | null;
  setSelectedCountryId: (id: string | null) => void;
  tickCount: number;
  advanceTick: () => void;
  /** Start or reinforce a revolution in a country */
  startRevolution: (
    countryId: string,
    goal: "independence" | "regime_change" | "secession",
    leaderName: string
  ) => { success: boolean; message: string };
  /** Push independence movement; at high support can declare Independence Day */
  supportIndependence: (countryId: string, amount?: number) => {
    success: boolean;
    message: string;
  };
  /** Declare independence if movement strong enough */
  declareIndependence: (countryId: string) => {
    success: boolean;
    message: string;
  };
  /** Declare war (demo) between two countries */
  declareWar: (attackerId: string, defenderId: string, warName: string) => {
    success: boolean;
    message: string;
  };
  /** Resolve a battle step in an active war */
  resolveBattleStep: (warId: string, battleId: string) => {
    success: boolean;
    message: string;
  };
  /** Recruit a demo unit for a country */
  recruitUnit: (
    countryId: string,
    type: string,
    name: string,
    size: number
  ) => { success: boolean; message: string };
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState(DEMO_COUNTRIES);
  const [resources, setResources] = useState(DEMO_RESOURCES);
  const [units, setUnits] = useState(DEMO_UNITS);
  const [events, setEvents] = useState(DEMO_WORLD_EVENTS);
  const [market] = useState(DEMO_MARKET);
  const [wars, setWars] = useState(DEMO_WARS);
  const [revolutions, setRevolutions] = useState(DEMO_REVOLUTIONS);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    "country_jps"
  );
  const [tickCount, setTickCount] = useState(0);

  const pushEvent = useCallback(
    (title: string, description: string, type: string) => {
      setEvents((prev) => [
        {
          id: `evt_${Date.now().toString(36)}`,
          title,
          description,
          type,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
    },
    []
  );

  const advanceTick = useCallback(() => {
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
    // Slow independence drift in revolt-prone regions
    setCountries((prev) =>
      prev.map((c) => {
        if (!c.canRevolt) return c;
        const drift = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const next = Math.min(
          100,
          Math.max(0, (c.independenceMovement ?? 0) + drift)
        );
        return { ...c, independenceMovement: next };
      })
    );
  }, []);

  useEffect(() => {
    const id = setInterval(advanceTick, 12_000);
    return () => clearInterval(id);
  }, [advanceTick]);

  const startRevolution = useCallback(
    (
      countryId: string,
      goal: "independence" | "regime_change" | "secession",
      leaderName: string
    ) => {
      const country = countries.find((c) => c.id === countryId);
      if (!country) return { success: false, message: "Unknown country." };
      if (!country.canRevolt)
        return {
          success: false,
          message: `${country.name} is too tightly controlled for open revolt.`,
        };
      const existing = revolutions.find(
        (r) =>
          r.countryId === countryId &&
          (r.status === "organizing" || r.status === "active")
      );
      if (existing)
        return {
          success: false,
          message: "A revolution is already underway here.",
        };

      const support = Math.min(
        95,
        (country.independenceMovement ?? 20) + 15
      );
      const rev: DemoRevolution = {
        id: `rev_${Date.now().toString(36)}`,
        countryId,
        leaderName: leaderName || "Provisional Committee",
        support,
        status: "organizing",
        goal,
        startedAt: new Date().toISOString(),
      };
      setRevolutions((prev) => [rev, ...prev]);
      setCountries((prev) =>
        prev.map((c) =>
          c.id === countryId
            ? {
                ...c,
                status: "unstable",
                stability: Math.max(15, c.stability - 12),
                independenceMovement: support,
              }
            : c
        )
      );
      pushEvent(
        `Revolution begins — ${country.name}`,
        `${leaderName} organizes for ${goal.replace(/_/g, " ")}. Support: ${support}%.`,
        "revolution"
      );
      return {
        success: true,
        message: `Revolution launched in ${country.name}. Support ${support}%.`,
      };
    },
    [countries, revolutions, pushEvent]
  );

  const supportIndependence = useCallback(
    (countryId: string, amount = 8) => {
      const country = countries.find((c) => c.id === countryId);
      if (!country) return { success: false, message: "Unknown country." };
      if (!country.canRevolt)
        return {
          success: false,
          message: "Independence activity is suppressed here.",
        };
      const next = Math.min(
        100,
        (country.independenceMovement ?? 0) + amount
      );
      setCountries((prev) =>
        prev.map((c) =>
          c.id === countryId
            ? {
                ...c,
                independenceMovement: next,
                stability: Math.max(10, c.stability - 2),
              }
            : c
        )
      );
      setRevolutions((prev) =>
        prev.map((r) =>
          r.countryId === countryId &&
          (r.status === "organizing" || r.status === "active")
            ? { ...r, support: Math.min(100, r.support + amount) }
            : r
        )
      );
      return {
        success: true,
        message: `Independence movement in ${country.name} now at ${next}%.`,
      };
    },
    [countries]
  );

  const declareIndependence = useCallback(
    (countryId: string) => {
      const country = countries.find((c) => c.id === countryId);
      if (!country) return { success: false, message: "Unknown country." };
      const movement = country.independenceMovement ?? 0;
      if (movement < 70)
        return {
          success: false,
          message: `Movement too weak (${movement}%). Need at least 70% to declare Independence Day.`,
        };
      if (country.independenceDay && country.status !== "occupied")
        return {
          success: false,
          message: `${country.name} already observes an independence day.`,
        };

      const day = new Date().toISOString().slice(0, 10);
      setCountries((prev) =>
        prev.map((c) =>
          c.id === countryId
            ? {
                ...c,
                status: "peace",
                government: "provisional",
                overlordId: null,
                independenceDay: day,
                independenceMovement: 100,
                stability: Math.min(80, c.stability + 20),
                bloc: "Independent",
                description: `${c.description ?? ""} Independence declared on ${day}. A new nation stands.`,
              }
            : c
        )
      );
      setRevolutions((prev) =>
        prev.map((r) =>
          r.countryId === countryId
            ? { ...r, status: "victorious", support: 100 }
            : r
        )
      );
      pushEvent(
        `Independence Day — ${country.name}`,
        `On ${day}, ${country.name} declares independence. The ordered map is redrawn.`,
        "politics"
      );
      return {
        success: true,
        message: `Independence Day declared for ${country.name} on ${day}!`,
      };
    },
    [countries, pushEvent]
  );

  const declareWar = useCallback(
    (attackerId: string, defenderId: string, warName: string) => {
      if (attackerId === defenderId)
        return { success: false, message: "Cannot declare war on yourself." };
      const attacker = countries.find((c) => c.id === attackerId);
      const defender = countries.find((c) => c.id === defenderId);
      if (!attacker || !defender)
        return { success: false, message: "Unknown country." };
      // GNR is too strong to casually be attacked without cost messaging
      if (defenderId === "country_gnr" && attacker.militaryStrength < 90)
        return {
          success: false,
          message:
            "The Greater Nazi Reich is the supreme military power. Only a peer coalition could challenge Berlin.",
        };
      const existing = wars.find(
        (w) =>
          w.status === "active" &&
          ((w.attackerId === attackerId && w.defenderId === defenderId) ||
            (w.attackerId === defenderId && w.defenderId === attackerId))
      );
      if (existing)
        return { success: false, message: "War already active between these powers." };

      const battle: DemoBattle = {
        id: `bat_${Date.now().toString(36)}`,
        name: `Opening clash — ${defender.capital}`,
        location: defender.capital,
        attackerStrength: Math.floor(attacker.militaryStrength * 80),
        defenderStrength: Math.floor(defender.militaryStrength * 80),
        status: "ongoing",
        day: 1,
      };
      const war: DemoWar = {
        id: `war_${Date.now().toString(36)}`,
        name: warName || `${attacker.code} vs ${defender.code}`,
        attackerId,
        defenderId,
        status: "active",
        startedAt: new Date().toISOString(),
        fronts: [defender.capital],
        battles: [battle],
      };
      setWars((prev) => [war, ...prev]);
      setCountries((prev) =>
        prev.map((c) => {
          if (c.id === attackerId || c.id === defenderId)
            return { ...c, status: "at_war" };
          return c;
        })
      );
      pushEvent(
        `War declared: ${war.name}`,
        `${attacker.name} moves against ${defender.name}. First battle at ${defender.capital}.`,
        "military"
      );
      return { success: true, message: `War "${war.name}" is now active.` };
    },
    [countries, wars, pushEvent]
  );

  const resolveBattleStep = useCallback(
    (warId: string, battleId: string) => {
      let message = "No change.";
      setWars((prev) =>
        prev.map((w) => {
          if (w.id !== warId) return w;
          const battles = w.battles.map((b) => {
            if (b.id !== battleId || b.status !== "ongoing") return b;
            const aRoll = b.attackerStrength * (0.85 + Math.random() * 0.3);
            const dRoll = b.defenderStrength * (0.85 + Math.random() * 0.3);
            const day = b.day + 1;
            if (day >= 5) {
              const status =
                aRoll > dRoll * 1.1
                  ? "attacker_won"
                  : dRoll > aRoll * 1.1
                    ? "defender_won"
                    : "stalemate";
              message = `${b.name}: ${status.replace(/_/g, " ")} after day ${day}.`;
              return { ...b, day, status: status as DemoBattle["status"] };
            }
            const newA = Math.max(
              100,
              Math.floor(b.attackerStrength * (0.92 + Math.random() * 0.06))
            );
            const newD = Math.max(
              100,
              Math.floor(b.defenderStrength * (0.92 + Math.random() * 0.06))
            );
            message = `${b.name} day ${day}: strengths ${newA} vs ${newD}.`;
            return {
              ...b,
              day,
              attackerStrength: newA,
              defenderStrength: newD,
            };
          });
          return { ...w, battles };
        })
      );
      return { success: true, message };
    },
    []
  );

  const recruitUnit = useCallback(
    (countryId: string, type: string, name: string, size: number) => {
      const country = countries.find((c) => c.id === countryId);
      if (!country) return { success: false, message: "Unknown country." };
      const unit: DemoUnit = {
        id: `unit_${Date.now().toString(36)}`,
        type,
        name,
        size,
        location: country.capital,
        morale: 70,
        supply: 80,
        status: "forming",
        countryId,
      };
      setUnits((prev) => [unit, ...prev]);
      pushEvent(
        `Recruitment — ${name}`,
        `${country.name} forms ${name} (${size} personnel) at ${country.capital}.`,
        "military"
      );
      return { success: true, message: `${name} is forming.` };
    },
    [countries, pushEvent]
  );

  const value = useMemo(
    () => ({
      countries,
      resources,
      units,
      events,
      market,
      wars,
      revolutions,
      selectedCountryId,
      setSelectedCountryId,
      tickCount,
      advanceTick,
      startRevolution,
      supportIndependence,
      declareIndependence,
      declareWar,
      resolveBattleStep,
      recruitUnit,
    }),
    [
      countries,
      resources,
      units,
      events,
      market,
      wars,
      revolutions,
      selectedCountryId,
      tickCount,
      advanceTick,
      startRevolution,
      supportIndependence,
      declareIndependence,
      declareWar,
      resolveBattleStep,
      recruitUnit,
    ]
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
