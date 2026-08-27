import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen, Card, Title, Muted, SectionHeader } from "../../components/ui";
import { COLORS } from "../../constants/colors";
import { apiClient } from "../../services/api";

const BUILDINGS = [
  ["hospital","HOSPITAL","Restores damaged troops stationed in the city."],
  ["barracks","BARRACKS","Produces infantry and supports manpower deployment."],
  ["tank_factory","TANK FACTORY","Produces armor and mechanized formations."],
  ["artillery_factory","ARTILLERY FACTORY","Produces artillery and air-defense formations."],
  ["factory","INDUSTRIAL FACTORY","Increases industrial output."],
  ["airbase","AIRBASE","Builds and operates aircraft."],
  ["port","NAVAL PORT","Builds and operates naval units."],
  ["rail","RAILWAY","Improves strategic logistics and movement."],
  ["road","ROAD NETWORK","Improves local logistics and movement."],
  ["secret_service","SECRET SERVICE HQ","Enables national secret-service agencies, counterintelligence and spy operations."],
];

export default function BuildScreen(){
 const [cities,setCities]=useState<any[]>([]); const [state,setState]=useState<any>({constructionQueue:[],buildings:[]}); const [selected,setSelected]=useState<any>(null);
 const refresh=()=>{apiClient.get<any[]>('/cities').then(setCities).catch(()=>{});apiClient.get<any>('/strategy/state').then(setState).catch(()=>{});};
 useEffect(()=>{refresh(); const t=setInterval(refresh,5000); return ()=>clearInterval(t);},[]);
 const cityBuildings=useMemo(()=>selected?((state.buildings||[]).filter((b:any)=>b.cityId===selected.id&&!b.destroyed)):[],[state.buildings,selected]);
 const build=async(type:string)=>{if(!selected)return; try{await apiClient.post('/construction',{cityId:selected.id,type});Alert.alert('Construction started',`${type.replace(/_/g,' ')} started in ${selected.name}.`);refresh();}catch(e:any){Alert.alert('Construction failed',e?.message||'You do not control this city.');}};
 return <Screen><ScrollView showsVerticalScrollIndicator={false}>
  <Title>Buildings & Infrastructure</Title><Muted>Build real facilities in cities you control. Facilities unlock production, defense and troop recovery.</Muted>
  <Card><SectionHeader title="Selected City"/><Text style={s.t}>{selected?.name||'Select a city below'}</Text>{selected&&<><Muted>Controller: {selected.controllerCountryId||selected.countryId}</Muted><View style={s.buildings}>{cityBuildings.map((b:any)=><View key={b.id} style={s.badge}><Text style={s.badgeText}>{String(b.type).replace(/_/g,' ').toUpperCase()} LV.{b.level||1}</Text></View>)}</View><View style={s.grid}>{BUILDINGS.map(([id,name,desc])=><Pressable key={id} style={s.button} onPress={()=>build(id)}><Text style={s.b}>{name}</Text><Text style={s.desc}>{desc}</Text></Pressable>)}</View></>}</Card>
  <SectionHeader title="Cities"/>
  {cities.slice(0,80).map(c=><Pressable key={c.id} onPress={()=>setSelected(c)}><Card><Text style={s.t}>{c.name}</Text><Muted>{c.capital?'CAPITAL · ':''}{c.major?'MAJOR CITY · ':''}{c.controllerCountryId||c.countryId}</Muted></Card></Pressable>)}
  <SectionHeader title="Construction Queue"/>
  {(state.constructionQueue||[]).map((q:any)=><Card key={q.id}><Text style={s.t}>{String(q.type).replace(/_/g,' ').toUpperCase()}</Text><Muted>{q.progress}% · {q.status}</Muted></Card>)}
 </ScrollView></Screen>
}
const s=StyleSheet.create({t:{color:COLORS.textPrimary,fontWeight:'900',fontSize:16},d:{color:COLORS.textSecondary},b:{color:COLORS.accentGold,fontWeight:'900'},desc:{color:COLORS.textSecondary,fontSize:11,marginTop:3},button:{borderWidth:1,borderColor:COLORS.border,padding:10,marginTop:8,borderRadius:8},buildings:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:8},badge:{paddingHorizontal:8,paddingVertical:5,borderRadius:8,backgroundColor:COLORS.surfaceElevated},badgeText:{color:COLORS.textPrimary,fontSize:10,fontWeight:'800'},grid:{marginTop:8}});
