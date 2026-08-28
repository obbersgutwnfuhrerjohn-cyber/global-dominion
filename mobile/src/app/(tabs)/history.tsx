import { ScrollView, StyleSheet, Text } from "react-native";
import { useGame } from "../../context/GameContext";
import { Card, Screen, SectionHeader } from "../../components/ui";
export default function HistoryScreen(){const {state}=useGame();return <Screen><ScrollView contentContainerStyle={{paddingBottom:30}}><SectionHeader title="HISTORY"/>{state.history.map(h=><Card key={h.id} style={styles.row}><Text style={styles.time}>{new Date(h.createdAt).toLocaleTimeString()}</Text><Text style={styles.text}>{h.text}</Text></Card>)}</ScrollView></Screen>}
const styles=StyleSheet.create({row:{paddingVertical:10},time:{color:"#6F797F",fontSize:7},text:{color:"#D8CFBF",fontSize:9,marginTop:3}});
