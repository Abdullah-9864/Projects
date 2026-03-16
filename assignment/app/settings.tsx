import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() 
{
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Tab</Text>
    </View>
  );
}

const styles = StyleSheet.create(
{
  container: 
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00e9d5',
  },
  text: {
    fontSize: 24,
  },
});
