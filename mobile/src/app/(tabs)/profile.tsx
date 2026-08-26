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
  ProgressBar,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";
import { useShop } from "../../context/ShopContext";

const RANK_LADDER = [
  "Citizen",
  "Loyal Subject",
  "Official",
  "Administrator",
  "Provincial Director",
  "Minister",
  "Inner Circle",
];

export default function ProfileScreen() {
  const { player, logout, isDemoMode } = useAuth();
  const { marks, unlocks } = useShop();
  const { countries } = useGame();
  const router = useRouter();

  const country = countries.find((c) => c.id === player?.countryId);
  const level = player?.level ?? 1;
  const xp = player?.experience ?? 0;
  const xpToNext = level * 100;
  const loyalty = (player as any)?.loyalty ?? 65;
  const influence = (player as any)?.influence ?? 10;
  const medals: string[] = (player as any)?.medals ?? [];

  const handleLogout = () => {
    Alert.alert("Sign Out", "Leave the ordered world?", [
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
        {/* Identity banner */}
        <View style={styles.banner}>
          <View style={styles.bannerStripe} />
          <Muted>SUBJECT DOSSIER</Muted>
          <Title>{player?.displayName ?? "Citizen"}</Title>
          <Text style={styles.handle}>@{player?.username}</Text>
          <View style={styles.badges}>
            <Badge
              text={(player?.rank ?? "citizen").toUpperCase()}
              tone="gold"
            />
            {isDemoMode ? <Badge text="DEMO MODE" tone="warning" /> : null}
            <Badge
              text={(player?.status ?? "online").toUpperCase()}
              tone="success"
            />
          </View>
        </View>

        {/* Core vitals */}
        <Card>
          <SectionHeader title="Standing" />
          <View style={styles.row}>
            <Stat label="LEVEL" value={level} accent />
            <Stat label="PRESTIGE" value={player?.prestige ?? 0} gold />
            <Stat label="REPUTATION" value={player?.reputation ?? 50} />
          </View>
          <Divider />
          <Text style={styles.smallLabel}>EXPERIENCE → NEXT RANK</Text>
          <ProgressBar value={xp} max={xpToNext} color={COLORS.accentGold} />
          <Muted style={styles.xpText}>
            {xp} / {xpToNext} XP
          </Muted>
        </Card>

        {/* Loyalty & Influence — High Castle flavor */}
        <Card>
          <SectionHeader title="Loyalty & Influence" />
          <View style={styles.metricBlock}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricName}>Loyalty to Authority</Text>
              <Text style={styles.metricValue}>{loyalty}%</Text>
            </View>
            <ProgressBar
              value={loyalty}
              color={loyalty >= 70 ? COLORS.success : COLORS.warning}
            />
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricName}>Political Influence</Text>
              <Text style={[styles.metricValue, { color: COLORS.accentGold }]}>
                {influence}
              </Text>
            </View>
            <ProgressBar value={influence} max={100} color={COLORS.accentBright} />
          </View>
          <Divider />
          <Muted>
            High loyalty grants access to restricted zones and promotions.
            Influence determines your weight in provincial and imperial
            decisions.
          </Muted>
        </Card>

        {/* Wealth & Career */}
        <Card>
          <SectionHeader title="Assets & Career" />
          <View style={styles.row}>
            <Stat
              label="WEALTH"
              value={`${player?.wealth ?? 0} ${player?.currency ?? "¥"}`}
              gold
            />
            <Stat label="MARKS" value={marks} gold />
            <Stat label="CAREER" value={player?.career ?? "civilian"} />
          </View>
          <Divider />
          <Text style={styles.line}>
            Affiliation: {country?.name ?? "Unaffiliated"}
          </Text>
          <Text style={styles.line}>
            Bloc: {country?.bloc ?? "—"} · {country?.region ?? ""}
          </Text>
        </Card>

        {/* Biography */}
        <Card>
          <SectionHeader title="Biography" />
          <Text style={styles.bio}>
            {player?.biography ||
              "No official biography on record. Subjects are advised to maintain a clean dossier."}
          </Text>
        </Card>

        {/* Rank ladder */}
        <Card>
          <SectionHeader title="Hierarchy Path" />
          {RANK_LADDER.map((r, i) => {
            const current =
              (player?.rank ?? "citizen").toLowerCase() === r.toLowerCase() ||
              (i === 0 && (player?.rank ?? "citizen") === "citizen");
            return (
              <View key={r} style={styles.rankRow}>
                <View
                  style={[
                    styles.rankDot,
                    current && styles.rankDotActive,
                    i < level && styles.rankDotPast,
                  ]}
                />
                <Text
                  style={[
                    styles.rankName,
                    current && styles.rankNameActive,
                  ]}
                >
                  {r}
                </Text>
                {current ? (
                  <Badge text="CURRENT" tone="gold" />
                ) : null}
              </View>
            );
          })}
        </Card>

        {/* Medals / achievements placeholder */}
        <Card>
          <SectionHeader title="Commendations" />
          {medals.length === 0 ? (
            <Muted>
              No medals awarded yet. Serve the order, suppress disorder, expand
              influence.
            </Muted>
          ) : (
            medals.map((m) => (
              <Text key={m} style={styles.medal}>
                ★ {m}
              </Text>
            ))
          )}
        </Card>

        {/* Account meta */}
        <Card>
          <SectionHeader title="Records" />
          <Text style={styles.line}>
            Email: {player?.email ?? "—"}
          </Text>
          <Text style={styles.line}>
            Registered:{" "}
            {player?.createdAt
              ? new Date(player.createdAt).toLocaleDateString()
              : "—"}
          </Text>
          <Text style={styles.line}>
            Last seen:{" "}
            {player?.lastLoginAt
              ? new Date(player.lastLoginAt).toLocaleString()
              : "—"}
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Session" />
          <Muted>
            {isDemoMode
              ? "You are in the offline demo world. Progress is stored on this device. Connect a live backend to join the persistent multiplayer order."
              : "Connected to the live world server."}
          </Muted>
          <View style={{ height: 16 }} />
          <Button title="Sign Out" variant="danger" onPress={handleLogout} />
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: 16,
    marginTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bannerStripe: {
    height: 3,
    width: 48,
    backgroundColor: COLORS.accentBright,
    marginBottom: 10,
  },
  handle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 2,
    marginBottom: 10,
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
  smallLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  xpText: {
    marginTop: 6,
  },
  metricBlock: {
    marginBottom: 14,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metricName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  bio: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  line: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  rankDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.surfacePressed,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  rankDotActive: {
    backgroundColor: COLORS.accentGold,
    borderColor: COLORS.accentGold,
  },
  rankDotPast: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  rankName: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  rankNameActive: {
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  medal: {
    color: COLORS.accentGold,
    fontSize: 14,
    marginBottom: 6,
  },
});
