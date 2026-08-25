import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
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

export default function PoliticsScreen() {
  const { player } = useAuth();
  const { countries, events } = useGame();
  const country = countries.find((c) => c.id === player?.countryId);

  const politicalEvents = events.filter(
    (e) => e.type === "politics" || e.type === "diplomacy"
  );

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Muted>GOVERNANCE</Muted>
          <Title>Politics & Diplomacy</Title>
        </View>

        <Card>
          <SectionHeader title="Your Standing" />
          <View style={styles.row}>
            <Stat label="RANK" value={player?.rank ?? "citizen"} accent />
            <Stat label="CAREER" value={player?.career ?? "civilian"} />
            <Stat label="REPUTATION" value={player?.reputation ?? 50} />
          </View>
          <Divider />
          <Muted>
            Rise from citizen to head of government through elections,
            appointments, and influence. Full election and government services
            are already modeled.
          </Muted>
        </Card>

        {country ? (
          <Card>
            <SectionHeader title="National Government" />
            <Text style={styles.country}>{country.name}</Text>
            <Muted>
              {country.government.replace(/_/g, " ")} • Capital {country.capital}
            </Muted>
            <Divider />
            <View style={styles.row}>
              <Stat label="STABILITY" value={`${country.stability}%`} />
              <Stat label="STATUS" value={country.status} />
            </View>
          </Card>
        ) : null}

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
            Relations, treaties, alliances, and international orgs are covered
            by services/diplomacy.ts and services/international.ts. Connect to
            live multiplayer when the backend is online.
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
  country: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
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
