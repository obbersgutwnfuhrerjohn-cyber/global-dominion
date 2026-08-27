import { useMemo, useState, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/colors";
import { apiClient } from "../../services/api";
import CountryPolygons from "../../components/CountryPolygons";
import Svg, { Polyline } from "react-native-svg";

const MAP_WIDTH = 1600;
const MAP_HEIGHT = 800;
const MIN_ZOOM = 0.72;
const MAX_ZOOM = 2.45;

// Positions are normalized against the supplied 1600x800 world-map artwork.
// They are gameplay anchors, not geography data; authoritative ownership lives in the game state.
const CITIES = [
  ["Berlin", "country_gnr", 0.495, 0.215, true],
  ["London", "country_gnr", 0.435, 0.245, true],
  ["Paris", "country_gnr", 0.462, 0.285, false],
  ["Moscow", "country_gnr", 0.705, 0.145, true],
  ["Warsaw", "country_gnr", 0.575, 0.245, false],
  ["Rome", "country_gar", 0.535, 0.365, true],
  ["Vienna", "country_gar", 0.545, 0.285, false],
  ["Belgrade", "country_gar", 0.565, 0.315, true],
  ["Tirana", "country_gar", 0.525, 0.345, true],
  ["Athens", "country_gar", 0.575, 0.405, true],
  ["Cairo", "country_gar", 0.595, 0.455, false],
  ["San Francisco", "country_jps", 0.165, 0.365, true],
  ["Los Angeles", "country_jps", 0.18, 0.455, false],
  ["Seattle", "country_jps", 0.155, 0.30, false],
  ["Tokyo", "country_jps", 0.885, 0.445, true],
  ["Osaka", "country_jps", 0.865, 0.48, false],
  ["Shanghai", "country_jps", 0.79, 0.425, true],
  ["Beijing", "country_jps", 0.775, 0.355, true],
  ["Delhi", "country_jps", 0.705, 0.505, true],
  ["Sydney", "country_jps", 0.89, 0.79, true],
  ["Denver", "country_nz", 0.305, 0.405, true],
  ["Cheyenne", "country_rms", 0.30, 0.355, false],
  ["New York", "country_nz", 0.315, 0.31, true],
  ["São Paulo", "country_nz", 0.41, 0.67, true],
  ["Cape Town", "country_nz", 0.43, 0.81, true],
] as const;

const UNIT_POSITIONS: Record<string, [number, number, string]> = {
  "San Francisco Garrison": [0.18, 0.37, "infantry"],
  "Sacramento Sector": [0.19, 0.34, "armor"],
  "Alameda Airbase": [0.17, 0.39, "fighter"],
  "Berlin Command": [0.50, 0.22, "armor"],
  Tirana: [0.525, 0.35, "infantry"],
  Athens: [0.575, 0.405, "infantry"],
  Belgrade: [0.565, 0.315, "armor"],
  Thessaloniki: [0.575, 0.385, "infantry"],
};

const FLEETS = [
  ["North Atlantic Fleet", 0.31, 0.245, "country_gnr", "naval"],
  ["Mediterranean Fleet", 0.55, 0.47, "country_gar", "naval"],
  ["Pacific Fleet", 0.84, 0.62, "country_jps", "naval"],
] as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function WorldScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { countries, units, wars, events, selectedCountryId, setSelectedCountryId, declareWar, tickCount } = useGame();
  const { player } = useAuth();
  const [zoom, setZoom] = useState(0.92);
  const [night, setNight] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showMilitary, setShowMilitary] = useState(true);
  const [showFleets, setShowFleets] = useState(true);
  const [mapMode, setMapMode] = useState<"political" | "military" | "economy">("political");
  const [liveCities, setLiveCities] = useState<any[]>([]);
  const [liveTerritories, setLiveTerritories] = useState<any[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<any[]>([]);
  const [defaultFactions, setDefaultFactions] = useState<any[]>([]);
  useEffect(() => {
    apiClient.get<any[]>("/world/default-factions").then(setDefaultFactions).catch(() => setDefaultFactions([]));
    Promise.all([apiClient.get<any[]>("/cities"), apiClient.get<any[]>("/territories"), apiClient.get<any[]>("/map/routes")])
      .then(([cities, territories, routes]) => { setLiveCities(cities); setLiveTerritories(territories); setTransportRoutes(routes); })
      .catch(() => { setLiveCities([]); setLiveTerritories([]); setTransportRoutes([]); });
  }, [tickCount]);

  const routeHubs = useMemo(() => {
    const seen = new Set<string>();
    const hubs:any[] = [];
    for (const route of transportRoutes) {
      const type = route.type === "sea" ? "port" : route.type === "air" ? "airport" : null;
      if (!type) continue;
      for (const side of ["from", "to"] as const) {
        const id = `${type}:${route[side]?.longitude}:${route[side]?.latitude}`;
        if (seen.has(id)) continue;
        seen.add(id);
        hubs.push({type, latitude: route[side]?.latitude, longitude: route[side]?.longitude});
      }
    }
    return hubs;
  }, [transportRoutes]);
  const activeWars = useMemo(() => wars.filter((w) => w.status === "active" || w.status === "preparing"), [wars]);
  const selected = countries.find((c) => c.id === selectedCountryId);
  const playerCountryId = player?.countryId ?? null;
  const selectedUnits = units.filter((u) => u.countryId === selectedCountryId);
  const mapPixelWidth = MAP_WIDTH * zoom;
  const mapPixelHeight = MAP_HEIGHT * zoom;
  const displayWidth = Math.max(width - 24, 320);
  const cityDetail = zoom >= 1.35;
  const worldTime = night ? "23:40" : "13:20";

  const countryStatus = (countryId: string) => {
    const war = activeWars.find((w) => w.attackerId === countryId || w.defenderId === countryId);
    return war ? "WAR" : "PEACE";
  };

  const setMapZoom = (next: number) => setZoom((current) => clamp(next, MIN_ZOOM, MAX_ZOOM));

  const onDeclareWar = () => {
    if (!selected || !playerCountryId || selected.id === playerCountryId) {
      Alert.alert("Strategic Command", "Select a foreign territory first.");
      return;
    }
    Alert.alert("Declare War", `${playerCountryId} → ${selected.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => {
          const result = declareWar(playerCountryId, selected.id, `Dominion War — ${selected.name}`);
          Alert.alert(result.success ? "War declared" : "Blocked", result.message);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.hudTop}>
        <View style={styles.brandBlock}>
          <Text style={styles.kicker}>GLOBAL DOMINION</Text>
          <Text style={styles.title}>WORLD COMMAND</Text>
        </View>
        <View style={styles.hudStats}>
          <HudStat label="GD$" value={player?.wealth?.toLocaleString() ?? "2,500"} />
          <HudStat label="WARS" value={String(activeWars.length)} danger={activeWars.length > 0} />
          <HudStat label="TICK" value={String(tickCount)} />
        </View>
      </View>

      {defaultFactions.length > 0 && (
        <View style={styles.factionBar}>
          <Text style={styles.factionTitle}>DEFAULT WORLD POWERS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {defaultFactions.map((f:any) => (
              <Pressable key={f.id} onPress={async () => {
                try { await apiClient.post("/world/country-selection", {countryId:f.id}); setSelectedCountryId(f.id); } catch {}
              }} style={[styles.factionButton, selectedCountryId === f.id && styles.factionButtonActive, {borderColor:f.color || "#D7B36B"}]}>
                <View style={[styles.factionDot,{backgroundColor:f.color || "#D7B36B"}]} />
                <Text style={styles.factionText}>{f.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.mapShell}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: mapPixelWidth }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: mapPixelHeight }}>
            <View style={{ width: mapPixelWidth, height: mapPixelHeight }}>
              <Image source={require("../../../assets/world-map.png")} resizeMode="stretch" style={StyleSheet.absoluteFill} />
              <CountryPolygons
                width={mapPixelWidth}
                height={mapPixelHeight}
                countries={countries as any}
                selectedCountryId={selectedCountryId}
                onSelectCountry={(countryId) => setSelectedCountryId(countryId)}
                night={night}
                mode={mapMode}
              />
              <Svg pointerEvents="none" width={mapPixelWidth} height={mapPixelHeight} style={StyleSheet.absoluteFill}>
                {transportRoutes.map((route:any) => {
                  const fx=((route.from?.longitude + 180) / 360) * mapPixelWidth;
                  const fy=((90 - route.from?.latitude) / 180) * mapPixelHeight;
                  const tx=((route.to?.longitude + 180) / 360) * mapPixelWidth;
                  const ty=((90 - route.to?.latitude) / 180) * mapPixelHeight;
                  const stroke=route.type==='road' ? '#C8B27A' : route.type==='sea' ? '#4DB7D8' : '#E9E1B7';
                  const dash=route.type==='road' ? undefined : route.type==='sea' ? '10 7' : '3 8';
                  return <Polyline key={route.id} points={`${fx},${fy} ${tx},${ty}`} fill="none" stroke={stroke} strokeWidth={route.type==='road' ? (cityDetail?2.2:1.2) : (cityDetail?2:1)} strokeDasharray={dash} opacity={route.type==='road'?0.42:0.5}/>;
                })}
              </Svg>
              {night && <View pointerEvents="none" style={styles.nightTint} />}

              {liveTerritories.map((territory:any) => {
                const city = liveCities.find((c:any) => c.id === territory.cityId);
                const fallback = CITIES.find(x => x[0] === territory.name);
                if (!city && !fallback) return null;
                const x = city ? (city.longitude + 180) / 360 : (fallback?.[2] ?? 0.5);
                const y = city ? (90 - city.latitude) / 180 : (fallback?.[3] ?? 0.5);
                const controller = countries.find(c => c.id === (territory.controllerCountryId || territory.countryId));
                return <Pressable key={`territory-${territory.id}`} onPress={() => setSelectedCountryId(territory.controllerCountryId || territory.countryId)} style={[styles.territoryOverlay,{left:x*mapPixelWidth,top:y*mapPixelHeight,borderColor:controller?.color || '#D7B36B',backgroundColor:(controller?.color || '#D7B36B')+'22'}]}>
                  {territory.occupied && <Text style={styles.occupationText}>OCCUPIED</Text>}
                </Pressable>;
              })}

              {showCities && (liveCities.length ? liveCities : CITIES.map(([name,countryId,_x,_y,capital]) => ({name,countryId,latitude:0,longitude:0,capital}))).map((city:any) => {
                const displayCountryId = city.controllerCountryId || city.countryId;
                const country = countries.find((c) => c.id === displayCountryId);
                const fallback = CITIES.find(x => x[0] === city.name);
                const x = typeof city.longitude === "number" ? (city.longitude + 180) / 360 : (fallback?.[2] ?? 0.5);
                const y = typeof city.latitude === "number" ? (90 - city.latitude) / 180 : (fallback?.[3] ?? 0.5);
                const left = x * mapPixelWidth;
                const top = y * mapPixelHeight;
                const capital = !!city.capital;
                const glow = night && (capital || cityDetail);
                return (
                  <Pressable key={city.id || city.name} onPress={() => setSelectedCountryId(displayCountryId)} style={[styles.cityMarker, { left, top }, glow && styles.cityGlow]}>
                    <View style={[styles.cityDot, { backgroundColor: country?.color ?? COLORS.accentGold }]}>
                      {capital ? <Ionicons name="star" size={8 * zoom + 3} color="#fff" /> : <Ionicons name="business" size={8 * zoom + 2} color="#fff" />}
                    </View>
                    {(zoom >= 1.0 || capital) && <Text style={styles.cityLabel}>{city.name}</Text>}
                    {city.controllerCountryId && city.controllerCountryId !== city.countryId && <Text style={styles.occupiedLabel}>CONTROLLED</Text>}
                    {cityDetail && <View style={styles.city3d}><Text style={styles.city3dText}>▥</Text><Text style={styles.city3dText}>▥</Text><Text style={styles.city3dText}>▥</Text></View>}
                  </Pressable>
                );
              })}

              {zoom >= 1.12 && routeHubs.map((hub:any, index:number) => {
                const x=((hub.longitude + 180) / 360) * mapPixelWidth;
                const y=((90 - hub.latitude) / 180) * mapPixelHeight;
                return <View key={`hub-${hub.type}-${index}`} pointerEvents="none" style={[styles.routeHub,{left:x,top:y}]}>
                  <MaterialCommunityIcons name={hub.type === "port" ? "anchor" : "airplane"} size={cityDetail ? 14 : 10} color={hub.type === "port" ? "#4DB7D8" : "#E9E1B7"}/>
                </View>;
              })}

              {showMilitary && units.map((unit) => {
                const pos = unit.position
                  ? { x: (unit.position.longitude + 180) / 360, y: (90 - unit.position.latitude) / 180 }
                  : UNIT_POSITIONS[unit.location] ? { x: UNIT_POSITIONS[unit.location][0], y: UNIT_POSITIONS[unit.location][1] } : null;
                if (!pos) return null;
                const icon = unit.type === "fighter" || unit.type === "bomber" || unit.type === "transport_aircraft" ? "airplane" : unit.type === "armor" ? "tank" : unit.type.includes("nav") || unit.type === "carrier" || unit.type === "destroyer" ? "ferry" : "account-group";
                const route = unit.route || [];
                return (
                  <View key={unit.id}>
                    {route.length > 1 && (
                      <Svg pointerEvents="none" width={mapPixelWidth} height={mapPixelHeight} style={StyleSheet.absoluteFill}>
                        <Polyline
                          points={route.map((p:any) => `${((p.longitude + 180) / 360) * mapPixelWidth},${((90 - p.latitude) / 180) * mapPixelHeight}`).join(" ")}
                          fill="none"
                          stroke={unit.orderStatus === "attacking" ? "#FF4D3D" : unit.orderStatus === "retreating" ? "#D7B36B" : "#6ED4FF"}
                          strokeWidth={cityDetail ? 3 : 2}
                          strokeDasharray="7 5"
                          opacity={0.9}
                        />
                      </Svg>
                    )}
                    <Pressable
                      onPress={() => setSelectedCountryId(unit.countryId ?? null)}
                      style={[styles.unitMarker, { left: pos.x * mapPixelWidth, top: pos.y * mapPixelHeight }]}
                    >
                      <View style={[styles.unitBadge, unit.orderStatus === "attacking" && styles.unitBadgeAttack, unit.orderStatus === "defending" && styles.unitBadgeDefend]}>
                        <MaterialCommunityIcons name={icon as any} size={cityDetail ? 21 : 16} color="#F5F0E5" />
                      </View>
                      {cityDetail && <Text style={styles.unitLabel}>{unit.name}</Text>}
                      {unit.orderStatus && unit.orderStatus !== "idle" && <Text style={styles.orderLabel}>{unit.orderStatus.toUpperCase()} {unit.progress != null ? `${Math.round(unit.progress)}%` : ""}</Text>}
                    </Pressable>
                  </View>
                );
              })}

              {showFleets && FLEETS.map(([name, x, y, countryId]) => (
                <Pressable key={name} onPress={() => setSelectedCountryId(countryId)} style={[styles.fleetMarker, { left: x * mapPixelWidth, top: y * mapPixelHeight }]}>
                  <MaterialCommunityIcons name="ferry" size={cityDetail ? 25 : 18} color="#9DD8FF" />
                  {cityDetail && <Text style={styles.unitLabel}>{name}</Text>}
                </Pressable>
              ))}

              {activeWars.map((war) => {
                const battle = war.battles?.find((b) => b.status === "ongoing");
                if (!battle) return null;
                const p = battle.location.includes("Denver") ? [0.31, 0.40] : [0.57, 0.32];
                return (
                  <Pressable key={battle.id} onPress={() => setSelectedCountryId(war.defenderId)} style={[styles.battleMarker, { left: p[0] * mapPixelWidth, top: p[1] * mapPixelHeight }]}>
                    <Ionicons name="flame" size={cityDetail ? 24 : 18} color="#FF4D3D" />
                    <Text style={styles.battlePulse}>●</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>

        <View style={styles.mapOverlayTop}>
          <View style={styles.modeRow}>
            {(["political", "military", "economy"] as const).map((mode) => (
              <Pressable key={mode} onPress={() => setMapMode(mode)} style={[styles.modeButton, mapMode === mode && styles.modeActive]}>
                <Text style={[styles.modeText, mapMode === mode && styles.modeTextActive]}>{mode.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE WORLD · {worldTime}</Text></View>
        </View>

        <View style={styles.mapControls}>
          <ControlButton icon="add" onPress={() => setMapZoom(zoom + 0.22)} />
          <ControlButton icon="remove" onPress={() => setMapZoom(zoom - 0.22)} />
          <ControlButton icon={night ? "sunny" : "moon"} onPress={() => setNight(!night)} />
          <ControlButton icon="locate" onPress={() => setMapZoom(0.92)} />
        </View>

        <View style={styles.layerBar}>
          <LayerButton label="CITIES" active={showCities} onPress={() => setShowCities(!showCities)} />
          <LayerButton label="MIL" active={showMilitary} onPress={() => setShowMilitary(!showMilitary)} />
          <LayerButton label="FLEETS" active={showFleets} onPress={() => setShowFleets(!showFleets)} />
          <LayerButton label="ROUTES" active={true} onPress={() => {}} />
          <Text style={styles.zoomReadout}>ZOOM {zoom.toFixed(1)}×</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.commandBar}>
        <CommandButton icon="briefcase" label="WORK" onPress={() => router.push("/work")} />
        <CommandButton icon="cash" label="MARKET" onPress={() => router.push("/market")} />
        <CommandButton icon="shield-sword" label="WAR" onPress={() => router.push("/military")} />
        <CommandButton icon="bank" label="NATION" onPress={() => router.push("/nation")} />
        <CommandButton icon="bank" label="POLITICS" onPress={() => router.push("/politics")} />
        <CommandButton icon="flask" label="RESEARCH" onPress={() => router.push("/research")} />
        <CommandButton icon="handshake" label="DIPLOMACY" onPress={() => router.push("/diplomacy")} />
        <CommandButton icon="airplane" label="TRAVEL" onPress={() => router.push("/travel")} />
        <CommandButton icon="hammer" label="BUILD" onPress={() => router.push("/build")} />
        <CommandButton icon="earth" label="HISTORY" onPress={() => router.push("/history")} />
        <CommandButton icon="account-group" label="PLAYERS" onPress={() => router.push("/players")} />
        <CommandButton icon="newspaper" label="SOCIAL" onPress={() => router.push("/social")} />
        <CommandButton icon="account-group" label="PROFILE" onPress={() => router.push("/profile")} />
      </ScrollView>

      <View style={styles.infoPanel}>
        <View style={styles.panelHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.panelKicker}>{selected ? countryStatus(selected.id) : "WORLD STATUS"}</Text>
            <Text style={styles.panelTitle}>{selected?.name ?? "Select a territory"}</Text>
          </View>
          {selected && <View style={[styles.countryFlag, { backgroundColor: selected.color }]} />}
        </View>
        {selected ? (
          <View>
            <View style={styles.panelStats}>
              <PanelStat label="CAPITAL" value={selected.capital} />
              <PanelStat label="MILITARY" value={String(selected.militaryStrength)} />
              <PanelStat label="STABILITY" value={`${selected.stability}%`} />
              <PanelStat label="UNITS" value={String(selectedUnits.length)} />
            </View>
            <View style={styles.actionRow}>
              <SmallAction label="INSPECT" onPress={() => Alert.alert(selected.name, selected.description ?? "Strategic territory.")} />
              <SmallAction label="WAR" danger onPress={onDeclareWar} />
              <SmallAction label="MILITARY" onPress={() => router.push("/military")} />
            </View>
          </View>
        ) : (
          <Text style={styles.panelHint}>Tap a city, territory, army, fleet, or battle marker to inspect the live strategic world.</Text>
        )}
      </View>

      <View style={styles.bottomStatus}>
        <Text style={styles.statusText}>{countries.length} POWERS</Text>
        <Text style={styles.statusText}>{units.length} FORMATIONS</Text>
        <Text style={[styles.statusText, activeWars.length ? styles.dangerText : null]}>{activeWars.length} ACTIVE WARS</Text>
        <Text style={styles.statusText}>{events.length} EVENTS</Text>
      </View>
    </View>
  );
}

function HudStat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return <View style={styles.hudStat}><Text style={styles.hudLabel}>{label}</Text><Text style={[styles.hudValue, danger && styles.dangerText]}>{value}</Text></View>;
}

function ControlButton({ icon, onPress }: { icon: any; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.controlButton, pressed && { opacity: 0.7 }]}><Ionicons name={icon} size={20} color="#F4E7C1" /></Pressable>;
}

function LayerButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.layerButton, active && styles.layerActive]}><Text style={[styles.layerText, active && styles.layerTextActive]}>{label}</Text></Pressable>;
}

function CommandButton({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.commandButton}><MaterialCommunityIcons name={icon} size={19} color="#E8D4A2" /><Text style={styles.commandText}>{label}</Text></Pressable>;
}

function PanelStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.panelStat}><Text style={styles.panelStatLabel}>{label}</Text><Text style={styles.panelStatValue}>{value}</Text></View>;
}

function SmallAction({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.smallAction, danger && styles.smallActionDanger]}><Text style={styles.smallActionText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05080C" },
  hudTop: { minHeight: 70, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#080D12", borderBottomWidth: 1, borderBottomColor: "#24303A" },
  brandBlock: { flex: 1 },
  kicker: { color: "#B39B66", fontSize: 9, fontWeight: "900", letterSpacing: 2.2 },
  title: { color: "#F4EEE2", fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  hudStats: { flexDirection: "row", gap: 12 },
  hudStat: { alignItems: "flex-end", minWidth: 44 },
  hudLabel: { color: "#6D7B84", fontSize: 8, fontWeight: "800" },
  hudValue: { color: "#E8D4A2", fontSize: 11, fontWeight: "900" },
  factionBar: { marginHorizontal: 12, marginBottom: 8, padding: 8, backgroundColor: "rgba(8,14,20,.92)", borderWidth: 1, borderColor: "#3C4A55", borderRadius: 8 },
  factionTitle: { color: "#B9A87A", fontSize: 9, fontWeight: "900", letterSpacing: 1.2, marginBottom: 6 },
  factionButton: { flexDirection: "row", alignItems: "center", paddingVertical: 7, paddingHorizontal: 10, marginRight: 6, borderWidth: 1, borderRadius: 6, backgroundColor: "rgba(20,28,34,.9)" },
  factionButtonActive: { backgroundColor: "rgba(215,179,107,.14)" },
  factionDot: { width: 9, height: 9, borderRadius: 5, marginRight: 6 },
  factionText: { color: "#F2E8D0", fontSize: 10, fontWeight: "800" },
  mapShell: { flex: 1, margin: 6, borderWidth: 1, borderColor: "#2C3942", overflow: "hidden", backgroundColor: "#101820" },
  nightTint: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(2, 12, 28, 0.27)" },
  mapOverlayTop: { position: "absolute", top: 10, left: 10, right: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modeRow: { flexDirection: "row", backgroundColor: "rgba(5,8,12,.88)", borderWidth: 1, borderColor: "#37424B" },
  modeButton: { paddingHorizontal: 9, paddingVertical: 7 },
  modeActive: { backgroundColor: "#6F1419" },
  modeText: { color: "#91A0A8", fontSize: 8, fontWeight: "900" },
  modeTextActive: { color: "#FFF3D2" },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: "rgba(5,8,12,.88)", borderWidth: 1, borderColor: "#37424B" },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#47D18C" },
  liveText: { color: "#D4DDE0", fontSize: 8, fontWeight: "900" },
  mapControls: { position: "absolute", right: 10, bottom: 56, gap: 6 },
  controlButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,8,12,.9)", borderWidth: 1, borderColor: "#45515A" },
  layerBar: { position: "absolute", left: 8, right: 8, bottom: 8, flexDirection: "row", alignItems: "center", gap: 5, padding: 5, backgroundColor: "rgba(5,8,12,.9)", borderWidth: 1, borderColor: "#45515A" },
  layerButton: { paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: "#34414A" },
  layerActive: { backgroundColor: "#4A161A", borderColor: "#9E4B50" },
  layerText: { color: "#73818A", fontSize: 8, fontWeight: "900" },
  layerTextActive: { color: "#F5E8C5" },
  zoomReadout: { marginLeft: "auto", color: "#87939A", fontSize: 8, fontWeight: "900" },
  territoryOverlay: { position: "absolute", transform: [{ translateX: -30 }, { translateY: -30 }], width: 60, height: 60, borderWidth: 2, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  occupationText: { color: "#FFB66B", fontSize: 6, fontWeight: "900", textShadowColor: "#000", textShadowRadius: 3 },
  cityMarker: { position: "absolute", transform: [{ translateX: -8 }, { translateY: -8 }], alignItems: "center", minWidth: 20 },
  cityDot: { width: 17, height: 17, borderRadius: 9, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E7E2D5" },
  cityGlow: { shadowColor: "#FFD96B", shadowOpacity: 0.95, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  cityLabel: { color: "#F6EAD1", fontSize: 8, fontWeight: "900", marginTop: 2, textShadowColor: "#000", textShadowRadius: 3 },
  occupiedLabel: { color: "#FFB66B", fontSize: 6, fontWeight: "900", marginTop: 1, textShadowColor: "#000", textShadowRadius: 3 },
  city3d: { flexDirection: "row", marginTop: 2, gap: 1 },
  city3dText: { color: "#D7B36B", fontSize: 7, opacity: 0.8 },
  routeHub: { position: "absolute", width: 20, height: 20, alignItems: "center", justifyContent: "center", marginLeft: -10, marginTop: -10 },
  unitMarker: { position: "absolute", transform: [{ translateX: -10 }, { translateY: -10 }], alignItems: "center" },
  unitBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15,25,32,.92)", borderWidth: 1, borderColor: "#6ED4FF" },
  unitBadgeAttack: { borderColor: "#FF4D3D", backgroundColor: "rgba(100,15,15,.92)" },
  unitBadgeDefend: { borderColor: "#D7B36B", backgroundColor: "rgba(75,55,20,.92)" },
  orderLabel: { color: "#BFE9FF", fontSize: 6, fontWeight: "900", backgroundColor: "rgba(0,0,0,.78)", paddingHorizontal: 3, paddingVertical: 1, marginTop: 1 },
  unitLabel: { maxWidth: 120, color: "#FFF0C6", fontSize: 7, fontWeight: "800", backgroundColor: "rgba(0,0,0,.72)", paddingHorizontal: 3, paddingVertical: 2, marginTop: 2 },
  fleetMarker: { position: "absolute", transform: [{ translateX: -10 }, { translateY: -10 }], alignItems: "center" },
  battleMarker: { position: "absolute", transform: [{ translateX: -12 }, { translateY: -12 }], width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(130,20,20,.75)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FF8176" },
  battlePulse: { position: "absolute", color: "#FF4D3D", fontSize: 8, top: -2, right: -2 },
  commandBar: { paddingHorizontal: 7, paddingVertical: 6, gap: 6, backgroundColor: "#090E13", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#25313A" },
  commandButton: { minWidth: 76, paddingHorizontal: 9, paddingVertical: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#111A21", borderWidth: 1, borderColor: "#34414A", gap: 3 },
  commandText: { color: "#C5CED2", fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  infoPanel: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: "#0B1117", borderTopWidth: 1, borderColor: "#2C3942" },
  panelHeader: { flexDirection: "row", alignItems: "center" },
  panelKicker: { color: "#B39B66", fontSize: 8, fontWeight: "900", letterSpacing: 1.5 },
  panelTitle: { color: "#F3EBDD", fontSize: 17, fontWeight: "900" },
  countryFlag: { width: 28, height: 28, borderRadius: 4, borderWidth: 1, borderColor: "#D7D0BF" },
  panelStats: { flexDirection: "row", marginTop: 8, gap: 14 },
  panelStat: { flex: 1 },
  panelStatLabel: { color: "#687780", fontSize: 7, fontWeight: "900" },
  panelStatValue: { color: "#D7E0E3", fontSize: 10, fontWeight: "800", marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  smallAction: { paddingHorizontal: 11, paddingVertical: 7, backgroundColor: "#1A2730", borderWidth: 1, borderColor: "#40505A" },
  smallActionDanger: { backgroundColor: "#5D171C", borderColor: "#9D3D43" },
  smallActionText: { color: "#F1E7D2", fontSize: 8, fontWeight: "900" },
  panelHint: { color: "#87949B", fontSize: 10, lineHeight: 14, marginTop: 5 },
  bottomStatus: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 5, backgroundColor: "#070B0F" },
  statusText: { color: "#65737B", fontSize: 7, fontWeight: "900", letterSpacing: 0.6 },
  dangerText: { color: "#FF7165" },
});
