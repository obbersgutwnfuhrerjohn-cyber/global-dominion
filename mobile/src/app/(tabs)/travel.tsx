import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen, Card, Title, Muted, Divider } from "../../components/ui";
import { COLORS } from "../../constants/colors";
import { apiClient } from "../../services/api";

export default function TravelScreen(){
 const [cities,setCities]=useState<any[]>([]); const [active,setActive]=useState<any[]>([]); const [agencies,setAgencies]=useState<any[]>([]);
 const load=async()=>{try{setCities(await apiClient.get<any[]>("/cities"));setActive(await apiClient.get<any[]>("/travel"));setAgencies(await apiClient.get<any[]>("/travel/agencies"))}catch{}};
 useEffect(()=>{load();const i=setInterval(load,5000);return()=>clearInterval(i)},[]);
 const travel=async(c:any)=>{try{await apiClient.post("/travel",{destinationCityId:c.id,transport:c.capital?"air":"train"});Alert.alert("Travel started",`Travelling to ${c.name}.`);load()}catch(e:any){Alert.alert("Travel unavailable",e?.message||"Server rejected travel.")}};
 return <Screen><ScrollView><Title>Travel</Title><Muted>Travel agencies coordinate civilian, commercial and military transport across the persistent world.</Muted><Divider/><Title>Travel Agencies</Title>{agencies.map(a=><Card key={a.id}><Text style={s.name}>{a.name}</Text><Text style={s.text}>{String(a.type).toUpperCase()} · Capacity {Number(a.capacity||0).toLocaleString()}</Text></Card>)}<Divider/><Muted>Move through the persistent world. Travel continues while you are offline.</Muted>{active.map(t=><Card key={t.id}><Text style={s.name}>{t.originName} → {t.destinationName}</Text><Text style={s.text}>{t.transport.toUpperCase()} · {t.progress}% · {t.distance} km</Text></Card>)}<Divider/><Title>Destinations</Title>{cities.slice(0,80).map(c=><Pressable key={c.id} onPress={()=>travel(c)}><Card><View style={s.row}><View><Text style={s.name}>{c.name}</Text><Text style={s.text}>{c.capital?"CAPITAL · ":""}Population {Number(c.population||0).toLocaleString()}</Text></View><Text style={s.go}>TRAVEL</Text></View></Card></Pressable>)}</ScrollView></Screen>
}
const s=StyleSheet.create({name:{color:COLORS.textPrimary,fontSize:16,fontWeight:"800"},text:{color:COLORS.textMuted,marginTop:4},row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},go:{color:COLORS.accentGold,fontWeight:"900"}});