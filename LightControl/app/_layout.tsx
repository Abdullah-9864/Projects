import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,    // ← removes top header
      tabBarStyle: { display: 'none' },  // ← removes bottom tab bar
    }}>
      <Tabs.Screen name="index" />
    </Tabs>
  );
}