import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGame } from "../../context/GameContext";
import {
  Badge,
  Card,
  Screen,
  SectionHeader,
  Stat,
  Title,
  Muted,
  Divider,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";

export default function WorldScreen() {
  const {
    countries,
    selectedCountryId,
    setSelectedCountryId,
  } = useGame();

  const selected = countries.find((c) => c.id === selectedCountryId);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Muted>WORLD MAP</Muted>
          <Title>Nations</Title>
        </View>

        <Card>
          <SectionHeader title="Select a Country" />
          <View style={styles.grid}>
            {countries.map((c) => {
              const active = c.id === selectedCountryId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCountryId(c.id)}
                  style={[
                    styles.countryChip,
                    active && styles.countryChipActive,
                    { borderLeftColor: c.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.countryCode,
                      active && styles.countryCodeActive,
                    ]}
                  >
                    {c.code}
                  </Text>
                  <Text
                    style={[
                      styles.countryName,
                      active && styles.countryNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {selected ? (
          <Card>
            <View style={styles.selectedHeader}>
              <View>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Muted>
                  Capital: {selected.capital} • {selected.government}
                </Muted>
              </View>
              <Badge
                text={selected.status.toUpperCase()}
                tone={selected.status === "peace" ? "success" : "warning"}
              />
            </View>
            <Divider />
            <View style={styles.row}>
              <Stat
                label="POPULATION"
                value={`${(selected.population / 1e6).toFixed(1)}M`}
              />
              <Stat
                label="GDP"
                value={`$${(selected.gdp / 1e12).toFixed(2)}T`}
              />
            </View>
            <Divider />
            <View style={styles.row}>
              <Stat
                label="TREASURY"
                value={`$${(selected.treasury / 1e9).toFixed(0)}B`}
              />
              <Stat label="MILITARY" value={selected.militaryStrength} />
              <Stat label="STABILITY" value={`${selected.stability}%`} />
            </View>
            <Divider />
            <Muted>
              Full interactive map (MapLibre / satellite layers) will connect
              here once the backend world service is live. Existing map.ts
              service is ready for API integration.
            </Muted>
          </Card>
        ) : null}

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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  countryChip: {
    width: "48%",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countryChipActive: {
    borderColor: COLORS.accentBright,
    backgroundColor: COLORS.surfacePressed,
  },
  countryCode: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  countryCodeActive: {
    color: COLORS.accentBright,
  },
  countryName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  countryNameActive: {
    color: COLORS.textPrimary,
  },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  selectedName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
});
