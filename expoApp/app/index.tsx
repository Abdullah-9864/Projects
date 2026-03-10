import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={Styles.div}> 
      <Text style={Styles.paragraph}>Home Screen</Text>
      <Link href="/about" style={Styles.paragraph}>Go to About</Link>
    </View>
  );
}

const Styles = StyleSheet.create({
  div: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 20,
  },

  paragraph: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    marginVertical: 10,
    textAlign: "center",
    overflow: "hidden",
  },
});