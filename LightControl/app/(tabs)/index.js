import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView, Animated, Dimensions,
} from 'react-native';
import Paho from 'paho-mqtt';

// ─── MQTT Config ────────────────────────────────────────────────────────────
const BROKER        = 'c12e66baf5c34fecb0d1558aff2707d4.s1.eu.hivemq.cloud';
const PORT          = 8884;
const MQTT_USER     = 'abdullah9864';
const MQTT_PASS     = 'Ab5599@ab';
const TOPIC_CONTROL = 'home/light/control';
const TOPIC_STATUS  = 'home/light/status';
const TOPIC_CONN    = 'home/esp32/connection';

// ─── Color Palette ───────────────────────────────────────────────────────────
const C = {
  cream:      '#F5F0E8',
  creamDark:  '#EDE6D6',
  creamDeep:  '#E2D9C8',
  warmWhite:  '#FDFAF5',
  gold:       '#C9A84C',
  goldLight:  '#E8C96A',
  charcoal:   '#1C1C1E',
  stone:      '#3A3A3C',
  mist:       '#8E8E93',
  green:      '#34C759',
  red:        '#FF3B30',
  orange:     '#FF9500',
  white:      '#FFFFFF',
};

const { width } = Dimensions.get('window');

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [lightState,    setLightState]    = useState('OFF');
  const [mqttStatus,    setMqttStatus]    = useState('Connecting');
  const [mqttColor,     setMqttColor]     = useState(C.orange);
  const [esp32Status,   setEsp32Status]   = useState('Unknown');
  const [esp32Color,    setEsp32Color]    = useState(C.mist);
  const [isESP32Online, setIsESP32Online] = useState(false);
  const [isMqttReady,   setIsMqttReady]   = useState(false);

  const glowAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const clientRef   = useRef(null);
  const reconnTimer = useRef(null);
  const glowLoop    = useRef(null);

  // ── Clock state ──
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setClock(`${h}:${m}`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // ── MQTT connect on mount ──
  useEffect(() => {
    connectMQTT();
    return () => {
      if (reconnTimer.current) clearTimeout(reconnTimer.current);
      if (clientRef.current) {
        try { clientRef.current.disconnect(); } catch (_) {}
      }
    };
  }, []);

  // ── Bulb glow animation ──
  useEffect(() => {
    if (lightState === 'ON' && isESP32Online) {
      glowLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        ])
      );
      glowLoop.current.start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.00, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    } else {
      if (glowLoop.current) glowLoop.current.stop();
      glowAnim.stopAnimation();
      scaleAnim.stopAnimation();
      glowAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [lightState, isESP32Online]);

  // ── MQTT ──
  function connectMQTT() {
    const clientId = 'rn-' + Math.random().toString(16).substr(2, 8);
    const client   = new Paho.Client(BROKER, PORT, '/mqtt', clientId);
    clientRef.current = client;

    client.onConnectionLost = () => {
      setMqttStatus('Disconnected');
      setMqttColor(C.red);
      setIsMqttReady(false);
      reconnTimer.current = setTimeout(() => connectMQTT(), 3000);
    };

    client.onMessageArrived = (msg) => {
      const topic   = msg.destinationName;
      const payload = msg.payloadString;

      if (topic === TOPIC_STATUS) {
        setLightState(payload);
      }
      if (topic === TOPIC_CONN) {
        if (payload === 'ONLINE') {
          setEsp32Status('Online');
          setEsp32Color(C.green);
          setIsESP32Online(true);
        } else {
          setEsp32Status('Offline');
          setEsp32Color(C.red);
          setIsESP32Online(false);
          setLightState('OFF');
        }
      }
    };

    client.connect({
      useSSL:   true,
      userName: MQTT_USER,
      password: MQTT_PASS,
      onSuccess: () => {
        setMqttStatus('Connected');
        setMqttColor(C.green);
        setIsMqttReady(true);
        client.subscribe(TOPIC_STATUS);
        client.subscribe(TOPIC_CONN);
      },
      onFailure: () => {
        setMqttStatus('Failed');
        setMqttColor(C.red);
        setIsMqttReady(false);
        reconnTimer.current = setTimeout(() => connectMQTT(), 3000);
      },
    });
  }

  function sendCommand(cmd) {
    if (!isMqttReady || !isESP32Online) return;
    if (clientRef.current && clientRef.current.isConnected()) {
      const msg = new Paho.Message(cmd);
      msg.destinationName = TOPIC_CONTROL;
      msg.retained = true;
      clientRef.current.send(msg);
      setLightState(cmd);
    }
  }

  // ── Derived state ──
  const canControl = isMqttReady && isESP32Online;
  const isOn       = lightState === 'ON' && isESP32Online;

  const glowOpacity = glowAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0.3, 1],
  });

  const bulbStateText = isESP32Online
    ? (lightState === 'ON' ? 'Light is on' : 'Light is off')
    : 'Device offline';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />

      <View style={s.container}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerLabel}>Living Room</Text>
            <Text style={s.headerTitle}>Smart Light</Text>
          </View>
          <View style={s.clockBadge}>
            <Text style={s.clockText}>{clock}</Text>
          </View>
        </View>

        {/* ── Bulb Hero Card ── */}
        <View style={[s.heroCard, isOn && s.heroCardOn]}>
          {/* Glow ring */}
          {isOn && (
            <Animated.View style={[s.glowRing, { opacity: glowOpacity }]} />
          )}

          {/* Bulb */}
          <Animated.Text style={[
            s.bulbEmoji,
            { transform: [{ scale: scaleAnim }] },
            isOn && s.bulbEmojiOn,
          ]}>
            💡
          </Animated.Text>

          <Text style={s.roomLabel}>Ceiling Light</Text>
          <Text style={[s.bulbStateText, isOn && s.bulbStateTextOn]}>
            {bulbStateText}
          </Text>
        </View>

        {/* ── Status Pills ── */}
        <View style={s.statusRow}>
          <View style={s.statusPill}>
            <View style={[s.statusDot, { backgroundColor: mqttColor, shadowColor: mqttColor }]} />
            <View>
              <Text style={s.statusLabel}>BROKER</Text>
              <Text style={s.statusVal}>{mqttStatus}</Text>
            </View>
          </View>
          <View style={s.statusPill}>
            <View style={[s.statusDot, { backgroundColor: esp32Color, shadowColor: esp32Color }]} />
            <View>
              <Text style={s.statusLabel}>ESP32</Text>
              <Text style={s.statusVal}>{esp32Status}</Text>
            </View>
          </View>
        </View>

        {/* ── Warning ── */}
        {(!isMqttReady || !isESP32Online) && (
          <View style={s.warningBox}>
            <Text style={s.warningText}>
              {!isMqttReady
                ? '🔄  Connecting to broker...'
                : '⚠️  ESP32 offline — buttons disabled until it reconnects.'}
            </Text>
          </View>
        )}

        {/* ── ON / OFF Buttons ── */}
        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.ctrlBtn, isOn ? s.btnOnActive : s.btnOnIdle, !canControl && s.btnDisabled]}
            onPress={() => sendCommand('ON')}
            activeOpacity={canControl ? 0.8 : 1}
            disabled={!canControl}
          >
            <Text style={s.btnIcon}>☀️</Text>
            <Text style={[s.btnLabel, isOn && s.btnLabelActive]}>TURN ON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.ctrlBtn, !isOn ? s.btnOffActive : s.btnOffIdle, !canControl && s.btnDisabled]}
            onPress={() => sendCommand('OFF')}
            activeOpacity={canControl ? 0.8 : 1}
            disabled={!canControl}
          >
            <Text style={s.btnIcon}>🌙</Text>
            <Text style={[s.btnLabel, !isOn && s.btnLabelActive]}>TURN OFF</Text>
          </TouchableOpacity>
        </View>

        {/* ── Scenes ── */}
        <Text style={s.sectionLabel}>Scenes</Text>
        <View style={s.scenesRow}>
          {[
            { icon: '🌅', name: 'Relax',  cmd: 'ON'  },
            { icon: '💼', name: 'Focus',  cmd: 'ON'  },
            { icon: '🌃', name: 'Night',  cmd: 'OFF' },
          ].map((scene) => (
            <TouchableOpacity
              key={scene.name}
              style={[s.sceneBtn, !canControl && s.btnDisabled]}
              onPress={() => sendCommand(scene.cmd)}
              activeOpacity={canControl ? 0.75 : 1}
              disabled={!canControl}
            >
              <Text style={s.sceneIcon}>{scene.icon}</Text>
              <Text style={s.sceneName}>{scene.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Home Bar ── */}
        <View style={s.homeBar} />

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.cream,
  },
  container: {
    flex: 1,
    backgroundColor: C.warmWhite,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: C.mist,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: C.charcoal,
    letterSpacing: -0.5,
  },
  clockBadge: {
    backgroundColor: C.creamDark,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  clockText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.stone,
  },

  // Hero Card
  heroCard: {
    backgroundColor: C.charcoal,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: C.charcoal,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
    position: 'relative',
  },
  heroCardOn: {
    shadowColor: C.gold,
    shadowOpacity: 0.3,
  },
  glowRing: {
    position: 'absolute',
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: C.gold,
    opacity: 0.18,
  },
  bulbEmoji: {
    fontSize: 80,
    marginBottom: 12,
    opacity: 0.5,
  },
  bulbEmojiOn: {
    opacity: 1,
  },
  roomLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: C.white,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  bulbStateText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.mist,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bulbStateTextOn: {
    color: C.goldLight,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.creamDark,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: C.mist,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statusVal: {
    fontSize: 13,
    fontWeight: '600',
    color: C.charcoal,
  },

  // Warning
  warningBox: {
    backgroundColor: '#FFF8EC',
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  warningText: {
    fontSize: 12,
    color: '#7A5500',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  ctrlBtn: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  btnOnIdle: {
    backgroundColor: C.creamDark,
  },
  btnOnActive: {
    backgroundColor: C.gold,
    shadowColor: C.gold,
    shadowOpacity: 0.4,
  },
  btnOffIdle: {
    backgroundColor: C.creamDark,
  },
  btnOffActive: {
    backgroundColor: C.charcoal,
    shadowColor: C.charcoal,
    shadowOpacity: 0.35,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  btnLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: C.stone,
  },
  btnLabelActive: {
    color: C.white,
  },

  // Scenes
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.mist,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  scenesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sceneBtn: {
    flex: 1,
    backgroundColor: C.creamDark,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sceneIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  sceneName: {
    fontSize: 11,
    fontWeight: '600',
    color: C.stone,
    letterSpacing: 0.5,
  },

  // Home Bar
  homeBar: {
    width: 134,
    height: 5,
    backgroundColor: C.charcoal,
    borderRadius: 3,
    opacity: 0.15,
    alignSelf: 'center',
    marginTop: 20,
  },
});
