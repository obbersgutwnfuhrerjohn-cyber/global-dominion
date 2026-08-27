import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import {
  Badge,
  Button,
  Card,
  Screen,
  SectionHeader,
  Title,
  Muted,
  Divider,
  Stat,
  ProgressBar,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";
import { apiClient } from "../../services/api";
import { useEffect, useState } from "react";

export default function MilitaryScreen() {
  const {
    units,
    wars,
    countries,
    resolveBattleStep,
    recruitUnit,
    issueMilitaryOrder,
    cancelMilitaryOrder,
  } = useGame();
  const { player } = useAuth();
  const [cities, setCities] = useState<any[]>([]);
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [production, setProduction] = useState<any[]>([]);
  const [armory, setArmory] = useState<any>({ units: [], matchups: [] });
  const [command, setCommand] = useState<any>(null);
  const [travelAgencies, setTravelAgencies] = useState<any[]>([]);
  useEffect(() => {
    apiClient.get<any[]>("/cities").then(setCities).catch(() => setCities([]));
    apiClient.get<any[]>("/military/blueprints").then(setBlueprints).catch(() => setBlueprints([]));
    apiClient.get<any[]>("/military/production").then(setProduction).catch(() => setProduction([]));
    apiClient.get<any>("/military/armory").then(setArmory).catch(() => setArmory({ units: [], matchups: [] }));
    apiClient.get<any>("/government/command").then(setCommand).catch(() => setCommand(null));
    apiClient.get<any[]>("/travel/agencies").then(setTravelAgencies).catch(() => setTravelAgencies([]));
  }, []);
  const buildAircraft = async (type:string) => {
    try {
      const city = cities.find((c:any) => (c.controllerCountryId || c.countryId) === playerCountryId && (c.capital || c.major));
      if (!city) { Alert.alert("Production", "No controlled production city is available."); return; }
      const q = await apiClient.post<any>("/military/production", { type, cityId: city.id, quantity: 1 });
      setProduction(prev => [...prev, q]);
      Alert.alert("Production started", `${type.replace(/_/g," ")} is being built at ${city.name}.`);
    } catch (e:any) {
      Alert.alert("Production", e?.message || "Production could not be started.");
    }
  };

  const playerCountryId = player?.countryId ?? "country_jps";
  const myUnits = units.filter(
    (u) => !u.countryId || u.countryId === playerCountryId
  );
  const totalForce = myUnits.reduce((sum, u) => sum + u.size, 0);
  const avgMorale = Math.round(
    myUnits.reduce((s, u) => s + u.morale, 0) / Math.max(1, myUnits.length)
  );

  const nameOf = (id: string) =>
    countries.find((c) => c.id === id)?.name ?? id;

  const onResolve = (warId: string, battleId: string) => {
    const res = resolveBattleStep(warId, battleId);
    Alert.alert("Battle Update", res.message);
  };

  const onRecruit = () => {
    const res = recruitUnit(
      playerCountryId,
      "infantry",
      "Volunteer Legion",
      2500
    );
    Alert.alert(res.success ? "Recruitment" : "Failed", res.message);
  };

  const chooseDestination = (unit:any, orderType:"move"|"attack"|"defend") => {
    const options = cities.filter(c => c.major || c.capital).slice(0, 8);
    Alert.alert(`${orderType.toUpperCase()} — ${unit.name}`, "Choose a destination", [
      ...options.slice(0, 6).map((c:any) => ({ text: c.name, onPress: () => {
        const r = issueMilitaryOrder({ unitId: unit.id, orderType, destinationCityId: c.id, targetTerritoryId: orderType === "attack" ? c.id : undefined });
        Alert.alert("Order", r.message);
      }})),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const chooseAirTarget = (unit:any, orderType:"air_strike"|"intercept") => {
    const enemyUnits = units.filter((x:any) => x.countryId && x.countryId !== playerCountryId && (orderType === "intercept" ? ["fighter","interceptor","strike_fighter","ground_attack","naval_fighter","bomber","heavy_bomber","naval_bomber","patrol_aircraft","reconnaissance_aircraft","awacs","helicopter","drone"].includes(x.type) : !["fighter","interceptor","strike_fighter","ground_attack","naval_fighter","bomber","heavy_bomber","naval_bomber","patrol_aircraft","reconnaissance_aircraft","awacs","helicopter","drone"].includes(x.type)));
    if (!enemyUnits.length) { Alert.alert("No target", "No enemy target is currently visible."); return; }
    Alert.alert(`${orderType === "intercept" ? "INTERCEPT" : "AIR STRIKE"} — ${unit.name}`, "Choose a target", [
      ...enemyUnits.slice(0, 7).map((target:any) => ({ text: `${target.name} · ${target.location}`, onPress: () => {
        const r = issueMilitaryOrder({ unitId: unit.id, orderType, targetUnitId: target.id });
        Alert.alert("Air Command", r.message);
      }})),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const chooseNavalTarget = (unit:any) => {
    const coastal = cities.filter((c:any) => c.major || c.capital).filter((c:any) => ["San Francisco","Los Angeles","New York","Washington D.C.","Miami","Boston","Seattle","Vancouver","London","Paris","Amsterdam","Brussels","Copenhagen","Oslo","Stockholm","Helsinki","Lisbon","Madrid","Rome","Athens","Istanbul","Tirana","Moscow","Cairo","Tripoli","Tunis","Algiers","Casablanca","Cape Town","Lagos","Nairobi","Jeddah","Abu Dhabi","Muscat","Karachi","Mumbai","Colombo","Bangkok","Singapore","Jakarta","Manila","Shanghai","Seoul","Tokyo","Sydney","Melbourne","Auckland"].includes(c.name));
    if (!coastal.length) { Alert.alert("No coastal target", "No coastal city is available."); return; }
    Alert.alert(`NAVAL BOMBARDMENT — ${unit.name}`, "Choose a coastal target", [
      ...coastal.slice(0, 8).map((c:any) => ({ text: c.name, onPress: () => {
        const r = issueMilitaryOrder({ unitId: unit.id, orderType: "naval_bombard", destinationCityId: c.id });
        Alert.alert("Naval Command", r.message);
      }})),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const retreat = (unit:any) => {
    const r = issueMilitaryOrder({ unitId: unit.id, orderType: "retreat" });
    Alert.alert("Retreat", r.message);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stripe} />
          <Muted>ARMED FORCES · WAR &amp; BATTLES</Muted>
          <Title>Military</Title>
        </View>

        <Card>
          <View style={styles.row}>
            <Stat label="YOUR UNITS" value={myUnits.length} accent />
            <Stat label="FORCE" value={totalForce.toLocaleString()} />
            <Stat label="MORALE" value={`${avgMorale}%`} gold />
          </View>
          <Divider />
          <Button title="Recruit Infantry Legion" variant="secondary" onPress={onRecruit} />
        </Card>

        <Card>
          <SectionHeader title="NATIONAL COMMAND" />
          {command ? (
            <>
              <Muted>ROLE: {String(command.role || "citizen").replace(/_/g, " ").toUpperCase()}</Muted>
              <Text style={styles.movementText}>President: {command.structure?.presidentPlayerId || "VACANT"}</Text>
              <Text style={styles.movementText}>Defense Minister: {command.structure?.defenseMinisterPlayerId || "VACANT"}</Text>
              <Text style={styles.movementText}>Military Commander: {command.structure?.militaryCommanderPlayerId || "VACANT"}</Text>
              <Text style={styles.smallLabel}>FORMATIONS</Text>
              {(command.formations || []).map((f:any) => (
                <View key={f.id} style={styles.movementBox}>
                  <Text style={styles.movementText}>{f.name} · {String(f.status).toUpperCase()}</Text>
                  <Muted>{f.branch} · {f.role} · {f.units?.length || 0} completed units</Muted>
                  <Muted>Commander: {f.commanderPlayerId || "AI / UNASSIGNED"}</Muted>
                </View>
              ))}
              {(command.proposals || []).map((q:any) => (
                <View key={q.id} style={styles.movementBox}>
                  <Text style={styles.movementText}>PROPOSAL · {q.formation?.name}</Text>
                  <Muted>{String(q.status).replace(/_/g, " ")}</Muted>
                </View>
              ))}
              <Muted>Military transport agencies: {travelAgencies.filter(a => a.type === "military").length}</Muted>
            </>
          ) : <Muted>National command data unavailable.</Muted>}
        </Card>

        <Card>
          <SectionHeader title="Active Wars" />
          {wars.length === 0 ? (
            <Muted>No active wars. Declare war from the World map.</Muted>
          ) : (
            wars.map((w) => (
              <View key={w.id} style={styles.war}>
                <View style={styles.unitHeader}>
                  <Text style={styles.unitName}>{w.name}</Text>
                  <Badge
                    text={w.status.toUpperCase()}
                    tone={
                      w.status === "active"
                        ? "danger"
                        : w.status === "ceasefire"
                          ? "warning"
                          : "neutral"
                    }
                  />
                </View>
                <Muted>
                  {nameOf(w.attackerId)} vs {nameOf(w.defenderId)}
                </Muted>
                <Muted>Fronts: {w.fronts.join(", ")}</Muted>
                <Divider />
                {w.battles.map((b) => (
                  <View key={b.id} style={styles.battle}>
                    <View style={styles.unitHeader}>
                      <Text style={styles.battleName}>{b.name}</Text>
                      <Badge
                        text={b.status.replace(/_/g, " ").toUpperCase()}
                        tone={
                          b.status === "ongoing"
                            ? "warning"
                            : b.status === "attacker_won"
                              ? "success"
                              : b.status === "defender_won"
                                ? "danger"
                                : "info"
                        }
                      />
                    </View>
                    <Muted>
                      {b.location} · Day {b.day}
                    </Muted>
                    <View style={styles.row}>
                      <Stat
                        label="ATTACKER"
                        value={b.attackerStrength.toLocaleString()}
                      />
                      <Stat
                        label="DEFENDER"
                        value={b.defenderStrength.toLocaleString()}
                      />
                    </View>
                    {b.status === "ongoing" ? (
                      <>
                        <View style={{ height: 8 }} />
                        <Button
                          title="Resolve Battle Day"
                          variant="primary"
                          onPress={() => onResolve(w.id, b.id)}
                        />
                      </>
                    ) : null}
                  </View>
                ))}
              </View>
            ))
          )}
        </Card>

        <Card>
          <SectionHeader title="Deployed Formations" />
          {myUnits.map((u) => (
            <View key={u.id} style={styles.unit}>
              <View style={styles.unitHeader}>
                <Text style={styles.unitName}>{u.name}</Text>
                <Badge
                  text={u.status.toUpperCase()}
                  tone={
                    u.status === "ready"
                      ? "success"
                      : u.status === "patrol" || u.status === "forming"
                        ? "info"
                        : "warning"
                  }
                />
              </View>
              <Muted>
                {u.type.replace(/_/g, " ")} · {u.location}
              </Muted>
              <Divider />
              <View style={styles.row}>
                <Stat label="SIZE" value={u.size.toLocaleString()} />
                <Stat label="MORALE" value={`${u.morale}%`} />
                <Stat label="SUPPLY" value={`${u.supply}%`} />
              </View>
              {u.position && (
                <View style={styles.movementBox}>
                  <Text style={styles.smallLabel}>MOVEMENT</Text>
                  <Text style={styles.movementText}>
                    {u.orderStatus?.toUpperCase() || "IDLE"} · {u.progress != null ? `${Math.round(u.progress)}%` : "STATIONARY"}
                    {u.distanceKm ? ` · ${Math.round(u.distanceKm)} km` : ""}
                  </Text>
                  {u.etaSeconds ? <Text style={styles.movementText}>ETA {formatEta(u.etaSeconds * (1 - (u.progress || 0) / 100))} · {Math.round(u.speedKmh || 0)} km/h</Text> : null}
                  {u.garrisonedCityId ? <Text style={styles.garrisonText}>GARRISONED · ENTRENCHMENT {Math.round(u.entrenchment || 0)}%</Text> : null}
                </View>
              )}
              <View style={styles.actionRow}>
                <Button title="MOVE" variant="secondary" onPress={() => chooseDestination(u, "move")} />
                <Button title="ATTACK" variant="primary" onPress={() => chooseDestination(u, "attack")} />
                <Button title="DEFEND" variant="secondary" onPress={() => chooseDestination(u, "defend")} />
                <Button title="RETREAT" variant="secondary" onPress={() => retreat(u)} />
              </View>
              {(["fighter","interceptor","strike_fighter","ground_attack","naval_fighter","bomber","heavy_bomber","naval_bomber","patrol_aircraft","reconnaissance_aircraft","awacs","helicopter","drone"].includes(u.type)) && (
                <View style={styles.actionRow}>
                  <Button title="AIR STRIKE" variant="primary" onPress={() => chooseAirTarget(u, "air_strike")} />
                  <Button title="INTERCEPT" variant="secondary" onPress={() => chooseAirTarget(u, "intercept")} />
                  <Button title="AIR PATROL" variant="secondary" onPress={() => issueMilitaryOrder({unitId:u.id,orderType:"air_patrol",destinationCityId:u.location})} />
                </View>
              )}
              {(["frigate","destroyer","cruiser","carrier","submarine","landing_ship","transport_ship","corvette"].includes(u.type)) && (
                <View style={styles.actionRow}>
                  <Button title="NAVAL BOMBARD" variant="primary" onPress={() => chooseNavalTarget(u)} />
                  <Button title="NAVAL PATROL" variant="secondary" onPress={() => issueMilitaryOrder({unitId:u.id,orderType:"naval_patrol",destinationCityId:u.location})} />
                </View>
              )}
              <View style={{ height: 8 }} />
              <Text style={styles.smallLabel}>MORALE</Text>
              <ProgressBar
                value={u.morale}
                color={u.morale >= 80 ? COLORS.success : COLORS.warning}
              />
              <View style={{ height: 6 }} />
              <Text style={styles.smallLabel}>SUPPLY</Text>
              <ProgressBar value={u.supply} color={COLORS.accentGold} />
            </View>
          ))}
        </Card>

        <Card>
          <SectionHeader title="ARMORY & COMBAT DOCTRINE" />
          <Muted>Every unit has a distinct battlefield role, hit points and target effectiveness. Combat effectiveness is calculated server-side.</Muted>
          {["ground","air","navy"].map((branch) => (
            <View key={branch} style={{marginTop:10}}>
              <Text style={styles.smallLabel}>{branch.toUpperCase()}</Text>
              {(armory.units || []).filter((u:any) => u.branch === branch).slice(0, branch === "ground" ? 8 : 12).map((u:any) => (
                <View key={u.id} style={styles.movementBox}>
                  <Text style={styles.movementText}>{u.displayName} · {u.hpPerUnit || "—"} HP · {u.role}</Text>
                  <Muted>{u.requiresFacility ? `Requires ${String(u.requiresFacility).replace(/_/g," ")}` : "Strategic unit"}</Muted>
                </View>
              ))}
            </View>
          ))}
          <Divider />
          <Text style={styles.smallLabel}>SPECIALIST MATCHUPS</Text>
          {(armory.matchups || []).filter((m:any) => ["fighter","ground_attack","bomber","naval_bomber","tank_destroyer","air_defense","artillery","submarine"].includes(m.attacker)).slice(0, 24).map((m:any, i:number) => (
            <View key={`${m.attacker}-${m.target}-${i}`} style={styles.row}>
              <Text style={{color:COLORS.textPrimary, flex:1, fontSize:11}}>{String(m.attacker).replace(/_/g," ")} → {String(m.target).replace(/_/g," ")}</Text>
              <Text style={{color:COLORS.accentGold, fontWeight:"900", fontSize:11}}>{m.stars}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <SectionHeader title="AIR & NAVAL PRODUCTION" />
          <Muted>Research unlocks each design. Airbases build aircraft; ports build naval formations. Each class has its own hit points, speed, range and combat role.</Muted>
          <View style={styles.actionRow}>
            {blueprints.filter((b:any) => b.branch === "air" && ["fighter","interceptor","ground_attack","bomber","naval_bomber"].includes(b.id)).map((b:any) => (
              <Button key={b.id} title={`${b.displayName}${b.researchReady ? "" : " · LOCKED"}`} variant={b.researchReady ? "primary" : "secondary"} onPress={() => b.researchReady && buildAircraft(b.id)} />
            ))}
          </View>
          <Divider />
          {production.length === 0 ? <Muted>No active production orders.</Muted> : production.slice(-6).map((q:any) => (
            <View key={q.id} style={styles.movementBox}>
              <Text style={styles.movementText}>{String(q.type).replace(/_/g," ").toUpperCase()} · {q.status.toUpperCase()}</Text>
              <ProgressBar value={Number(q.progress || 0)} color={COLORS.accentGold} />
              <Muted>{q.completed || 0}/{q.quantity || 1} completed</Muted>
            </View>
          ))}
        </Card>

        <Card>
          <SectionHeader title="Doctrine" />
          <Muted>
            GNR field strength is unmatched. GAR holds the Balkan axis with
            garrisons in Tirana, Niš, and Thessaloniki. Resolve battle days to
            push fronts. Recruit to grow your force. Full fog-of-war and supply
            lines connect when the live war API is online.
          </Muted>
        </Card>

        <View style={{ height: 28 }} />
      </ScrollView>
    </Screen>
  );
}

function formatEta(seconds:number){
  const s=Math.max(0,Math.round(seconds));
  const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60;
  return h ? `${h}h ${m}m` : m ? `${m}m ${sec}s` : `${sec}s`;
}

const styles = StyleSheet.create({
  header: { marginBottom: 16, marginTop: 4 },
  stripe: {
    height: 3,
    width: 48,
    backgroundColor: COLORS.accentBright,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 8 },
  war: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  battle: {
    marginTop: 8,
    padding: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    marginBottom: 8,
  },
  battleName: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
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
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  smallLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  movementBox: { marginTop: 10, padding: 9, backgroundColor: COLORS.surfaceElevated, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  movementText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: "700", marginBottom: 3 },
  garrisonText: { color: COLORS.accentGold, fontSize: 10, fontWeight: "900", marginTop: 4 },
});
