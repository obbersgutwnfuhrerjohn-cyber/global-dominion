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

export default function MilitaryScreen() {
  const {
    units,
    wars,
    countries,
    resolveBattleStep,
    recruitUnit,
  } = useGame();
  const { player } = useAuth();

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
});
