import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView, Animated, Switch,
  Dimensions, ScrollView, Platform,
} from 'react-native';
import Paho from 'paho-mqtt';

// ─── MQTT Config ──────────────────────────────────────────────────────────────
const BROKER        = 'c12e66baf5c34fecb0d1558aff2707d4.s1.eu.hivemq.cloud';
const PORT          = 8884;
const MQTT_USER     = 'abdullah9864';
const MQTT_PASS     = 'Ab5599@ab';
const TOPIC_CONTROL = 'home/light/control';
const TOPIC_STATUS  = 'home/light/status';
const TOPIC_CONN    = 'home/esp32/connection';

// ─── Palette ──────────────────────────────────────────────────────────────────
const DARK = {
  bg:          '#0D0D10',
  bgCard:      '#13131A',
  bgCardAlt:   '#1A1A24',
  bgInput:     '#1C1C26',
  bgHero:      '#0A1929',
  bgHeroTop:   '#0F2744',
  bgIconWrap:  '#1E1E2A',
  border:      '#22222E',
  borderCard:  '#28283A',
  borderIcon:  '#2A2A3A',
  borderLight: '#2A2A38',
  accent:      '#0078D4',
  accentBorder:'#1A8DE8',
  accentBg:    'rgba(0,120,212,0.14)',
  accentBadge: 'rgba(0,120,212,0.25)',
  accentText:  '#5AABF5',
  accentHero:  '#4D9DE0',
  accentGlow:  'rgba(0,120,212,0.22)',
  green:       '#55B155',
  orange:      '#FF8C00',
  red:         '#D83B01',
  textPri:     '#FFFFFF',
  textSec:     '#C8C8E0',
  textMid:     '#8888AA',
  textMute:    '#48485F',
  textHero:    '#CCE4FF',
  textHeroSub: '#5A7FA0',
  textHeroClk: '#5A8FC4',
  checkBg:     'rgba(255,255,255,0.22)',
  heroDivider: 'rgba(255,255,255,0.06)',
  settingsBadgeBg: 'rgba(0,120,212,0.12)',
  settingsBadgeBorder: 'rgba(0,120,212,0.25)',
  white:       '#FFFFFF',
};

const LIGHT = {
  bg:          '#F3F2F1',
  bgCard:      '#FFFFFF',
  bgCardAlt:   '#F8F7F6',
  bgInput:     '#F0EFEE',
  bgHero:      '#E8F3FC',
  bgHeroTop:   '#D4E8F8',
  bgIconWrap:  '#F0EFEE',
  border:      '#E8E6E4',
  borderCard:  '#E0DED9',
  borderIcon:  '#D0CECC',
  borderLight: '#D8D6D4',
  accent:      '#0078D4',
  accentBorder:'#106EBE',
  accentBg:    'rgba(0,120,212,0.1)',
  accentBadge: 'rgba(0,120,212,0.2)',
  accentText:  '#0078D4',
  accentHero:  '#0078D4',
  accentGlow:  'rgba(0,120,212,0.15)',
  green:       '#107C10',
  orange:      '#CA5010',
  red:         '#D83B01',
  textPri:     '#201F1E',
  textSec:     '#3C3B3A',
  textMid:     '#605E5C',
  textMute:    '#A19F9D',
  textHero:    '#0F3860',
  textHeroSub: '#3A6A99',
  textHeroClk: '#185FA5',
  checkBg:     'rgba(255,255,255,0.4)',
  heroDivider: 'rgba(0,0,0,0.08)',
  settingsBadgeBg: 'rgba(0,120,212,0.1)',
  settingsBadgeBorder: 'rgba(0,120,212,0.3)',
  white:       '#FFFFFF',
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function Divider({ T }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: T.border, marginHorizontal: 0 }} />;
}

function IconBox({ icon, T }) {
  return (
    <View style={[styles.iconBox, { backgroundColor: T.bgIconWrap, borderColor: T.borderIcon }]}>
      <Text style={styles.iconBoxText}>{icon}</Text>
    </View>
  );
}

function ConnCard({ label, value, dotColor, T }) {
  return (
    <View style={[styles.connCard, { backgroundColor: T.bgCardAlt, borderColor: T.borderCard }]}>
      <Text style={[styles.connLabel, { color: T.textMute }]}>{label}</Text>
      <View style={styles.connVal}>
        <View style={[styles.connDot, { backgroundColor: dotColor }]} />
        <Text style={[styles.connValText, { color: T.textSec }]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const clientRef  = useRef(null);
  const reconnRef  = useRef(null);
  const offlineRef = useRef(null); // ← tracks the offline delay timer

  const isOn       = lightState === 'ON' && isESP32Online;
  const canControl = isMqttReady && isESP32Online;

  // Clock tick
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
      setDate(n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // Fade-in mount
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Bulb pulse + glow when ON
  useEffect(() => {
    if (isOn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.07, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.00, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      glowAnim.stopAnimation();  glowAnim.setValue(0);
    }
  }, [isOn]);

  // MQTT
  useEffect(() => {
    connectMQTT();
    return () => {
      if (reconnRef.current)  clearTimeout(reconnRef.current);
      if (offlineRef.current) clearTimeout(offlineRef.current);
      try { clientRef.current?.disconnect(); } catch (_) {}
    };
  }, []);

  function connectMQTT() {
    const id = 'rn-' + Math.random().toString(16).substr(2, 8);
    const cl = new Paho.Client(BROKER, PORT, '/mqtt', id);
    clientRef.current = cl;

    cl.onConnectionLost = () => {
      setMqttStatus('DISCONNECTED');
      setMqttOk(false);
      setIsMqttReady(false);
      reconnRef.current = setTimeout(connectMQTT, 3000);
    };

    cl.onMessageArrived = ({ destinationName: topic, payloadString: payload }) => {
      if (topic === TOPIC_STATUS) {
        setLightState(payload);
      }

      if (topic === TOPIC_CONN) {
        if (payload === 'ONLINE') {
          // ESP32 is online — cancel any pending offline timer and mark online immediately
          if (offlineRef.current) clearTimeout(offlineRef.current);
          setEsp32Status('Online');
          setIsESP32Online(true);
        } else {
          // Wait 5s before marking offline — avoids false OFFLINE from retained message on startup
          if (offlineRef.current) clearTimeout(offlineRef.current);
          offlineRef.current = setTimeout(() => {
            setEsp32Status('Offline');
            setIsESP32Online(false);
            setLightState('OFF');
          }, 60000);
        }
      }
    };

    cl.connect({
      useSSL: true, userName: MQTT_USER, password: MQTT_PASS,
      onSuccess: () => {
        setMqttStatus('Connected');
        setMqttOk(true);
        setIsMqttReady(true);
        cl.subscribe(TOPIC_STATUS);
        cl.subscribe(TOPIC_CONN);
      },
      onFailure: () => {
        setMqttStatus('Failed');
        setMqttOk(false);
        setIsMqttReady(false);
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      <Animated.View style={[styles.root, { backgroundColor: T.bg, opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Navbar ── */}
          <View style={styles.navbar}>
            <View>
              <Text style={[styles.navTitle, { color: T.textPri }]}>Light Control</Text>
              <Text style={[styles.navSub, { color: T.textMute }]}>Smart Home</Text>
            </View>
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: T.bgCardAlt, borderColor: T.border }]}
              onPress={() => setIsDark(d => !d)}
              activeOpacity={0.7}
            >
              <Text style={styles.themeBtnIcon}>{isDark ? '🔅' : '🌛'}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Hero Card ── */}
          <View style={[styles.heroCard, {
            backgroundColor: T.bgHero,
            borderColor: isOn ? T.accentBadge : T.border,
          }]}>
            <Animated.View style={[styles.heroGlowRing, {
              backgroundColor: T.accentGlow,
              opacity: isOn ? glowAnim : 0.0,
            }]} />

            <View style={styles.heroTop}>
              <View>
                <Text style={[styles.heroRoom, { color: T.textPri }]}>Ceiling Light</Text>
                <Text style={[styles.heroZone, { color: T.textHeroClk }]}>Living room</Text>
              </View>
              <View style={[styles.heroBadge, {
                backgroundColor: isOn ? T.accentBg : T.bgInput,
                borderColor: isOn ? T.accentBadge : T.border,
              }]}>
                <View style={[styles.heroBadgeDot, { backgroundColor: isOn ? T.accentText : T.textMute }]} />
                <Text style={[styles.heroBadgeText, { color: isOn ? T.accentText : T.textMute }]}>
                  {isOn ? 'Active' : 'Standby'}
                </Text>
              </View>
            </View>

            <View style={styles.heroCenter}>
              <View style={[styles.bulbRing, {
                backgroundColor: T.accentGlow,
                borderColor: isOn ? T.accentBadge : T.border,
              }]}>
                <Animated.Text style={[
                  styles.bulb,
                  { transform: [{ scale: pulseAnim }], opacity: isOn ? 1 : 0.3 },
                ]}>
                  💡
                </Animated.Text>
              </View>
              <Text style={[styles.heroState, { color: T.textHero }]}>
                {isESP32Online ? (isOn ? 'Light is On' : 'Light is Off') : 'Device Offline'}
              </Text>
              <Text style={[styles.heroStateSub, { color: T.textHeroSub }]}>
                {isESP32Online ? 'ESP32 connected' : 'Check your connection'}
              </Text>
            </View>

            <View style={[styles.heroBottom, { borderTopColor: T.heroDivider }]}>
              <Text style={[styles.heroDate, { color: T.textHeroSub }]}>{date}</Text>
              <Text style={[styles.heroClock, { color: T.textPri }]}>{clock}</Text>
            </View>
          </View>

          {/* ── Power ── */}
          <View style={[styles.section, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <Text style={[styles.sectionLabel, { color: T.textMute }]}>Power</Text>
            <View style={styles.powerRow}>
              <TouchableOpacity
                style={[styles.powerBtn, {
                  backgroundColor: isOn ? T.accent : T.bgInput,
                  borderColor: isOn ? T.accentBorder : T.borderLight,
                }, !canControl && styles.disabled]}
                onPress={() => sendCommand('ON')}
                disabled={!canControl}
                activeOpacity={0.75}
              >
                <Text style={[styles.powerBtnIcon, { opacity: isOn ? 1 : 0.45 }]}>◑</Text>
                <Text style={[styles.powerBtnLabel, { color: isOn ? T.white : T.textMid }]}>Turn On</Text>
                {isOn && (
                  <View style={[styles.powerCheck, { backgroundColor: T.checkBg }]}>
                    <Text style={styles.powerCheckIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.powerBtn, {
                  backgroundColor: !isOn ? T.bgCardAlt : T.bgInput,
                  borderColor: !isOn ? T.borderLight : T.border,
                }, !canControl && styles.disabled]}
                onPress={() => sendCommand('OFF')}
                disabled={!canControl}
                activeOpacity={0.75}
              >
                <Text style={[styles.powerBtnIcon, { opacity: !isOn ? 0.6 : 0.3 }]}>◐</Text>
                <Text style={[styles.powerBtnLabel, { color: !isOn ? T.textSec : T.textMute }]}>Turn Off</Text>
                {!isOn && isESP32Online && (
                  <View style={[styles.powerCheck, { backgroundColor: T.bgInput, borderColor: T.border, borderWidth: 0.5 }]}>
                    <Text style={[styles.powerCheckIcon, { color: T.textMid }]}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Scenes ── */}
          <View style={[styles.section, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <Text style={[styles.sectionLabel, { color: T.textMute }]}>Scenes</Text>
            <View style={styles.scenesRow}>
              {[
                { label: 'Relax', sub: 'Warm ambient',  cmd: 'ON',  icon: '🍃' },
                { label: 'Night', sub: 'Lights out',    cmd: 'OFF', icon: '🌛' },
              ].map(sc => (
                <TouchableOpacity
                  key={sc.label}
                  style={[styles.sceneCard, { backgroundColor: T.bgCardAlt, borderColor: T.borderCard }, !canControl && styles.disabled]}
                  onPress={() => sendCommand(sc.cmd)}
                  disabled={!canControl}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sceneIcon}>{sc.icon}</Text>
                  <Text style={[styles.sceneLabel, { color: T.textSec }]}>{sc.label}</Text>
                  <Text style={[styles.sceneSub, { color: T.textMute }]}>{sc.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Connection ── */}
          <View style={[styles.section, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <Text style={[styles.sectionLabel, { color: T.textMute }]}>Connection</Text>
            {(!isMqttReady || !isESP32Online) && (
              <View style={[styles.alert, {
                backgroundColor: !isMqttReady ? 'rgba(202,80,16,0.08)' : 'rgba(216,59,1,0.08)',
                borderColor: !isMqttReady ? T.orange : T.red,
              }]}>
                <Text style={{ fontSize: 14 }}>⚠️</Text>
                <Text style={[styles.alertText, { color: !isMqttReady ? T.orange : T.red }]}>
                  {!isMqttReady ? 'Connecting to broker…' : 'ESP32 offline — controls disabled'}
                </Text>
              </View>
            )}
            <View style={styles.connRow}>
              <ConnCard label="Broker" value={mqttStatus}  dotColor={mqttOk ? T.green : T.orange} T={T} />
              <ConnCard label="ESP32"  value={esp32Status} dotColor={isESP32Online ? T.green : T.red} T={T} />
            </View>
          </View>

          {/* ── Settings ── */}
          <View style={[styles.section, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <Text style={[styles.sectionLabel, { color: T.textMute }]}>Settings</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <IconBox icon={isDark ? '🌛' : '🔅'} T={T} />
                <View>
                  <Text style={[styles.settingName, { color: T.textPri }]}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
                  <Text style={[styles.settingDetail, { color: T.textMute }]}>Fluent theme</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={v => setIsDark(v)}
                trackColor={{ false: T.border, true: T.accent }}
                thumbColor={T.white}
              />
            </View>

            <Divider T={T} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <IconBox icon="📡" T={T} />
                <View>
                  <Text style={[styles.settingName, { color: T.textPri }]}>Broker</Text>
                  <Text style={[styles.settingDetail, { color: T.textMute }]} numberOfLines={1}>
                    {BROKER.slice(0, 24)}…
                  </Text>
                </View>
              </View>
              <View style={[styles.connDot, { backgroundColor: mqttOk ? T.green : T.orange }]} />
            </View>

            <Divider T={T} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <IconBox icon="🗝️" T={T} />
                <View>
                  <Text style={[styles.settingName, { color: T.textPri }]}>Encryption</Text>
                  <Text style={[styles.settingDetail, { color: T.textMute }]}>MQTT over TLS/SSL</Text>
                </View>
              </View>
              <View style={[styles.secureBadge, {
                backgroundColor: T.settingsBadgeBg,
                borderColor: T.settingsBadgeBorder,
              }]}>
                <Text style={[styles.secureBadgeText, { color: T.accentHero }]}>Secured</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.footer, { color: T.textMute }]}>
            Smart Home · ESP32 · HiveMQ Cloud
          </Text>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Static styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:  { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  root:  { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 36 },
  navbar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6, paddingVertical: 4,
  },
  navTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  navSub:   { fontSize: 11, fontWeight: '400', marginTop: 2, letterSpacing: 0.2 },
  themeBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 0.5,
  },
  themeBtnIcon: { fontSize: 18 },
  heroCard: {
    borderRadius: 20, borderWidth: 0.5,
    padding: 20, marginBottom: 2,
    overflow: 'hidden', position: 'relative', minHeight: 210,
  },
  heroGlowRing: {
    position: 'absolute', top: -50, right: -50,
    width: 180, height: 180, borderRadius: 90,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 18, zIndex: 1,
  },
  heroRoom:  { fontSize: 21, fontWeight: '600', letterSpacing: -0.3 },
  heroZone:  { fontSize: 12, fontWeight: '400', marginTop: 3, letterSpacing: 0.2 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 0.5, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  heroBadgeDot:  { width: 5, height: 5, borderRadius: 2.5 },
  heroBadgeText: { fontSize: 11, fontWeight: '500', letterSpacing: 0.3 },
  heroCenter:    { alignItems: 'center', paddingVertical: 6, zIndex: 1 },
  bulbRing: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, marginBottom: 12,
  },
  bulb:         { fontSize: 44 },
  heroState:    { fontSize: 15, fontWeight: '600', letterSpacing: 0.1, marginBottom: 3 },
  heroStateSub: { fontSize: 12, fontWeight: '400' },
  heroBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', borderTopWidth: 0.5,
    marginTop: 16, paddingTop: 14, zIndex: 1,
  },
  heroDate:  { fontSize: 12, fontWeight: '400', letterSpacing: 0.2 },
  heroClock: { fontSize: 28, fontWeight: '300', letterSpacing: 2 },
  section:   { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: 10, fontWeight: '600',
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  powerRow: { flexDirection: 'row', gap: 10 },
  powerBtn: {
    flex: 1, borderRadius: 12, borderWidth: 0.5,
    paddingVertical: 18, alignItems: 'center',
    gap: 6, position: 'relative',
  },
  powerBtnIcon:   { fontSize: 22, color: '#FFFFFF' },
  powerBtnLabel:  { fontSize: 13, fontWeight: '500', letterSpacing: 0.2 },
  powerCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  powerCheckIcon: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  disabled:       { opacity: 0.35 },
  scenesRow:      { flexDirection: 'row', gap: 8 },
  sceneCard: {
    flex: 1, borderRadius: 12, borderWidth: 0.5,
    paddingVertical: 14, paddingHorizontal: 8,
    alignItems: 'center', gap: 5,
  },
  sceneIcon:  { fontSize: 24 },
  sceneLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.1 },
  sceneSub:   { fontSize: 10, fontWeight: '400', textAlign: 'center', lineHeight: 13 },
  alert: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 0.5, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  alertText:   { fontSize: 12, fontWeight: '500', flex: 1, lineHeight: 16 },
  connRow:     { flexDirection: 'row', gap: 8 },
  connCard:    { flex: 1, borderRadius: 10, borderWidth: 0.5, padding: 12 },
  connLabel:   { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 },
  connVal:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  connDot:     { width: 7, height: 7, borderRadius: 3.5 },
  connValText: { fontSize: 12, fontWeight: '500' },
  settingRow:  {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 6,
  },
  settingLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 0.5,
  },
  iconBoxText:     { fontSize: 18 },
  settingName:     { fontSize: 14, fontWeight: '500', letterSpacing: 0.1 },
  settingDetail:   { fontSize: 11, fontWeight: '400', marginTop: 2, letterSpacing: 0.1 },
  secureBadge:     { borderRadius: 6, borderWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 },
  secureBadgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  footer:          { fontSize: 11, textAlign: 'center', marginTop: 4, letterSpacing: 0.5 },
});