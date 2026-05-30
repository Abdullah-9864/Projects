import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView, Animated
} from 'react-native';
import Paho from 'paho-mqtt';

const BROKER    = 'c12e66baf5c34fecb0d1558aff2707d4.s1.eu.hivemq.cloud';
const PORT      = 8884;
const MQTT_USER = 'abdullah9864';
const MQTT_PASS = 'Ab5599@ab';

const TOPIC_CONTROL = 'home/light/control';
const TOPIC_STATUS  = 'home/light/status';
const TOPIC_CONN    = 'home/esp32/connection';

export default function App() {
  const [lightState, setLightState]   = useState('OFF');
  const [mqttStatus, setMqttStatus]   = useState('Connecting...');
  const [esp32Status, setEsp32Status] = useState('Unknown');
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const clientRef = useRef<any>(null);

  useEffect(() => {
    connectMQTT();
    return () => {
      if (clientRef.current) clientRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (lightState === 'ON') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1,   duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [lightState]);

  function connectMQTT() {
    const clientId = 'expo-' + Math.random().toString(16).substr(2, 8);
    const client   = new Paho.Client(BROKER, PORT, '/mqtt', clientId);
    clientRef.current = client;

    client.onConnectionLost = () => {
      setMqttStatus('Disconnected ❌');
      setEsp32Status('Unknown');
      setTimeout(() => connectMQTT(), 3000);
    };

    client.onMessageArrived = (msg: any) => {
      const topic   = msg.destinationName;
      const payload = msg.payloadString;
      if (topic === TOPIC_STATUS) setLightState(payload);
      if (topic === TOPIC_CONN)   setEsp32Status(payload === 'ONLINE' ? 'Online' : 'Offline');
    };

    client.connect({
      useSSL: true,
      userName: MQTT_USER,
      password: MQTT_PASS,
      onSuccess: () => {
        setMqttStatus('Connected');
        client.subscribe(TOPIC_STATUS);
        client.subscribe(TOPIC_CONN);
      },
      onFailure: () => {
        setMqttStatus('Failed');
        setTimeout(() => connectMQTT(), 3000);
      },
    });
  }

  function sendCommand(cmd: string) {
    if (clientRef.current && clientRef.current.isConnected()) {
      const msg = new Paho.Message(cmd);
      msg.destinationName = TOPIC_CONTROL;
      clientRef.current.send(msg);
      // Update UI immediately without waiting for ESP32 feedback
      setLightState(cmd);
    }
  }

  const glowOpacity = glowAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      <Text style={styles.title}>Smart Light</Text>
      <Text style={styles.subtitle}>CONTROL PANEL</Text>

      {/* Bulb */}
      <Animated.View style={[styles.bulbContainer, { opacity: lightState === 'ON' ? glowOpacity : 0.2 }]}>
        <Text style={styles.bulbEmoji}>💡</Text>
        <Text style={lightState === 'ON' ? styles.glowText : styles.offText}>
          Light is {lightState}
        </Text>
      </Animated.View>

      {/* Status */}
      <View style={styles.statusRow}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>MQTT</Text>
          <Text style={styles.statusValue}>{mqttStatus}</Text>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>ESP32</Text>
          <Text style={styles.statusValue}>{esp32Status}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, lightState === 'ON' ? styles.btnOnActive : styles.btnOn]}
          onPress={() => sendCommand('ON')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnIcon}>☀️</Text>
          <Text style={styles.btnText}>ON</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, lightState === 'OFF' ? styles.btnOffActive : styles.btnOff]}
          onPress={() => sendCommand('OFF')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnIcon}>🌙</Text>
          <Text style={styles.btnText}>OFF</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0a0a1a', alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: 36, fontWeight: 'bold', color: '#ffffff', letterSpacing: 2 },
  subtitle:     { fontSize: 12, color: '#888', marginBottom: 40, letterSpacing: 4 },
  bulbContainer:{ alignItems: 'center', marginBottom: 40 },
  bulbEmoji:    { fontSize: 100 },
  glowText:     { color: '#f1c40f', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  offText:      { color: '#555',    fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  statusRow:    { flexDirection: 'row', gap: 16, marginBottom: 50 },
  statusCard:   { backgroundColor: '#1a1a2e', padding: 16, borderRadius: 16, alignItems: 'center',
                  minWidth: 130, borderWidth: 1, borderColor: '#2a2a4a' },
  statusLabel:  { color: '#888', fontSize: 12, letterSpacing: 2, marginBottom: 6 },
  statusValue:  { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  btnRow:       { flexDirection: 'row', gap: 20 },
  btn:          { width: 130, height: 130, borderRadius: 65, alignItems: 'center',
                  justifyContent: 'center', borderWidth: 2 },
  btnOn:        { backgroundColor: '#1a1a2e', borderColor: '#f1c40f' },
  btnOnActive:  { backgroundColor: '#f1c40f', borderColor: '#f1c40f' },
  btnOff:       { backgroundColor: '#1a1a2e', borderColor: '#3498db' },
  btnOffActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  btnIcon:      { fontSize: 30 },
  btnText:      { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
});