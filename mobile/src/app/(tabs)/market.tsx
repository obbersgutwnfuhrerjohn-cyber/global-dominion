import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen, Card, Title, Muted, Divider } from "../../components/ui";
import { COLORS } from "../../constants/colors";
import { apiClient } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type Quote = { symbol: string; name: string; price: number; change: number };
type Resource = { type: string; name: string; amount: number; unit: string };

export default function MarketScreen() {
  const { player, updatePlayer } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [q, r, o] = await Promise.all([
        apiClient.get<Quote[]>("/economy/market/prices"),
        apiClient.get<Resource[]>(`/economy/resources?countryId=${encodeURIComponent(player?.countryId ?? "country_jps")}`),
        apiClient.get<any[]>("/economy/market/orders"),
      ]);
      setQuotes(q); setResources(r); setOrders(o);
    } catch (e: any) {
      Alert.alert("Market unavailable", e?.message || "Could not load the live market.");
    }
  }, [player?.countryId]);

  useEffect(() => { void load(); const i = setInterval(() => void load(), 5000); return () => clearInterval(i); }, [load]);

  const trade = async (symbol: string, side: "buy" | "sell") => {
    const quote = quotes.find(q => q.symbol === symbol);
    if (!quote) return;
    setBusy(`${side}:${symbol}`);
    try {
      const result: any = await apiClient.post("/economy/market/orders", { symbol, side, quantity: 1 });
      const total = Number(result.total ?? quote.price);
      if (side === "buy") {
        await updatePlayer({ wealth: Math.max(0, Number(player?.wealth ?? 0) - total) } as any);
      } else {
        await updatePlayer({ wealth: Number(player?.wealth ?? 0) + total } as any);
      }
      await load();
      Alert.alert("Market filled", `${side.toUpperCase()} 1 ${symbol} for GD$ ${total.toFixed(2)}.`);
    } catch (e: any) {
      Alert.alert("Trade rejected", e?.message || "The server rejected the order.");
    } finally { setBusy(null); }
  };

  const stock = (symbol: string) => resources.find(r => ({ FOOD:"food", OIL:"oil", STL:"steel", ENR:"energy", TECH:"electronics" } as any)[symbol] === r.type)?.amount ?? 0;

  return <Screen><ScrollView showsVerticalScrollIndicator={false}>
    <Title>Market</Title>
    <Muted>LIVE GLOBAL COMMODITY EXCHANGE · server-authoritative</Muted>
    <Card><Text style={s.balance}>GD$ {Number(player?.wealth ?? 0).toLocaleString()}</Text><Muted>Your available national currency.</Muted></Card>
    <Card><Text style={s.section}>RESOURCES</Text>{resources.map(r => <View key={r.type} style={s.row}><Text style={s.name}>{r.name}</Text><Text style={s.value}>{Number(r.amount).toFixed(1)} {r.unit}</Text></View>)}</Card>
    <Card><Text style={s.section}>LIVE PRICES</Text>{quotes.map(q => <View key={q.symbol} style={s.quote}>
      <View style={{flex:1}}><Text style={s.symbol}>{q.symbol}</Text><Muted>{q.name} · GD$ {q.price.toFixed(2)} · {q.change >= 0 ? "+" : ""}{q.change.toFixed(1)}%</Muted><Muted>Stock: {stock(q.symbol)}</Muted></View>
      <View style={s.actions}><Pressable disabled={!!busy} onPress={() => void trade(q.symbol,"buy")} style={s.buy}><Text style={s.actionText}>{busy === `buy:${q.symbol}` ? "…" : "BUY"}</Text></Pressable><Pressable disabled={!!busy} onPress={() => void trade(q.symbol,"sell")} style={s.sell}><Text style={s.actionText}>{busy === `sell:${q.symbol}` ? "…" : "SELL"}</Text></Pressable></View>
    </View>)}</Card>
    <Card><Text style={s.section}>YOUR FILLED ORDERS</Text>{orders.length === 0 ? <Muted>No orders yet.</Muted> : orders.slice(-20).reverse().map(o => <View key={o.id} style={s.row}><Text style={s.name}>{o.side?.toUpperCase()} {o.quantity} {o.symbol}</Text><Text style={s.value}>GD$ {Number(o.total ?? 0).toFixed(2)}</Text></View>)}<Divider/><Muted>Orders are filled by the server and change your real resource/currency balances.</Muted></Card>
    <View style={{height:24}}/>
  </ScrollView></Screen>;
}
const s=StyleSheet.create({balance:{color:COLORS.accentGold,fontSize:28,fontWeight:"900",marginBottom:4},section:{color:COLORS.textMuted,fontSize:10,fontWeight:"900",letterSpacing:1.2,marginBottom:10},row:{flexDirection:"row",justifyContent:"space-between",paddingVertical:10,borderBottomWidth:1,borderBottomColor:COLORS.border},name:{color:COLORS.textPrimary,fontWeight:"700"},value:{color:COLORS.accentGold,fontWeight:"800"},quote:{flexDirection:"row",alignItems:"center",paddingVertical:11,borderBottomWidth:1,borderBottomColor:COLORS.border},symbol:{color:COLORS.accentBright,fontWeight:"900",fontSize:16},actions:{flexDirection:"row",gap:6},buy:{backgroundColor:"#183C2A",borderWidth:1,borderColor:"#3A8B60",paddingHorizontal:10,paddingVertical:8},sell:{backgroundColor:"#4A1D21",borderWidth:1,borderColor:"#9A4B52",paddingHorizontal:10,paddingVertical:8},actionText:{color:"#F5E9CF",fontSize:9,fontWeight:"900"}});
