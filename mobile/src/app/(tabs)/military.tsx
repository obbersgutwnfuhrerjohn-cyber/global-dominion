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
  Stat,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";

export default function MilitaryScreen() {
  const { units } = useGame();

  const totalForce = units.reduce((sum, u) => sum + u.size, 0);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Muted>ARMED FORCES</Muted>
          <Title>Military Command</Title>
        </View>

        <Card>
          <View style={styles.row}>
            <Stat label="ACTIVE UNITS" value={units.length} accent />
            <Stat label="TOTAL FORCE" value={totalForce.toLocaleString()} />
            <Stat label="READINESS" value="High" />
          </View>
        </Card>

        <Card>
          <SectionHeader title="Deployed Formations" />
          {units.map((u) => (
            <View key={u.id} style={styles.unit}>
              <View style={styles.unitHeader}>
                <Text style={styles.unitName}>{u.name}</Text>
                <Badge
                  text={u.status.toUpperCase()}
                  tone={u.status === "ready" ? "success" : "warning"}
                />
              </View>
              <Muted>
                {u.type.replace(/_/g, " ")} • {u.location}
              </Muted>
              <Divider />
              <View style={styles.row}>
                <Stat label="SIZE" value={u.size.toLocaleString()} />
                <Stat label="MORALE" value={`${u.morale}%`} />
                <Stat label="SUPPLY" value={`${u.supply}%`} />
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <SectionHeader title="Operations" />
          <Muted>
            War, logistics, and real-time unit control are defined in
            services/war.ts, services/military.ts and services/realtime.ts.
            Hook them to the backend when ready. Fog of war and supply lines
            are already configured in GAME_CONFIG.
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
    gap: 8,
  },
  unit: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  unitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  unitName: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
});
