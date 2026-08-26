import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import {
  Badge,
  Button,
  Card,
  Screen,
  SectionHeader,
  Stat,
  Title,
  Muted,
  Divider,
  ProgressBar,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";

const MAP_LAYOUT: { id: string; flex: number }[] = [
  { id: "country_gnr", flex: 2 },
  { id: "country_gar", flex: 2 },
  { id: "country_jps", flex: 2 },
  { id: "country_nz", flex: 1 },
  { id: "country_rms", flex: 1 },
];

export default function WorldScreen() {
  const {
    countries,
    selectedCountryId,
    setSelectedCountryId,
    supportIndependence,
    declareIndependence,
    startRevolution,
    declareWar,
  } = useGame();
  const { player } = useAuth();

  const selected = countries.find((c) => c.id === selectedCountryId);
  const playerCountryId = player?.countryId ?? null;

  const onSupportIndependence = () => {
    if (!selected) return;
    const res = supportIndependence(selected.id);
    Alert.alert(res.success ? "Movement" : "Blocked", res.message);
  };

  const onDeclareIndependence = () => {
    if (!selected) return;
    Alert.alert(
      "Declare Independence Day?",
      `Requires ~70% independence movement. Current: ${selected.independenceMovement ?? 0}%.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Declare",
          style: "destructive",
          onPress: () => {
            const res = declareIndependence(selected.id);
            Alert.alert(res.success ? "Independence Day" : "Failed", res.message);
          },
        },
      ]
    );
  };

  const onStartRevolution = () => {
    if (!selected) return;
    Alert.alert(
      "Start Revolution?",
      `Organize independence struggle in ${selected.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Organize",
          style: "destructive",
          onPress: () => {
            const res = startRevolution(
              selected.id,
              "independence",
              player?.displayName ?? "Provisional Committee"
            );
            Alert.alert(res.success ? "Revolution" : "Blocked", res.message);
          },
        },
      ]
    );
  };

  const onDeclareWar = () => {
    if (!selected || !playerCountryId) return;
    if (selected.id === playerCountryId) {
      Alert.alert("War", "Select a foreign power to declare war on.");
      return;
    }
    Alert.alert(
      "Declare War?",
      `${playerCountryId} → ${selected.name}. This opens an active front.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Declare War",
          style: "destructive",
          onPress: () => {
            const res = declareWar(
              playerCountryId,
              selected.id,
              `${player?.displayName ?? "Commander"}'s War`
            );
            Alert.alert(res.success ? "War" : "Blocked", res.message);
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
          <Muted>GEOPOLITICAL THEATER · 1962</Muted>
          <Title>World Map</Title>
        </View>

        <Card style={styles.mapCard}>
          <SectionHeader title="Strategic Overview" />
          <View style={styles.mapGrid}>
            {MAP_LAYOUT.map((slot) => {
              const c = countries.find((x) => x.id === slot.id);
              if (!c) return null;
              const active = c.id === selectedCountryId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCountryId(c.id)}
                  style={[
                    styles.mapRegion,
                    {
                      flex: slot.flex,
                      backgroundColor: active ? c.color : `${c.color}99`,
                      borderColor: active ? COLORS.accentGold : COLORS.border,
                      borderWidth: active ? 2 : 1,
                    },
                  ]}
                >
                  <Text style={styles.mapCode}>{c.code}</Text>
                  <Text style={styles.mapName} numberOfLines={2}>
                    {c.name}
                  </Text>
                  <Text style={styles.mapBloc}>{c.bloc}</Text>
                </Pressable>
              );
            })}
          </View>
          <Muted>
            GNR is the supreme power. GAR holds the western Balkans to Thessaloniki &amp; Ioannina.
          </Muted>
        </Card>

        <Card>
          <SectionHeader title="All Powers" />
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
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Muted>
                  {selected.capital} · {selected.government} · {selected.region}
                </Muted>
              </View>
              {selected.superpower ? (
                <Badge text="SUPERPOWER" tone="gold" />
              ) : null}
              <Badge
                text={selected.status.toUpperCase()}
                tone={
                  selected.status === "peace"
                    ? "success"
                    : selected.status === "at_war"
                      ? "danger"
                      : selected.status === "unstable" ||
                          selected.status === "occupied"
                        ? "warning"
                        : "info"
                }
              />
            </View>
            <Divider />
            {selected.description ? (
              <>
                <Text style={styles.desc}>{selected.description}</Text>
                <Divider />
              </>
            ) : null}

            {selected.territories && selected.territories.length > 0 ? (
              <>
                <Text style={styles.smallLabel}>TERRITORIES</Text>
                <Text style={styles.territories}>
                  {selected.territories.join(" · ")}
                </Text>
                <Divider />
              </>
            ) : null}

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
                gold
              />
              <Stat
                label="MILITARY"
                value={selected.militaryStrength}
                accent
              />
              <Stat label="STABILITY" value={`${selected.stability}%`} />
            </View>
            <Divider />
            <Text style={styles.smallLabel}>STABILITY</Text>
            <ProgressBar
              value={selected.stability}
              color={
                selected.stability >= 70
                  ? COLORS.success
                  : selected.stability >= 50
                    ? COLORS.warning
                    : COLORS.danger
              }
            />
            <View style={{ height: 10 }} />
            <Text style={styles.smallLabel}>MILITARY STRENGTH</Text>
            <ProgressBar
              value={selected.militaryStrength}
              color={
                selected.id === "country_gnr"
                  ? COLORS.accentBright
                  : COLORS.accentGold
              }
            />
            {selected.id === "country_gnr" ? (
              <Muted>
                Supreme power of the ordered world. Peer challenge only.
              </Muted>
            ) : null}

            <Divider />
            
            {selected.cityImages && selected.cityImages.length > 0 ? (
              <>
                <Divider />
                <Text style={styles.smallLabel}>CITY VIEWS · ATMOSPHERE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {selected.cityImages.map((img) => (
                    <View key={img.url} style={styles.cityCard}>
                      <Image
                        source={{ uri: img.url }}
                        style={styles.cityImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.cityTitle} numberOfLines={1}>{img.title}</Text>
                      <Text style={styles.cityCaption} numberOfLines={2}>{img.caption}</Text>
                    </View>
                  ))}
                </ScrollView>
                <Muted>Public stock photography used for atmosphere — not copyrighted series stills.</Muted>
              </>
            ) : null}

            <Text style={styles.smallLabel}>
              INDEPENDENCE MOVEMENT · {selected.independenceMovement ?? 0}%
            </Text>
            <ProgressBar
              value={selected.independenceMovement ?? 0}
              color={COLORS.warning}
            />
            {selected.independenceDay ? (
              <Text style={styles.indyDay}>
                Independence Day: {selected.independenceDay}
              </Text>
            ) : null}

            {selected.allies && selected.allies.length > 0 ? (
              <>
                <Divider />
                <Text style={styles.smallLabel}>ALLIES</Text>
                <Text style={styles.territories}>
                  {selected.allies
                    .map(
                      (id) =>
                        countries.find((c) => c.id === id)?.code ?? id
                    )
                    .join(" · ")}
                </Text>
              </>
            ) : null}

            <Divider />
            <SectionHeader title="Actions" />
            <View style={styles.actions}>
              {selected.canRevolt ? (
                <>
                  <Button
                    title="Support Independence"
                    variant="secondary"
                    onPress={onSupportIndependence}
                  />
                  <View style={{ height: 8 }} />
                  <Button
                    title="Start Revolution"
                    variant="danger"
                    onPress={onStartRevolution}
                  />
                  <View style={{ height: 8 }} />
                  <Button
                    title="Declare Independence Day"
                    variant="gold"
                    onPress={onDeclareIndependence}
                  />
                  <View style={{ height: 8 }} />
                </>
              ) : (
                <Muted>
                  Open revolt is not viable under this regime.
                </Muted>
              )}
              {playerCountryId && selected.id !== playerCountryId ? (
                <Button
                  title="Declare War"
                  variant="danger"
                  onPress={onDeclareWar}
                />
              ) : null}
            </View>
          </Card>
        ) : null}

        <Card>
          <SectionHeader title="Intelligence Brief" />
          <Muted>
            The Greater Nazi Reich stands supreme. Greater Albanian Reich —
            ally of Berlin — holds Niš, Montenegro, Macedonia, Thessaloniki and
            Ioannina. Occupied Serbia burns with independence fever. The Neutral
            Zone remains the powder keg of the continent.
          </Muted>
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
    backgroundColor: COLORS.accentBright,
    marginBottom: 10,
  },
  mapCard: { paddingBottom: 14 },
  mapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    minHeight: 140,
  },
  mapRegion: {
    minWidth: "30%",
    minHeight: 72,
    borderRadius: 8,
    padding: 10,
    justifyContent: "space-between",
  },
  mapCode: {
    color: COLORS.paper,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    opacity: 0.9,
  },
  mapName: {
    color: COLORS.paper,
    fontSize: 12,
    fontWeight: "700",
  },
  mapBloc: {
    color: COLORS.paper,
    fontSize: 10,
    opacity: 0.75,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  countryChip: {
    width: "48%",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countryChipActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.surfacePressed,
  },
  countryCode: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  countryCodeActive: { color: COLORS.accentGold },
  countryName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  countryNameActive: { color: COLORS.textPrimary },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  selectedName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  row: { flexDirection: "row", gap: 8 },
  smallLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  territories: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  indyDay: {
    color: COLORS.accentGold,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  actions: { marginTop: 4 },
});
