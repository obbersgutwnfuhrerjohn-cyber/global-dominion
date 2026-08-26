import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";
import {
  initIap,
  endIap,
  purchaseProduct,
  type PurchaseResult,
} from "../services/iap";
import { SHOP_PRODUCTS, type ShopProduct } from "../data/shopCatalog";
import { getItem, setItem, StorageKeys } from "../utils/storage";

interface ShopState {
  marks: number;
  unlocks: string[];
  activeBoosts: { id: string; expiresAt: string }[];
}

interface ShopContextValue {
  marks: number;
  unlocks: string[];
  activeBoosts: { id: string; expiresAt: string }[];
  products: ShopProduct[];
  storeReady: boolean;
  storeMessage: string;
  purchasing: string | null;
  buy: (productId: string) => Promise<PurchaseResult>;
  hasUnlock: (key: string) => boolean;
  spendMarks: (amount: number) => boolean;
}

const ShopContext = createContext<ShopContextValue | null>(null);

const defaultState = (): ShopState => ({
  marks: 0,
  unlocks: [],
  activeBoosts: [],
});

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { player, isAuthenticated, updatePlayer } = useAuth();
  const [state, setState] = useState<ShopState>(defaultState);
  const [storeReady, setStoreReady] = useState(false);
  const [storeMessage, setStoreMessage] = useState("Connecting to store…");
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Load per-player shop state
  useEffect(() => {
    if (!player?.id) {
      setState(defaultState());
      return;
    }
    (async () => {
      const key = `${StorageKeys.settings}_shop_${player.id}`;
      const saved = await getItem<ShopState>(key);
      if (saved) setState(saved);
      else setState(defaultState());
    })();
  }, [player?.id]);

  const persist = useCallback(
    async (next: ShopState) => {
      setState(next);
      if (!player?.id) return;
      const key = `${StorageKeys.settings}_shop_${player.id}`;
      await setItem(key, next);
    },
    [player?.id]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await initIap();
      if (!alive) return;
      setStoreReady(r.ready);
      setStoreMessage(r.message);
    })();
    return () => {
      alive = false;
      endIap();
    };
  }, []);

  const buy = useCallback(
    async (productId: string): Promise<PurchaseResult> => {
      if (!player?.id || !isAuthenticated) {
        return { success: false, message: "Sign in required to purchase." };
      }
      setPurchasing(productId);
      try {
        const result = await purchaseProduct(productId, player.id);
        if (result.success && result.grants) {
          const g = result.grants;
          const next: ShopState = {
            marks: state.marks + (g.marks ?? 0),
            unlocks: Array.from(
              new Set([...state.unlocks, ...(g.unlocks ?? [])])
            ),
            activeBoosts: [...state.activeBoosts],
          };
          if (g.unlocks?.some((u) => u.startsWith("boost_"))) {
            const product = SHOP_PRODUCTS.find((p) => p.id === productId);
            const hours = product?.boostHours ?? 24;
            next.activeBoosts.push({
              id: g.unlocks.find((u) => u.startsWith("boost_")) || "boost",
              expiresAt: new Date(
                Date.now() + hours * 3600_000
              ).toISOString(),
            });
          }
          await persist(next);

          const patch: Record<string, number | string[]> = {};
          if (g.wealth) patch.wealth = (player.wealth ?? 0) + g.wealth;
          if (g.influence)
            patch.influence = ((player as { influence?: number }).influence ?? 0) + g.influence;
          if (g.prestige)
            patch.prestige = (player.prestige ?? 0) + g.prestige;
          if (g.loyalty)
            patch.loyalty = ((player as { loyalty?: number }).loyalty ?? 0) + g.loyalty;
          if (g.unlocks?.includes("medal_order_of_merit")) {
            const medals = [
              ...((player as { medals?: string[] }).medals ?? []),
              "Order of Merit",
            ];
            await updatePlayer({
              ...patch,
              medals,
            } as Parameters<typeof updatePlayer>[0]);
          } else if (Object.keys(patch).length) {
            await updatePlayer(patch as Parameters<typeof updatePlayer>[0]);
          }
        }
        return result;
      } finally {
        setPurchasing(null);
      }
    },
    [player, isAuthenticated, state, persist, updatePlayer]
  );

  const hasUnlock = useCallback(
    (key: string) => state.unlocks.includes(key),
    [state.unlocks]
  );

  const spendMarks = useCallback(
    (amount: number) => {
      if (state.marks < amount) return false;
      void persist({ ...state, marks: state.marks - amount });
      return true;
    },
    [state, persist]
  );

  const value = useMemo(
    () => ({
      marks: state.marks,
      unlocks: state.unlocks,
      activeBoosts: state.activeBoosts,
      products: SHOP_PRODUCTS,
      storeReady,
      storeMessage,
      purchasing,
      buy,
      hasUnlock,
      spendMarks,
    }),
    [
      state,
      storeReady,
      storeMessage,
      purchasing,
      buy,
      hasUnlock,
      spendMarks,
    ]
  );

  return (
    <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}

export function promptBuy(
  buy: (id: string) => Promise<PurchaseResult>,
  product: ShopProduct
) {
  Alert.alert(
    product.title,
    `${product.description}\n\n${product.priceLabel}`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Purchase",
        onPress: async () => {
          const r = await buy(product.id);
          Alert.alert(r.success ? "Purchased" : "Purchase failed", r.message);
        },
      },
    ]
  );
}
