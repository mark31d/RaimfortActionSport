// Components/HomeScreen.js — RaimfortActionSport (dark navy + контейнеры как у тебя)

import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';

// --- assets ---
const LOGO = require('../assets/logo.png'); // можно заменить на logo.webp
const GEAR = require('../assets/gear.png'); // иконка настроек
const BACK = require('../assets/back.png'); // стрелка назад (если где-то понадобится)

// --- theme (держим в одном стиле с App.js) ---
const THEME = {
  bg: '#0B1522',
  card: '#0F1F33',
  deep: '#132A41',
  text: '#FFFFFF',
  text2: '#A9B7C6',
  line: '#1B334A',
  accent: '#42E8D6',
  good: '#10B981',
  warn: '#F59E0B',
  bad: '#EF4444',
};

const HomeScreen = ({ navigation }) => {
  const [readyOpen, setReadyOpen] = useState(false);

  // Ready-Check (0..10)
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(3);
  const [soreness, setSoreness] = useState(3);
  const [time, setTime] = useState(35);

  const readiness = useMemo(() => {
    // 0..100
    const sleepScore = Math.min(10, Math.max(0, sleep)) * 10; // 0..100
    const stressPenalty = Math.min(10, Math.max(0, stress)) * 6; // 0..60
    const sorePenalty = Math.min(10, Math.max(0, soreness)) * 6; // 0..60
    const timeScore = Math.min(60, Math.max(10, time)) * 1.2; // 12..72

    let score = 0.45 * sleepScore + 0.25 * timeScore - 0.15 * stressPenalty - 0.15 * sorePenalty;
    score = Math.max(0, Math.min(100, Math.round(score)));

    let label = 'Normal';
    let color = THEME.accent;

    if (score >= 75) { label = 'Push'; color = THEME.good; }
    else if (score >= 45) { label = 'Normal'; color = THEME.accent; }
    else { label = 'Light'; color = THEME.warn; }

    return { score, label, color };
  }, [sleep, stress, soreness, time]);

  const week = useMemo(
    () => [
      { day: 'Day 1', title: 'Strength + Tempo', minutes: 45, focus: 'Squat / Push / Core', tag: 'RPE 7' },
      { day: 'Day 2', title: 'Cardio Intervals', minutes: 25, focus: 'HIIT + Breathing', tag: 'Timer' },
      { day: 'Day 3', title: 'Pull + Mobility', minutes: 40, focus: 'Row / Hinge / Stretch', tag: 'Control' },
      { day: 'Day 4', title: 'Zone 2', minutes: 35, focus: 'Endurance base', tag: 'Easy' },
      { day: 'Day 5', title: 'Full Body', minutes: 50, focus: 'Compound + Finish', tag: 'Progress' },
    ],
    []
  );

  const goPlan = () => navigation?.navigate?.('PlanDetails');
  const goSession = (index) => navigation?.navigate?.('Session', { dayIndex: index });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoWrap}>
              <Image source={LOGO} style={styles.logo} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>RaimfortActionSport</Text>
              <Text style={styles.subtitle}>Train with rhythm • Progress by control</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.('Settings')}
            style={styles.gearBtn}
          >
            <Image source={GEAR} style={styles.gearIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Container 1: How it works */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How RaimfortActionSport works</Text>

            <View style={styles.bullets}>
              <Text style={styles.bullet}>• Ready-Check → selects Light / Normal / Push plan</Text>
              <Text style={styles.bullet}>• Tempo metronome + rest coach during sets</Text>
              <Text style={styles.bullet}>• Smart substitutions if you lack equipment</Text>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => setReadyOpen(true)} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Open Ready-Check</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={goPlan} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>Weekly Plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Container 2: Today status */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Today</Text>
              <View style={[styles.pill, { borderColor: readiness.color, backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <View style={[styles.pillDot, { backgroundColor: readiness.color }]} />
                <Text style={[styles.pillText, { color: readiness.color }]}>{readiness.label}</Text>
                <Text style={styles.pillText2}>{readiness.score}/100</Text>
              </View>
            </View>

            <Text style={styles.muted}>
              Suggestion: {readiness.label === 'Push'
                ? 'Increase load slightly or add 1 set.'
                : readiness.label === 'Normal'
                ? 'Keep planned volume and tempo.'
                : 'Reduce volume, focus on technique + mobility.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation?.navigate?.('Timer')}
              style={[styles.btnWide, { borderColor: THEME.line }]}
            >
              <Text style={styles.btnWideText}>Open Timer & Tempo</Text>
            </TouchableOpacity>
          </View>

          {/* Container 3: Week days list */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Your week</Text>
              <Text style={styles.mutedSmall}>Tap a day to start</Text>
            </View>

            <View style={{ marginTop: 10 }}>
              {week.map((item, idx) => (
                <TouchableOpacity
                  key={item.day}
                  activeOpacity={0.88}
                  onPress={() => goSession(idx)}
                  style={styles.dayRow}
                >
                  <View style={styles.dayLeft}>
                    <Text style={styles.dayBadge}>{item.day}</Text>
                    <View style={{ gap: 2 }}>
                      <Text style={styles.dayTitle}>{item.title}</Text>
                      <Text style={styles.daySub}>{item.focus}</Text>
                    </View>
                  </View>

                  <View style={styles.dayRight}>
                    <Text style={styles.dayMin}>{item.minutes}m</Text>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Small footer */}
          <Text style={styles.footer}>
            Small steps every day → clean tempo → real progress.
          </Text>
        </ScrollView>

        {/* Ready-Check Modal */}
        <Modal visible={readyOpen} transparent animationType="fade" onRequestClose={() => setReadyOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setReadyOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Ready-Check (30 sec)</Text>
              <Text style={styles.modalHint}>Pick quick values — we’ll adjust the day intensity.</Text>

              <Metric
                label="Sleep (hours)"
                value={sleep}
                min={0}
                max={10}
                onDec={() => setSleep(v => Math.max(0, v - 1))}
                onInc={() => setSleep(v => Math.min(10, v + 1))}
              />
              <Metric
                label="Stress (0–10)"
                value={stress}
                min={0}
                max={10}
                onDec={() => setStress(v => Math.max(0, v - 1))}
                onInc={() => setStress(v => Math.min(10, v + 1))}
              />
              <Metric
                label="Soreness (0–10)"
                value={soreness}
                min={0}
                max={10}
                onDec={() => setSoreness(v => Math.max(0, v - 1))}
                onInc={() => setSoreness(v => Math.min(10, v + 1))}
              />
              <Metric
                label="Time available (min)"
                value={time}
                min={10}
                max={60}
                onDec={() => setTime(v => Math.max(10, v - 5))}
                onInc={() => setTime(v => Math.min(60, v + 5))}
              />

              <View style={[styles.rowBetween, { marginTop: 14 }]}>
                <View style={[styles.pill, { borderColor: readiness.color }]}>
                  <View style={[styles.pillDot, { backgroundColor: readiness.color }]} />
                  <Text style={[styles.pillText, { color: readiness.color }]}>{readiness.label}</Text>
                  <Text style={styles.pillText2}>{readiness.score}/100</Text>
                </View>

                <TouchableOpacity activeOpacity={0.85} onPress={() => setReadyOpen(false)} style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

function Metric({ label, value, onDec, onInc }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricRight}>
        <TouchableOpacity activeOpacity={0.85} onPress={onDec} style={styles.stepBtn}>
          <Text style={styles.stepText}>−</Text>
        </TouchableOpacity>

        <View style={styles.metricValueBox}>
          <Text style={styles.metricValue}>{value}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={onInc} style={styles.stepBtn}>
          <Text style={styles.stepText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  screen: { flex: 1, backgroundColor: THEME.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: THEME.line,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 28, height: 28, resizeMode: 'contain' },
  title: { color: THEME.text, fontSize: 20, fontWeight: '800' },
  subtitle: { color: THEME.text2, fontSize: 12, marginTop: 2 },

  gearBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: { width: 20, height: 20, resizeMode: 'contain', tintColor: THEME.text2 },

  content: { paddingHorizontal: 16, paddingBottom: 28 },

  card: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { color: THEME.text, fontSize: 16, fontWeight: '800' },
  bullets: { marginTop: 10, gap: 6 },
  bullet: { color: THEME.text2, fontSize: 13, lineHeight: 18 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },

  btnPrimary: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  btnPrimaryText: { color: THEME.bg, fontWeight: '800', fontSize: 13 },

  btnGhost: {
    borderWidth: 1,
    borderColor: THEME.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  btnGhostText: { color: THEME.text, fontWeight: '700', fontSize: 13 },

  btnWide: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  btnWideText: { color: THEME.text, fontWeight: '800' },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillDot: { width: 8, height: 8, borderRadius: 99 },
  pillText: { fontWeight: '900', fontSize: 12 },
  pillText2: { color: THEME.text2, fontSize: 12, fontWeight: '700', marginLeft: 2 },

  muted: { color: THEME.text2, marginTop: 10, lineHeight: 18 },
  mutedSmall: { color: THEME.text2, fontSize: 12 },

  dayRow: {
    backgroundColor: THEME.deep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dayBadge: {
    color: THEME.bg,
    backgroundColor: THEME.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '900',
    fontSize: 12,
    overflow: 'hidden',
  },
  dayTitle: { color: THEME.text, fontWeight: '900', fontSize: 13 },
  daySub: { color: THEME.text2, fontSize: 12 },

  dayRight: { alignItems: 'flex-end', gap: 6 },
  dayMin: { color: THEME.text, fontWeight: '900' },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagText: { color: THEME.text2, fontSize: 11, fontWeight: '800' },

  footer: { color: THEME.text2, textAlign: 'center', marginTop: 6, marginBottom: 10 },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 14,
  },
  modalTitle: { color: THEME.text, fontSize: 16, fontWeight: '900' },
  modalHint: { color: THEME.text2, marginTop: 6, marginBottom: 8 },

  metricRow: {
    marginTop: 10,
    backgroundColor: THEME.deep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricLabel: { color: THEME.text, fontWeight: '800', fontSize: 13, flex: 1 },
  metricRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: THEME.text, fontSize: 18, fontWeight: '900' },
  metricValueBox: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
  },
  metricValue: { color: THEME.text, fontWeight: '900' },
});

export default HomeScreen;
