// Components/SessionScreen.js — RaimfortActionSport (session view + tempo/rest timers + simple checkmarks)

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';

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
  bad: '#EF4444',
};

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function pad2(n) {
  return String(n).padStart(2, '0');
}
function fmtSec(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

export default function SessionScreen({ navigation, route }) {
  const dayIndex = route?.params?.dayIndex ?? 0;
  const intensity = route?.params?.intensity ?? 'Normal';
  const equipment = route?.params?.equipment ?? 'Gym';

  const session = useMemo(() => buildSession(dayIndex, intensity, equipment), [dayIndex, intensity, equipment]);

  // checkmarks
  const [done, setDone] = useState(() => session.blocks.map(b => b.items.map(() => false)));

  useEffect(() => {
    setDone(session.blocks.map(b => b.items.map(() => false)));
  }, [session]);

  const toggleItem = (bi, ii) => {
    setDone(prev => {
      const next = prev.map(arr => [...arr]);
      next[bi][ii] = !next[bi][ii];
      return next;
    });
  };

  // timers
  const [tempoOpen, setTempoOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);

  // tempo (metronome-ish): ticks per rep count
  const [tempoPattern, setTempoPattern] = useState(session.tempo || '3-1-1'); // e.g. 3-1-1
  const [repSeconds, setRepSeconds] = useState(4); // computed from pattern
  const [repCount, setRepCount] = useState(8);
  const [ticksLeft, setTicksLeft] = useState(0);
  const [tempoRunning, setTempoRunning] = useState(false);
  const tempoRef = useRef(null);

  // rest timer
  const [restTotal, setRestTotal] = useState(session.restSec ?? 90);
  const [restLeft, setRestLeft] = useState(session.restSec ?? 90);
  const [restRunning, setRestRunning] = useState(false);
  const restRef = useRef(null);

  useEffect(() => {
    // update pattern -> repSeconds
    const secs = parseTempoToSeconds(tempoPattern);
    setRepSeconds(secs);
  }, [tempoPattern]);

  useEffect(() => {
    // cleanup
    return () => {
      if (tempoRef.current) clearInterval(tempoRef.current);
      if (restRef.current) clearInterval(restRef.current);
    };
  }, []);

  // tempo start/stop
  const startTempo = () => {
    const totalTicks = repSeconds * clamp(repCount, 1, 50);
    setTicksLeft(totalTicks);
    setTempoRunning(true);

    if (tempoRef.current) clearInterval(tempoRef.current);
    tempoRef.current = setInterval(() => {
      setTicksLeft(t => {
        if (t <= 1) {
          clearInterval(tempoRef.current);
          tempoRef.current = null;
          setTempoRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const stopTempo = () => {
    setTempoRunning(false);
    setTicksLeft(0);
    if (tempoRef.current) {
      clearInterval(tempoRef.current);
      tempoRef.current = null;
    }
  };

  // rest start/stop
  const startRest = (sec = restTotal) => {
    setRestTotal(sec);
    setRestLeft(sec);
    setRestRunning(true);

    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestLeft(t => {
        if (t <= 1) {
          clearInterval(restRef.current);
          restRef.current = null;
          setRestRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const stopRest = () => {
    setRestRunning(false);
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
  };

  const doneCount = useMemo(() => {
    let d = 0;
    let all = 0;
    done.forEach(b => {
      b.forEach(x => {
        all += 1;
        if (x) d += 1;
      });
    });
    return { d, all };
  }, [done]);

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
            <Text style={styles.hTitle}>{session.day} • {session.title}</Text>
            <Text style={styles.hSub}>
              {intensity} • {equipment} • {session.minutes}m
            </Text>
          </View>

          <View style={styles.progressPill}>
            <Text style={styles.progressTxt}>{doneCount.d}/{doneCount.all}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Focus */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Focus</Text>
            <Text style={styles.muted}>{session.focus}</Text>

            <View style={styles.infoRow}>
              <InfoChip label="Tempo" value={session.tempo} />
              <InfoChip label="Rest" value={session.restLabel} />
              <InfoChip label="RPE" value={session.rpe} />
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity activeOpacity={0.88} onPress={() => setTempoOpen(true)} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Tempo Timer</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.88} onPress={() => setRestOpen(true)} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>Rest Timer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Blocks */}
          {session.blocks.map((block, bi) => (
            <View key={block.name} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{block.name}</Text>
                {!!block.note && <Text style={styles.note}>{block.note}</Text>}
              </View>

              <View style={{ marginTop: 10, gap: 10 }}>
                {block.items.map((it, ii) => {
                  const checked = !!done?.[bi]?.[ii];
                  return (
                    <TouchableOpacity
                      key={`${bi}-${ii}`}
                      activeOpacity={0.9}
                      onPress={() => toggleItem(bi, ii)}
                      style={[
                        styles.itemRow,
                        checked && { borderColor: 'rgba(16,185,129,0.55)', backgroundColor: 'rgba(16,185,129,0.10)' },
                      ]}
                    >
                      <View style={[styles.check, checked && { backgroundColor: THEME.good, borderColor: THEME.good }]}>
                        <Text style={[styles.checkTxt, checked && { color: THEME.bg }]}>✓</Text>
                      </View>

                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[styles.itemTxt, checked && { color: THEME.text }]}>{it.main}</Text>
                        {!!it.sub && <Text style={styles.itemSub}>{it.sub}</Text>}
                      </View>

                      {it.tag ? (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{it.tag}</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.blockFooter}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => startRest(session.restSec)}
                  style={styles.smallBtn}
                >
                  <Text style={styles.smallBtnText}>Start Rest</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setTempoOpen(true)}
                  style={[styles.smallBtn, { borderColor: 'rgba(66,232,214,0.35)' }]}
                >
                  <Text style={[styles.smallBtnText, { color: THEME.accent }]}>Tempo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <Text style={styles.footer}>Finish clean. Log it later in History.</Text>
        </ScrollView>

        {/* Tempo Modal */}
        <Modal visible={tempoOpen} transparent animationType="fade" onRequestClose={() => setTempoOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setTempoOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Tempo Timer</Text>
              <Text style={styles.modalHint}>Counts seconds per rep using your tempo pattern.</Text>

              <View style={styles.modalGrid}>
                <MiniField label="Tempo (e.g. 3-1-1)" value={tempoPattern} onDec={() => setTempoPattern(prev => stepTempo(prev, -1))} onInc={() => setTempoPattern(prev => stepTempo(prev, +1))} />
                <MiniField label="Reps" value={repCount} onDec={() => setRepCount(v => clamp(v - 1, 1, 50))} onInc={() => setRepCount(v => clamp(v + 1, 1, 50))} />
              </View>

              <View style={[styles.timerBox, { borderColor: 'rgba(66,232,214,0.35)' }]}>
                <Text style={styles.timerBig}>{tempoRunning ? fmtSec(ticksLeft) : `${repSeconds}s/rep`}</Text>
                <Text style={styles.timerSmall}>
                  Pattern {tempoPattern} • Total {repSeconds * clamp(repCount, 1, 50)}s
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={tempoRunning ? stopTempo : startTempo}
                  style={[styles.btnPrimary, { minWidth: 120 }]}
                >
                  <Text style={styles.btnPrimaryText}>{tempoRunning ? 'Stop' : 'Start'}</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} onPress={() => setTempoOpen(false)} style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Rest Modal */}
        <Modal visible={restOpen} transparent animationType="fade" onRequestClose={() => setRestOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setRestOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Rest Timer</Text>
              <Text style={styles.modalHint}>Quick rest presets + custom seconds.</Text>

              <View style={styles.presetRow}>
                {[45, 60, 90, 120].map((sec) => (
                  <TouchableOpacity key={sec} activeOpacity={0.9} onPress={() => startRest(sec)} style={styles.presetBtn}>
                    <Text style={styles.presetTxt}>{sec}s</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.timerBox, { borderColor: 'rgba(255,255,255,0.10)' }]}>
                <Text style={styles.timerBig}>{fmtSec(restLeft)}</Text>
                <Text style={styles.timerSmall}>Default for today: {session.restLabel}</Text>
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={restRunning ? stopRest : () => startRest(restTotal)}
                  style={[styles.btnPrimary, { minWidth: 120 }]}
                >
                  <Text style={styles.btnPrimaryText}>{restRunning ? 'Pause' : 'Start'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    stopRest();
                    setRestLeft(restTotal);
                  }}
                  style={styles.btnGhost}
                >
                  <Text style={styles.btnGhostText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} onPress={() => setRestOpen(false)} style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

/* ----------------- helpers ----------------- */

function parseTempoToSeconds(pattern) {
  // "3-1-1" -> 5 seconds/rep (минимум 2)
  const parts = String(pattern)
    .split('-')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isFinite(n) && n >= 0);

  const sum = parts.reduce((a, b) => a + b, 0);
  return clamp(sum || 4, 2, 12);
}

// простая смена темпа кнопками (чтобы не вводить текст)
function stepTempo(pattern, dir) {
  const p = String(pattern).split('-').map(x => parseInt(x, 10));
  let a = Number.isFinite(p[0]) ? p[0] : 3;
  let b = Number.isFinite(p[1]) ? p[1] : 1;
  let c = Number.isFinite(p[2]) ? p[2] : 1;

  // меняем первую фазу (эксцентрика) — самая “tempo”
  a = clamp(a + dir, 1, 6);
  return `${a}-${b}-${c}`;
}

function buildSession(dayIndex, intensity, equipment) {
  const eq = {
    Gym: {
      squat: 'Back Squat',
      push: 'Bench Press',
      pull: 'Lat Pulldown',
      hinge: 'Romanian Deadlift',
      row: 'Seated Row',
      core: 'Hollow Hold',
    },
    Home: {
      squat: 'Goblet Squat (Backpack)',
      push: 'Push-ups',
      pull: 'Band Row / Door Row',
      hinge: 'Hip Hinge (Backpack)',
      row: 'Band Row',
      core: 'Plank',
    },
    Dumbbells: {
      squat: 'DB Front Squat',
      push: 'DB Floor Press',
      pull: '1-Arm DB Row',
      hinge: 'DB RDL',
      row: '1-Arm DB Row',
      core: 'Dead Bug',
    },
  }[equipment] || {
    squat: 'Back Squat',
    push: 'Bench Press',
    pull: 'Lat Pulldown',
    hinge: 'Romanian Deadlift',
    row: 'Seated Row',
    core: 'Hollow Hold',
  };

  const mainSets = intensity === 'Push' ? 4 : intensity === 'Light' ? 3 : 3;
  const accSets = intensity === 'Push' ? 3 : intensity === 'Light' ? 2 : 3;

  const restSec = intensity === 'Push' ? 120 : intensity === 'Light' ? 75 : 90;
  const restLabel = intensity === 'Push' ? '90–120s' : intensity === 'Light' ? '60–75s' : '75–90s';
  const rpe = intensity === 'Push' ? '8' : intensity === 'Light' ? '6' : '7';

  const sessions = [
    {
      day: 'Day 1',
      title: 'Strength + Tempo',
      minutes: intensity === 'Push' ? 50 : intensity === 'Light' ? 38 : 45,
      focus: 'Squat / Push / Core',
      tempo: '3-1-1',
      restSec,
      restLabel,
      rpe,
      blocks: [
        {
          name: 'Main',
          note: `Tempo 3-1-1 • Rest ${restLabel}`,
          items: [
            { main: `${eq.squat} — ${mainSets}×6`, sub: 'Focus on depth + control', tag: 'Main' },
            { main: `${eq.push} — ${mainSets}×6`, sub: 'Pause 1s at bottom', tag: 'Main' },
          ],
        },
        {
          name: 'Accessory',
          note: 'Rest 45–60s',
          items: [
            { main: `${eq.pull} — ${accSets}×10`, sub: 'Full stretch each rep', tag: 'Acc' },
            { main: `${eq.core} — 3×30–45s`, sub: 'Brace + breathe', tag: 'Core' },
          ],
        },
      ],
    },
    {
      day: 'Day 2',
      title: 'Cardio Intervals',
      minutes: intensity === 'Push' ? 28 : intensity === 'Light' ? 22 : 25,
      focus: 'HIIT + breathing finish',
      tempo: '2-1-1',
      restSec: 60,
      restLabel: '60s',
      rpe: intensity === 'Push' ? '8' : intensity === 'Light' ? '6' : '7',
      blocks: [
        {
          name: 'Warm-up',
          note: 'Easy pace',
          items: [{ main: '5 min easy', sub: 'Nose breathing if possible', tag: 'Warm' }],
        },
        {
          name: 'Intervals',
          note: '10 rounds',
          items: [
            { main: '30s hard + 60s easy ×10', sub: 'Keep form, don’t sprint sloppy', tag: 'HIIT' },
            { main: '2 min slow breathing', sub: '4-4-4-4 box breathing', tag: 'Breath' },
          ],
        },
      ],
    },
    {
      day: 'Day 3',
      title: 'Pull + Mobility',
      minutes: intensity === 'Push' ? 45 : intensity === 'Light' ? 35 : 40,
      focus: 'Hinge / Row / Stretch',
      tempo: '2-1-2',
      restSec,
      restLabel,
      rpe,
      blocks: [
        {
          name: 'Main',
          note: `Rest ${restLabel}`,
          items: [
            { main: `${eq.hinge} — ${mainSets}×8`, sub: 'Hips back, neutral spine', tag: 'Main' },
            { main: `${eq.row} — ${mainSets}×10`, sub: 'Pause 1s at top', tag: 'Main' },
          ],
        },
        {
          name: 'Mobility',
          note: 'Slow & controlled',
          items: [
            { main: 'Hip mobility — 6 min', sub: '90/90 + couch stretch', tag: 'Mob' },
            { main: 'Thoracic mobility — 4 min', sub: 'Open books + rotations', tag: 'Mob' },
          ],
        },
      ],
    },
    {
      day: 'Day 4',
      title: 'Zone 2',
      minutes: intensity === 'Push' ? 38 : intensity === 'Light' ? 30 : 35,
      focus: 'Endurance base',
      tempo: '2-1-1',
      restSec: 0,
      restLabel: '—',
      rpe: '5',
      blocks: [
        {
          name: 'Main',
          note: 'Talk test: you can speak short sentences',
          items: [{ main: 'Zone 2 steady — 30 min', sub: 'Keep it easy, consistent', tag: 'Z2' }],
        },
        {
          name: 'Cool-down',
          note: '',
          items: [{ main: 'Walk — 5 min', sub: 'Lower HR smoothly', tag: 'Cool' }],
        },
      ],
    },
    {
      day: 'Day 5',
      title: 'Full Body',
      minutes: intensity === 'Push' ? 55 : intensity === 'Light' ? 42 : 50,
      focus: 'Compound + finisher',
      tempo: '2-1-1',
      restSec,
      restLabel,
      rpe,
      blocks: [
        {
          name: 'Main',
          note: `Rest ${restLabel}`,
          items: [
            { main: `${eq.squat} — ${mainSets}×5`, sub: 'Explode up, control down', tag: 'Main' },
            { main: `${eq.hinge} — ${mainSets}×6`, sub: 'Tight core, slow eccentric', tag: 'Main' },
            { main: `${eq.pull} — ${mainSets}×8`, sub: 'Don’t swing', tag: 'Main' },
          ],
        },
        {
          name: 'Finisher',
          note: '8 min',
          items: [
            { main: 'EMOM 8: 8 push-ups + 10 air squats', sub: 'Scale reps if form breaks', tag: 'EMOM' },
          ],
        },
      ],
    },
  ];

  return sessions[clamp(dayIndex, 0, sessions.length - 1)];
}

/* ----------------- UI components ----------------- */

function InfoChip({ label, value }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function MiniField({ label, value, onDec, onInc }) {
  return (
    <View style={styles.miniField}>
      <Text style={styles.miniLabel}>{label}</Text>
      <View style={styles.miniRow}>
        <TouchableOpacity activeOpacity={0.9} onPress={onDec} style={styles.stepBtn}>
          <Text style={styles.stepTxt}>−</Text>
        </TouchableOpacity>
        <View style={styles.valueBox}>
          <Text style={styles.valueTxt}>{value}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={onInc} style={styles.stepBtn}>
          <Text style={styles.stepTxt}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ----------------- styles ----------------- */

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
  hTitle: { color: THEME.text, fontSize: 14, fontWeight: '900' },
  hSub: { color: THEME.text2, fontSize: 12, marginTop: 2 },

  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(66,232,214,0.35)',
    backgroundColor: 'rgba(66,232,214,0.10)',
  },
  progressTxt: { color: THEME.accent, fontWeight: '900' },

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

  infoRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  chip: {
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 110,
  },
  chipLabel: { color: THEME.text2, fontSize: 11, fontWeight: '800' },
  chipValue: { color: THEME.text, fontSize: 13, fontWeight: '900', marginTop: 4 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },

  btnPrimary: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  btnPrimaryText: { color: THEME.bg, fontWeight: '900', fontSize: 13 },

  btnGhost: {
    borderWidth: 1,
    borderColor: THEME.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  btnGhostText: { color: THEME.text, fontWeight: '800', fontSize: 13 },

  note: { color: THEME.text2, fontWeight: '800', fontSize: 12 },

  itemRow: {
    backgroundColor: THEME.deep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  checkTxt: { color: THEME.text2, fontWeight: '900' },
  itemTxt: { color: THEME.text, fontWeight: '900', fontSize: 13 },
  itemSub: { color: THEME.text2, fontSize: 12, lineHeight: 16 },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tagText: { color: THEME.text2, fontWeight: '800', fontSize: 11 },

  blockFooter: { flexDirection: 'row', gap: 10, marginTop: 12 },
  smallBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  smallBtnText: { color: THEME.text, fontWeight: '900' },

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
    maxWidth: 560,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 14,
  },
  modalTitle: { color: THEME.text, fontSize: 16, fontWeight: '900' },
  modalHint: { color: THEME.text2, marginTop: 6, marginBottom: 10 },

  modalGrid: { flexDirection: 'row', gap: 10 },
  miniField: {
    flex: 1,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 16,
    padding: 12,
  },
  miniLabel: { color: THEME.text2, fontWeight: '800', fontSize: 11 },
  miniRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },

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
  stepTxt: { color: THEME.text, fontSize: 18, fontWeight: '900' },

  valueBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTxt: { color: THEME.text, fontWeight: '900' },

  timerBox: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: THEME.deep,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBig: { color: THEME.text, fontWeight: '900', fontSize: 34 },
  timerSmall: { color: THEME.text2, marginTop: 6, fontWeight: '800', textAlign: 'center' },

  presetRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  presetBtn: {
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  presetTxt: { color: THEME.text, fontWeight: '900' },
});
