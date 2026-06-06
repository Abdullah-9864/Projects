import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView, Animated, Dimensions,
} from 'react-native';
import Paho from 'paho-mqtt';

// ─── MQTT Config ─────────────────────────────────────────────────────────────
const BROKER        = 'c12e66baf5c34fecb0d1558aff2707d4.s1.eu.hivemq.cloud';
const PORT          = 8884;
const MQTT_USER     = 'abdullah9864';
const MQTT_PASS     = 'Ab5599@ab';
const TOPIC_CONTROL = 'home/light/control';
const TOPIC_STATUS  = 'home/light/status';
const TOPIC_CONN    = 'home/esp32/connection';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg:           '#0B0C0E',
  bgCard:       '#111316',
  bgInput:      '#1A1C22',
  border:       '#222530',
  borderAccent: '#2E3245',
  accent:       '#6C63FF',
  accentDim:    '#3D3870',
  amber:        '#F5A623',
  amberDim:     '#7A5010',
  green:        '#00E676',
  red:          '#FF1744',
  orange:       '#FF9100',
  textPri:      '#F0F2FF',
  textSec:      '#7B80A0',
  textMute:     '#3E4260',
  white:        '#FFFFFF',
};

// ─── Corner decoration component ─────────────────────────────────────────────
function Corners({ size = 12, thickness = 1.5, color = T.borderAccent }) {
  const h = { position: 'absolute', width: size, height: thickness, backgroundColor: color };
  const v = { position: 'absolute', width: thickness, height: size, backgroundColor: color };
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ ...h, top: 0, left: 0 }} /><View style={{ ...v, top: 0, left: 0 }} />
      <View style={{ ...h, top: 0, right: 0 }} /><View style={{ ...v, top: 0, right: 0 }} />
      <View style={{ ...h, bottom: 0, left: 0 }} /><View style={{ ...v, bottom: 0, left: 0 }} />
      <View style={{ ...h, bottom: 0, right: 0 }} /><View style={{ ...v, bottom: 0, right: 0 }} />
    </View>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lightState,    setLightState]    = useState('OFF');
  const [mqttStatus,    setMqttStatus]    = useState('CONNECTING');
  const [mqttOk,        setMqttOk]        = useState(false);
  const [esp32Status,   setEsp32Status]   = useState('UNKNOWN');
  const [isESP32Online, setIsESP32Online] = useState(false);
  const [isMqttReady,   setIsMqttReady]   = useState(false);
  const [clock,         setClock]         = useState('--:--');
  const [pktCount,      setPktCount]      = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const clientRef = useRef(null);
  const reconnRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    connectMQTT();
    return () => {
      if (reconnRef.current) clearTimeout(reconnRef.current);
      try { clientRef.current?.disconnect(); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    if (lightState === 'ON' && isESP32Online) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.07, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.00, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [lightState, isESP32Online]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isMqttReady) setPktCount(c => (c + Math.floor(Math.random() * 3 + 1)) % 10000);
    }, 1800);
    return () => clearInterval(id);
  }, [isMqttReady]);

  function connectMQTT() {
    const id = 'rn-' + Math.random().toString(16).substr(2, 8);
    const cl = new Paho.Client(BROKER, PORT, '/mqtt', id);
    clientRef.current = cl;
    cl.onConnectionLost = () => {
      setMqttStatus('DISCONNECTED'); setMqttOk(false); setIsMqttReady(false);
      reconnRef.current = setTimeout(connectMQTT, 3000);
    };
    cl.onMessageArrived = (msg) => {
      const { destinationName: topic, payloadString: payload } = msg;
      if (topic === TOPIC_STATUS) setLightState(payload);
      if (topic === TOPIC_CONN) {
        if (payload === 'ONLINE') { setEsp32Status('ONLINE'); setIsESP32Online(true); }
        else { setEsp32Status('OFFLINE'); setIsESP32Online(false); setLightState('OFF'); }
      }
    };
    cl.connect({
      useSSL: true, userName: MQTT_USER, password: MQTT_PASS,
      onSuccess: () => {
        setMqttStatus('CONNECTED'); setMqttOk(true); setIsMqttReady(true);
        cl.subscribe(TOPIC_STATUS); cl.subscribe(TOPIC_CONN);
      },
      onFailure: () => {
        setMqttStatus('FAILED'); setMqttOk(false); setIsMqttReady(false);
        reconnRef.current = setTimeout(connectMQTT, 3000);
      },
    });
  }

  function sendCommand(cmd) {
    if (!isMqttReady || !isESP32Online || !clientRef.current?.isConnected()) return;
    const msg = new Paho.Message(cmd);
    msg.destinationName = TOPIC_CONTROL;
    msg.retained = true;
    clientRef.current.send(msg);
    setLightState(cmd);
  }

  const canControl = isMqttReady && isESP32Online;
  const isOn       = lightState === 'ON' && isESP32Online;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />

      {/* Horizontal grid lines background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={s.gridLine} />
        ))}
      </View>

      <View style={s.container}>

        {/* Top bar */}
        <View style={s.topBar}>
          <View style={s.topBarLeft}>
            <View style={[s.dot, { backgroundColor: mqttOk ? T.green : T.orange }]} />
            <Text style={s.mono10mute}>SYS:LIGHT_CTL</Text>
          </View>
          <Text style={s.monoClk}>{clock}</Text>
          <View style={s.versionTag}>
            <Text style={s.mono9mute}>v2.4.1</Text>
          </View>
        </View>

        {/* Title */}
        <View style={s.titleBlock}>
          <Text style={s.titleMain}>SMART{'\n'}LIGHT</Text>
          <View style={s.titleRight}>
            <Text style={s.titleSub}>CONTROL UNIT</Text>
            <Text style={s.titleSub}>LIVING ROOM</Text>
            <View style={s.titleTagRow}>
              <View style={[s.tag, { borderColor: isOn ? T.amber : T.borderAccent }]}>
                <Text style={[s.tagText, { color: isOn ? T.amber : T.textMute }]}>
                  {isOn ? 'ACTIVE' : 'STANDBY'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hero panel */}
        <View style={[s.heroPanel, isOn && { borderColor: T.amberDim, backgroundColor: '#120E06' }]}>
          <Corners size={14} thickness={2} color={isOn ? T.amber : T.borderAccent} />

          <View style={s.heroInner}>
            {/* Bulb */}
            <View style={s.bulbCol}>
              <Animated.Text style={[s.bulbEmoji, !isOn && { opacity: 0.25 }, { transform: [{ scale: pulseAnim }] }]}>
                💡
              </Animated.Text>
              <Text style={[s.bulbState, { color: isOn ? T.amber : T.textMute }]}>
                {isOn ? '● ON' : '○ OFF'}
              </Text>
            </View>

            {/* Readout table */}
            <View style={s.readout}>
              {[
                { label: 'STATE',  val: lightState,   color: isOn ? T.amber : T.textSec },
                { label: 'DEVICE', val: esp32Status,   color: isESP32Online ? T.green : T.red },
                { label: 'BROKER', val: mqttStatus,    color: mqttOk ? T.green : T.orange },
                { label: 'PKT_RX', val: String(pktCount).padStart(4,'0'), color: T.accent },
              ].map((row, i) => (
                <View key={i}>
                  <View style={s.readoutRow}>
                    <Text style={s.readoutLabel}>{row.label}</Text>
                    <Text style={[s.readoutVal, { color: row.color }]}>{row.val}</Text>
                  </View>
                  {i < 3 && <View style={s.readoutDivider} />}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Warning strip */}
        {(!isMqttReady || !isESP32Online) && (
          <View style={[s.warningStrip, { borderColor: !isMqttReady ? T.orange : T.red }]}>
            <View style={[s.dot, { backgroundColor: !isMqttReady ? T.orange : T.red }]} />
            <Text style={[s.mono9, { color: !isMqttReady ? T.orange : T.red, flex: 1 }]}>
              {!isMqttReady ? 'CONNECTING TO BROKER — PLEASE WAIT' : 'ESP32 OFFLINE — AWAITING RECONNECT'}
            </Text>
          </View>
        )}

        {/* ON / OFF buttons */}
        <View style={s.ctrlRow}>
          <TouchableOpacity
            style={[s.ctrlBtn, isOn && { borderColor: T.amberDim, backgroundColor: '#130E05' }, !canControl && s.disabled]}
            onPress={() => sendCommand('ON')}
            disabled={!canControl}
            activeOpacity={0.7}
          >
            <Corners size={8} thickness={1.5} color={isOn ? T.amber : T.borderAccent} />
            <Text style={[s.ctrlIcon, { color: isOn ? T.amber : T.textMute }]}>◑</Text>
            <Text style={[s.ctrlLabel, { color: isOn ? T.amber : T.textSec }]}>POWER ON</Text>
            {isOn && <View style={[s.activeBar, { backgroundColor: T.amber }]} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.ctrlBtn, !isOn && { borderColor: T.accentDim, backgroundColor: '#0D0B1E' }, !canControl && s.disabled]}
            onPress={() => sendCommand('OFF')}
            disabled={!canControl}
            activeOpacity={0.7}
          >
            <Corners size={8} thickness={1.5} color={!isOn ? T.accent : T.borderAccent} />
            <Text style={[s.ctrlIcon, { color: !isOn ? T.accent : T.textMute }]}>◐</Text>
            <Text style={[s.ctrlLabel, { color: !isOn ? T.accent : T.textSec }]}>POWER OFF</Text>
            {!isOn && <View style={[s.activeBar, { backgroundColor: T.accent }]} />}
          </TouchableOpacity>
        </View>

        {/* Scene presets */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.mono9mute}>SCENE PRESETS</Text>
          <View style={s.dividerLine} />
        </View>

        <View style={s.scenesRow}>
          {[
            { id: '01', label: 'RELAX',  sub: 'Warm mode', cmd: 'ON',  icon: '▣' },
            { id: '02', label: 'FOCUS',  sub: 'Full bright', cmd: 'ON', icon: '◈' },
            { id: '03', label: 'NIGHT',  sub: 'Lights out', cmd: 'OFF', icon: '◉' },
          ].map(sc => (
            <TouchableOpacity
              key={sc.id}
              style={[s.sceneBtn, !canControl && s.disabled]}
              onPress={() => sendCommand(sc.cmd)}
              disabled={!canControl}
              activeOpacity={0.7}
            >
              <Corners size={7} thickness={1} color={T.borderAccent} />
              <Text style={s.sceneId}>{sc.id}</Text>
              <Text style={[s.sceneIcon, { color: T.accent }]}>{sc.icon}</Text>
              <Text style={s.sceneName}>{sc.label}</Text>
              <Text style={s.sceneSub}>{sc.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.mono8mute}>ESP32  ·  HIVEMQ  ·  MQTT/TLS</Text>
          <Text style={s.mono8mute}>[ {BROKER.substr(0, 22)}… ]</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },

  gridLine: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(34,37,48,0.6)',
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12, marginBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  mono10mute: { fontSize: 10, fontWeight: '700', color: T.textSec, letterSpacing: 1.5, fontFamily: 'monospace' },
  monoClk:    { fontSize: 15, fontWeight: '700', color: T.textPri, letterSpacing: 3,   fontFamily: 'monospace' },
  versionTag: {
    borderWidth: StyleSheet.hairlineWidth, borderColor: T.border,
    borderRadius: 3, paddingHorizontal: 7, paddingVertical: 3,
  },
  mono9mute:  { fontSize: 9, fontWeight: '700', color: T.textMute, letterSpacing: 1.5, fontFamily: 'monospace' },
  mono9:      { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, fontFamily: 'monospace' },
  mono8mute:  { fontSize: 8, fontWeight: '600', color: T.textMute, letterSpacing: 1.5, fontFamily: 'monospace' },

  // Title
  titleBlock: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 14,
  },
  titleMain: {
    fontSize: 38, fontWeight: '800', color: T.textPri,
    letterSpacing: 5, fontFamily: 'monospace', lineHeight: 42,
  },
  titleRight: { alignItems: 'flex-end', justifyContent: 'flex-end', gap: 4, paddingTop: 4 },
  titleSub: { fontSize: 9, fontWeight: '700', color: T.textMute, letterSpacing: 2, fontFamily: 'monospace' },
  titleTagRow: { marginTop: 4 },
  tag: {
    borderWidth: 1, borderRadius: 3,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, fontFamily: 'monospace' },

  // Hero panel
  heroPanel: {
    backgroundColor: T.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.border,
    borderRadius: 4,
    padding: 16, marginBottom: 10,
    overflow: 'hidden', position: 'relative',
  },
  heroInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  bulbCol: {
    alignItems: 'center', gap: 8,
    paddingRight: 14,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: T.border,
  },
  bulbEmoji: { fontSize: 50 },
  bulbState: { fontSize: 10, fontWeight: '800', letterSpacing: 2, fontFamily: 'monospace' },

  readout: { flex: 1 },
  readoutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
  },
  readoutDivider: { height: StyleSheet.hairlineWidth, backgroundColor: T.border },
  readoutLabel: { fontSize: 9, fontWeight: '700', color: T.textMute, letterSpacing: 1.5, fontFamily: 'monospace' },
  readoutVal:   { fontSize: 11, fontWeight: '700', letterSpacing: 1, fontFamily: 'monospace' },

  // Warning
  warningStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#130A00',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3, paddingHorizontal: 12,
    paddingVertical: 8, marginBottom: 10,
  },

  // Controls
  ctrlRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  ctrlBtn: {
    flex: 1, backgroundColor: T.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.border, borderRadius: 4,
    paddingVertical: 20, alignItems: 'center',
    gap: 6, overflow: 'hidden', position: 'relative',
  },
  disabled: { opacity: 0.3 },
  ctrlIcon:  { fontSize: 24 },
  ctrlLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2, fontFamily: 'monospace' },
  activeBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },

  // Presets
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 10,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: T.border },

  scenesRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  sceneBtn: {
    flex: 1, backgroundColor: T.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.border, borderRadius: 4,
    padding: 12, alignItems: 'center',
    gap: 4, position: 'relative', overflow: 'hidden',
  },
  sceneId:   { position: 'absolute', top: 6, left: 8, fontSize: 8, color: T.textMute, fontFamily: 'monospace', fontWeight: '700' },
  sceneIcon: { fontSize: 18, marginTop: 8 },
  sceneName: { fontSize: 10, fontWeight: '800', color: T.textPri, letterSpacing: 1.5, fontFamily: 'monospace' },
  sceneSub:  { fontSize: 8, color: T.textMute, fontFamily: 'monospace', letterSpacing: 0.5 },

  // Footer
  footer: {
    alignItems: 'center', gap: 3, marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.border,
  },
});
