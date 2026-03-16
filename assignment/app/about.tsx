// import { View, Text, StyleSheet } from 'react-native';

// export default function SettingsScreen() 
// {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>About tab</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create(
// {
//   container: 
//   {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#01a41f',
//   },
//   text: {
//     fontSize: 24,
//   },
// });


import{View , Text, StyleSheet} from 'react-native';
export default function aboutScreen()
{
  return(
    <View style={styles.container}>
      <Text style={styles.text}>
        about page

      </Text>
    </View>
  )
}

const styles=StyleSheet.create(
  {
    container:{
      flex:1,
      backgroundColor:'blue',

    },
    text:
    {
      fontSize:23,
    },
  });