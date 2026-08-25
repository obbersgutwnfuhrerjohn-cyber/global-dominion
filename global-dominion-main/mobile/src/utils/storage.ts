import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  session: "@gd/session",
  player: "@gd/player",
  demoMode: "@gd/demo_mode",
  settings: "@gd/settings",
} as const;

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors in demo
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const StorageKeys = KEYS;
