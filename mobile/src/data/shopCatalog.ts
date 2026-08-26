/**
 * In-app purchase catalog — product IDs must match App Store Connect & Google Play Console.
 * Prefix: com.globaldominion.game.*
 */
export type ShopCategory =
  | "currency"
  | "boost"
  | "cosmetic"
  | "military"
  | "political"
  | "bundle";

export interface ShopProduct {
  id: string;
  /** Store SKU — create identical IDs in ASC / Play Console */
  storeProductId: string;
  title: string;
  description: string;
  category: ShopCategory;
  /** Display price hint (real price comes from the store) */
  priceLabel: string;
  /** USD cents for server analytics */
  priceCents: number;
  /** Marks (premium currency) granted */
  marks?: number;
  /** Soft currency */
  wealth?: number;
  influence?: number;
  prestige?: number;
  loyalty?: number;
  /** Cosmetic / unlock keys applied to inventory */
  unlocks?: string[];
  /** Consumable boost duration hours */
  boostHours?: number;
  popular?: boolean;
  bestValue?: boolean;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  // —— Premium currency (Marks) ——
  {
    id: "marks_500",
    storeProductId: "com.globaldominion.game.marks_500",
    title: "500 Marks",
    description: "Imperial Marks for the black market and state shops.",
    category: "currency",
    priceLabel: "$0.99",
    priceCents: 99,
    marks: 500,
  },
  {
    id: "marks_1200",
    storeProductId: "com.globaldominion.game.marks_1200",
    title: "1,200 Marks",
    description: "Standard reserve of Imperial Marks.",
    category: "currency",
    priceLabel: "$1.99",
    priceCents: 199,
    marks: 1200,
    popular: true,
  },
  {
    id: "marks_6500",
    storeProductId: "com.globaldominion.game.marks_6500",
    title: "6,500 Marks",
    description: "Large treasury allocation. Best rate per Mark.",
    category: "currency",
    priceLabel: "$9.99",
    priceCents: 999,
    marks: 6500,
    bestValue: true,
  },
  {
    id: "marks_14000",
    storeProductId: "com.globaldominion.game.marks_14000",
    title: "14,000 Marks",
    description: "Strategic reserve for long campaigns.",
    category: "currency",
    priceLabel: "$19.99",
    priceCents: 1999,
    marks: 14000,
  },

  // —— Boosts ——
  {
    id: "boost_xp_24h",
    storeProductId: "com.globaldominion.game.boost_xp_24h",
    title: "XP Decree (24h)",
    description: "+50% experience from all actions for 24 hours.",
    category: "boost",
    priceLabel: "$2.99",
    priceCents: 299,
    boostHours: 24,
    unlocks: ["boost_xp_50"],
  },
  {
    id: "boost_production_24h",
    storeProductId: "com.globaldominion.game.boost_production_24h",
    title: "Industrial Mandate (24h)",
    description: "+25% resource production for 24 hours.",
    category: "boost",
    priceLabel: "$2.99",
    priceCents: 299,
    boostHours: 24,
    unlocks: ["boost_production_25"],
  },
  {
    id: "boost_loyalty_pack",
    storeProductId: "com.globaldominion.game.boost_loyalty",
    title: "Loyalty Inspection",
    description: "Instant +15 loyalty. Useful before promotions.",
    category: "boost",
    priceLabel: "$1.99",
    priceCents: 199,
    loyalty: 15,
  },

  // —— Military ——
  {
    id: "mil_volunteer_legion",
    storeProductId: "com.globaldominion.game.mil_volunteer",
    title: "Volunteer Legion Contract",
    description: "Instantly form a 5,000-strong infantry formation.",
    category: "military",
    priceLabel: "$4.99",
    priceCents: 499,
    unlocks: ["unit_volunteer_legion"],
  },
  {
    id: "mil_armor_detachment",
    storeProductId: "com.globaldominion.game.mil_armor",
    title: "Armor Detachment",
    description: "Deploy a ready armored brigade to your capital.",
    category: "military",
    priceLabel: "$7.99",
    priceCents: 799,
    unlocks: ["unit_armor_brigade"],
  },
  {
    id: "mil_war_bonds",
    storeProductId: "com.globaldominion.game.mil_warbonds",
    title: "War Bonds",
    description: "Treasury infusion for wartime logistics.",
    category: "military",
    priceLabel: "$3.99",
    priceCents: 399,
    wealth: 25000,
  },

  // —— Political ——
  {
    id: "pol_influence_pack",
    storeProductId: "com.globaldominion.game.pol_influence",
    title: "Influence Dossier",
    description: "+25 political influence.",
    category: "political",
    priceLabel: "$2.99",
    priceCents: 299,
    influence: 25,
  },
  {
    id: "pol_prestige_order",
    storeProductId: "com.globaldominion.game.pol_prestige",
    title: "Order of Merit",
    description: "+10 prestige and a dossier commendation.",
    category: "political",
    priceLabel: "$4.99",
    priceCents: 499,
    prestige: 10,
    unlocks: ["medal_order_of_merit"],
  },
  {
    id: "pol_revolution_fund",
    storeProductId: "com.globaldominion.game.pol_revolution",
    title: "Covert Fund",
    description: "Fuel independence movements (+20 movement support when used).",
    category: "political",
    priceLabel: "$5.99",
    priceCents: 599,
    unlocks: ["item_covert_fund"],
  },

  // —— Cosmetics ——
  {
    id: "cos_banner_reich",
    storeProductId: "com.globaldominion.game.cos_banner_reich",
    title: "Reich Command Banner",
    description: "Profile banner — authority aesthetic.",
    category: "cosmetic",
    priceLabel: "$1.99",
    priceCents: 199,
    unlocks: ["banner_reich"],
  },
  {
    id: "cos_banner_pacific",
    storeProductId: "com.globaldominion.game.cos_banner_pacific",
    title: "Pacific States Banner",
    description: "Profile banner — imperial Pacific style.",
    category: "cosmetic",
    priceLabel: "$1.99",
    priceCents: 199,
    unlocks: ["banner_pacific"],
  },
  {
    id: "cos_title_director",
    storeProductId: "com.globaldominion.game.cos_title_director",
    title: "Title: Provincial Director",
    description: "Display title under your name (cosmetic).",
    category: "cosmetic",
    priceLabel: "$2.99",
    priceCents: 299,
    unlocks: ["title_provincial_director"],
  },

  // —— Bundles ——
  {
    id: "bundle_starter",
    storeProductId: "com.globaldominion.game.bundle_starter",
    title: "Subject Starter Pack",
    description: "2,000 Marks + XP boost 24h + Influence +5.",
    category: "bundle",
    priceLabel: "$4.99",
    priceCents: 499,
    marks: 2000,
    influence: 5,
    unlocks: ["boost_xp_50"],
    boostHours: 24,
    popular: true,
  },
  {
    id: "bundle_commander",
    storeProductId: "com.globaldominion.game.bundle_commander",
    title: "Commander Pack",
    description: "6,500 Marks + Armor Detachment + War Bonds.",
    category: "bundle",
    priceLabel: "$14.99",
    priceCents: 1499,
    marks: 6500,
    wealth: 25000,
    unlocks: ["unit_armor_brigade"],
    bestValue: true,
  },
];

export const SHOP_CATEGORIES: { id: ShopCategory | "all"; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "currency", label: "MARKS" },
  { id: "bundle", label: "BUNDLES" },
  { id: "boost", label: "BOOSTS" },
  { id: "military", label: "MILITARY" },
  { id: "political", label: "POLITICS" },
  { id: "cosmetic", label: "STYLE" },
];
