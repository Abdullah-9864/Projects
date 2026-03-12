import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Home() 
{

  let day;
  switch(new Date().getDay()) {
    case 0: day = "Sunday";    break;
    case 1: day = "Monday";    break;
    case 2: day = "Tuesday";   break;
    case 3: day = "Wednesday"; break;
    case 4: day = "Thursday";  break;
    case 5: day = "Friday";    break;
    case 6: day = "Saturday";  break;
    default: day = "Unknown";
  }

  return (
    <View style={styles.wrapper}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar} />
          <Text style={styles.appName}>App Name</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Day Card */}
        <View style={styles.dayCard}>
          <Text style={styles.todayText}>Today is:</Text>
          <Text style={styles.dayText}>{day}</Text>
        </View>

        {/* Placeholder */}
        <View style={styles.contentBox}>
          <Text style={styles.contentTitle}>Scrollable Content Area</Text>
          <Text style={styles.contentSub}>Scrollable Content Area</Text>
        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create(
{
  wrapper: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#cccccc",
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  dayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  todayText: {
    fontSize: 16,
    color: "#999999",
    marginBottom: 8,
  },
  dayText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#000000",
  },
  contentBox: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 40,
    alignItems: "center",
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  contentSub: {
    fontSize: 13,
    color: "#999999",
    marginTop: 4,
  },
});
