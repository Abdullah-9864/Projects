import { StyleSheet, Text, View } from "react-native";

export default function about() {
  return (
    <View style={Styles.div} > 
      <Text style = {Styles.paragraph}>About screen.</Text>
      
    </View>
  );
}

const Styles = StyleSheet.create({
paragraph: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    textAlign: "center",
    padding:10
  },
div:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black"

},


})
