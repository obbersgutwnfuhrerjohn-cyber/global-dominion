import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { apiClient } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Badge, Button, Card, Screen, SectionHeader, Stat, Title, Muted, Divider,
} from "../../components/ui";
import { COLORS } from "../../constants/colors";

type Job = {
  id: string;
  title: string;
  department: string;
  salary: number;
  durationMinutes: number;
  levelRequired: number;
  description: string;
};

const JOBS: Job[] = [
  { id: "factory_worker", title: "Factory Worker", department: "Industry", salary: 180, durationMinutes: 30, levelRequired: 1, description: "Operate a production line and earn industrial wages." },
  { id: "miner", title: "Strategic Miner", department: "Resources", salary: 240, durationMinutes: 45, levelRequired: 2, description: "Extract strategic materials for the national economy." },
  { id: "merchant", title: "Licensed Merchant", department: "Commerce", salary: 320, durationMinutes: 45, levelRequired: 3, description: "Move goods through sanctioned trade corridors." },
  { id: "engineer", title: "Systems Engineer", department: "Technology", salary: 480, durationMinutes: 60, levelRequired: 5, description: "Maintain infrastructure and advanced industrial systems." },
  { id: "officer", title: "Military Officer", department: "Defense", salary: 600, durationMinutes: 60, levelRequired: 7, description: "Coordinate logistics, readiness and strategic operations." },
];

export default function WorkScreen() {
  const { player } = useAuth();
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!player?.id) return;
    try {
      setCurrentJob(await apiClient.get(`/players/${player.id}/jobs/current`));
    } catch {
      setCurrentJob(null);
    }
  };

  useEffect(() => { refresh(); }, [player?.id]);

  const apply = async (job: Job) => {
    if ((player?.level ?? 1) < job.levelRequired) {
      Alert.alert("Locked", `Requires level ${job.levelRequired}.`);
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/players/jobs/apply", { jobId: job.id });
      await refresh();
      Alert.alert("Work accepted", `${job.title} application submitted.`);
    } catch (e) {
      Alert.alert("Work unavailable", e instanceof Error ? e.message : "The server rejected the application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stripe} />
          <Muted>EMPLOYMENT · PRODUCTION · CAREER</Muted>
          <Title>Work</Title>
        </View>

        <Card>
          <SectionHeader title="Career Status" />
          <View style={styles.row}>
            <Stat label="CAREER" value={player?.career ?? "civilian"} accent />
            <Stat label="LEVEL" value={player?.level ?? 1} />
            <Stat label="WEALTH" value={`${player?.wealth ?? 0} ${player?.currency ?? "¥"}`} gold />
          </View>
          <Divider />
          {currentJob ? (
            <>
              <Badge text="JOB ACTIVE" tone="success" />
              <Text style={styles.currentTitle}>{currentJob.title ?? "Current assignment"}</Text>
              <Muted>{currentJob.status ?? "Application accepted by the server."}</Muted>
            </>
          ) : (
            <Muted>No active assignment. Choose a career operation below.</Muted>
          )}
        </Card>

        <Card>
          <SectionHeader title="Available Assignments" />
          {JOBS.map((job) => {
            const locked = (player?.level ?? 1) < job.levelRequired;
            return (
              <View key={job.id} style={styles.job}>
                <View style={{ flex: 1 }}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Badge text={locked ? `LV ${job.levelRequired}` : job.department.toUpperCase()} tone={locked ? "neutral" : "info"} />
                  </View>
                  <Muted>{job.description}</Muted>
                  <View style={styles.jobStats}>
                    <Text style={styles.salary}>¥{job.salary}/shift</Text>
                    <Text style={styles.duration}>{job.durationMinutes} min</Text>
                  </View>
                </View>
                <Button title={locked ? "Locked" : loading ? "..." : "Apply"} variant={locked ? "ghost" : "secondary"} onPress={() => apply(job)} disabled={locked || loading} />
              </View>
            );
          })}
        </Card>

        <Card>
          <SectionHeader title="Career Progression" />
          <Muted>
            Work produces income and progression. Higher-level assignments unlock better pay and strategic roles.
          </Muted>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 14 },
  stripe: { width: 48, height: 4, backgroundColor: COLORS.accentGold, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  currentTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900", marginTop: 8 },
  job: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  jobHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  jobTitle: { color: COLORS.text, fontSize: 16, fontWeight: "900", flex: 1 },
  jobStats: { flexDirection: "row", gap: 14, marginTop: 8 },
  salary: { color: COLORS.accentGold, fontWeight: "900" },
  duration: { color: COLORS.textMuted, fontSize: 12, paddingTop: 2 },
});
