import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";
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

export default function PoliticsScreen() {
  const { player } = useAuth();
  const {
    countries,
    events,
    revolutions,
    supportIndependence,
    declareIndependence,
    startRevolution,
  } = useGame();

  const country = countries.find((c) => c.id === player?.countryId);
  const politicalEvents = events.filter((e) =>
    ["politics", "diplomacy", "security", "revolution"].includes(e.type)
  );

  const nameOf = (id: string) =>
    countries.find((c) => c.id === id)?.name ?? id;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stripe} />
          <Muted>GOVERNANCE · REVOLUTION · INDEPENDENCE</Muted>
          <Title>Politics</Title>
        </View>

        <Card>
          <SectionHeader title="Your Position" />
          <View style={styles.row}>
            <Stat
              label="RANK"
              value={(player?.rank ?? "citizen").toUpperCase()}
              gold
            />
            <Stat label="CAREER" value={player?.career ?? "civilian"} />
            <Stat label="REPUTATION" value={player?.reputation ?? 50} />
          </View>
          <Divider />
          <Muted>
            Rise through loyalty — or organize resistance. Independence Day can
            be declared when a movement reaches ~70% support.
          </Muted>
        </Card>

        {country ? (
          <Card>
            <SectionHeader title="National Authority" />
            <Text style={styles.country}>{country.name}</Text>
            <Muted>
              {country.government.replace(/_/g, " ")} · {country.capital} ·{" "}
              {country.bloc}
            </Muted>
            <Divider />
            <View style={styles.row}>
              <Stat label="STABILITY" value={`${country.stability}%`} />
              <Stat label="STATUS" value={country.status} />
              <Stat label="MILITARY" value={country.militaryStrength} />
            </View>
            {country.canRevolt ? (
              <>
                <Divider />
                <Text style={styles.smallLabel}>
                  INDEPENDENCE MOVEMENT · {country.independenceMovement ?? 0}%
                </Text>
                <ProgressBar
                  value={country.independenceMovement ?? 0}
                  color={COLORS.warning}
                />
                <View style={{ height: 12 }} />
                <Button
                  title="Support Independence"
                  variant="secondary"
                  onPress={() => {
                    const r = supportIndependence(country.id);
                    Alert.alert(r.success ? "Support" : "Blocked", r.message);
                  }}
                />
                <View style={{ height: 8 }} />
                <Button
                  title="Start Revolution"
                  variant="danger"
                  onPress={() => {
                    const r = startRevolution(
                      country.id,
                      "independence",
                      player?.displayName ?? "Committee"
                    );
                    Alert.alert(r.success ? "Revolution" : "Blocked", r.message);
                  }}
                />
                <View style={{ height: 8 }} />
                <Button
                  title="Declare Independence Day"
                  variant="gold"
                  onPress={() => {
                    const r = declareIndependence(country.id);
                    Alert.alert(
                      r.success ? "Independence Day" : "Failed",
                      r.message
                    );
                  }}
                />
              </>
            ) : null}
          </Card>
        ) : null}

        <Card>
          <SectionHeader title="Active Revolutions" />
          {revolutions.length === 0 ? (
            <Muted>No open revolutions.</Muted>
          ) : (
            revolutions.map((r) => (
              <View key={r.id} style={styles.event}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>
                    {nameOf(r.countryId)} — {r.goal.replace(/_/g, " ")}
                  </Text>
                  <Badge
                    text={r.status.toUpperCase()}
                    tone={
                      r.status === "victorious"
                        ? "success"
                        : r.status === "active"
                          ? "danger"
                          : r.status === "suppressed"
                            ? "neutral"
                            : "warning"
                    }
                  />
                </View>
                <Muted>
                  Led by {r.leaderName} · Support {r.support}%
                </Muted>
                <ProgressBar
                  value={r.support}
                  color={
                    r.status === "victorious" ? COLORS.success : COLORS.warning
                  }
                />
              </View>
            ))
          )}
        </Card>

        <Card>
          <SectionHeader title="Active Affairs" />
          {politicalEvents.length === 0 ? (
            <Muted>No major political events at this time.</Muted>
          ) : (
            politicalEvents.map((e) => (
              <View key={e.id} style={styles.event}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Badge text={e.type} tone="info" />
                </View>
                <Muted>{e.description}</Muted>
              </View>
            ))
          )}
        </Card>

        <Card>
          <SectionHeader title="Diplomacy" />
          <Muted>
            Greater Albanian Reich is a formal ally of the Greater Nazi Reich.
            Occupied Serbia and the Neutral Zone are the main flashpoints for
            independence. Live multiplayer diplomacy activates with the backend.
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
  country: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  smallLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  event: { marginBottom: 14 },
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
