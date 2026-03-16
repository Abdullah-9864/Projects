import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';

export default function HomeScreen() 
{
  const [day, setDay] = useState<string>("");

  useEffect(() => 
{
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[new Date().getDay()];
    setDay(currentDay);
}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Today is: {day}</Text>
    </View>
  );
}

const styles = StyleSheet.create(
{
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d1f825',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
