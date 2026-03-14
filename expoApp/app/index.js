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
const TOPIC_NETWORK = 'home/esp/network';
const TOPIC_ONLINE  = 'home/esp/online';
// ──────────────────────────────────────────────────────

const COOLDOWN_MS       = 2 * 60 * 1000; // 2 min lock before turning OFF AC/Fan
const NEEDS_COOLDOWN    = ['fan', 'ac'];
const POWER_RESTORE_MS  = 60 * 1000;     // 1 min wait after power outage

const DEVICES = [
  { id: 'led',  name: 'Main Light',  room: 'Living Room', icon: '💡', mqtt: true  },
  { id: 'fan',  name: 'Ceiling Fan', room: 'Bedroom',     icon: '🌀', mqtt: false },
  { id: 'ac',   name: 'AC Unit',     room: 'Living Room', icon: '❄️', mqtt: false },
  { id: 'lock', name: 'Door Lock',   room: 'Main Door',   icon: '🔒', mqtt: false },
];

function encStr(str) {
  const b = unescape(encodeURIComponent(str)).split('').map(c => c.charCodeAt(0));
  return [(b.length >> 8) & 0xff, b.length & 0xff, ...b];
}
function encLen(n) {
  const r = [];
  do { let b = n % 128; n = Math.floor(n / 128); if (n > 0) b |= 0x80; r.push(b); } while (n > 0);
  return r;
}

export default function SmartHome() {
  const [states, setStates]               = useState({ led: false, fan: false, ac: false, lock: false });
  const [connected, setConnected]         = useState(false);
  const [espOnline, setEspOnline]         = useState(false);
  const [espNetwork, setEspNetwork]       = useState({ ssid: '...', ip: '...' });
  const [status, setStatus]               = useState('Connecting...');
  const [cooldownUntil, setCooldownUntil] = useState({});
  const [countdown, setCountdown]         = useState({});

  // Power outage state
  const [powerOutage, setPowerOutage]         = useState(false);
  const [powerRestoreAt, setPowerRestoreAt]   = useState(null); // timestamp when devices can be turned on
  const [powerCountdown, setPowerCountdown]   = useState(null); // "0:45" display

  const wsRef    = useRef(null);
  const pingRef  = useRef(null);
  const tickRef  = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── MQTT helpers ───────────────────────────────────
  const sendBytes = (bytes) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(new Uint8Array(bytes).buffer);
  };

  const publish = (topic, message) => {
    const p = [...encStr(topic),
               ...unescape(encodeURIComponent(message)).split('').map(c => c.charCodeAt(0))];
    sendBytes([0x30, ...encLen(p.length), ...p]);
  };

  const subscribe = (topic) => {
    const p = [0x00, 0x01, ...encStr(topic), 0x00];
    sendBytes([0x82, ...encLen(p.length), ...p]);
  };

  // ── Handle MQTT packets ────────────────────────────
  const handlePacket = (data) => {
    const type = (data[0] & 0xF0) >> 4;

    if (type === 2) {
      setConnected(true);
      setStatus('Connected');
      subscribe(TOPIC_STATUS);
      subscribe(TOPIC_NETWORK);
      subscribe(TOPIC_ONLINE);
      pingRef.current = setInterval(() => sendBytes([0xC0, 0x00]), 30000);
    }

    if (type === 3) {
      try {
        let i = 1, mul = 1, len = 0, b;
        do { b = data[i++]; len += (b & 0x7F) * mul; mul *= 128; } while (b & 0x80);
        const tLen    = (data[i] << 8) | data[i + 1]; i += 2;
        const topic   = String.fromCharCode(...data.slice(i, i + tLen));
        const payload = String.fromCharCode(...data.slice(i + tLen));

        if (topic === TOPIC_STATUS)
          setStates(prev => ({ ...prev, led: payload === 'ON' }));

        if (topic === TOPIC_NETWORK) {
          const parts = payload.split('|');
          if (parts.length === 2)
            setEspNetwork({ ssid: parts[0], ip: parts[1] });
        }

        if (topic === TOPIC_ONLINE) {
          const isOnline = payload === 'online';
          setEspOnline(isOnline);

          if (!isOnline) {
            // ⚡ POWER OUTAGE DETECTED!
            // 1. Turn all devices OFF immediately
            setStates({ led: false, fan: false, ac: false, lock: false });

            // 2. Clear all cooldown timers
            setCooldownUntil({});
            setCountdown({});

            // 3. Set power outage flag
            setPowerOutage(true);

            // 4. Set 1 minute lockout before user can turn anything ON
            setPowerRestoreAt(Date.now() + POWER_RESTORE_MS);

            // 5. Update network display
            setEspNetwork(prev => ({ ...prev, ssid: 'Offline ⚡' }));

          } else {
            // ESP came back online
            // Power outage flag stays until 1 minute timer expires
            setEspNetwork(prev => ({ ...prev, ssid: prev.ssid === 'Offline ⚡' ? '...' : prev.ssid }));
          }
        }
      } catch (e) {}
    }
  };

  // ── Connect MQTT ───────────────────────────────────
  const connect = () => {
    try {
      const clientId = 'App_' + Math.random().toString(16).substr(2, 8);
      const ws = new WebSocket(`wss://${MQTT_HOST}:${MQTT_PORT}/mqtt`, ['mqtt']);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;
      ws.onopen = () => {
        const p = [...encStr('MQTT'), 0x04, 0xC2, 0x00, 0x3C,
                   ...encStr(clientId), ...encStr(MQTT_USER), ...encStr(MQTT_PASS)];
        sendBytes([0x10, ...encLen(p.length), ...p]);
      };
      ws.onmessage = (e) => handlePacket(new Uint8Array(e.data));
      ws.onerror   = () => { setConnected(false); setStatus('Error...'); };
      ws.onclose   = () => {
        setConnected(false); setStatus('Reconnecting...');
        clearInterval(pingRef.current);
        setTimeout(connect, 3000);
      };
    } catch (e) { setTimeout(connect, 3000); }
  };

  // ── Countdown ticker ───────────────────────────────
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const now = Date.now();

      // AC/Fan cooldown countdown
      const newCD = {};
      Object.entries(cooldownUntil).forEach(([id, until]) => {
        if (!until) return;
        const rem = until - now;
        if (rem > 0) {
          const m = Math.floor(rem / 60000);
          const s = Math.floor((rem % 60000) / 1000);
          newCD[id] = `${m}:${s.toString().padStart(2, '0')}`;
        }
      });
      setCountdown(newCD);

      // Power restore countdown
      if (powerRestoreAt) {
        const rem = powerRestoreAt - now;
        if (rem > 0) {
          const m = Math.floor(rem / 60000);
          const s = Math.floor((rem % 60000) / 1000);
          setPowerCountdown(`${m}:${s.toString().padStart(2, '0')}`);
        } else {
          // 1 minute passed — lift lockout!
          setPowerOutage(false);
          setPowerRestoreAt(null);
          setPowerCountdown(null);
        }
      }
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [cooldownUntil, powerRestoreAt]);

  // ── Can user turn OFF this device (AC/Fan cooldown) ─
  const canTurnOff = (deviceId) => {
    if (!NEEDS_COOLDOWN.includes(deviceId)) return true;
    const until = cooldownUntil[deviceId];
    if (!until) return true;
    return Date.now() >= until;
  };

  // ── Can user turn ON any device (power outage lock) ─
  const canTurnOn = () => {
    if (!powerOutage) return true;
    if (!powerRestoreAt) return true;
    return Date.now() >= powerRestoreAt;
  };

  // ── Toggle device ──────────────────────────────────
  const toggle = (device) => {
    const isOn = states[device.id];

    // Turning ON — check power outage lockout
    if (!isOn && !canTurnOn()) return;

    // Turning OFF — check AC/Fan cooldown
    if (isOn && !canTurnOff(device.id)) return;

    const newVal = !isOn;
    setStates(prev => ({ ...prev, [device.id]: newVal }));
    if (device.mqtt) publish(TOPIC_CONTROL, newVal ? 'ON' : 'OFF');

    // Start cooldown when turning ON AC/Fan
    if (newVal && NEEDS_COOLDOWN.includes(device.id)) {
      setCooldownUntil(prev => ({ ...prev, [device.id]: Date.now() + COOLDOWN_MS }));
    }

    // Clear cooldown when turned OFF
    if (!newVal) {
      setCooldownUntil(prev => ({ ...prev, [device.id]: null }));
      setCountdown(prev => ({ ...prev, [device.id]: null }));
    }
  };

  // ── Init ───────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem('states').then(val => {
      if (val) setStates(JSON.parse(val));
    });
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    connect();
    return () => {
      clearInterval(pingRef.current);
      clearInterval(tickRef.current);
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('states', JSON.stringify(states));
  }, [states]);

  const activeCount = Object.values(states).filter(Boolean).length;
  const powerLocked = powerOutage && !canTurnOn();

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>Smart Home</Text>
              <Text style={s.subtitle}>Controller</Text>
            </View>
            <View style={[s.espBox, { borderColor: espOnline ? '#22c55e' : '#f87171' }]}>
              <View style={[s.espDot, { backgroundColor: espOnline ? '#22c55e' : '#f87171' }]} />
              <View>
                <Text style={s.espSsid}>{espNetwork.ssid}</Text>
                <Text style={s.espIp}>{espNetwork.ip}</Text>
              </View>
            </View>
          </View>

          {/* ── MQTT pill ── */}
          <View style={[s.pill, connected ? s.pillGreen : s.pillOrange]}>
            {!connected
              ? <ActivityIndicator size="small" color="#f59e0b" style={{ marginRight: 6 }} />
              : <View style={s.pillDot} />}
            <Text style={[s.pillText, { color: connected ? '#166534' : '#92400e' }]}>{status}</Text>
            {connected && !espOnline && <Text style={s.warnText}>  ⚠️ ESP Offline</Text>}
          </View>

          {/* ── Power Outage Banner ── */}
          {powerOutage && (
            <View style={s.outageBanner}>
              <Text style={s.outageIcon}>⚡</Text>
              <View style={s.outageInfo}>
                <Text style={s.outageTitle}>Power Outage Detected!</Text>
                <Text style={s.outageSub}>
                  {powerLocked
                    ? `All devices turned OFF. Can turn ON in ${powerCountdown}`
                    : 'Power restored! You can now turn devices ON.'}
                </Text>
              </View>
            </View>
          )}

          {/* ── Stats ── */}
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

          {/* ── Devices ── */}
          <Text style={s.sectionTitle}>Devices</Text>

          {DEVICES.map(device => {
            const isOn        = states[device.id];
            const offLocked   = isOn && !canTurnOff(device.id);
            const onLocked    = !isOn && powerLocked;
            const isLocked    = offLocked || onLocked;
            const timeLeft    = countdown[device.id];

            return (
              <View key={device.id} style={[s.deviceRow, isOn && s.deviceRowOn, isLocked && s.deviceRowLocked]}>

                <View style={[s.iconBox, { backgroundColor: isOn ? '#fef3c7' : '#f3f4f6' }]}>
                  <Text style={s.iconEmoji}>{device.icon}</Text>
                </View>

                <View style={s.deviceInfo}>
                  <Text style={s.deviceName}>{device.name}</Text>
                  <Text style={s.deviceRoom}>{device.room}</Text>

                  {/* AC/Fan cooldown */}
                  {offLocked && timeLeft && (
                    <Text style={s.cooldownText}>⏳ Can turn off in {timeLeft}</Text>
                  )}
                  {!offLocked && isOn && NEEDS_COOLDOWN.includes(device.id) && (
                    <Text style={s.readyText}>✅ Ready to turn off</Text>
                  )}

                  {!espOnline && (
                    <Text style={s.offlineText}>📡 ESP offline — controls disabled</Text>
                  )}

                  {/* Power outage lock */}
                  {onLocked && (
                    <Text style={s.outageText}>⚡ Wait {powerCountdown} after outage</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    s.toggleBtn,
                    isOn ? s.toggleOn : s.toggleOff,
                    isLocked && s.toggleLocked,
                    (!espOnline || !connected) && s.btnDisabled,
                  ]}
                  onPress={() => toggle(device)}
                  disabled={!espOnline || !connected || isLocked}
                  activeOpacity={0.8}
                >
                  <Text style={[s.toggleText, {
                    color: isLocked ? '#9ca3af' : isOn ? '#92400e' : '#6b7280'
                  }]}>
                    {isLocked ? '🔒' : isOn ? 'ON' : 'OFF'}
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
  root:            { flex: 1, backgroundColor: '#f0f4ff' },
  scroll:          { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title:           { color: '#111827', fontSize: 30, fontWeight: '800' },
  subtitle:        { color: '#9ca3af', fontSize: 14, marginTop: 2 },

  espBox:          { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff' },
  espDot:          { width: 8, height: 8, borderRadius: 4 },
  espSsid:         { color: '#111827', fontSize: 12, fontWeight: '700' },
  espIp:           { color: '#9ca3af', fontSize: 10 },

  pill:            { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 16, marginTop: 12 },
  pillGreen:       { backgroundColor: '#dcfce7' },
  pillOrange:      { backgroundColor: '#fef3c7' },
  pillDot:         { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  pillText:        { fontSize: 12, fontWeight: '600' },
  warnText:        { fontSize: 12, color: '#ef4444', fontWeight: '600' },

  // Power outage banner
  outageBanner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#fed7aa', borderRadius: 16, padding: 14, marginBottom: 20, gap: 12 },
  outageIcon:      { fontSize: 28 },
  outageInfo:      { flex: 1 },
  outageTitle:     { color: '#9a3412', fontSize: 14, fontWeight: '800' },
  outageSub:       { color: '#c2410c', fontSize: 12, marginTop: 2 },

  statsRow:        { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard:        { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center' },
  statNum:         { fontSize: 28, fontWeight: '800' },
  statLbl:         { color: '#9ca3af', fontSize: 11, marginTop: 4 },

  sectionTitle:    { color: '#9ca3af', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 },

  deviceRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
  deviceRowOn:     { borderColor: '#fcd34d', backgroundColor: '#fffbeb' },
  deviceRowLocked: { borderColor: '#fed7aa', backgroundColor: '#fff7ed' },

  iconBox:         { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconEmoji:       { fontSize: 26 },

  deviceInfo:      { flex: 1 },
  deviceName:      { color: '#111827', fontSize: 16, fontWeight: '600' },
  deviceRoom:      { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  cooldownText:    { color: '#f59e0b', fontSize: 11, marginTop: 4, fontWeight: '600' },
  readyText:       { color: '#22c55e', fontSize: 11, marginTop: 4, fontWeight: '600' },
  offlineText:    { color: '#6b7280', fontSize: 11, marginTop: 4, fontWeight: '600' },
  outageText:      { color: '#ea580c', fontSize: 11, marginTop: 4, fontWeight: '600' },

  toggleBtn:       { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 14 },
  toggleOn:        { backgroundColor: '#fef3c7' },
  toggleOff:       { backgroundColor: '#f3f4f6' },
  toggleLocked:    { backgroundColor: '#fee2e2', opacity: 0.7 },
  toggleText:      { fontWeight: '700', fontSize: 14 },
  btnDisabled:     { opacity: 0.4 },

  footer:          { color: '#d1d5db', fontSize: 11, textAlign: 'center', marginTop: 28, letterSpacing: 1 },
});
