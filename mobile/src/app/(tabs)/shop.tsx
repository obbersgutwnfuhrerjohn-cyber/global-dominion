import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Badge,
  Button,
  Card,
  Screen,
  SectionHeader,
  Title,
  Muted,
  Divider,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";
import { useShop } from "../../context/ShopContext";
import {
  SHOP_CATEGORIES,
  type ShopCategory,
  type ShopProduct,
} from "../../data/shopCatalog";

export default function ShopScreen() {
  const {
    marks,
    products,
    storeReady,
    storeMessage,
    purchasing,
    buy,
    unlocks,
  } = useShop();
  const [category, setCategory] = useState<ShopCategory | "all">("all");

  const filtered = useMemo(() => {
    if (category === "all") return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  const onBuy = (p: ShopProduct) => {
    Alert.alert(
      p.title,
      `${p.description}\n\nPrice: ${p.priceLabel}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: async () => {
            const r = await buy(p.id);
            Alert.alert(
              r.success ? "Purchase complete" : "Purchase failed",
              r.message
            );
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stripe} />
          <Muted>IMPERIAL COMMISSARY · REAL MONEY</Muted>
          <Title>Shop</Title>
        </View>

        <Card>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>YOUR MARKS</Text>
              <Text style={styles.balanceValue}>{marks.toLocaleString()}</Text>
            </View>
            <Badge
              text={storeReady ? "STORE ONLINE" : "STORE SETUP"}
              tone={storeReady ? "success" : "warning"}
            />
          </View>
          <Muted>{storeMessage}</Muted>
          <Divider />
          <Muted>
            Purchases use Apple App Store or Google Play billing. Product IDs
            must be created in App Store Connect and Play Console to match this
            catalog. Restore purchases from device account settings if needed.
          </Muted>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cats}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {SHOP_CATEGORIES.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCategory(c.id)}
              style={[
                styles.catChip,
                category === c.id && styles.catChipActive,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  category === c.id && styles.catTextActive,
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.map((p) => {
          const owned =
            p.unlocks?.every((u) => unlocks.includes(u)) &&
            p.category === "cosmetic";
          return (
            <Card key={p.id}>
              <View style={styles.productHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productTitle}>{p.title}</Text>
                  <Muted>{p.description}</Muted>
                </View>
                {p.bestValue ? (
                  <Badge text="BEST" tone="gold" />
                ) : p.popular ? (
                  <Badge text="POPULAR" tone="info" />
                ) : null}
              </View>
              <Divider />
              <View style={styles.productFooter}>
                <Text style={styles.price}>{p.priceLabel}</Text>
                {owned ? (
                  <Badge text="OWNED" tone="success" />
                ) : (
                  <Button
                    title={purchasing === p.id ? "…" : "Purchase"}
                    variant="primary"
                    onPress={() => onBuy(p)}
                    disabled={!!purchasing}
                    loading={purchasing === p.id}
                  />
                )}
              </View>
              {p.marks ? (
                <Text style={styles.grant}>+{p.marks.toLocaleString()} Marks</Text>
              ) : null}
            </Card>
          );
        })}

        <Card>
          <SectionHeader title="Inventory unlocks" />
          {unlocks.length === 0 ? (
            <Muted>No cosmetic or item unlocks yet.</Muted>
          ) : (
            unlocks.map((u) => (
              <Text key={u} style={styles.unlock}>
                ★ {u}
              </Text>
            ))
          )}
        </Card>

        <View style={{ height: 28 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16, marginTop: 4 },
  stripe: {
    height: 3,
    width: 48,
    backgroundColor: COLORS.accentGold,
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  balanceValue: {
    color: COLORS.accentGold,
    fontSize: 28,
    fontWeight: "800",
  },
  cats: { marginBottom: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.surfacePressed,
  },
  catText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  catTextActive: { color: COLORS.accentGold },
  productHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  productTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  price: {
    color: COLORS.accentGold,
    fontSize: 18,
    fontWeight: "800",
  },
  grant: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  unlock: {
    color: COLORS.accentGold,
    fontSize: 13,
    marginBottom: 6,
  },
});
