

import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';

const BACK = require('../assets/back.png');
const BOLT = require('../assets/bolt.png');
const TRASH = require('../assets/trash.png');

const EDIT = require('../assets/edit.png');
const HEART = require('../assets/heart.png');
const FLAME = require('../assets/flame.png');
const CLOCK = require('../assets/clock.png');

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

const pad2 = (n) => String(n).padStart(2, '0');
const fmtSec = (sec) => `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function formatPretty(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function badgeStyle(type) {
  if (type === 'Strength') return { borderColor: 'rgba(66,232,214,0.35)', backgroundColor: 'rgba(66,232,214,0.10)' };
  if (type === 'HIIT') return { borderColor: 'rgba(245,158,11,0.35)', backgroundColor: 'rgba(245,158,11,0.10)' };
  if (type === 'Zone2') return { borderColor: 'rgba(16,185,129,0.35)', backgroundColor: 'rgba(16,185,129,0.10)' };
  return { borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.06)' };
}

function scoreStyle(score) {
  const s = clamp(score || 0, 0, 100);
  if (s >= 85) return { borderColor: 'rgba(16,185,129,0.45)', backgroundColor: 'rgba(16,185,129,0.12)' };
  if (s >= 70) return { borderColor: 'rgba(245,158,11,0.45)', backgroundColor: 'rgba(245,158,11,0.10)' };
  return { borderColor: 'rgba(239,68,68,0.45)', backgroundColor: 'rgba(239,68,68,0.10)' };
}

function demoWorkout() {
  return {
    id: 'demo',
    date: '2025-12-22',
    title: 'Strength + Tempo',
    type: 'Strength',
    minutes: 45,
    calories: 320,
    avgHR: 138,
    tempo: '3-1-1',
    tempoScore: 86,
    note: 'Clean tempo. Solid depth.',
    intervalProgram: {
      name: 'Strength Finisher',
      warmupSec: 180,
      workSec: 40,
      restSec: 80,
      rounds: 6,
      cooldownSec: 120,
      skipRestAfterLast: true,
    },
    metrics: {
      rpe: 8,
      steps: 4200,
      hydrationMl: 750,
    },
    exercises: [
      { name: 'Goblet Squat', sets: 4, reps: '10', restSec: 90, tempo: '3-1-1' },
      { name: 'Push-ups', sets: 4, reps: '12', restSec: 60, tempo: '2-1-1' },
      { name: 'Row (Band)', sets: 4, reps: '12', restSec: 60, tempo: '2-1-2' },
      { name: 'Plank', sets: 3, reps: '45s', restSec: 45, tempo: '—' },
    ],
  };
}

export default function WorkoutDetailsScreen({ navigation, route }) {
  const base = route?.params?.workout || demoWorkout();

  const [note, setNote] = useState(base.note || '');
  const [exercises, setExercises] = useState(base.exercises || []);
  const [adding, setAdding] = useState(false);

  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState(base.title || 'Workout');

  const totalSets = useMemo(() => exercises.reduce((s, x) => s + (Number(x.sets) || 0), 0), [exercises]);

  const estProgramSec = useMemo(() => {
    if (!base.intervalProgram) return 0;
    const p = base.intervalProgram;
    const rounds = p.rounds || 1;
    const work = (p.workSec || 0) * rounds;
    const rest = (p.restSec || 0) * (p.skipRestAfterLast ? Math.max(0, rounds - 1) : rounds);
    return (p.warmupSec || 0) + work + rest + (p.cooldownSec || 0);
  }, [base.intervalProgram]);

  const duplicateToTimer = (autoStart) => {
    if (!base.intervalProgram) {
      Alert.alert('No interval program', 'This workout does not have an interval program to duplicate.');
      return;
    }
    const payload = { intervalProgram: base.intervalProgram, autoStart: !!autoStart };
    const parent = navigation.getParent?.();
    if (parent?.navigate) parent.navigate('Timer', payload);
    else navigation.navigate('Timer', payload);
  };

  const deleteWorkout = () => {
    Alert.alert('Delete workout?', 'This will remove the workout from history (demo action).', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => navigation?.goBack?.() },
    ]);
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { name: 'New exercise', sets: 3, reps: '10', restSec: 60, tempo: '—' },
    ]);
    setAdding(false);
  };

  const updateExercise = (idx, patch) => {
    setExercises((prev) => prev.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const removeExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation?.goBack?.()} style={styles.iconBtn}>
            <Image source={BACK} style={styles.iconImg} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.hTitle}>Workout Details</Text>
            <Text style={styles.hSub}>{formatPretty(base.date)}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={deleteWorkout} style={styles.iconBtn}>
            <Image source={TRASH} style={styles.iconImg} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero / Summary */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  {editTitle ? (
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Workout title…"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      style={styles.titleInput}
                      maxLength={40}
                    />
                  ) : (
                    <Text style={styles.title}>{title}</Text>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setEditTitle((v) => !v)}
                    style={styles.smallIconBtn}
                  >
                    <Image source={EDIT} style={styles.smallIcon} />
                  </TouchableOpacity>
                </View>

                <View style={styles.metaRow}>
                  <MetaPill icon={CLOCK} text={`${base.minutes} min`} />
                  <MetaPill icon={FLAME} text={`${base.calories} kcal`} />
                  <MetaPill icon={HEART} text={`Avg HR ${base.avgHR}`} />
                </View>

                <Text style={styles.subtitle}>
                  {base.type} • Tempo {base.tempo || '—'} • Total Sets {totalSets}
                </Text>
              </View>

              <View style={[styles.badge, badgeStyle(base.type)]}>
                <Text style={styles.badgeText}>{base.type}</Text>
              </View>
            </View>

            <View style={styles.kpis}>
              <KpiBox label="Tempo Score" value={`${base.tempoScore || 0}%`} accent />
              <KpiBox label="Tempo" value={base.tempo || '—'} />
              <KpiBox label="Total Sets" value={`${totalSets}`} />
            </View>

            <View style={[styles.scoreBox, scoreStyle(base.tempoScore)]}>
              <Text style={styles.scoreText}>{base.tempoScore || 0}%</Text>
              <Text style={styles.scoreLabel}>Control & consistency</Text>
            </View>
          </View>

          {/* Optional metrics */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Metrics</Text>
            <View style={styles.metricsRow}>
              <MetricChip label="RPE" value={base.metrics?.rpe ? `${base.metrics.rpe}/10` : '—'} />
              <MetricChip label="Steps" value={base.metrics?.steps ? `${base.metrics.steps}` : '—'} />
              <MetricChip label="Hydration" value={base.metrics?.hydrationMl ? `${base.metrics.hydrationMl} ml` : '—'} />
            </View>
            <Text style={styles.tip}>RPE = perceived effort. Higher isn’t always better — keep quality reps.</Text>
          </View>

          {/* Interval program (optional) */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Interval Program</Text>
              <Text style={styles.mutedSmall}>{base.intervalProgram ? 'Available' : 'Not set'}</Text>
            </View>

            {base.intervalProgram ? (
              <>
                <View style={styles.programBox}>
                  <Text style={styles.programName}>{base.intervalProgram.name}</Text>
                  <Text style={styles.programSub}>
                    Warm {base.intervalProgram.warmupSec}s • {base.intervalProgram.rounds}×({base.intervalProgram.workSec}/{base.intervalProgram.restSec})
                    • Cool {base.intervalProgram.cooldownSec}s
                  </Text>

                  <View style={styles.programTime}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Image source={CLOCK} style={styles.miniIcon} />
                      <Text style={styles.programTimeBig}>{fmtSec(estProgramSec)}</Text>
                    </View>
                    <Text style={styles.programTimeSmall}>Estimated duration</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => duplicateToTimer(false)} style={styles.btnGhostIcon}>
                    <Image source={BOLT} style={styles.actionIconGhost} />
                    <Text style={styles.btnGhostText}>Send to Timer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.9} onPress={() => duplicateToTimer(true)} style={styles.btnPrimaryIcon}>
                    <Image source={BOLT} style={styles.actionIcon} />
                    <Text style={styles.btnPrimaryText}>Send & Start</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No interval program</Text>
                <Text style={styles.emptySub}>This session was logged as a regular workout.</Text>
              </View>
            )}
          </View>

          {/* Exercises */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Exercises</Text>
              <TouchableOpacity activeOpacity={0.9} onPress={() => setAdding(true)} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {exercises.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>No exercises</Text>
                  <Text style={styles.emptySub}>Add a few movements to make this workout reusable.</Text>
                </View>
              ) : (
                exercises.map((ex, idx) => (
                  <View key={`${ex.name}-${idx}`} style={styles.exerciseCard}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <TouchableOpacity activeOpacity={0.9} onPress={() => removeExercise(idx)} style={styles.removeBtn}>
                        <Image source={TRASH} style={styles.removeIcon} />
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.exerciseGrid}>
                      <EditField label="Sets" value={`${ex.sets}`} onChange={(t) => updateExercise(idx, { sets: t.replace(/[^\d]/g, '') })} width="33%" />
                      <EditField label="Reps" value={`${ex.reps}`} onChange={(t) => updateExercise(idx, { reps: t })} width="33%" />
                      <EditField
                        label="Rest (sec)"
                        value={`${ex.restSec}`}
                        onChange={(t) => updateExercise(idx, { restSec: t.replace(/[^\d]/g, '') })}
                        width="33%"
                      />
                      <EditField label="Tempo" value={`${ex.tempo}`} onChange={(t) => updateExercise(idx, { tempo: t })} width="100%" />
                    </View>
                  </View>
                ))
              )}
            </View>

            {adding && (
              <TouchableOpacity activeOpacity={0.9} onPress={addExercise} style={[styles.btnPrimaryIcon, { marginTop: 12 }]}>
                <Image source={BOLT} style={styles.actionIcon} />
                <Text style={styles.btnPrimaryText}>Add Exercise</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Notes</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => Alert.alert('Saved (demo)', 'Notes saved locally for this screen session.')}
                  style={styles.iconPill}
                >
                  <Image source={BOLT} style={styles.pillIcon} />
                  <Text style={styles.pillText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} onPress={() => setNote('')} style={styles.iconPill}>
                  <Image source={TRASH} style={styles.pillIcon} />
                  <Text style={styles.pillText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.muted}>What felt good? What should you improve next time?</Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Write your notes…"
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              style={styles.noteInput}
            />
          </View>

          <Text style={styles.footer}>RaimfortActionSport • details create progress.</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function MetaPill({ icon, text }) {
  return (
    <View style={styles.metaPill}>
      <Image source={icon} style={styles.metaIcon} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function KpiBox({ label, value, accent }) {
  return (
    <View style={[styles.kpiBox, accent && { borderColor: 'rgba(66,232,214,0.35)', backgroundColor: 'rgba(66,232,214,0.08)' }]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, accent && { color: THEME.accent }]}>{value}</Text>
    </View>
  );
}

function MetricChip({ label, value }) {
  return (
    <View style={styles.metricChip}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function EditField({ label, value, onChange, width }) {
  return (
    <View style={[styles.field, { width }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="—"
        placeholderTextColor="rgba(255,255,255,0.35)"
        style={styles.fieldInput}
      />
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

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: THEME.text, fontSize: 16, fontWeight: '900' },
  titleInput: {
    flex: 1,
    color: THEME.text,
    fontWeight: '900',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  smallIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIcon: { width: 18, height: 18, resizeMode: 'contain', tintColor: THEME.text },

  metaRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
  },
  metaIcon: { width: 16, height: 16, resizeMode: 'contain', tintColor: THEME.text2 },
  metaText: { color: THEME.text, fontWeight: '900', fontSize: 12 },

  subtitle: { color: THEME.text2, marginTop: 10, lineHeight: 18 },

  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  badgeText: { color: THEME.text, fontWeight: '900', fontSize: 11 },

  kpis: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  kpiBox: {
    flex: 1,
    minWidth: 110,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 12,
  },
  kpiLabel: { color: THEME.text2, fontWeight: '800', fontSize: 11 },
  kpiValue: { color: THEME.text, fontWeight: '900', fontSize: 14, marginTop: 6 },

  scoreBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    backgroundColor: THEME.deep,
  },
  scoreText: { color: THEME.text, fontWeight: '900', fontSize: 18 },
  scoreLabel: { color: THEME.text2, marginTop: 4, fontWeight: '800' },

  cardTitle: { color: THEME.text, fontSize: 16, fontWeight: '900' },
  muted: { color: THEME.text2, marginTop: 8, lineHeight: 18 },
  mutedSmall: { color: THEME.text2, fontSize: 12, fontWeight: '800' },

  metricsRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  metricChip: {
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: { color: THEME.text2, fontWeight: '800', fontSize: 11 },
  metricValue: { color: THEME.text, fontWeight: '900' },

  programBox: {
    marginTop: 10,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 12,
  },
  programName: { color: THEME.text, fontWeight: '900' },
  programSub: { color: THEME.text2, marginTop: 6, lineHeight: 18 },

  programTime: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(66,232,214,0.25)',
    backgroundColor: 'rgba(66,232,214,0.08)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  programTimeBig: { color: THEME.text, fontWeight: '900', fontSize: 22 },
  programTimeSmall: { color: THEME.text2, marginTop: 4, fontWeight: '800' },

  miniIcon: { width: 16, height: 16, resizeMode: 'contain', tintColor: THEME.text2 },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },

  btnPrimaryIcon: {
    flex: 1,
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimaryText: { color: THEME.bg, fontWeight: '900', textAlign: 'center' },

  btnGhostIcon: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  btnGhostText: { color: THEME.text, fontWeight: '900', textAlign: 'center' },

  actionIcon: { width: 18, height: 18, resizeMode: 'contain', tintColor: THEME.bg },
  actionIconGhost: { width: 18, height: 18, resizeMode: 'contain', tintColor: THEME.text },

  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(66,232,214,0.25)',
    backgroundColor: 'rgba(66,232,214,0.10)',
  },
  smallBtnText: { color: THEME.accent, fontWeight: '900' },

  exerciseCard: {
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  exerciseName: { color: THEME.text, fontWeight: '900' },

  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeIcon: { width: 14, height: 14, resizeMode: 'contain', tintColor: THEME.text2 },
  removeText: { color: THEME.text2, fontWeight: '900', fontSize: 12 },

  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  field: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    padding: 10,
  },
  fieldLabel: { color: THEME.text2, fontWeight: '800', fontSize: 11 },
  fieldInput: {
    marginTop: 6,
    color: THEME.text,
    fontWeight: '900',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  iconPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillIcon: { width: 14, height: 14, resizeMode: 'contain', tintColor: THEME.text },
  pillText: { color: THEME.text, fontWeight: '900', fontSize: 12 },

  noteInput: {
    marginTop: 10,
    minHeight: 120,
    color: THEME.text,
    fontWeight: '800',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
    textAlignVertical: 'top',
  },

  empty: {
    marginTop: 10,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  emptyTitle: { color: THEME.text, fontWeight: '900' },
  emptySub: { color: THEME.text2, marginTop: 6, textAlign: 'center' },

  tip: { color: THEME.text2, marginTop: 12, lineHeight: 18 },

  footer: { color: THEME.text2, textAlign: 'center', marginTop: 6 },
});
