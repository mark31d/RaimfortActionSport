// Components/PlanDetailsScreen.js — RaimfortActionSport (dark navy + контейнеры)

import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';

// assets
const BACK = require('../assets/back.png');

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
};

const PlanDetailsScreen = ({ navigation, route }) => {
  const [intensity, setIntensity] = useState('Normal'); // Light | Normal | Push
  const [equipment, setEquipment] = useState('Gym'); // Home | Gym | Dumbbells

  const intensityHint = useMemo(() => {
    if (intensity === 'Push') return { txt: 'Add +1 set OR +1–2 reps on main lifts', color: THEME.good };
    if (intensity === 'Light') return { txt: 'Reduce volume: -1 set on each block, focus on tempo', color: THEME.warn };
    return { txt: 'Follow the plan, keep clean tempo and rest', color: THEME.accent };
  }, [intensity]);

  const plan = useMemo(() => {
    // базовые шаблоны упражнений (подменяем по equipment)
    const map = {
      Gym: {
        squat: 'Back Squat',
        push: 'Bench Press',
        pull: 'Lat Pulldown',
        hinge: 'Romanian Deadlift',
        core: 'Hollow Hold',
        cardio: 'Bike Intervals',
        row: 'Seated Row',
      },
      Home: {
        squat: 'Goblet Squat (Backpack)',
        push: 'Push-ups',
        pull: 'Band Row / Door Row',
        hinge: 'Hip Hinge (Backpack)',
        core: 'Plank',
        cardio: 'Running Intervals',
        row: 'Band Row',
      },
      Dumbbells: {
        squat: 'DB Front Squat',
        push: 'DB Floor Press',
        pull: '1-Arm DB Row',
        hinge: 'DB RDL',
        core: 'Dead Bug',
        cardio: 'Jump Rope / Intervals',
        row: '1-Arm DB Row',
      },
    };

    const ex = map[equipment] || map.Gym;

    // объем под интенсивность (простая логика)
    const mult = intensity === 'Push' ? 1 : intensity === 'Light' ? 0.8 : 0.9;
    const mainSets = intensity === 'Push' ? 4 : intensity === 'Light' ? 3 : 3;
    const accSets = intensity === 'Push' ? 3 : intensity === 'Light' ? 2 : 3;

    const tempoMain = '3-1-1';
    const restMain = intensity === 'Push' ? '90–120s' : '75–90s';
    const restAcc = '45–60s';

    return [
      {
        day: 'Day 1',
        title: 'Strength + Tempo',
        minutes: 45,
        focus: 'Squat / Push / Core',
        blocks: [
          { name: 'Main', items: [`${ex.squat} — ${mainSets}×6 (tempo ${tempoMain})`, `${ex.push} — ${mainSets}×6 (tempo ${tempoMain})`], note: `Rest ${restMain}` },
          { name: 'Accessory', items: [`${ex.pull} — ${accSets}×10`, `${ex.core} — 3×30–45s`], note: `Rest ${restAcc}` },
        ],
      },
      {
        day: 'Day 2',
        title: 'Cardio Intervals',
        minutes: 25,
        focus: 'HIIT + Breathing',
        blocks: [
          { name: 'Warm-up', items: ['5 min easy pace'], note: '' },
          { name: 'Intervals', items: [`${ex.cardio} — 10×(30s hard / 60s easy)`], note: 'Finish with 2 min slow breathing' },
        ],
      },
      {
        day: 'Day 3',
        title: 'Pull + Mobility',
        minutes: 40,
        focus: 'Row / Hinge / Stretch',
        blocks: [
          { name: 'Main', items: [`${ex.hinge} — ${mainSets}×8 (tempo 2-1-2)`, `${ex.row} — ${mainSets}×10`], note: `Rest ${restMain}` },
          { name: 'Mobility', items: ['Hips + thoracic — 8 min', 'Hamstrings — 4 min'], note: 'Slow and controlled' },
        ],
      },
      {
        day: 'Day 4',
        title: 'Zone 2',
        minutes: 35,
        focus: 'Endurance base',
        blocks: [
          { name: 'Main', items: ['Zone 2 steady — 30 min'], note: 'Nose breathing if possible' },
          { name: 'Cool-down', items: ['Walk — 5 min'], note: '' },
        ],
      },
      {
        day: 'Day 5',
        title: 'Full Body',
        minutes: 50,
        focus: 'Compound + Finish',
        blocks: [
          { name: 'Main', items: [`${ex.squat} — ${mainSets}×5 (tempo 2-1-1)`, `${ex.hinge} — ${mainSets}×6`, `${ex.pull} — ${mainSets}×8`], note: `Rest ${restMain}` },
          { name: 'Finisher', items: ['EMOM 8 min: 8 push-ups + 10 air squats'], note: 'Keep form clean' },
        ],
      },
    ].map((d) => ({
      ...d,
      // чуть “весим” длительность под интенсивность
      minutes: Math.round(d.minutes * mult),
    }));
  }, [intensity, equipment]);

  const openSession = (idx) => navigation?.navigate?.('Session', { dayIndex: idx, intensity, equipment });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation?.goBack?.()}
            style={styles.iconBtn}
          >
            <Image source={BACK} style={styles.iconImg} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.hTitle}>Weekly Plan</Text>
            <Text style={styles.hSub}>RaimfortActionSport • details & blocks</Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Overview card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan overview</Text>
            <Text style={styles.muted}>
              5 sessions / week. Focus: strength with tempo + cardio base + mobility.
            </Text>

            <View style={styles.pillsRow}>
              <Pill label="Tempo-first" value="3-1-1" />
              <Pill label="Goal" value="Consistency" />
              <Pill label="Auto-progress" value="On" />
            </View>
          </View>

          {/* Intensity */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Intensity</Text>
            <Text style={styles.mutedSmall}>Choose how hard this week should feel.</Text>

            <View style={styles.segment}>
              {['Light', 'Normal', 'Push'].map((k) => {
                const active = intensity === k;
                return (
                  <TouchableOpacity
                    key={k}
                    activeOpacity={0.9}
                    onPress={() => setIntensity(k)}
                    style={[
                      styles.segBtn,
                      active && { backgroundColor: 'rgba(66,232,214,0.16)', borderColor: 'rgba(66,232,214,0.35)' },
                    ]}
                  >
                    <Text style={[styles.segText, { color: active ? THEME.text : THEME.text2 }]}>{k}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.hintBox, { borderColor: intensityHint.color }]}>
              <View style={[styles.hintDot, { backgroundColor: intensityHint.color }]} />
              <Text style={styles.hintText}>{intensityHint.txt}</Text>
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Equipment</Text>
            <Text style={styles.mutedSmall}>We’ll swap exercises automatically.</Text>

            <View style={styles.segment}>
              {['Home', 'Gym', 'Dumbbells'].map((k) => {
                const active = equipment === k;
                return (
                  <TouchableOpacity
                    key={k}
                    activeOpacity={0.9}
                    onPress={() => setEquipment(k)}
                    style={[
                      styles.segBtn,
                      active && { backgroundColor: 'rgba(66,232,214,0.16)', borderColor: 'rgba(66,232,214,0.35)' },
                    ]}
                  >
                    <Text style={[styles.segText, { color: active ? THEME.text : THEME.text2 }]}>{k}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Days list */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Days</Text>
              <Text style={styles.mutedSmall}>Tap to view session</Text>
            </View>

            <View style={{ marginTop: 10 }}>
              {plan.map((d, idx) => (
                <TouchableOpacity
                  key={d.day}
                  activeOpacity={0.9}
                  onPress={() => openSession(idx)}
                  style={styles.dayRow}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.dayTitle}>{d.day} • {d.title}</Text>
                      <Text style={styles.dayMin}>{d.minutes}m</Text>
                    </View>
                    <Text style={styles.daySub}>{d.focus}</Text>

                    <View style={{ marginTop: 10, gap: 8 }}>
                      {d.blocks.map((b) => (
                        <View key={b.name} style={styles.block}>
                          <Text style={styles.blockTitle}>{b.name}</Text>
                          {b.items.map((t, i) => (
                            <Text key={i} style={styles.blockItem}>• {t}</Text>
                          ))}
                          {!!b.note && <Text style={styles.blockNote}>{b.note}</Text>}
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.footer}>
            Tip: keep tempo clean first — weight comes second.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

function Pill({ label, value }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
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
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImg: { width: 20, height: 20, resizeMode: 'contain', tintColor: THEME.text },

  hTitle: { color: THEME.text, fontSize: 18, fontWeight: '900' },
  hSub: { color: THEME.text2, fontSize: 12, marginTop: 2 },

  content: { paddingHorizontal: 16, paddingBottom: 26 },

  card: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { color: THEME.text, fontSize: 16, fontWeight: '900' },
  muted: { color: THEME.text2, marginTop: 8, lineHeight: 18 },
  mutedSmall: { color: THEME.text2, marginTop: 6, fontSize: 12 },

  pillsRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  pill: {
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
  },
  pillLabel: { color: THEME.text2, fontSize: 11, fontWeight: '800' },
  pillValue: { color: THEME.text, fontSize: 13, fontWeight: '900', marginTop: 4 },

  segment: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  segBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segText: { fontWeight: '900', fontSize: 12 },

  hintBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  hintDot: { width: 10, height: 10, borderRadius: 99 },
  hintText: { color: THEME.text, fontWeight: '800', flex: 1, lineHeight: 18 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  dayRow: {
    backgroundColor: THEME.deep,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 14,
    marginBottom: 12,
  },
  dayTitle: { color: THEME.text, fontWeight: '900', fontSize: 13 },
  daySub: { color: THEME.text2, marginTop: 6, fontSize: 12 },
  dayMin: { color: THEME.text, fontWeight: '900' },

  block: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 12,
  },
  blockTitle: { color: THEME.text, fontWeight: '900', marginBottom: 6 },
  blockItem: { color: THEME.text2, lineHeight: 18 },
  blockNote: { color: THEME.text, marginTop: 8, fontWeight: '800', fontSize: 12 },

  footer: { color: THEME.text2, textAlign: 'center', marginTop: 6, marginBottom: 10 },
});

export default PlanDetailsScreen;
