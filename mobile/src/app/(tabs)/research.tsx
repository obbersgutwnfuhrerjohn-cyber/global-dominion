import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen, Card, Title, Muted, Button, Badge, Divider } from "../../components/ui";
import { apiClient } from "../../services/api";
import { COLORS } from "../../constants/colors";

export default function ResearchScreen(){
  const [techs,setTechs]=useState<any[]>([]); const [projects,setProjects]=useState<any[]>([]);
  const load=async()=>{try{setTechs(await apiClient.get<any[]>("/research/technologies"));setProjects(await apiClient.get<any[]>("/research/projects"));}catch(e:any){Alert.alert("Research",e?.message||"Unable to load research.")}};
  useEffect(()=>{load()},[]);
  const start=async(id:string)=>{try{await apiClient.post("/research/projects",{technologyId:id});await load();}catch(e:any){Alert.alert("Research",e?.message||"Research could not start.")}};
  return <Screen><ScrollView><Title>Research</Title><Muted>Persistent technology development advances on server ticks.</Muted><Card><Text style={styles.h}>ACTIVE PROJECTS</Text>{projects.length===0?<Muted>No active projects.</Muted>:projects.map(p=><View key={p.id} style={styles.row}><View style={{flex:1}}><Text style={styles.name}>{p.name}</Text><Muted>{p.progress}% · {p.status}</Muted></View><Badge text={p.status.toUpperCase()} tone="info"/></View>)}</Card><Card><Text style={styles.h}>TECHNOLOGY TREE</Text>{techs.map(t=><View key={t.id} style={styles.row}><View style={{flex:1}}><Text style={styles.name}>{t.name}</Text><Muted>{t.category} · {t.days} days · {t.cost} research</Muted></View><Button title={t.unlocked?"START":"LOCKED"} disabled={!t.unlocked} variant="secondary" onPress={()=>start(t.id)}/></View>)}</Card></ScrollView></Screen>
}
const styles=StyleSheet.create({h:{color:COLORS.accentGold,fontWeight:"900",fontSize:12,letterSpacing:1,marginBottom:10},row:{flexDirection:"row",alignItems:"center",gap:10,paddingVertical:10,borderBottomWidth:1,borderBottomColor:COLORS.border},name:{color:COLORS.textPrimary,fontWeight:"800",fontSize:14}});
