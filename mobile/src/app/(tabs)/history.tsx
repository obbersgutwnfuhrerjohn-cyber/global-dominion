import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Screen, Card, Title, Muted } from "../../components/ui";
import { COLORS } from "../../constants/colors";
import { apiClient } from "../../services/api";
export default function HistoryScreen(){const [items,setItems]=useState<any[]>([]);useEffect(()=>{apiClient.get<any[]>("/history").then(setItems).catch(()=>{})},[]);return <Screen><ScrollView><Title>World History</Title><Muted>Persistent record of wars, revolutions, travel and political change.</Muted>{items.map(x=><Card key={x.id}><Text style={s.t}>{x.title}</Text><Text style={s.d}>{x.description}</Text><Text style={s.time}>{new Date(x.timestamp).toLocaleString()}</Text></Card>)}</ScrollView></Screen>}
const s=StyleSheet.create({t:{color:COLORS.textPrimary,fontWeight:"900",fontSize:16},d:{color:COLORS.textMuted,marginTop:4},time:{color:COLORS.accentGold,fontSize:11,marginTop:7}});