import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Animated, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── MQTT Config ────────────────────────────────────────
const MQTT_HOST     = 'c12e66baf5c34fecb0d1558aff2707d4.s1.eu.hivemq.cloud';
const MQTT_PORT     = 8884;
const MQTT_USER     = 'abdullah9864';
const MQTT_PASS     = 'Ab7788@ab';
const TOPIC_CONTROL = 'home/led/control';
const TOPIC_STATUS  = 'home/led/status';
// ──────────────────────────────────────────────────────

// Helper: encode string to MQTT format
function encStr(str) {
  const bytes = unescape(encodeURIComponent(str)).split('').map(c => c.charCodeAt(0));
  return [(bytes.length >> 8) & 0xff, bytes.length & 0xff, ...bytes];
}

// Helper: encode remaining length
function encLen(n) {
  const r = [];
  do {
    let b = n % 128;
    n = Math.floor(n / 128);
    if (n > 0) b |= 0x80;
    r.push(b);
  } while (n > 0);
  return r;
}

// Devices list
const DEVICES = [
  { id: 'led',  name: 'Main Light',  room: 'Living Room', icon: '💡', mqtt: true  },
  { id: 'fan',  name: 'Ceiling Fan', room: 'Bedroom',     icon: '🌀', mqtt: false },
  { id: 'ac',   name: 'AC Unit',     room: 'Living Room', icon: '❄️', mqtt: false },
  { id: 'lock', name: 'Door Lock',   room: 'Main Door',   icon: '🔒', mqtt: false },
];

export default function SmartHome() {
  const [states, setStates]       = useState({ led: false, fan: false, ac: false, lock: false });
  const [connected, setConnected] = useState(false);
  const [status, setStatus]       = useState('Connecting...');
  const wsRef    = useRef(null);
  const pingRef  = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Send raw bytes over WebSocket
  const sendBytes = (bytes) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(new Uint8Array(bytes).buffer);
    }
  };

  // Send MQTT CONNECT packet
  const sendConnect = () => {
    const clientId = 'App_' + Math.random().toString(16).substr(2, 8);
    const payload = [
      ...encStr('MQTT'), 0x04, 0xC2, 0x00, 0x3C,
      ...encStr(clientId),
      ...encStr(MQTT_USER),
      ...encStr(MQTT_PASS),
    ];
    sendBytes([0x10, ...encLen(payload.length), ...payload]);
  };

  // Publish message to topic
  const publish = (topic, message) => {
    const payload = [
      ...encStr(topic),
      ...unescape(encodeURIComponent(message)).split('').map(c => c.charCodeAt(0)),
    ];
    sendBytes([0x30, ...encLen(payload.length), ...payload]);
  };

  // Subscribe to topic
  const subscribe = (topic) => {
    const payload = [0x00, 0x01, ...encStr(topic), 0x00];
    sendBytes([0x82, ...encLen(payload.length), ...payload]);
  };

  // Handle incoming MQTT packet
  const handlePacket = (data) => {
    const type = (data[0] & 0xF0) >> 4;

    // CONNACK = connected!
    if (type === 2) {
      setConnected(true);
      setStatus('Connected');
      subscribe(TOPIC_STATUS);
      pingRef.current = setInterval(() => sendBytes([0xC0, 0x00]), 30000);
    }

    // PUBLISH = incoming message
    if (type === 3) {
      try {
        let i = 1;
        let mul = 1, len = 0, b;
        do { b = data[i++]; len += (b & 0x7F) * mul; mul *= 128; } while (b & 0x80);
        const tLen   = (data[i] << 8) | data[i + 1]; i += 2;
        const payload = String.fromCharCode(...data.slice(i + tLen));
        if (payload === 'ON')  setStates(prev => ({ ...prev, led: true  }));
        if (payload === 'OFF') setStates(prev => ({ ...prev, led: false }));
      } catch (e) {}
    }
  };

  // Connect to MQTT broker
  const connect = () => {
    try {
      const ws = new WebSocket(`wss://${MQTT_HOST}:${MQTT_PORT}/mqtt`, ['mqtt']);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen    = () => sendConnect();
      ws.onmessage = (e) => handlePacket(new Uint8Array(e.data));
      ws.onerror   = () => { setConnected(false); setStatus('Error...'); };
      ws.onclose   = () => {
        setConnected(false);
        setStatus('Reconnecting...');
        clearInterval(pingRef.current);
        setTimeout(connect, 3000);
      };
    } catch (e) {
      setTimeout(connect, 3000);
    }
  };

  // Load saved states on startup
  useEffect(() => {
    AsyncStorage.getItem('states').then(val => {
      if (val) setStates(JSON.parse(val));
    });

    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    connect();

    return () => {
      clearInterval(pingRef.current);
      wsRef.current?.close();
    };
  }, []);

  // Save states whenever they change
  useEffect(() => {
    AsyncStorage.setItem('states', JSON.stringify(states));
  }, [states]);

  // Toggle a device
  const toggle = (device) => {
    const newVal = !states[device.id];
    setStates(prev => ({ ...prev, [device.id]: newVal }));
    if (device.mqtt) publish(TOPIC_CONTROL, newVal ? 'ON' : 'OFF');
  };

  const activeCount = Object.values(states).filter(Boolean).length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Title */}
          <Text style={s.title}>Smart Home</Text>
          <Text style={s.subtitle}>Controller</Text>

          {/* Connection status */}
          <View style={[s.pill, connected ? s.pillGreen : s.pillOrange]}>
            {!connected
              ? <ActivityIndicator size="small" color="#f59e0b" style={{ marginRight: 6 }} />
              : <View style={s.pillDot} />
            }
            <Text style={[s.pillText, { color: connected ? '#166534' : '#92400e' }]}>
              {status}
            </Text>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={[s.statCard, { backgroundColor: '#eff6ff' }]}>
              <Text style={[s.statNum, { color: '#3b82f6' }]}>{DEVICES.length}</Text>
              <Text style={s.statLbl}>Devices</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: '#f0fdf4' }]}>
              <Text style={[s.statNum, { color: '#22c55e' }]}>{activeCount}</Text>
              <Text style={s.statLbl}>Active</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: '#fefce8' }]}>
              <Text style={[s.statNum, { color: '#f59e0b' }]}>3</Text>
              <Text style={s.statLbl}>Rooms</Text>
            </View>
          </View>

          {/* Device cards */}
          <Text style={s.sectionTitle}>Devices</Text>

          {DEVICES.map(device => {
            const isOn = states[device.id];
            return (
              <View
                key={device.id}
                style={[s.deviceRow, isOn && s.deviceRowOn]}
              >
                {/* Icon */}
                <View style={[s.iconBox, { backgroundColor: isOn ? '#fef3c7' : '#f3f4f6' }]}>
                  <Text style={s.iconEmoji}>{device.icon}</Text>
                </View>

                {/* Info */}
                <View style={s.deviceInfo}>
                  <Text style={s.deviceName}>{device.name}</Text>
                  <Text style={s.deviceRoom}>{device.room}</Text>
                </View>

                {/* Single toggle button */}
                <TouchableOpacity
                  style={[
                    s.toggleBtn,
                    isOn ? s.toggleOn : s.toggleOff,
                    device.mqtt && !connected && s.btnDisabled
                  ]}
                  onPress={() => toggle(device)}
                  disabled={device.mqtt && !connected}
                  activeOpacity={0.8}
                >
                  <Text style={[s.toggleText, { color: isOn ? '#92400e' : '#6b7280' }]}>
                    {isOn ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>

              </View>
            );
          })}

          <Text style={s.footer}>ESP32 + MQTT • Worldwide 🌍</Text>

        </ScrollView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#f0f4ff' },
  scroll:       { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  title:        { color: '#111827', fontSize: 30, fontWeight: '800' },
  subtitle:     { color: '#9ca3af', fontSize: 14, marginBottom: 20, marginTop: 2 },

  pill:         { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 28 },
  pillGreen:    { backgroundColor: '#dcfce7' },
  pillOrange:   { backgroundColor: '#fef3c7' },
  pillDot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  pillText:     { fontSize: 12, fontWeight: '600' },

  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard:     { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center' },
  statNum:      { fontSize: 28, fontWeight: '800' },
  statLbl:      { color: '#9ca3af', fontSize: 11, marginTop: 4 },

  sectionTitle: { color: '#9ca3af', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 },

  deviceRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
  deviceRowOn:  { borderColor: '#fcd34d', backgroundColor: '#fffbeb' },

  iconBox:      { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconEmoji:    { fontSize: 26 },

  deviceInfo:   { flex: 1 },
  deviceName:   { color: '#111827', fontSize: 16, fontWeight: '600' },
  deviceRoom:   { color: '#9ca3af', fontSize: 12, marginTop: 2 },

  toggleBtn:    { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 14 },
  toggleOn:     { backgroundColor: '#fef3c7' },
  toggleOff:    { backgroundColor: '#f3f4f6' },
  toggleText:   { fontWeight: '700', fontSize: 14 },
  btnDisabled:  { opacity: 0.4 },

  footer:       { color: '#d1d5db', fontSize: 11, textAlign: 'center', marginTop: 28, letterSpacing: 1 },
});
