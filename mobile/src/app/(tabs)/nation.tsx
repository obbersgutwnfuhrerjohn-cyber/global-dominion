import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen, Card, Title, Muted, Stat, Divider } from "../../components/ui";
import { apiClient } from "../../services/api";
import { COLORS } from "../../constants/colors";
export default function NationScreen(){const [state,setState]=useState<any>(null);useEffect(()=>{apiClient.get<any>("/strategy/state").then(setState).catch(()=>{})},[]);const c=state?.countries?.find((x:any)=>x.id===state?.units?.[0]?.countryId)||state?.countries?.[0];return <Screen><ScrollView><Title>Nation Command</Title><Muted>Economy, population, industry, military and strategic capacity.</Muted><Card>{c?<><Text style={styles.name}>{c.name}</Text><Divider/><View style={styles.grid}><Stat label="POPULATION" value={c.population?.toLocaleString()}/><Stat label="GDP" value={`$${Math.round((c.gdp||0)/1e9)}B`}/><Stat label="TREASURY" value={`$${Math.round((c.treasury||0)/1e9)}B`}/><Stat label="MILITARY" value={String(c.militaryStrength)}/><Stat label="STABILITY" value={`${c.stability}%`}/></View></>:<Muted>Loading nation data…</Muted>}</Card></ScrollView></Screen>}
const styles=StyleSheet.create({name:{color:COLORS.textPrimary,fontSize:20,fontWeight:"900",marginBottom:8},grid:{gap:12}});
