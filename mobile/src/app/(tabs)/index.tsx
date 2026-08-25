import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";
import {
  Badge,
  Card,
  Divider,
  Screen,
  SectionHeader,
  Stat,
  Title,
  Muted,
  Button,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";

export default function CommandScreen() {
  const { player } = useAuth();
  const { countries, events, resources, tickCount, advanceTick } = useGame();

  const country = countries.find((c) => c.id === player?.countryId);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Muted>COMMAND CENTER</Muted>
            <Title>{player?.displayName ?? "Commander"}</Title>
          </View>
          <Badge text={player?.rank?.toUpperCase() ?? "CITIZEN"} tone="info" />
        </View>

        <Card>
          <View style={styles.row}>
            <Stat label="LEVEL" value={player?.level ?? 1} accent />
            <Stat label="XP" value={player?.experience ?? 0} />
            <Stat label="WEALTH" value={`${player?.wealth ?? 0} ${player?.currency ?? "GD$"}`} />
          </View>
          <Divider />
          <View style={styles.row}>
            <Stat label="PRESTIGE" value={player?.prestige ?? 0} />
            <Stat label="REPUTATION" value={player?.reputation ?? 50} />
            <Stat label="STATUS" value={player?.status ?? "online"} />
          </View>
        </Card>

        {country ? (
          <Card>
            <SectionHeader title="Your Nation" />
            <Text style={styles.countryName}>{country.name}</Text>
            <Muted>
              {country.capital} • {country.government} • {country.status}
            </Muted>
            <Divider />
            <View style={styles.row}>
              <Stat
                label="POPULATION"
                value={`${(country.population / 1e6).toFixed(0)}M`}
              />
              <Stat
                label="GDP"
                value={`$${(country.gdp / 1e12).toFixed(1)}T`}
              />
              <Stat label="STABILITY" value={`${country.stability}%`} />
            </View>
          </Card>
        ) : null}

        <Card>
          <SectionHeader
            title="Resource Snapshot"
            action={
              <Button
                title={`Tick #${tickCount}`}
                variant="ghost"
                onPress={advanceTick}
              />
            }
          />
          {resources.slice(0, 4).map((r) => (
            <View key={r.type} style={styles.resourceRow}>
              <Text style={styles.resourceName}>{r.name}</Text>
              <Text style={styles.resourceValue}>
                {r.amount} {r.unit}
              </Text>
              <Text
                style={[
                  styles.resourceDelta,
                  r.production >= r.consumption
                    ? { color: COLORS.success }
                    : { color: COLORS.danger },
                ]}
              >
                {r.production >= r.consumption ? "+" : ""}
                {r.production - r.consumption}/t
              </Text>
            </View>
          ))}
        </Card>

        <Card>
          <SectionHeader title="World Events" />
          {events.map((e) => (
            <View key={e.id} style={styles.event}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{e.title}</Text>
                <Badge text={e.type} tone="neutral" />
              </View>
              <Muted>{e.description}</Muted>
            </View>
          ))}
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  countryName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resourceName: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  resourceValue: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 14,
    marginRight: 12,
  },
  resourceDelta: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 48,
    textAlign: "right",
  },
  event: {
    marginBottom: 14,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  eventTitle: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
});
