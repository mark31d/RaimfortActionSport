// Components/IntervalBuilderScreen.js — RaimfortActionSport (FULL, English, sends program to Timer)

import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
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

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const pad2 = (n) => String(n).padStart(2, '0');
const fmtSec = (sec) => `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;

export default function IntervalBuilderScreen({ navigation }) {
  // Builder state
  const [name, setName] = useState('My Intervals');
  const [warmupSec, setWarmupSec] = useState(300);
  const [workSec, setWorkSec] = useState(30);
  const [restSec, setRestSec] = useState(60);
  const [rounds, setRounds] = useState(10);
  const [cooldownSec, setCooldownSec] = useState(120);

  const [skipRestAfterLast, setSkipRestAfterLast] = useState(true);

  // local presets (in-memory)
  const [userPresets, setUserPresets] = useState([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  const presets = useMemo(
    () => [
      {
        title: 'Classic HIIT',
        program: { name: 'Classic HIIT', warmupSec: 300, workSec: 30, restSec: 60, rounds: 10, cooldownSec: 120, skipRestAfterLast: true },
        tag: 'Easy to follow',
      },
      {
        title: 'Tabata',
        program: { name: 'Tabata', warmupSec: 180, workSec: 20, restSec: 10, rounds: 8, cooldownSec: 120, skipRestAfterLast: true },
        tag: 'Fast',
      },
      {
        title: 'Sprint Builder',
        program: { name: 'Sprints', warmupSec: 300, workSec: 15, restSec: 75, rounds: 10, cooldownSec: 180, skipRestAfterLast: true },
        tag: 'Hard',
      },
      {
        title: 'Endurance Intervals',
        program: { name: 'Endurance', warmupSec: 300, workSec: 60, restSec: 30, rounds: 8, cooldownSec: 180, skipRestAfterLast: true },
        tag: 'Steady',
      },
    ],
    []
  );

  const program = useMemo(() => {
    return {
      name: name?.trim() ? name.trim() : 'My Intervals',
      warmupSec: clamp(warmupSec, 0, 1800),
      workSec: clamp(workSec, 5, 3600),
      restSec: clamp(restSec, 0, 3600),
      rounds: clamp(rounds, 1, 99),
      cooldownSec: clamp(cooldownSec, 0, 1800),
      skipRestAfterLast: !!skipRestAfterLast,
    };
  }, [name, warmupSec, workSec, restSec, rounds, cooldownSec, skipRestAfterLast]);

  const totalSec = useMemo(() => {
    const main = program.rounds * program.workSec + (program.rounds - 1 + (program.skipRestAfterLast ? 0 : 1)) * program.restSec;
    return program.warmupSec + main + program.cooldownSec;
  }, [program]);

  const timeline = useMemo(() => {
    const items = [];
    if (program.warmupSec > 0) items.push({ label: 'Warm-up', sec: program.warmupSec, type: 'warm' });

    for (let r = 1; r <= program.rounds; r++) {
      items.push({ label: `Round ${r} • Work`, sec: program.workSec, type: 'work' });
      const needRest = r < program.rounds ? program.restSec > 0 : (!program.skipRestAfterLast && program.restSec > 0);
      if (needRest) items.push({ label: `Round ${r} • Rest`, sec: program.restSec, type: 'rest' });
    }

    if (program.cooldownSec > 0) items.push({ label: 'Cool-down', sec: program.cooldownSec, type: 'cool' });
    return items;
  }, [program]);

  const applyProgram = (p) => {
    setName(p.name ?? 'My Intervals');
    setWarmupSec(p.warmupSec ?? 0);
    setWorkSec(p.workSec ?? 30);
    setRestSec(p.restSec ?? 60);
    setRounds(p.rounds ?? 10);
    setCooldownSec(p.cooldownSec ?? 0);
    setSkipRestAfterLast(p.skipRestAfterLast ?? true);
  };

  const sendToTimer = (autoStart) => {
    const payload = { intervalProgram: program, autoStart: !!autoStart };

    // If Timer is a TAB route, often it lives in parent navigator
    const parent = navigation.getParent?.();
    if (parent?.navigate) parent.navigate('Timer', payload);
    else navigation.navigate('Timer', payload);

    // go back if IntervalBuilder is in a stack
    navigation.goBack?.();
  };

  const openSave = () => {
    setSaveTitle(program.name);
    setSaveOpen(true);
  };

  const savePreset = () => {
    const title = (saveTitle || '').trim() || 'My Preset';
    const newPreset = { id: `${Date.now()}`, title, program: { ...program, name: title } };
    setUserPresets((prev) => [newPreset, ...prev]);
    setSaveOpen(false);
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
            <Text style={styles.hTitle}>Interval Builder</Text>
            <Text style={styles.hSub}>Build a program and send it to Timer</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={openSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Presets */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Presets</Text>
              <Text style={styles.mutedSmall}>Tap to apply</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {presets.map((p) => (
                <TouchableOpacity
                  key={p.title}
                  activeOpacity={0.9}
                  onPress={() => applyProgram(p.program)}
                  style={styles.presetRow}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.presetTitle}>{p.title}</Text>
                    <Text style={styles.presetSub}>
                      Warm {p.program.warmupSec}s • {p.program.rounds}×({p.program.workSec}/{p.program.restSec}) • Cool {p.program.cooldownSec}s
                    </Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{p.tag}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {userPresets.length > 0 && (
                <>
                  <Text style={[styles.cardTitle, { marginTop: 10 }]}>Saved</Text>
                  {userPresets.map((p) => (
                    <TouchableOpacity key={p.id} activeOpacity={0.9} onPress={() => applyProgram(p.program)} style={styles.presetRow}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.presetTitle}>{p.title}</Text>
                        <Text style={styles.presetSub}>
                          Warm {p.program.warmupSec}s • {p.program.rounds}×({p.program.workSec}/{p.program.restSec}) • Cool {p.program.cooldownSec}s
                        </Text>
                      </View>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Saved</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          </View>

          {/* Builder */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Custom program</Text>
            <Text style={styles.muted}>Adjust values and preview your full timeline.</Text>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Program name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="My Intervals"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
                maxLength={32}
              />
            </View>

            <StepRow label="Warm-up (sec)" value={warmupSec} step={30} min={0} max={1800} onChange={setWarmupSec} />
            <StepRow label="Work (sec)" value={workSec} step={5} min={5} max={3600} onChange={setWorkSec} />
            <StepRow label="Rest (sec)" value={restSec} step={5} min={0} max={3600} onChange={setRestSec} />
            <StepRow label="Rounds" value={rounds} step={1} min={1} max={99} onChange={setRounds} />
            <StepRow label="Cool-down (sec)" value={cooldownSec} step={30} min={0} max={1800} onChange={setCooldownSec} />

            <ToggleRow
              label="Skip rest after last round"
              value={skipRestAfterLast}
              onToggle={() => setSkipRestAfterLast((v) => !v)}
            />

            <View style={[styles.preview, { borderColor: 'rgba(66,232,214,0.35)' }]}>
              <Text style={styles.previewBig}>{fmtSec(totalSec)}</Text>
              <Text style={styles.previewSmall}>
                Total duration • Warm {warmupSec}s • Work {workSec}s • Rest {restSec}s • Rounds {rounds} • Cool {cooldownSec}s
              </Text>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => sendToTimer(false)} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>Send to Timer</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={() => sendToTimer(true)} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Send & Auto-Start</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Timeline preview */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Timeline</Text>
              <Text style={styles.mutedSmall}>{timeline.length} steps</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {timeline.map((t, idx) => (
                <View key={idx} style={styles.timeRow}>
                  <View style={[styles.dot, dotStyle(t.type)]} />
                  <Text style={styles.timeLabel}>{t.label}</Text>
                  <Text style={styles.timeSec}>{fmtSec(t.sec)}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.tip}>
              Tip: for “tempo strength days”, try 30/60 × 8–12 rounds. For quick finishers: Tabata 20/10 × 8.
            </Text>
          </View>
        </ScrollView>

        {/* Save modal */}
        <Modal visible={saveOpen} transparent animationType="fade" onRequestClose={() => setSaveOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setSaveOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Save preset</Text>
              <Text style={styles.modalHint}>Name your preset and save it for quick reuse.</Text>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Preset name</Text>
                <TextInput
                  value={saveTitle}
                  onChangeText={setSaveTitle}
                  placeholder="My Preset"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  style={styles.input}
                  maxLength={32}
                />
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setSaveOpen(false)} style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} onPress={savePreset} style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function StepRow({ label, value, step, min, max, onChange }) {
  return (
    <View style={styles.stepRow}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepRight}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => onChange((v) => clamp((typeof v === 'number' ? v : value) - step, min, max))} style={styles.stepBtn}>
          <Text style={styles.stepBtnTxt}>−</Text>
        </TouchableOpacity>

        <View style={styles.stepValBox}>
          <Text style={styles.stepValTxt}>{value}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => onChange((v) => clamp((typeof v === 'number' ? v : value) + step, min, max))} style={styles.stepBtn}>
          <Text style={styles.stepBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ToggleRow({ label, value, onToggle }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onToggle} style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.togglePill, value && { borderColor: 'rgba(66,232,214,0.45)', backgroundColor: 'rgba(66,232,214,0.12)' }]}>
        <Text style={[styles.toggleText, { color: value ? THEME.accent : THEME.text2 }]}>{value ? 'ON' : 'OFF'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function dotStyle(type) {
  if (type === 'work') return { backgroundColor: THEME.accent };
  if (type === 'rest') return { backgroundColor: 'rgba(255,255,255,0.35)' };
  if (type === 'warm') return { backgroundColor: THEME.good };
  return { backgroundColor: THEME.warn };
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

  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(66,232,214,0.35)',
    backgroundColor: 'rgba(66,232,214,0.10)',
  },
  saveText: { color: THEME.accent, fontWeight: '900' },

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
  mutedSmall: { color: THEME.text2, fontSize: 12, fontWeight: '800' },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },

  presetRow: {
    backgroundColor: THEME.deep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  presetTitle: { color: THEME.text, fontWeight: '900' },
  presetSub: { color: THEME.text2, marginTop: 4, fontSize: 12 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tagText: { color: THEME.text2, fontWeight: '800', fontSize: 11 },

  inputBox: {
    marginTop: 10,
    backgroundColor: THEME.deep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 12,
  },
  inputLabel: { color: THEME.text2, fontWeight: '800', fontSize: 11 },
  input: {
    marginTop: 8,
    color: THEME.text,
    fontWeight: '900',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  stepRow: {
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
  stepLabel: { color: THEME.text, fontWeight: '900', flex: 1 },
  stepRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },

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
  stepBtnTxt: { color: THEME.text, fontSize: 18, fontWeight: '900' },

  stepValBox: {
    minWidth: 64,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  stepValTxt: { color: THEME.text, fontWeight: '900' },

  toggleRow: {
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
  toggleLabel: { color: THEME.text, fontWeight: '900', flex: 1 },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  toggleText: { fontWeight: '900', fontSize: 12 },

  preview: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: THEME.deep,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBig: { color: THEME.text, fontWeight: '900', fontSize: 34 },
  previewSmall: { color: THEME.text2, marginTop: 6, fontWeight: '800', textAlign: 'center' },

  btnPrimary: {
    flex: 1,
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimaryText: { color: THEME.bg, fontWeight: '900', textAlign: 'center' },

  btnGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnGhostText: { color: THEME.text, fontWeight: '900', textAlign: 'center' },

  timeRow: {
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 99 },
  timeLabel: { color: THEME.text, fontWeight: '900', flex: 1 },
  timeSec: { color: THEME.text2, fontWeight: '900' },

  tip: { color: THEME.text2, marginTop: 12, lineHeight: 18 },

  // modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 18 },
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
});
