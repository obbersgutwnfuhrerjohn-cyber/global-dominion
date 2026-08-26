import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StorageKeys, getItem, removeItem, setItem } from "../utils/storage";
import {
  createDemoPlayer,
  type DemoPlayer,
} from "../data/mock";
import { authService } from "../services/auth";
import { apiClient, ApiRequestError } from "../services/api";
import { ENVIRONMENT } from "../config/environment";

export interface AuthSession {
  sessionId: string;
  playerId: string;
  accessToken: string;
  expiresAt: string;
}

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  player: DemoPlayer | null;
  session: AuthSession | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (
    email: string,
    password: string,
    displayName: string,
    username: string,
    countryId?: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  enterDemo: () => Promise<void>;
  updatePlayer: (patch: Partial<DemoPlayer>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeSession(playerId: string): AuthSession {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  return {
    sessionId: `sess_${Date.now().toString(36)}`,
    playerId,
    accessToken: `demo_${Math.random().toString(36).slice(2)}`,
    expiresAt: expires.toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<DemoPlayer | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedPlayer, storedSession, demoFlag] = await Promise.all([
          getItem<DemoPlayer>(StorageKeys.player),
          getItem<AuthSession>(StorageKeys.session),
          getItem<boolean>(StorageKeys.demoMode),
        ]);
        if (storedPlayer && storedSession) {
          const demo = demoFlag === true && ENVIRONMENT.features.demoMode;
          setSession(storedSession);
          setIsDemoMode(demo);
          if (demo) {
            setPlayer(storedPlayer);
          } else {
            try {
              const fresh = await apiClient.get<DemoPlayer>(`/players/${encodeURIComponent(storedSession.playerId)}`);
              setPlayer(fresh);
              await setItem(StorageKeys.player, fresh);
            } catch {
              await Promise.all([removeItem(StorageKeys.player), removeItem(StorageKeys.session)]);
              setSession(null); setPlayer(null);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (p: DemoPlayer, s: AuthSession, demo: boolean) => {
    await Promise.all([
      setItem(StorageKeys.player, p),
      setItem(StorageKeys.session, s),
      setItem(StorageKeys.demoMode, demo),
    ]);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!email.trim() || !password) {
        return { success: false, message: "Email and password are required." };
      }
      if (isDemoMode) {
        const existing = await getItem<DemoPlayer>(StorageKeys.player);
        let p = existing;
        if (!p || p.email.toLowerCase() !== email.toLowerCase()) {
          p = createDemoPlayer(email.split("@")[0] || "citizen", email.split("@")[0] || "Citizen", email);
        }
        p.lastLoginAt = new Date().toISOString();
        p.status = "online";
        const s = makeSession(p.id);
        setPlayer(p); setSession(s);
        await persist(p, s, true);
        return { success: true, message: "Welcome back." };
      }
      try {
        const result = await authService.login(email, password);
        if (!result.success || !result.user || !result.session) {
          return { success: false, message: result.message || "Unable to sign in." };
        }
        const profile = await apiClient.get<DemoPlayer>(`/players/${encodeURIComponent(result.user.playerId)}`);
        const s = result.session;
        setPlayer(profile); setSession(s); setIsDemoMode(false);
        await persist(profile, s, false);
        return { success: true, message: result.message || "Welcome back." };
      } catch (error) {
        return { success: false, message: error instanceof ApiRequestError ? error.message : "Unable to connect to the game server." };
      }
    },
    [isDemoMode, persist]
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string, username: string, countryId = "country_jps") => {
      if (!email.trim() || !password || !displayName.trim() || !username.trim()) {
        return { success: false, message: "All fields are required." };
      }
      if (password.length < 8) {
        return { success: false, message: "Password must be at least 8 characters." };
      }
      if (isDemoMode) {
        if (username.length < 3) return { success: false, message: "Username must be at least 3 characters." };
        const p = createDemoPlayer(username, displayName, email, countryId);
        const s = makeSession(p.id);
        setPlayer(p); setSession(s);
        await persist(p, s, true);
        return { success: true, message: "Account created. Entering the world." };
      }
      try {
        const result = await authService.register({ email, password, displayName, username, countryId });
        if (!result.success || !result.user) return { success: false, message: result.message || "Unable to create account." };
        const profile = await apiClient.get<DemoPlayer>(`/players/${encodeURIComponent(result.user.playerId)}`);
        const session = await getItem<AuthSession>(StorageKeys.session);
        if (!session) return { success: false, message: "Account created, but the session could not be saved." };
        const nextProfile = await apiClient.get<DemoPlayer>(`/players/${encodeURIComponent(result.user.playerId)}`);
        setPlayer(nextProfile); setSession(session); setIsDemoMode(false);
        await persist(nextProfile, session, false);
        return { success: true, message: result.message || "Account created. Entering the world." };
      } catch (error) {
        return { success: false, message: error instanceof ApiRequestError ? error.message : "Unable to connect to the game server." };
      }
    },
    [isDemoMode, persist]
  );

  const logout = useCallback(async () => {
    if (session && !isDemoMode) {
      try { await authService.logout(); } catch { /* local logout must still succeed */ }
    }
    setPlayer(null);
    setSession(null);
    await Promise.all([
      removeItem(StorageKeys.player),
      removeItem(StorageKeys.session),
      removeItem(StorageKeys.demoMode),
    ]);
  }, [session, isDemoMode]);

  const enterDemo = useCallback(async () => {
    const p = createDemoPlayer("demo_commander", "Demo Commander", "demo@globaldominion.game");
    p.level = 12;
    p.experience = 8400;
    p.prestige = 15;
    p.wealth = 18500;
    p.rank = "officer";
    p.career = "military";
    p.biography = "Demo account exploring Global Dominion.";
    const s = makeSession(p.id);
    setPlayer(p);
    setSession(s);
    setIsDemoMode(true);
    await persist(p, s, true);
  }, [persist]);

  const updatePlayer = useCallback(
    async (patch: Partial<DemoPlayer>) => {
      if (!player || !session) return;
      const next = { ...player, ...patch };
      setPlayer(next);
      await setItem(StorageKeys.player, next);
    },
    [player, session]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: !!player && !!session,
      isDemoMode,
      player,
      session,
      login,
      register,
      logout,
      enterDemo,
      updatePlayer,
    }),
    [
      isLoading,
      player,
      session,
      isDemoMode,
      login,
      register,
      logout,
      enterDemo,
      updatePlayer,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
