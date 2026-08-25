import { Tabs, Redirect } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/colors";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: focused ? "800" : "600",
        color: focused ? COLORS.accentBright : COLORS.textMuted,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accentBright,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Command",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="CMD" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="world"
        options={{
          title: "World",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="WORLD" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="economy"
        options={{
          title: "Economy",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="ECO" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="military"
        options={{
          title: "Military",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="MIL" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="politics"
        options={{
          title: "Politics",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="POL" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="YOU" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
