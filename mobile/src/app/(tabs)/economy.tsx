import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useGame } from "../../context/GameContext";
import {
  Badge,
  Card,
  Screen,
  SectionHeader,
  Title,
  Muted,
  Divider,
  Button,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";

export default function EconomyScreen() {
  const { resources, market, tickCount, advanceTick } = useGame();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ height: 3, width: 48, backgroundColor: COLORS.accentBright, marginBottom: 10 }} />
          <Muted>NATIONAL ECONOMY · 1962</Muted>
          <Title>Resources & Markets</Title>
        </View>

        <Card>
          <SectionHeader
            title="Resource Stocks"
            action={
              <Button
                title="Simulate Tick"
                variant="secondary"
                onPress={advanceTick}
              />
            }
          />
          <Muted>Tick #{tickCount} • Demo simulation</Muted>
          <Divider />
          {resources.map((r) => {
            const net = r.production - r.consumption;
            return (
              <View key={r.type} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{r.name}</Text>
                  <Muted>
                    Prod {r.production} / Cons {r.consumption} {r.unit}
                  </Muted>
                </View>
                <View style={styles.right}>
                  <Text style={styles.amount}>
                    {r.amount} {r.unit}
                  </Text>
                  <Text
                    style={[
                      styles.net,
                      { color: net >= 0 ? COLORS.success : COLORS.danger },
                    ]}
                  >
                    {net >= 0 ? "+" : ""}
                    {net}/tick
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        <Card>
          <SectionHeader title="Global Market" />
          {market.map((m) => (
            <View key={m.symbol} style={styles.marketRow}>
              <View>
                <Text style={styles.symbol}>{m.symbol}</Text>
                <Muted>{m.name}</Muted>
              </View>
              <View style={styles.right}>
                <Text style={styles.price}>{m.price.toFixed(2)}</Text>
                <Badge
                  text={`${m.change >= 0 ? "+" : ""}${m.change.toFixed(1)}%`}
                  tone={m.change >= 0 ? "success" : "danger"}
                />
              </View>
            </View>
          ))}
          <Divider />
          <Muted>
            Full trading, stock market, and corporate finance services are
            already typed in services/ — connect them when the API is ready.
          </Muted>
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  net: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  symbol: {
    color: COLORS.accentBright,
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  price: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
});
