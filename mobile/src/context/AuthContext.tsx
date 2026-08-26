import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StorageKeys, getItem, removeItem, setItem } from "../utils/storage";
import { createDemoPlayer, type DemoPlayer } from "../data/mock";
import { authService } from "../services/auth";
import { apiClient } from "../services/api";
import { ENVIRONMENT } from "../config/environment";

export interface AuthSession {
  sessionId: string;
  playerId: string;
  accessToken: string;
  expiresAt: string;
  refreshToken?: string;
}

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  isOfflineMode: boolean;
  isDemoMode: boolean;
  player: DemoPlayer | null;
  session: AuthSession | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
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
const LOCAL_ACCOUNTS_KEY = "@gd/local_accounts";

interface LocalAccount {
  email: string;
  password: string;
  player: DemoPlayer;
}

function makeSession(playerId: string): AuthSession {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  return {
    sessionId: `sess_${Date.now().toString(36)}`,
    playerId,
    accessToken: `local_${Math.random().toString(36).slice(2)}`,
    expiresAt: expires.toISOString(),
  };
}

function sanitizeUsername(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  if (cleaned.length >= 3) return cleaned.slice(0, 24);
  return `player_${Date.now().toString(36).slice(-6)}`;
}

async function loadLocalAccounts(): Promise<LocalAccount[]> {
  return (await getItem<LocalAccount[]>(LOCAL_ACCOUNTS_KEY)) ?? [];
}

async function saveLocalAccounts(list: LocalAccount[]): Promise<void> {
  await setItem(LOCAL_ACCOUNTS_KEY, list);
}

/** Quick probe — never block auth on a dead API */
async function serverReachable(ms = 2500): Promise<boolean> {
  try {
    const base = ENVIRONMENT.api.baseUrl.replace(/\/api\/?$/, "");
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const res = await fetch(`${base}/health`, { signal: ctrl.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<DemoPlayer | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(true);

  const persist = useCallback(
    async (p: DemoPlayer, s: AuthSession, offline: boolean) => {
      await Promise.all([
        setItem(StorageKeys.player, p),
        setItem(StorageKeys.session, s),
        setItem(StorageKeys.demoMode, offline),
      ]);
    },
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const [storedPlayer, storedSession, offlineFlag] = await Promise.all([
          getItem<DemoPlayer>(StorageKeys.player),
          getItem<AuthSession>(StorageKeys.session),
          getItem<boolean>(StorageKeys.demoMode),
        ]);
        if (storedPlayer && storedSession) {
          const offline = offlineFlag !== false;
          setPlayer(storedPlayer);
          setSession(storedSession);
          setIsOfflineMode(offline);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginLocal = useCallback(
    async (email: string, password: string) => {
      const accounts = await loadLocalAccounts();
      const key = email.trim().toLowerCase();
      const found = accounts.find((a) => a.email === key);

      if (found) {
        if (found.password !== password) {
          return { success: false, message: "Wrong password for this account." };
        }
        found.player.lastLoginAt = new Date().toISOString();
        found.player.status = "online";
        const s = makeSession(found.player.id);
        await saveLocalAccounts(accounts);
        setPlayer(found.player);
        setSession(s);
        setIsOfflineMode(true);
        await persist(found.player, s, true);
        return { success: true, message: "Welcome back." };
      }

      // No local account yet — create one on first sign-in so the app never bricks
      const p = createDemoPlayer(
        sanitizeUsername(email.split("@")[0] || "citizen"),
        email.split("@")[0] || "Citizen",
        key
      );
      p.lastLoginAt = new Date().toISOString();
      const s = makeSession(p.id);
      accounts.push({ email: key, password, player: p });
      await saveLocalAccounts(accounts);
      setPlayer(p);
      setSession(s);
      setIsOfflineMode(true);
      await persist(p, s, true);
      return {
        success: true,
        message: "Signed in. Your world is saved on this device.",
      };
    },
    [persist]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (!email.trim() || !password) {
        return { success: false, message: "Email and password are required." };
      }
      if (password.length < 4) {
        return { success: false, message: "Password is too short." };
      }

      // Prefer local so the app always works without a hosted API
      const online = await serverReachable();
      if (!online) {
        return loginLocal(email, password);
      }

      try {
        const result = await authService.login(email, password);
        if (!result?.success || !result.user || !result.session) {
          // Server up but credentials unknown → local fallback
          return loginLocal(email, password);
        }
        const s: AuthSession = {
          sessionId: result.session.sessionId,
          playerId: result.session.playerId,
          accessToken: result.session.accessToken,
          expiresAt: result.session.expiresAt,
          refreshToken: result.session.refreshToken,
        };
        await setItem(StorageKeys.session, s);
        let profile: DemoPlayer;
        try {
          profile = await apiClient.get<DemoPlayer>(
            `/players/${encodeURIComponent(result.user.playerId)}`
          );
        } catch {
          profile = createDemoPlayer(
            sanitizeUsername(result.user.email.split("@")[0]),
            result.user.displayName || result.user.email.split("@")[0],
            result.user.email
          );
          profile.id = result.user.playerId;
        }
        setPlayer(profile);
        setSession(s);
        setIsOfflineMode(false);
        await persist(profile, s, false);
        return { success: true, message: result.message || "Welcome back." };
      } catch {
        return loginLocal(email, password);
      }
    },
    [loginLocal, persist]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      username: string,
      countryId = "country_jps"
    ) => {
      if (!email.trim() || !password || !displayName.trim()) {
        return { success: false, message: "Name, email and password are required." };
      }
      if (password.length < 6) {
        return {
          success: false,
          message: "Password must be at least 6 characters.",
        };
      }
      const user = sanitizeUsername(username || displayName || email.split("@")[0]);
      const key = email.trim().toLowerCase();

      const finishLocal = async () => {
        const accounts = await loadLocalAccounts();
        if (accounts.some((a) => a.email === key)) {
          return {
            success: false,
            message: "This email is already registered on this device. Sign in instead.",
          };
        }
        const p = createDemoPlayer(user, displayName.trim(), key, countryId);
        const s = makeSession(p.id);
        accounts.push({ email: key, password, player: p });
        await saveLocalAccounts(accounts);
        setPlayer(p);
        setSession(s);
        setIsOfflineMode(true);
        await persist(p, s, true);
        return {
          success: true,
          message: "Account created. Entering the ordered world.",
        };
      };

      const online = await serverReachable();
      if (!online) {
        return finishLocal();
      }

      try {
        const result = await authService.register({
          email: key,
          password,
          displayName: displayName.trim(),
          username: user,
          countryId,
        });
        if (!result?.success && !result?.user) {
          return finishLocal();
        }
        // Try login after register
        try {
          const loginResult = await authService.login(key, password);
          if (loginResult?.success && loginResult.session && loginResult.user) {
            const s: AuthSession = {
              sessionId: loginResult.session.sessionId,
              playerId: loginResult.session.playerId,
              accessToken: loginResult.session.accessToken,
              expiresAt: loginResult.session.expiresAt,
              refreshToken: loginResult.session.refreshToken,
            };
            await setItem(StorageKeys.session, s);
            let profile: DemoPlayer;
            try {
              profile = await apiClient.get<DemoPlayer>(
                `/players/${encodeURIComponent(loginResult.user.playerId)}`
              );
            } catch {
              profile = createDemoPlayer(
                user,
                displayName.trim(),
                key,
                countryId
              );
              profile.id = loginResult.user.playerId;
            }
            setPlayer(profile);
            setSession(s);
            setIsOfflineMode(false);
            await persist(profile, s, false);
            return {
              success: true,
              message: "Account created. Entering the world.",
            };
          }
        } catch {
          /* fall through */
        }
        return finishLocal();
      } catch {
        return finishLocal();
      }
    },
    [persist]
  );

  const logout = useCallback(async () => {
    if (session && !isOfflineMode) {
      try {
        await authService.logout();
      } catch {
        /* ignore */
      }
    }
    setPlayer(null);
    setSession(null);
    setIsOfflineMode(true);
    await Promise.all([
      removeItem(StorageKeys.player),
      removeItem(StorageKeys.session),
      removeItem(StorageKeys.demoMode),
    ]);
  }, [session, isOfflineMode]);

  const enterDemo = useCallback(async () => {
    const p = createDemoPlayer(
      "commander",
      "Commander",
      "commander@dominion.local",
      "country_jps"
    );
    p.level = 5;
    p.wealth = 5000;
    p.rank = "officer";
    const s = makeSession(p.id);
    setPlayer(p);
    setSession(s);
    setIsOfflineMode(true);
    await persist(p, s, true);
  }, [persist]);

  const updatePlayer = useCallback(
    async (patch: Partial<DemoPlayer>) => {
      if (!player || !session) return;
      const next = { ...player, ...patch };
      setPlayer(next);
      await setItem(StorageKeys.player, next);
      if (isOfflineMode) {
        const accounts = await loadLocalAccounts();
        const idx = accounts.findIndex((a) => a.player.id === next.id);
        if (idx >= 0) {
          accounts[idx].player = next;
          await saveLocalAccounts(accounts);
        }
      }
    },
    [player, session, isOfflineMode]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: !!player && !!session,
      isOfflineMode,
      isDemoMode: isOfflineMode,
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
      isOfflineMode,
      login,
      register,
      logout,
      enterDemo,
      updatePlayer,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
