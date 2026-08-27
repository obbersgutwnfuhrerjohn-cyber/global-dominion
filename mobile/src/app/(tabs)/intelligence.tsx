import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiClient } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";
import { COLORS } from "../../constants/colors";
import { Button, Card, Screen, SectionHeader, Title, Muted, Badge } from "../../components/ui";

type Agency = { id:string; countryId:string; name:string; level:number; capacity:number; counterintelligence:number; active:boolean };
type Mission = { id:string; type:string; targetCountryId:string; targetCity:string|null; status:string; progress:number; completesAt:string; report:string|null };

const missionTypes = [
  ["recon", "RECON", "Acquire military/location intelligence"],
  ["surveillance", "SURVEILLANCE", "Monitor target activity"],
  ["counterintelligence", "COUNTER-INTEL", "Protect your own network"],
  ["sabotage", "SABOTAGE", "Disrupt target infrastructure"],
] as const;

export default function IntelligenceScreen() {
  const { player } = useAuth();
  const { countries } = useGame();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedType, setSelectedType] = useState<string>("recon");
  const [targetCountry, setTargetCountry] = useState<string>("");
  const [targetCity, setTargetCity] = useState("");
  const [agencyName, setAgencyName] = useState("");

  const myCountry = player?.countryId ?? "country_us";
  const targets = useMemo(() => countries.filter((c:any) => c.id !== myCountry), [countries, myCountry]);
  const myAgencies = agencies.filter(a => a.countryId === myCountry);

  const load = async () => {
    try {
      const [a, m] = await Promise.all([
        apiClient.get<Agency[]>(`/intelligence/agencies?countryId=${encodeURIComponent(myCountry)}`),
        apiClient.get<Mission[]>("/intelligence/missions"),
      ]);
      setAgencies(a); setMissions(m);
    } catch { setAgencies([]); setMissions([]); }
  };
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [myCountry]);

  const createAgency = async () => {
    try {
      const agency = await apiClient.post<Agency>("/intelligence/agencies", { name: agencyName || "National Intelligence Directorate" });
      setAgencies(v => [...v, agency]); setAgencyName("");
      Alert.alert("Agency established", "Your new intelligence agency is operational.");
    } catch (e:any) { Alert.alert("Agency", e?.message || "Could not establish agency."); }
  };

  const launch = async () => {
    if (!myAgencies[0]) return Alert.alert("No agency", "Establish an intelligence agency first.");
    if (!targetCountry) return Alert.alert("Target", "Select a target country.");
    try {
      const mission = await apiClient.post<Mission>("/intelligence/missions", { agencyId: myAgencies[0].id, targetCountryId: targetCountry, targetCity: targetCity || undefined, type: selectedType });
      setMissions(v => [mission, ...v]);
      Alert.alert("Mission launched", "The mission is now running on the server and can succeed or be caught by counterintelligence.");
    } catch (e:any) { Alert.alert("Mission", e?.message || "Mission could not be launched."); }
  };

  return <Screen>
    <ScrollView contentContainerStyle={styles.content}>
      <Title>INTELLIGENCE</Title>
      <Muted>Build a Secret Service Headquarters first, then open and operate persistent intelligence agencies.</Muted>

      <SectionHeader title="YOUR AGENCIES" />
      {myAgencies.map(a => <Card key={a.id} style={styles.card}>
        <Text style={styles.name}>{a.name}</Text>
        <View style={styles.row}><Badge text={`LEVEL ${a.level}`} /><Text style={styles.meta}>Capacity {a.capacity} · Counter-intel {a.counterintelligence}</Text></View>
      </Card>)}
      <Card style={styles.card}>
        <TextInput value={agencyName} onChangeText={setAgencyName} placeholder="New agency name" placeholderTextColor={COLORS.textSecondary} style={styles.input}/>
        <Button title="OPEN NEW SECRET AGENCY · GD$5,000" onPress={createAgency}/>
        <Text style={styles.meta}>Requirement: Secret Service Headquarters in a controlled city. HQ level increases the number and capacity of agencies you can operate.</Text>
      </Card>

      <SectionHeader title="NEW MISSION" />
      <Card style={styles.card}>
        <Text style={styles.label}>MISSION TYPE</Text>
        {missionTypes.map(([value, label, desc]) => <Pressable key={value} onPress={() => setSelectedType(value)} style={[styles.option, selectedType === value && styles.selected]}>
          <Text style={styles.optionTitle}>{label}</Text><Text style={styles.meta}>{desc}</Text>
        </Pressable>)}
        <Text style={styles.label}>TARGET COUNTRY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>{targets.map((c:any)=><Pressable key={c.id} onPress={()=>setTargetCountry(c.id)} style={[styles.chip, targetCountry===c.id&&styles.chipSelected]}><Text style={styles.chipText}>{c.name}</Text></Pressable>)}</ScrollView>
        <TextInput value={targetCity} onChangeText={setTargetCity} placeholder="Optional target city" placeholderTextColor={COLORS.textSecondary} style={styles.input}/>
        <Button title="LAUNCH MISSION" onPress={launch}/>
      </Card>

      <SectionHeader title="MISSION LOG" />
      {missions.length === 0 ? <Muted>No missions yet.</Muted> : missions.map(m => <Card key={m.id} style={styles.card}>
        <View style={styles.row}><Text style={styles.name}>{m.type.replace(/_/g," ").toUpperCase()}</Text><Badge text={m.status.toUpperCase()} /></View>
        <Text style={styles.meta}>Target: {countries.find((c:any)=>c.id===m.targetCountryId)?.name ?? m.targetCountryId}{m.targetCity ? ` · ${m.targetCity}` : ""}</Text>
        <Text style={styles.meta}>Progress: {m.progress}%</Text>
        {m.report && <Text style={styles.report}>{m.report}</Text>}
      </Card>)}
    </ScrollView>
  </Screen>;
}

const styles = StyleSheet.create({
  content:{padding:16,paddingBottom:40}, card:{marginTop:10,padding:14}, name:{color:COLORS.textPrimary,fontSize:15,fontWeight:"800",marginBottom:6}, meta:{color:COLORS.textSecondary,fontSize:12}, row:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10}, label:{color:COLORS.textSecondary,fontSize:11,fontWeight:"800",marginTop:12,marginBottom:7}, input:{borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.background,color:COLORS.textPrimary,padding:11,borderRadius:8,marginBottom:10}, option:{borderWidth:1,borderColor:COLORS.border,padding:10,borderRadius:8,marginBottom:7}, selected:{borderColor:COLORS.accentGold}, optionTitle:{color:COLORS.textPrimary,fontWeight:"800",fontSize:13}, chip:{paddingHorizontal:10,paddingVertical:8,borderWidth:1,borderColor:COLORS.border,borderRadius:16,marginRight:6}, chipSelected:{borderColor:COLORS.accentGold}, chipText:{color:COLORS.textPrimary,fontSize:11}, report:{color:COLORS.accentGold,fontSize:12,marginTop:8}
});
