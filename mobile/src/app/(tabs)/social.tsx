import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { apiClient } from "../../services/api";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";

const TABS=["FEED","MESSAGES","COALITION"] as const;
type Tab=typeof TABS[number];

export default function SocialScreen(){
  const {player}=useAuth();
  const [tab,setTab]=useState<Tab>("FEED");
  const [feed,setFeed]=useState<any[]>([]);
  const [text,setText]=useState("");
  const [imageDataUrl,setImageDataUrl]=useState<string|null>(null);
  const [players,setPlayers]=useState<any[]>([]);
  const [selectedPlayer,setSelectedPlayer]=useState<any>(null);
  const [messages,setMessages]=useState<any[]>([]);
  const [messageText,setMessageText]=useState("");
  const [coalitions,setCoalitions]=useState<any[]>([]);
  const [selectedCoalition,setSelectedCoalition]=useState<any>(null);
  const [coalitionMessages,setCoalitionMessages]=useState<any[]>([]);
  const [coalitionText,setCoalitionText]=useState("");
  const [newCoalition,setNewCoalition]=useState("");

  const loadFeed=async()=>{try{setFeed(await apiClient.get<any[]>("/social/feed"));}catch(e:any){Alert.alert("Social",e?.message||"Unable to load the world feed.")}};
const loadPlayers = async () => { try { setPlayers(await apiClient.get<any[]>("/players/search")); } catch { setPlayers([]); } }
  const loadCoalitions=async()=>{try{setCoalitions(await apiClient.get<any[]>("/social/coalitions"));}catch{}}
  useEffect(()=>{loadFeed();loadPlayers();loadCoalitions();const i=setInterval(loadFeed,10000);return()=>clearInterval(i)},[]);
useEffect(() => { if (!selectedPlayer) return; apiClient.get<any[]>("/social/messages?withPlayerId=" + selectedPlayer.id).then(setMessages).catch(() => setMessages([])); }, [selectedPlayer]);
  useEffect(()=>{if(!selectedCoalition)return;apiClient.get<any[]>(`/social/coalitions/${selectedCoalition.id}/messages`).then(setCoalitionMessages).catch(()=>setCoalitionMessages([]))},[selectedCoalition]);

  const pickImage=async()=>{
    const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],allowsEditing:true,quality:.75});
    if(r.canceled)return;
    const asset=r.assets[0];
    try{
      const resized=await ImageManipulator.manipulateAsync(asset.uri,[{resize:{width:900}}],{compress:.7,format:ImageManipulator.SaveFormat.JPEG,base64:true});
      if(resized.base64)setImageDataUrl(`data:image/jpeg;base64,${resized.base64}`);
    }catch(e:any){Alert.alert("Image",e?.message||"Could not prepare the image.")}
  };
  const post=async()=>{if(!text.trim()&&!imageDataUrl)return;try{await apiClient.post("/social/posts",{text:text.trim(),imageDataUrl});setText("");setImageDataUrl(null);await loadFeed();}catch(e:any){Alert.alert("Post rejected",e?.message||"Could not publish the post.")}};
  const sendMessage=async()=>{if(!selectedPlayer||!messageText.trim())return;try{await apiClient.post("/social/messages",{toPlayerId:selectedPlayer.id,text:messageText.trim()});setMessageText("");setMessages(await apiClient.get<any[]>("/social/messages?withPlayerId=" + selectedPlayer.id));}catch(e:any){Alert.alert("Message",e?.message||"Could not send message.")}};
  const createCoalition=async()=>{if(!newCoalition.trim())return;try{const c=await apiClient.post<any>("/social/coalitions",{name:newCoalition.trim()});setNewCoalition("");await loadCoalitions();setSelectedCoalition(c);}catch(e:any){Alert.alert("Coalition",e?.message||"Could not create coalition.")}};
  const joinCoalition=async(c:any)=>{try{const joined=await apiClient.post<any>(`/social/coalitions/${c.id}/join`,{});setSelectedCoalition(joined);await loadCoalitions();}catch(e:any){Alert.alert("Coalition",e?.message||"Could not join coalition.")}};
  const sendCoalition=async()=>{if(!selectedCoalition||!coalitionText.trim())return;try{await apiClient.post(` /social/coalitions/${selectedCoalition.id}/messages`.trim(),{text:coalitionText.trim()});setCoalitionText("");setCoalitionMessages(await apiClient.get<any[]>(`/social/coalitions/${selectedCoalition.id}/messages`));}catch(e:any){Alert.alert("Coalition chat",e?.message||"Could not send message.")}};

  return <View style={styles.root}>
    <View style={styles.header}><Text style={styles.kicker}>GLOBAL DOMINION</Text><Text style={styles.title}>WORLD NEWS & SOCIAL</Text><Text style={styles.sub}>Wars, diplomacy, revolutions and player communications.</Text></View>
    <View style={styles.tabs}>{TABS.map(x=><Pressable key={x} onPress={()=>setTab(x)} style={[styles.tab,tab===x&&styles.tabActive]}><Text style={[styles.tabText,tab===x&&styles.tabTextActive]}>{x}</Text></Pressable>)}</View>
    {tab==="FEED"&&<ScrollView contentContainerStyle={styles.content}>
      <View style={styles.compose}><Text style={styles.section}>PUBLISH</Text><TextInput value={text} onChangeText={setText} multiline placeholder="Write a report, announcement or player post…" placeholderTextColor={COLORS.textSecondary} style={styles.input}/>{imageDataUrl&&<Image source={{uri:imageDataUrl}} style={styles.preview}/>}<View style={styles.actions}><Pressable onPress={pickImage} style={styles.action}><Text style={styles.actionText}>ADD PHOTO</Text></Pressable><Pressable onPress={post} style={styles.action}><Text style={styles.actionText}>PUBLISH</Text></Pressable></View></View>
      {feed.map(item=><View key={item.id} style={[styles.card,item.kind!=="system"&&item.kind!=="war"&&styles.playerCard]}><View style={styles.row}><Text style={styles.author}>{item.author?.displayName||"GLOBAL DOMINION NEWS"}</Text><Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text></View><Text style={styles.cardTitle}>{item.title||"Player Post"}</Text>{item.body||item.text?<Text style={styles.body}>{item.body||item.text}</Text>:null}{item.imageDataUrl?<Image source={{uri:item.imageDataUrl}} style={styles.feedImage}/>:null}<Text style={styles.type}>{String(item.type||"social").toUpperCase()}</Text></View>)}
    </ScrollView>}
    {tab==="MESSAGES"&&<View style={styles.split}><ScrollView style={styles.list}>{players.filter(p=>p.id!==player?.id).map(p=><Pressable key={p.id} onPress={()=>setSelectedPlayer(p)} style={[styles.listItem,selectedPlayer?.id===p.id&&styles.selected]}><Text style={styles.author}>{p.displayName}</Text><Text style={styles.muted}>@{p.username} · {p.rank}</Text></Pressable>)}</ScrollView><View style={styles.chat}><Text style={styles.section}>{selectedPlayer?`CHAT · ${selectedPlayer.displayName}`:"SELECT A PLAYER"}</Text><ScrollView style={styles.chatScroll}>{messages.map(m=><View key={m.id} style={[styles.bubble,m.fromPlayerId===player?.id&&styles.mine]}><Text style={styles.body}>{m.text}</Text></View>)}</ScrollView>{selectedPlayer&&<View style={styles.messageRow}><TextInput value={messageText} onChangeText={setMessageText} placeholder="Message…" placeholderTextColor={COLORS.textSecondary} style={styles.messageInput}/><Pressable onPress={sendMessage} style={styles.send}><Text style={styles.sendText}>SEND</Text></Pressable></View>}</View></View>}
    {tab==="COALITION"&&<View style={styles.split}><View style={styles.list}><View style={styles.createRow}><TextInput value={newCoalition} onChangeText={setNewCoalition} placeholder="New coalition" placeholderTextColor={COLORS.textSecondary} style={styles.messageInput}/><Pressable onPress={createCoalition} style={styles.send}><Text style={styles.sendText}>CREATE</Text></Pressable></View><ScrollView>{coalitions.map(c=><View key={c.id} style={styles.listItem}><Pressable onPress={()=>setSelectedCoalition(c)}><Text style={styles.author}>{c.name} [{c.tag}]</Text><Text style={styles.muted}>{c.memberCount} members</Text></Pressable><Pressable onPress={()=>joinCoalition(c)}><Text style={styles.link}>JOIN</Text></Pressable></View>)}</ScrollView></View><View style={styles.chat}><Text style={styles.section}>{selectedCoalition?`COALITION · ${selectedCoalition.name}`:"SELECT A COALITION"}</Text><ScrollView style={styles.chatScroll}>{coalitionMessages.map(m=><View key={m.id} style={styles.bubble}><Text style={styles.muted}>{m.author?.displayName}</Text><Text style={styles.body}>{m.text}</Text></View>)}</ScrollView>{selectedCoalition&&<View style={styles.messageRow}><TextInput value={coalitionText} onChangeText={setCoalitionText} placeholder="Coalition message…" placeholderTextColor={COLORS.textSecondary} style={styles.messageInput}/><Pressable onPress={sendCoalition} style={styles.send}><Text style={styles.sendText}>SEND</Text></Pressable></View>}</View></View>}
  </View>
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:COLORS.background},header:{padding:18,borderBottomWidth:1,borderBottomColor:COLORS.border},kicker:{color:COLORS.accentGold,fontSize:11,fontWeight:"900",letterSpacing:2},title:{color:COLORS.textPrimary,fontSize:22,fontWeight:"900",marginTop:4},sub:{color:COLORS.textSecondary,marginTop:4},tabs:{flexDirection:"row",borderBottomWidth:1,borderBottomColor:COLORS.border},tab:{flex:1,padding:13,alignItems:"center"},tabActive:{borderBottomWidth:2,borderBottomColor:COLORS.accentGold},tabText:{color:COLORS.textSecondary,fontWeight:"800",fontSize:11},tabTextActive:{color:COLORS.accentGold},content:{padding:12,gap:10},compose:{backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,padding:12},section:{color:COLORS.accentGold,fontWeight:"900",letterSpacing:1},input:{minHeight:80,color:COLORS.textPrimary,borderWidth:1,borderColor:COLORS.border,marginTop:8,padding:10,textAlignVertical:"top"},actions:{flexDirection:"row",justifyContent:"space-between",marginTop:8},action:{padding:10,borderWidth:1,borderColor:COLORS.accentGold},actionText:{color:COLORS.accentGold,fontWeight:"900"},preview:{width:"100%",height:180,marginTop:8},card:{backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,padding:12},playerCard:{borderColor:COLORS.accentGold},row:{flexDirection:"row",justifyContent:"space-between",gap:8},author:{color:COLORS.textPrimary,fontWeight:"900"},time:{color:COLORS.textSecondary,fontSize:10},cardTitle:{color:COLORS.textPrimary,fontWeight:"900",fontSize:16,marginTop:8},body:{color:COLORS.textPrimary,fontSize:14,lineHeight:20,marginTop:5},type:{color:COLORS.accentGold,fontSize:10,fontWeight:"900",marginTop:8},feedImage:{width:"100%",height:240,marginTop:10},split:{flex:1,flexDirection:"row"},list:{width:"34%",borderRightWidth:1,borderRightColor:COLORS.border},listItem:{padding:12,borderBottomWidth:1,borderBottomColor:COLORS.border},selected:{backgroundColor:COLORS.surface},muted:{color:COLORS.textSecondary,fontSize:12,marginTop:3},link:{color:COLORS.accentGold,fontWeight:"900",marginTop:6},chat:{flex:1,padding:12},chatScroll:{flex:1,marginTop:8},bubble:{maxWidth:"82%",alignSelf:"flex-start",backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,padding:9,marginBottom:8},mine:{alignSelf:"flex-end",borderColor:COLORS.accentGold},messageRow:{flexDirection:"row",gap:6,alignItems:"center"},messageInput:{flex:1,borderWidth:1,borderColor:COLORS.border,color:COLORS.textPrimary,padding:10,minHeight:42},send:{backgroundColor:COLORS.accentGold,paddingHorizontal:12,paddingVertical:12},sendText:{color:"#111",fontWeight:"900"},createRow:{padding:8,flexDirection:"row",gap:5}});
