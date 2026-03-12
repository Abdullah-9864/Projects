import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: "#ffffff" },
      tabBarActiveTintColor: "#007AFF",
      tabBarInactiveTintColor: "#999999",
    }}>

      <Tabs.Screen name="index" options={{
        title: "Home",
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? "home" : "home-outline"} color={color} size={24} />
        ),
      }} />

      <Tabs.Screen name="explore" options={{
        title: "Explore",
        tabBarIcon: ({ color }) => (
          <Ionicons name="compass-outline" color={color} size={24} />
        ),
      }} />

      <Tabs.Screen name="create" options={{
        title: "Create",
        tabBarIcon: ({ color }) => (
          <Ionicons name="add-circle-outline" color={color} size={34} />
        ),
      }} />

      <Tabs.Screen name="activity" options={{
        title: "Activity",
        tabBarIcon: ({ color }) => (
          <Ionicons name="heart-outline" color={color} size={24} />
        ),
      }} />

      <Tabs.Screen name="settings" options={{
        title: "Settings",
        tabBarIcon: ({ color }) => (
          <Ionicons name="settings-outline" color={color} size={24} />
        ),
      }} />

    </Tabs>
  );
}
