import { Tabs, Redirect } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/colors";
function TabIcon({label,focused}:{label:string;focused:boolean}){return <Text style={{fontSize:9,fontWeight:focused?"900":"700",color:focused?COLORS.accentGold:COLORS.textMuted,letterSpacing:.6}}>{label}</Text>}
export default function TabsLayout(){const {isAuthenticated,isLoading}=useAuth();if(!isLoading&&!isAuthenticated)return <Redirect href="/"/>;return <Tabs screenOptions={{headerShown:false,tabBarStyle:{backgroundColor:"#090E13",borderTopColor:"#303A40",borderTopWidth:1,height:60,paddingBottom:7,paddingTop:6},tabBarShowLabel:false,tabBarActiveTintColor:COLORS.accentGold}}>
 <Tabs.Screen name="index" options={{title:"Map",tabBarIcon:({focused})=><TabIcon label="MAP" focused={focused}/>}}/>
 <Tabs.Screen name="profile" options={{title:"Profile",tabBarIcon:({focused})=><TabIcon label="PROFILE" focused={focused}/>}}/>
 <Tabs.Screen name="work" options={{title:"Work",tabBarIcon:({focused})=><TabIcon label="WORK" focused={focused}/>}}/>
 <Tabs.Screen name="market" options={{title:"Market",tabBarIcon:({focused})=><TabIcon label="MARKET" focused={focused}/>}}/>
 <Tabs.Screen name="wars" options={{title:"War",tabBarIcon:({focused})=><TabIcon label="WAR" focused={focused}/>}}/>
 <Tabs.Screen name="alliance" options={{title:"Alliance",tabBarIcon:({focused})=><TabIcon label="ALLIANCE" focused={focused}/>}}/>
 <Tabs.Screen name="more" options={{title:"More",tabBarIcon:({focused})=><TabIcon label="MORE" focused={focused}/>}}/>
 {['world','economy','military','politics','diplomacy','nation','travel','history','build','players','social','research','intelligence','rankings','notifications','city','province','army','battle','battle-report','shop'].map(name=><Tabs.Screen key={name} name={name as any} options={{href:null}}/>)}
 </Tabs>}
