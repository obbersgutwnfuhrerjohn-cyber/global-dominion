/**
 * In-App Purchases service for App Store / Google Play.
 *
 * Production: connects to native billing via react-native-iap in native store builds.
 * Validation: POST receipt to server /shop/validate then apply entitlements.
 *
 * Configure identical product IDs in:
 *   - App Store Connect → In-App Purchases
 *   - Google Play Console → Monetize → Products
 */
import { Platform } from "react-native";
import { apiClient } from "./api";
import { ENVIRONMENT } from "../config/environment";
import { SHOP_PRODUCTS, type ShopProduct } from "../data/shopCatalog";

export interface PurchaseResult {
  success: boolean;
  message: string;
  product?: ShopProduct;
  transactionId?: string;
  /** Applied grants for UI */
  grants?: {
    marks?: number;
    wealth?: number;
    influence?: number;
    prestige?: number;
    loyalty?: number;
    unlocks?: string[];
  };
}

export interface OwnedEntitlement {
  productId: string;
  unlocks: string[];
  purchasedAt: string;
  transactionId: string;
}

type NativeIap = {
  initConnection: () => Promise<boolean>;
  endConnection: () => Promise<void>;
  getProducts: (skus: string[]) => Promise<unknown[]>;
  requestPurchase: (sku: string) => Promise<{
    transactionId?: string;
    transactionReceipt?: string;
    purchaseToken?: string;
  }>;
  finishTransaction: (purchase: unknown, isConsumable?: boolean) => Promise<void>;
  getAvailablePurchases: () => Promise<any[]>;
};

let nativeIap: NativeIap | null = null;
let connected = false;

async function loadNativeIap(): Promise<NativeIap | null> {
  if (nativeIap) return nativeIap;
  if (Platform.OS === "web") return null;
  try {
    // Optional peer: npm i react-native-iap (required for store binaries)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    // Keep IAP optional so the app can run in Expo/web test environments without the native billing module.
    const mod = (0, eval)("require")("react-native-iap");
    nativeIap = {
      initConnection: mod.initConnection,
      endConnection: mod.endConnection,
      getProducts: (skus) =>
        mod.getProducts
          ? mod.getProducts({ skus })
          : mod.getSubscriptions?.({ skus }) ?? Promise.resolve([]),
      requestPurchase: async (sku: string) => {
        if (Platform.OS === "ios") {
          return mod.requestPurchase({ sku });
        }
        return mod.requestPurchase({ skus: [sku] });
      },
      finishTransaction: mod.finishTransaction,
      getAvailablePurchases: () => mod.getAvailablePurchases?.() ?? Promise.resolve([]),
    };
    return nativeIap;
  } catch {
    return null;
  }
}

export async function initIap(): Promise<{ ready: boolean; message: string }> {
  if (!ENVIRONMENT.features.iap) {
    return { ready: false, message: "IAP disabled in this environment." };
  }
  const iap = await loadNativeIap();
  if (!iap) {
    return {
      ready: false,
      message:
        Platform.OS === "web"
          ? "Store billing is available on iOS and Android builds."
          : "Install react-native-iap and rebuild for native store billing.",
    };
  }
  try {
    await iap.initConnection();
    connected = true;
    const skus = SHOP_PRODUCTS.map((p) => p.storeProductId);
    await iap.getProducts(skus);
    return { ready: true, message: "Store connected." };
  } catch (e) {
    return {
      ready: false,
      message: e instanceof Error ? e.message : "Failed to connect to store.",
    };
  }
}

export async function endIap(): Promise<void> {
  if (!connected || !nativeIap) return;
  try {
    await nativeIap.endConnection();
  } catch {
    /* ignore */
  }
  connected = false;
}

/**
 * Purchase a catalog product.
 * 1) Request store payment
 * 2) Validate receipt on game server
 * 3) Apply grants locally after server OK
 */
export async function purchaseProduct(
  productId: string,
  playerId: string
): Promise<PurchaseResult> {
  const product = SHOP_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return { success: false, message: "Unknown product." };
  }

  if (!ENVIRONMENT.features.iap) {
    return { success: false, message: "Purchases are not enabled." };
  }

  const iap = await loadNativeIap();

  // —— Native store path (production binaries) ——
  if (iap && connected) {
    try {
      const purchase = await iap.requestPurchase(product.storeProductId);
      const receipt =
        purchase.transactionReceipt ||
        purchase.purchaseToken ||
        purchase.transactionId ||
        "";

      const validated = await validateWithServer({
        playerId,
        productId: product.id,
        storeProductId: product.storeProductId,
        platform: Platform.OS,
        receipt,
        transactionId: purchase.transactionId,
      });

      if (!validated.success) {
        return { success: false, message: validated.message };
      }

      try {
        await iap.finishTransaction(purchase, product.category !== "cosmetic");
      } catch {
        /* still grant if server accepted */
      }

      return {
        success: true,
        message: validated.message || "Purchase complete.",
        product,
        transactionId: purchase.transactionId,
        grants: buildGrants(product),
      };
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Purchase cancelled or failed.";
      if (/cancel/i.test(msg)) {
        return { success: false, message: "Purchase cancelled." };
      }
      return { success: false, message: msg };
    }
  }

  return {
    success: false,
    message: Platform.OS === "web"
      ? "Store purchases are available only in App Store / Google Play builds."
      : "Store billing is unavailable. Rebuild the native app with the store billing module enabled.",
  };
}

/** Restore previously purchased non-consumables from the store account.
 * Consumable currency is intentionally not recreated by restore; the server ledger owns it.
 */
export async function restorePurchases(playerId: string): Promise<PurchaseResult[]> {
  const iap = await loadNativeIap();
  if (!iap || !connected || !ENVIRONMENT.features.iap) {
    return [{ success: false, message: "Store billing is unavailable." }];
  }
  const purchases = await iap.getAvailablePurchases();
  const results: PurchaseResult[] = [];
  for (const purchase of purchases) {
    const storeProductId = purchase.productId || purchase.sku;
    const product = SHOP_PRODUCTS.find((p) => p.storeProductId === storeProductId);
    if (!product || product.category !== "cosmetic") continue;
    const result = await validateWithServer({
      playerId,
      productId: product.id,
      storeProductId: product.storeProductId,
      platform: Platform.OS,
      receipt: purchase.purchaseToken || purchase.transactionReceipt || "",
      transactionId: purchase.transactionId,
    });
    results.push({
      success: result.success,
      message: result.message,
      product,
      transactionId: result.transactionId,
      grants: result.success ? buildGrants(product) : undefined,
    });
  }
  return results;
}

function buildGrants(product: ShopProduct) {
  return {
    marks: product.marks,
    wealth: product.wealth,
    influence: product.influence,
    prestige: product.prestige,
    loyalty: product.loyalty,
    unlocks: product.unlocks,
  };
}

async function validateWithServer(body: {
  playerId: string;
  productId: string;
  storeProductId: string;
  platform: string;
  receipt: string;
  transactionId?: string;
  testPurchase?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  transactionId?: string;
}> {
  try {
    const data = await apiClient.post<{
      success?: boolean;
      message?: string;
      transactionId?: string;
    }>(ENVIRONMENT.iap.validatePath, body);
    return {
      success: data?.success !== false,
      message: data?.message || "Validated.",
      transactionId: data?.transactionId || body.transactionId,
    };
  } catch (e) {
    // If API returns structured error
    if (e && typeof e === "object" && "message" in e) {
      return {
        success: false,
        message: String((e as { message: string }).message),
      };
    }
    return {
      success: false,
      message: "Server validation failed. Try again later.",
    };
  }
}

export function getCatalog(): ShopProduct[] {
  return SHOP_PRODUCTS;
}
