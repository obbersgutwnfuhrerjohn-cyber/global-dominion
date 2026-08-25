import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
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
} from "../../components/ui";
import { COLORS } from "../../constants/colors";

export default function ProfileScreen() {
  const { player, logout, isDemoMode } = useAuth();
  const { countries } = useGame();
  const router = useRouter();

  const country = countries.find((c) => c.id === player?.countryId);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Leave the world?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Muted>IDENTITY</Muted>
          <Title>{player?.displayName ?? "Citizen"}</Title>
          <Muted>@{player?.username}</Muted>
        </View>

        <Card>
          <View style={styles.badges}>
            <Badge text={player?.rank?.toUpperCase() ?? "CITIZEN"} tone="info" />
            {isDemoMode ? <Badge text="DEMO" tone="warning" /> : null}
            <Badge
              text={player?.status?.toUpperCase() ?? "ONLINE"}
              tone="success"
            />
          </View>
          <Divider />
          <View style={styles.row}>
            <Stat label="LEVEL" value={player?.level ?? 1} accent />
            <Stat label="XP" value={player?.experience ?? 0} />
            <Stat label="PRESTIGE" value={player?.prestige ?? 0} />
          </View>
          <Divider />
          <View style={styles.row}>
            <Stat
              label="WEALTH"
              value={`${player?.wealth ?? 0} ${player?.currency ?? "GD$"}`}
            />
            <Stat label="REPUTATION" value={player?.reputation ?? 50} />
            <Stat label="CAREER" value={player?.career ?? "civilian"} />
          </View>
        </Card>

        <Card>
          <SectionHeader title="Biography" />
          <Text style={styles.bio}>
            {player?.biography || "No biography set."}
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Affiliation" />
          <Text style={styles.line}>
            Nation: {country?.name ?? "Unaffiliated"}
          </Text>
          <Text style={styles.line}>
            Email: {player?.email ?? "—"}
          </Text>
          <Text style={styles.line}>
            Joined:{" "}
            {player?.createdAt
              ? new Date(player.createdAt).toLocaleDateString()
              : "—"}
          </Text>
          <Text style={styles.line}>
            Last login:{" "}
            {player?.lastLoginAt
              ? new Date(player.lastLoginAt).toLocaleString()
              : "—"}
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Session" />
          <Muted>
            Running in local demo mode. All progress is stored on this device.
            When you connect a real backend, auth and player services will take
            over without changing the UI structure.
          </Muted>
          <View style={{ height: 16 }} />
          <Button title="Sign Out" variant="danger" onPress={handleLogout} />
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
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  bio: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  line: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
});
