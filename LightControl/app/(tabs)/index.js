import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView, Animated, Switch, Dimensions, ScrollView,
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

const { width } = Dimensions.get('window');

// ─── Themes ──────────────────────────────────────────────────────────────────
const DARK = {
  bg:           '#1A1A1F',
  bgCard:       '#242429',
  bgCardAlt:    '#2C2C33',
  bgInput:      '#32323A',
  border:       '#3A3A44',
  borderLight:  '#484854',
  accent:       '#0078D4',   // Microsoft blue
  accentLight:  '#2B88D8',
  accentDim:    '#003A6B',
  accentGlow:   'rgba(0,120,212,0.2)',
  amber:        '#FFB900',   // Microsoft gold
  amberDim:     '#7A5800',
  amberGlow:    'rgba(255,185,0,0.15)',
  green:        '#107C10',   // Microsoft green
  greenLight:   '#55B155',
  red:          '#D83B01',   // Microsoft red
  redLight:     '#E87A5C',
  orange:       '#FF8C00',
  textPri:      '#FFFFFF',
  textSec:      '#A8A8B8',
  textMute:     '#606070',
  surface:      'rgba(255,255,255,0.04)',
  white:        '#FFFFFF',
};

const LIGHT = {
  bg:           '#F3F2F1',   // Microsoft light gray
  bgCard:       '#FFFFFF',
  bgCardAlt:    '#FAF9F8',
  bgInput:      '#F3F2F1',
  border:       '#EDEBE9',
  borderLight:  '#C8C6C4',
  accent:       '#0078D4',
  accentLight:  '#106EBE',
  accentDim:    '#DEECF9',
  accentGlow:   'rgba(0,120,212,0.12)',
  amber:        '#797673',
  amberDim:     '#FAF9F8',
  amberGlow:    'rgba(255,185,0,0.1)',
  green:        '#107C10',
  greenLight:   '#55B155',
  red:          '#D83B01',
  redLight:     '#E87A5C',
  orange:       '#CA5010',
  textPri:      '#201F1E',
  textSec:      '#605E5C',
  textMute:     '#A19F9D',
  surface:      'rgba(0,0,0,0.03)',
  white:        '#FFFFFF',
};

// ─── Fluent Design Separator ──────────────────────────────────────────────────
function Separator({ T }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: T.border, marginVertical: 2 }} />;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ label, value, color, T }) {
  return (
    <View style={[badge.wrap, { backgroundColor: T.bgCardAlt, borderColor: T.border }]}>
      <View style={[badge.dot, { backgroundColor: color }]} />
      <View>
        <Text style={[badge.label, { color: T.textMute }]}>{label}</Text>
        <Text style={[badge.val, { color: T.textPri }]}>{value}</Text>
      </View>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, borderWidth: 1, borderRadius: 6, padding: 12 },
  dot:   { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  val:   { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
});

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isDark,        setIsDark]        = useState(true);
  const [lightState,    setLightState]    = useState('OFF');
  const [mqttStatus,    setMqttStatus]    = useState('CONNECTING');
  const [mqttOk,        setMqttOk]        = useState(false);
  const [esp32Status,   setEsp32Status]   = useState('UNKNOWN');
  const [isESP32Online, setIsESP32Online] = useState(false);
  const [isMqttReady,   setIsMqttReady]   = useState(false);
  const [clock,         setClock]         = useState('--:--');
  const [date,          setDate]          = useState('');

  const T = isDark ? DARK : LIGHT;

  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const themeAnim  = useRef(new Animated.Value(1)).current;
  const clientRef  = useRef(null);
  const reconnRef  = useRef(null);

  // Clock
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
      setDate(n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Theme transition
  const toggleTheme = () => {
    Animated.sequence([
      Animated.timing(themeAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(themeAnim, { toValue: 1,    duration: 200, useNativeDriver: true }),
    ]).start();
    setIsDark(d => !d);
  };

  // MQTT
  useEffect(() => {
    connectMQTT();
    return () => {
      if (reconnRef.current) clearTimeout(reconnRef.current);
      try { clientRef.current?.disconnect(); } catch (_) {}
    };
  }, []);

  // Bulb pulse
  useEffect(() => {
    if (lightState === 'ON' && isESP32Online) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.00, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [lightState, isESP32Online]);

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

  const s = makeStyles(T);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={T.bg}
      />
      <Animated.View style={[s.root, { opacity: fadeAnim, transform: [{ scale: themeAnim }] }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Top Navigation Bar ── */}
          <View style={s.navbar}>
            <View style={s.navLeft}>
              <View style={[s.appIcon, { backgroundColor: T.accent }]}>
                <Text style={s.appIconText}>⚡</Text>
              </View>
              <View>
                <Text style={[s.appName, { color: T.textPri }]}>Light Control</Text>
                <Text style={[s.appSub, { color: T.textMute }]}>Smart Home</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.themeBtn, { backgroundColor: T.bgCardAlt, borderColor: T.border }]} onPress={toggleTheme}>
              <Text style={s.themeBtnIcon}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Hero Card ── */}
          <View style={[s.heroCard, {
            backgroundColor: isOn ? T.accent : T.bgCard,
            borderColor: isOn ? T.accentLight : T.border,
          }]}>
            {/* Ambient glow effect */}
            {isOn && (
              <View style={[s.heroGlow, { backgroundColor: T.accentGlow }]} />
            )}

            <View style={s.heroTop}>
              <View>
                <Text style={[s.heroLabel, { color: isOn ? 'rgba(255,255,255,0.7)' : T.textMute }]}>
                  LIVING ROOM
                </Text>
                <Text style={[s.heroRoom, { color: isOn ? T.white : T.textPri }]}>
                  Ceiling Light
                </Text>
              </View>
              <View style={[s.heroBadge, {
                backgroundColor: isOn ? 'rgba(255,255,255,0.2)' : T.bgInput,
                borderColor: isOn ? 'rgba(255,255,255,0.3)' : T.border,
              }]}>
                <View style={[s.heroBadgeDot, { backgroundColor: isOn ? T.white : T.textMute }]} />
                <Text style={[s.heroBadgeText, { color: isOn ? T.white : T.textMute }]}>
                  {isOn ? 'ACTIVE' : 'STANDBY'}
                </Text>
              </View>
            </View>

            <View style={s.heroCenter}>
              <Animated.Text style={[
                s.bulb,
                { transform: [{ scale: pulseAnim }], opacity: isOn ? 1 : 0.35 }
              ]}>
                💡
              </Animated.Text>
              <Text style={[s.heroStateText, { color: isOn ? T.white : T.textSec }]}>
                {isESP32Online ? (isOn ? 'Light is On' : 'Light is Off') : 'Device Offline'}
              </Text>
            </View>

            <View style={s.heroBottom}>
              <Text style={[s.heroTime, { color: isOn ? 'rgba(255,255,255,0.7)' : T.textMute }]}>
                {date}
              </Text>
              <Text style={[s.heroClock, { color: isOn ? T.white : T.textPri }]}>
                {clock}
              </Text>
            </View>
          </View>

          {/* ── Power Controls ── */}
          <View style={[s.section, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <Text style={[s.sectionTitle, { color: T.textMute }]}>POWER</Text>

            <View style={s.powerRow}>
              {/* ON Button */}
              <TouchableOpacity
                style={[s.powerBtn, {
                  backgroundColor: isOn ? T.accent : T.bgInput,
                  borderColor: isOn ? T.accent : T.border,
                  flex: 1,
                }, !canControl && s.btnDisabled]}
                onPress={() => sendCommand('ON')}
                disabled={!canControl}
                activeOpacity={0.75}
              >
                <Text style={[s.powerBtnIcon, { color: isOn ? T.white : T.textSec }]}>◑</Text>
                <Text style={[s.powerBtnLabel, { color: isOn ? T.white : T.textSec }]}>Turn On</Text>
                {isOn && <View style={[s.powerBtnCheck]} >
                  <Text style={{ color: T.white, fontSize: 10 }}>✓</Text>
                </View>}
              </TouchableOpacity>

              {/* OFF Button */}
              <TouchableOpacity
                style={[s.powerBtn, {
                  backgroundColor: !isOn ? T.bgCardAlt : T.bgInput,
                  borderColor: !isOn ? T.borderLight : T.border,
                  flex: 1,
                }, !canControl && s.btnDisabled]}
                onPress={() => sendCommand('OFF')}
                disabled={!canControl}
                activeOpacity={0.75}
              >
                <Text style={[s.powerBtnIcon, { color: !isOn ? T.textPri : T.textMute }]}>◐</Text>
                <Text style={[s.powerBtnLabel, { color: !isOn ? T.textPri : T.textMute }]}>Turn Off</Text>
                {!isOn && <View style={[s.powerBtnCheck, { backgroundColor: T.bgInput, borderColor: T.border }]} >
                  <Text style={{ color: T.textSec, fontSize: 10 }}>✓</Text>
                </View>}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Scene Presets ── */}
          <View style={[s.section, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <Text style={[s.sectionTitle, { color: T.textMute }]}>SCENES</Text>
            <View style={s.scenesGrid}>
              {[
                { id: '01', label: 'Relax',   sub: 'Warm ambient',  cmd: 'ON',  icon: '🌅' },
                { id: '02', label: 'Focus',   sub: 'Bright & clear', cmd: 'ON',  icon: '💼' },
                { id: '03', label: 'Night',   sub: 'Lights out',    cmd: 'OFF', icon: '🌙' },
              ].map(sc => (
                <TouchableOpacity
                  key={sc.id}
                  style={[s.sceneCard, {
                    backgroundColor: T.bgCardAlt,
                    borderColor: T.border,
                  }, !canControl && s.btnDisabled]}
                  onPress={() => sendCommand(sc.cmd)}
                  disabled={!canControl}
                  activeOpacity={0.7}
                >
                  <Text style={s.sceneEmoji}>{sc.icon}</Text>
                  <Text style={[s.sceneLabel, { color: T.textPri }]}>{sc.label}</Text>
                  <Text style={[s.sceneSub, { color: T.textMute }]}>{sc.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Connection Status ── */}
          <View style={[s.section, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <Text style={[s.sectionTitle, { color: T.textMute }]}>CONNECTION</Text>

            {/* Warning */}
            {(!isMqttReady || !isESP32Online) && (
              <View style={[s.alert, {
                backgroundColor: !isMqttReady ? 'rgba(202,80,16,0.1)' : 'rgba(216,59,1,0.1)',
                borderColor: !isMqttReady ? T.orange : T.red,
              }]}>
                <Text style={{ fontSize: 14 }}>⚠️</Text>
                <Text style={[s.alertText, { color: !isMqttReady ? T.orange : T.red }]}>
                  {!isMqttReady ? 'Connecting to broker...' : 'ESP32 is offline. Controls disabled.'}
                </Text>
              </View>
            )}

            <View style={s.statusRow}>
              <StatusBadge
                label="Broker"
                value={mqttStatus}
                color={mqttOk ? T.greenLight : T.orange}
                T={T}
              />
              <StatusBadge
                label="ESP32"
                value={esp32Status}
                color={isESP32Online ? T.greenLight : T.red}
                T={T}
              />
            </View>
          </View>

          {/* ── Settings ── */}
          <View style={[s.section, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <Text style={[s.sectionTitle, { color: T.textMute }]}>SETTINGS</Text>

            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <Text style={[s.settingIcon]}>
                  {isDark ? '🌙' : '☀️'}
                </Text>
                <View>
                  <Text style={[s.settingLabel, { color: T.textPri }]}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                  <Text style={[s.settingSub, { color: T.textMute }]}>
                    Microsoft Fluent theme
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: T.border, true: T.accent }}
                thumbColor={T.white}
              />
            </View>

            <Separator T={T} />

            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <Text style={s.settingIcon}>📡</Text>
                <View>
                  <Text style={[s.settingLabel, { color: T.textPri }]}>Broker</Text>
                  <Text style={[s.settingSub, { color: T.textMute }]} numberOfLines={1}>
                    {BROKER.substr(0, 28)}…
                  </Text>
                </View>
              </View>
              <View style={[s.connDot, { backgroundColor: mqttOk ? T.greenLight : T.orange }]} />
            </View>

            <Separator T={T} />

            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <Text style={s.settingIcon}>🔒</Text>
                <View>
                  <Text style={[s.settingLabel, { color: T.textPri }]}>Encryption</Text>
                  <Text style={[s.settingSub, { color: T.textMute }]}>MQTT over TLS/SSL</Text>
                </View>
              </View>
              <Text style={[s.settingBadge, { color: T.accent, backgroundColor: T.accentDim }]}>
                SECURED
              </Text>
            </View>
          </View>

          <Text style={[s.footerNote, { color: T.textMute }]}>
            Smart Home · ESP32 · HiveMQ Cloud
          </Text>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Dynamic Styles ───────────────────────────────────────────────────────────
function makeStyles(T) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: T.bg },
    root:   { flex: 1, backgroundColor: T.bg },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },

    // Navbar
    navbar: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4, paddingVertical: 4,
    },
    navLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
    appIcon:      { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    appIconText:  { fontSize: 18 },
    appName:      { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
    appSub:       { fontSize: 11, fontWeight: '500', letterSpacing: 0.3, marginTop: 1 },
    themeBtn:     { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    themeBtnIcon: { fontSize: 18 },

    // Hero card
    heroCard: {
      borderRadius: 12, borderWidth: 1,
      padding: 20, marginBottom: 4,
      overflow: 'hidden', position: 'relative',
      minHeight: 200,
    },
    heroGlow: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      opacity: 0.3,
    },
    heroTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, zIndex: 1 },
    heroLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 },
    heroRoom:   { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
    heroBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    heroBadgeDot: { width: 5, height: 5, borderRadius: 2.5 },
    heroBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
    heroCenter: { alignItems: 'center', paddingVertical: 8, zIndex: 1 },
    bulb:       { fontSize: 64, marginBottom: 8 },
    heroStateText: { fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
    heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, zIndex: 1 },
    heroTime:   { fontSize: 11, fontWeight: '500', letterSpacing: 0.3 },
    heroClock:  { fontSize: 22, fontWeight: '700', letterSpacing: 1 },

    // Section
    section: {
      borderRadius: 12, borderWidth: 1,
      padding: 16, gap: 12,
    },
    sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },

    // Power buttons
    powerRow: { flexDirection: 'row', gap: 10 },
    powerBtn: {
      borderRadius: 8, borderWidth: 1,
      paddingVertical: 16, alignItems: 'center',
      gap: 6, position: 'relative',
    },
    powerBtnIcon:  { fontSize: 22 },
    powerBtnLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
    powerBtnCheck: {
      position: 'absolute', top: 8, right: 8,
      width: 18, height: 18, borderRadius: 9,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center', justifyContent: 'center',
    },
    btnDisabled: { opacity: 0.35 },

    // Scenes
    scenesGrid: { flexDirection: 'row', gap: 8 },
    sceneCard:  {
      flex: 1, borderRadius: 8, borderWidth: 1,
      padding: 12, alignItems: 'center', gap: 6,
    },
    sceneEmoji: { fontSize: 24 },
    sceneLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
    sceneSub:   { fontSize: 9, fontWeight: '500', textAlign: 'center', letterSpacing: 0.2 },

    // Alert
    alert: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      borderWidth: 1, borderRadius: 6,
      paddingHorizontal: 12, paddingVertical: 10,
    },
    alertText: { fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 16 },

    // Status row
    statusRow: { flexDirection: 'row', gap: 10 },

    // Settings
    settingRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
    settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    settingIcon:  { fontSize: 20, width: 28, textAlign: 'center' },
    settingLabel: { fontSize: 14, fontWeight: '600', letterSpacing: 0.1 },
    settingSub:   { fontSize: 11, fontWeight: '400', marginTop: 2, letterSpacing: 0.1 },
    connDot:      { width: 10, height: 10, borderRadius: 5 },
    settingBadge: { fontSize: 9, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },

    // Footer
    footerNote: { fontSize: 11, textAlign: 'center', marginTop: 4, letterSpacing: 0.5 },
  });
}
