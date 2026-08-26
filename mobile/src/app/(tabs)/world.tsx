import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

/** Schematic layout of the alternate-history theater (not real GeoJSON). */
const MAP_REGIONS: {
  id: string;
  flex: number;
  row: number;
  label?: string;
}[] = [
  { id: "country_gnr", flex: 3, row: 0, label: "EUROPE · REICH" },
  { id: "country_gar", flex: 2, row: 0, label: "BALKANS" },
  { id: "country_jps", flex: 3, row: 1, label: "PACIFIC" },
  { id: "country_nz", flex: 2, row: 1, label: "NEUTRAL" },
  { id: "country_rms", flex: 2, row: 1, label: "ROCKY" },
];

function warInvolves(war: { attackerId: string; defenderId: string; status: string }, countryId: string) {
  return (
    war.status === "active" &&
    (war.attackerId === countryId || war.defenderId === countryId)
  );
}

export default function WorldScreen() {
  const {
    countries,
    units,
    wars,
    revolutions,
    events,
    selectedCountryId,
    setSelectedCountryId,
    supportIndependence,
    declareIndependence,
    startRevolution,
    declareWar,
    resolveBattleStep,
  } = useGame();
  const { player } = useAuth();
  const [mapFilter, setMapFilter] = useState<"all" | "wars" | "armies">("all");

  const selected = countries.find((c) => c.id === selectedCountryId);
  const playerCountryId = player?.countryId ?? null;

  const activeWars = useMemo(
    () => wars.filter((w) => w.status === "active" || w.status === "preparing"),
    [wars]
  );

  const countryWarStatus = useMemo(() => {
    const map: Record<string, "peace" | "war" | "contested"> = {};
    for (const c of countries) {
      map[c.id] = "peace";
    }
    for (const w of activeWars) {
      map[w.attackerId] = "war";
      map[w.defenderId] = "war";
      if (w.fronts?.length) {
        // Fronts imply contested border regions
        if (map[w.defenderId] === "war") map[w.defenderId] = "contested";
      }
    }
    return map;
  }, [countries, activeWars]);

  const unitsByCountry = useMemo(() => {
    const map: Record<string, number> = {};
    for (const u of units) {
      const id = u.countryId ?? "";
      map[id] = (map[id] ?? 0) + 1;
    }
    return map;
  }, [units]);

  const selectedUnits = useMemo(
    () => units.filter((u) => u.countryId === selectedCountryId),
    [units, selectedCountryId]
  );

  const selectedWars = useMemo(
    () =>
      activeWars.filter(
        (w) =>
          w.attackerId === selectedCountryId ||
          w.defenderId === selectedCountryId
      ),
    [activeWars, selectedCountryId]
  );

  const selectedRevolution = useMemo(
    () => revolutions.find((r) => r.countryId === selectedCountryId),
    [revolutions, selectedCountryId]
  );

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
            Alert.alert(
              res.success ? "Independence Day" : "Failed",
              res.message
            );
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

  const onResolveBattle = (warId: string, battleId: string) => {
    const res = resolveBattleStep(warId, battleId);
    Alert.alert(res.success ? "Battle Update" : "Failed", res.message);
  };

  const row0 = MAP_REGIONS.filter((r) => r.row === 0);
  const row1 = MAP_REGIONS.filter((r) => r.row === 1);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stripe} />
          <Muted>GEOPOLITICAL THEATER · 1962</Muted>
          <Title>World Map</Title>
          <Muted style={{ marginTop: 4 }}>
            Territory ownership is live. Wars change control over time.
          </Muted>
        </View>

        {/* Live world status bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{activeWars.length}</Text>
            <Text style={styles.statusLabel}>ACTIVE WARS</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{countries.length}</Text>
            <Text style={styles.statusLabel}>POWERS</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{units.length}</Text>
            <Text style={styles.statusLabel}>FORMATIONS</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>
              {revolutions.filter((r) => r.status === "active").length}
            </Text>
            <Text style={styles.statusLabel}>REVOLTS</Text>
          </View>
        </View>

        {/* Map filters */}
        <View style={styles.filterRow}>
          {(["all", "wars", "armies"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setMapFilter(f)}
              style={[
                styles.filterChip,
                mapFilter === f && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  mapFilter === f && styles.filterTextActive,
                ]}
              >
                {f === "all" ? "ALL" : f === "wars" ? "WARS" : "ARMIES"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Strategic Map — schematic territory grid */}
        <Card style={styles.mapCard}>
          <SectionHeader title="Strategic Theater" />
          <View style={styles.mapOcean}>
            <View style={styles.mapRow}>
              {row0.map((slot) => {
                const c = countries.find((x) => x.id === slot.id);
                if (!c) return null;
                return (
                  <TerritoryTile
                    key={c.id}
                    country={c}
                    flex={slot.flex}
                    active={c.id === selectedCountryId}
                    warStatus={countryWarStatus[c.id] ?? "peace"}
                    unitCount={unitsByCountry[c.id] ?? 0}
                    filter={mapFilter}
                    onPress={() => setSelectedCountryId(c.id)}
                    isPlayer={c.id === playerCountryId}
                  />
                );
              })}
            </View>
            <View style={styles.mapRow}>
              {row1.map((slot) => {
                const c = countries.find((x) => x.id === slot.id);
                if (!c) return null;
                return (
                  <TerritoryTile
                    key={c.id}
                    country={c}
                    flex={slot.flex}
                    active={c.id === selectedCountryId}
                    warStatus={countryWarStatus[c.id] ?? "peace"}
                    unitCount={unitsByCountry[c.id] ?? 0}
                    filter={mapFilter}
                    onPress={() => setSelectedCountryId(c.id)}
                    isPlayer={c.id === playerCountryId}
                  />
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.mapReich }]}
                />
                <Text style={styles.legendText}>Reich / Axis</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.danger },
                  ]}
                />
                <Text style={styles.legendText}>At war</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.warning },
                  ]}
                />
                <Text style={styles.legendText}>Contested</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.accentGold },
                  ]}
                />
                <Text style={styles.legendText}>Selected</Text>
              </View>
            </View>
          </View>
          <Muted>
            GNR supreme in Europe. GAR holds Balkans to Athens. JPE holds the
            Pacific coast. Neutral Zone and Rocky Mountain States remain
            contested.
          </Muted>
        </Card>

        {/* Active Wars on Map */}
        {activeWars.length > 0 && (
          <Card>
            <SectionHeader title="Active Conflicts" />
            {activeWars.map((w) => {
              const attacker = countries.find((c) => c.id === w.attackerId);
              const defender = countries.find((c) => c.id === w.defenderId);
              return (
                <View key={w.id} style={styles.warCard}>
                  <View style={styles.warHeader}>
                    <Badge
                      text={w.status.toUpperCase()}
                      tone={w.status === "active" ? "danger" : "warning"}
                    />
                    <Text style={styles.warName}>{w.name}</Text>
                  </View>
                  <View style={styles.warSides}>
                    <Pressable
                      onPress={() => setSelectedCountryId(w.attackerId)}
                      style={styles.warSide}
                    >
                      <View
                        style={[
                          styles.warColorBar,
                          { backgroundColor: attacker?.color ?? "#666" },
                        ]}
                      />
                      <Text style={styles.warSideName}>
                        {attacker?.code ?? "???"}
                      </Text>
                    </Pressable>
                    <Text style={styles.warVs}>VS</Text>
                    <Pressable
                      onPress={() => setSelectedCountryId(w.defenderId)}
                      style={styles.warSide}
                    >
                      <View
                        style={[
                          styles.warColorBar,
                          { backgroundColor: defender?.color ?? "#666" },
                        ]}
                      />
                      <Text style={styles.warSideName}>
                        {defender?.code ?? "???"}
                      </Text>
                    </Pressable>
                  </View>
                  {w.fronts?.length ? (
                    <Text style={styles.fronts}>
                      Fronts: {w.fronts.join(" · ")}
                    </Text>
                  ) : null}
                  {w.battles?.map((b) => (
                    <View key={b.id} style={styles.battleRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.battleName}>{b.name}</Text>
                        <Text style={styles.battleMeta}>
                          Day {b.day} · {b.location} ·{" "}
                          {b.status.replace("_", " ")}
                        </Text>
                        <Text style={styles.battleStrength}>
                          Atk {b.attackerStrength.toLocaleString()} · Def{" "}
                          {b.defenderStrength.toLocaleString()}
                        </Text>
                      </View>
                      {b.status === "ongoing" && (
                        <Button
                          title="Resolve"
                          variant="secondary"
                          onPress={() => onResolveBattle(w.id, b.id)}
                        />
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </Card>
        )}

        {/* All Powers grid */}
        <Card>
          <SectionHeader title="All Powers" />
          <View style={styles.grid}>
            {countries.map((c) => {
              const active = c.id === selectedCountryId;
              const ws = countryWarStatus[c.id] ?? "peace";
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
                  <View style={styles.chipTop}>
                    <Text
                      style={[
                        styles.countryCode,
                        active && styles.countryCodeActive,
                      ]}
                    >
                      {c.code}
                    </Text>
                    {ws !== "peace" && (
                      <View
                        style={[
                          styles.miniDot,
                          {
                            backgroundColor:
                              ws === "war" ? COLORS.danger : COLORS.warning,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.countryName,
                      active && styles.countryNameActive,
                    ]}
                    numberOfLines={2}
                  >
                    {c.name}
                  </Text>
                  <Text style={styles.chipMeta}>
                    {c.bloc ?? "—"} · Mil {c.militaryStrength}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Selected country detail */}
        {selected ? (
          <Card>
            <View style={styles.selectedHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Muted>
                  {selected.code} · {selected.capital} · {selected.government}
                </Muted>
              </View>
              <Badge
                text={(countryWarStatus[selected.id] ?? "peace").toUpperCase()}
                tone={
                  countryWarStatus[selected.id] === "war"
                    ? "danger"
                    : countryWarStatus[selected.id] === "contested"
                      ? "warning"
                      : "success"
                }
              />
            </View>

            {selected.description ? (
              <Text style={styles.desc}>{selected.description}</Text>
            ) : null}

            <View style={styles.row}>
              <Stat
                label="Population"
                value={(selected.population / 1e6).toFixed(0) + "M"}
              />
              <Stat
                label="Military"
                value={String(selected.militaryStrength)}
              />
              <Stat label="Stability" value={String(selected.stability)} />
            </View>
            <View style={styles.row}>
              <Stat
                label="Treasury"
                value={
                  selected.treasury >= 1e12
                    ? (selected.treasury / 1e12).toFixed(1) + "T"
                    : (selected.treasury / 1e9).toFixed(0) + "B"
                }
              />
              <Stat
                label="Units"
                value={String(unitsByCountry[selected.id] ?? 0)}
              />
              <Stat
                label="Ind. Mov."
                value={(selected.independenceMovement ?? 0) + "%"}
              />
            </View>

            <Text style={styles.smallLabel}>STABILITY</Text>
            <ProgressBar
              value={selected.stability ?? 50}
              max={100}
              color={
                (selected.stability ?? 50) >= 70
                  ? COLORS.success
                  : (selected.stability ?? 50) >= 40
                    ? COLORS.warning
                    : COLORS.danger
              }
            />

            {selected.territories && selected.territories.length > 0 ? (
              <>
                <Text style={styles.smallLabel}>TERRITORIES</Text>
                <Text style={styles.territories}>
                  {selected.territories.join(" · ")}
                </Text>
              </>
            ) : null}

            {selected.independenceDay ? (
              <Text style={styles.indyDay}>
                Independence Day: {selected.independenceDay}
              </Text>
            ) : null}

            {selectedRevolution ? (
              <>
                <Divider />
                <Text style={styles.smallLabel}>ACTIVE REVOLUTION</Text>
                <Text style={styles.desc}>
                  {selectedRevolution.leaderName} · {selectedRevolution.goal} ·{" "}
                  {selectedRevolution.support}% support ·{" "}
                  {selectedRevolution.status}
                </Text>
                <ProgressBar
                  value={selectedRevolution.support}
                  max={100}
                  color={COLORS.warning}
                />
              </>
            ) : null}

            {selectedWars.length > 0 ? (
              <>
                <Divider />
                <Text style={styles.smallLabel}>WARS INVOLVING THIS POWER</Text>
                {selectedWars.map((w) => (
                  <Text key={w.id} style={styles.desc}>
                    {w.name} ({w.status}) — fronts:{" "}
                    {(w.fronts ?? []).join(", ") || "—"}
                  </Text>
                ))}
              </>
            ) : null}

            {selectedUnits.length > 0 ? (
              <>
                <Divider />
                <Text style={styles.smallLabel}>MILITARY FORMATIONS</Text>
                {selectedUnits.map((u) => (
                  <View key={u.id} style={styles.unitRow}>
                    <Text style={styles.unitName}>
                      {u.name} ({u.type})
                    </Text>
                    <Text style={styles.unitMeta}>
                      {u.size.toLocaleString()} · {u.location} · morale{" "}
                      {u.morale} · {u.status}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}

            {selected.cityImages && selected.cityImages.length > 0 ? (
              <>
                <Divider />
                <Text style={styles.smallLabel}>CITY VIEWS · ATMOSPHERE</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.cityScroll}
                >
                  {selected.cityImages.map((img, i) => (
                    <View key={i} style={styles.cityCard}>
                      <Image
                        source={{ uri: img.url }}
                        style={styles.cityImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.cityTitle} numberOfLines={1}>
                        {img.title}
                      </Text>
                      <Text style={styles.cityCaption} numberOfLines={2}>
                        {img.caption}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <Divider />
            <View style={styles.actions}>
              <Text style={styles.smallLabel}>COMMAND ACTIONS</Text>
              {selected.canRevolt !== false && (
                <>
                  <Button
                    title="Support Independence"
                    variant="secondary"
                    onPress={onSupportIndependence}
                  />
                  <Button
                    title="Declare Independence Day"
                    variant="secondary"
                    onPress={onDeclareIndependence}
                  />
                  <Button
                    title="Start Revolution"
                    variant="secondary"
                    onPress={onStartRevolution}
                  />
                </>
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

        {/* Recent world events */}
        {events && events.length > 0 ? (
          <Card>
            <SectionHeader title="World Events" />
            {events.slice(0, 6).map((e: { id: string; title: string; description: string; type: string; timestamp?: string }) => (
              <View key={e.id} style={styles.eventRow}>
                <Badge
                  text={e.type.toUpperCase()}
                  tone={
                    e.type === "war" || e.type === "military"
                      ? "danger"
                      : e.type === "diplomacy"
                        ? "info"
                        : "gold"
                  }
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Text style={styles.eventDesc} numberOfLines={2}>
                    {e.description}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

function TerritoryTile({
  country,
  flex,
  active,
  warStatus,
  unitCount,
  filter,
  onPress,
  isPlayer,
}: {
  country: {
    id: string;
    name: string;
    code: string;
    color: string;
    bloc?: string;
    militaryStrength: number;
  };
  flex: number;
  active: boolean;
  warStatus: "peace" | "war" | "contested";
  unitCount: number;
  filter: "all" | "wars" | "armies";
  onPress: () => void;
  isPlayer: boolean;
}) {
  const dimmed =
    (filter === "wars" && warStatus === "peace") ||
    (filter === "armies" && unitCount === 0);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.mapRegion,
        {
          flex,
          backgroundColor: dimmed
            ? `${country.color}44`
            : active
              ? country.color
              : `${country.color}CC`,
          borderColor: active
            ? COLORS.accentGold
            : warStatus === "war"
              ? COLORS.danger
              : warStatus === "contested"
                ? COLORS.warning
                : COLORS.border,
          borderWidth: active ? 2 : warStatus !== "peace" ? 2 : 1,
          opacity: dimmed ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.tileTop}>
        <Text style={styles.mapCode}>{country.code}</Text>
        {isPlayer ? (
          <Text style={styles.youBadge}>YOU</Text>
        ) : warStatus === "war" ? (
          <Text style={styles.warBadge}>WAR</Text>
        ) : warStatus === "contested" ? (
          <Text style={styles.contestedBadge}>FRONT</Text>
        ) : null}
      </View>
      <Text style={styles.mapName} numberOfLines={2}>
        {country.name}
      </Text>
      <View style={styles.tileBottom}>
        <Text style={styles.mapBloc}>{country.bloc ?? "—"}</Text>
        {unitCount > 0 ? (
          <Text style={styles.armyCount}>{unitCount} units</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  stripe: {
    height: 3,
    width: 48,
    backgroundColor: COLORS.accentGold,
    marginBottom: 8,
  },
  statusBar: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  statusItem: { flex: 1, alignItems: "center" },
  statusValue: {
    color: COLORS.accentGold,
    fontSize: 18,
    fontWeight: "800",
  },
  statusLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  statusDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.surfacePressed,
  },
  filterText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  filterTextActive: { color: COLORS.accentGold },
  mapCard: { marginBottom: 4 },
  mapOcean: {
    backgroundColor: COLORS.mapOcean,
    borderRadius: 10,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapRow: {
    flexDirection: "row",
    gap: 6,
    minHeight: 100,
  },
  mapRegion: {
    minHeight: 96,
    borderRadius: 8,
    padding: 10,
    justifyContent: "space-between",
  },
  tileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapCode: {
    color: COLORS.paper,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    opacity: 0.95,
  },
  youBadge: {
    color: COLORS.accentGold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  warBadge: {
    color: "#FFB0B0",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  contestedBadge: {
    color: "#FFE08A",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  mapName: {
    color: COLORS.paper,
    fontSize: 12,
    fontWeight: "700",
    marginVertical: 4,
  },
  tileBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  mapBloc: {
    color: COLORS.paper,
    fontSize: 10,
    opacity: 0.75,
  },
  armyCount: {
    color: COLORS.paper,
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.9,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  warCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  warHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  warName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  warSides: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  warSide: { flexDirection: "row", alignItems: "center", gap: 6 },
  warColorBar: { width: 4, height: 18, borderRadius: 2 },
  warSideName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  warVs: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  fronts: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  battleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  battleName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  battleMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  battleStrength: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
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
  chipTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  chipMeta: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
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
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  smallLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 8,
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
  unitRow: { marginBottom: 8 },
  unitName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  unitMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  cityScroll: { marginTop: 6 },
  cityCard: {
    width: 180,
    marginRight: 10,
  },
  cityImage: {
    width: 180,
    height: 100,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceElevated,
  },
  cityTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  cityCaption: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  actions: { marginTop: 4, gap: 8 },
  eventRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  eventTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  eventDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
