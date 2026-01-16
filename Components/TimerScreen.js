// Components/TimerScreen.js — RaimfortActionSport (Rest + Intervals + Tempo beat)
// Uses only containers, no extra deps.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';

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

export default function TimerScreen({ navigation }) {
  // ---- Rest timer ----
  const [restOpen, setRestOpen] = useState(false);
  const [restTotal, setRestTotal] = useState(90);
  const [restLeft, setRestLeft] = useState(90);
  const [restRunning, setRestRunning] = useState(false);
  const restRef = useRef(null);

  // ---- Interval timer ----
  const [intOpen, setIntOpen] = useState(false);
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(60);
  const [rounds, setRounds] = useState(10);

  const [phase, setPhase] = useState('idle'); // idle | work | rest | done
  const [round, setRound] = useState(1);
  const [phaseLeft, setPhaseLeft] = useState(0);
  const [intervalRunning, setIntervalRunning] = useState(false);
  const intervalRef = useRef(null);

  // ---- Tempo (beats per minute) ----
  const [tempoOpen, setTempoOpen] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [beatsLeft, setBeatsLeft] = useState(0);
  const [tempoRunning, setTempoRunning] = useState(false);
  const tempoRef = useRef(null);

  const bpmMs = useMemo(() => Math.round(60000 / clamp(bpm, 30, 240)), [bpm]);

  useEffect(() => {
    return () => {
      if (restRef.current) clearInterval(restRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tempoRef.current) clearInterval(tempoRef.current);
    };
  }, []);

  /* ---------------- Rest ---------------- */

  const startRest = (sec) => {
    const s = clamp(sec || restTotal || 90, 10, 600);
    setRestTotal(s);
    setRestLeft(s);
    setRestRunning(true);

    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
    restRef.current = setInterval(() => {
      setRestLeft((t) => {
        if (t <= 1) {
          if (restRef.current) {
            clearInterval(restRef.current);
            restRef.current = null;
          }
          setRestRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const pauseRest = () => {
    setRestRunning(false);
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
  };

  const resetRest = () => {
    pauseRest();
    setRestLeft(restTotal);
  };

  /* ---------------- Intervals ---------------- */

  const initIntervals = () => {
    setRound(1);
    setPhase('work');
    setPhaseLeft(work);
  };

  const startIntervals = () => {
    initIntervals();
    setIntervalRunning(true);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setPhaseLeft((t) => {
        if (t <= 1) {
          // switch phase
          setPhase((p) => {
            // if we just finished WORK -> go REST
            if (p === 'work') {
              setPhaseLeft(rest);
              return 'rest';
            }
            // if we just finished REST -> next round or done
            if (p === 'rest') {
              setRound((r) => {
                const next = r + 1;
                if (next > rounds) {
                  // done
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                  setIntervalRunning(false);
                  setPhase('done');
                  setPhaseLeft(0);
                  return r;
                }
                // next round -> work
                setPhase('work');
                setPhaseLeft(work);
                return next;
              });
              return 'rest';
            }
            return p;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const pauseIntervals = () => {
    setIntervalRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetIntervals = () => {
    pauseIntervals();
    setPhase('idle');
    setRound(1);
    setPhaseLeft(0);
  };

  /* ---------------- Tempo ---------------- */

  const startTempo = (beats = 60) => {
    const b = clamp(beats, 1, 600);
    setBeatsLeft(b);
    setTempoRunning(true);

    if (tempoRef.current) clearInterval(tempoRef.current);
    tempoRef.current = setInterval(() => {
      setBeatsLeft((t) => {
        if (t <= 1) {
          clearInterval(tempoRef.current);
          tempoRef.current = null;
          setTempoRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, bpmMs);
  };

  const stopTempo = () => {
    setTempoRunning(false);
    if (tempoRef.current) {
      clearInterval(tempoRef.current);
      tempoRef.current = null;
    }
    setBeatsLeft(0);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.hTitle}>Timer</Text>
          <Text style={styles.hSub}>Rest • Intervals • Tempo beat</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Rest */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Rest timer</Text>
              <Text style={styles.mutedSmall}>{fmtSec(restLeft)}</Text>
            </View>

            <View style={styles.presetRow}>
              {[45, 60, 75, 90, 120].map((sec) => (
                <TouchableOpacity 
                  key={sec} 
                  activeOpacity={0.9} 
                  onPress={() => {
                    if (restRunning) pauseRest();
                    startRest(sec);
                  }} 
                  style={styles.presetBtn}
                >
                  <Text style={styles.presetTxt}>{sec}s</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (restRunning) {
                    pauseRest();
                  } else {
                    const timeToStart = restLeft > 0 ? restLeft : (restTotal > 0 ? restTotal : 90);
                    startRest(timeToStart);
                  }
                }}
                style={styles.btnPrimary}
              >
                <Text style={styles.btnPrimaryText}>{restRunning ? 'Pause' : 'Start'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={resetRest} 
                style={styles.btnGhost}
              >
                <Text style={styles.btnGhostText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => setRestOpen(true)} 
                style={styles.btnGhost}
              >
                <Text style={styles.btnGhostText}>Custom</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Intervals */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Intervals</Text>
              <Text style={styles.mutedSmall}>
                {phase === 'idle' ? 'Idle' : phase === 'done' ? 'Done' : `${phase.toUpperCase()} • R${round}/${rounds}`}
              </Text>
            </View>

            <View style={[styles.bigBox, { borderColor: phase === 'work' ? 'rgba(66,232,214,0.45)' : 'rgba(255,255,255,0.10)' }]}>
              <Text style={styles.bigTime}>
                {phase === 'idle' ? '--:--' : phase === 'done' ? '00:00' : fmtSec(phaseLeft)}
              </Text>
              <Text style={styles.bigHint}>
                Work {work}s • Rest {rest}s • Rounds {rounds}
              </Text>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={intervalRunning ? pauseIntervals : startIntervals}
                style={styles.btnPrimary}
              >
                <Text style={styles.btnPrimaryText}>{intervalRunning ? 'Pause' : 'Start'}</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={resetIntervals} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={() => setIntOpen(true)} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>Builder</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation?.navigate?.('IntervalBuilder')}
              style={[styles.wideBtn, { marginTop: 12 }]}
            >
              <Text style={styles.wideTxt}>Open Interval Builder Screen</Text>
            </TouchableOpacity>
          </View>

          {/* Tempo beat */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Tempo beat</Text>
              <Text style={styles.mutedSmall}>{clamp(bpm, 30, 240)} BPM</Text>
            </View>

            <View style={styles.presetRow}>
              {[60, 75, 90, 105, 120].map((x) => (
                <TouchableOpacity key={x} activeOpacity={0.9} onPress={() => setBpm(x)} style={styles.presetBtn}>
                  <Text style={styles.presetTxt}>{x}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.bigBox, { borderColor: 'rgba(66,232,214,0.35)' }]}>
              <Text style={styles.bigTime}>{tempoRunning ? `${beatsLeft} beats` : `${bpmMs} ms`}</Text>
              <Text style={styles.bigHint}>Tick interval based on BPM</Text>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={tempoRunning ? stopTempo : () => startTempo(60)}
                style={styles.btnPrimary}
              >
                <Text style={styles.btnPrimaryText}>{tempoRunning ? 'Stop' : 'Start'}</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={() => setTempoOpen(true)} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>Custom</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerTip}>
              Tip: use 90 BPM for “3-1-1” tempo reps (slow control).
            </Text>
          </View>
        </ScrollView>

        {/* Rest Custom Modal */}
        <Modal visible={restOpen} transparent animationType="fade" onRequestClose={() => setRestOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setRestOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Custom Rest</Text>
              <Text style={styles.modalHint}>Adjust in seconds (10-600).</Text>

              <StepRow
                label="Seconds"
                value={restTotal}
                onDec={() => setRestTotal((v) => clamp(v - 5, 10, 600))}
                onInc={() => setRestTotal((v) => clamp(v + 5, 10, 600))}
              />

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    if (restRunning) pauseRest();
                    startRest(restTotal);
                    setRestOpen(false);
                  }}
                  style={styles.btnPrimary}
                >
                  <Text style={styles.btnPrimaryText}>Start</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.9} 
                  onPress={() => setRestOpen(false)} 
                  style={styles.btnGhost}
                >
                  <Text style={styles.btnGhostText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Intervals Builder Modal (quick) */}
        <Modal visible={intOpen} transparent animationType="fade" onRequestClose={() => setIntOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setIntOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Quick Builder</Text>
              <Text style={styles.modalHint}>Work / Rest / Rounds</Text>

              <StepRow
                label="Work (sec)"
                value={work}
                onDec={() => setWork((v) => clamp(v - 5, 10, 600))}
                onInc={() => setWork((v) => clamp(v + 5, 10, 600))}
              />
              <StepRow
                label="Rest (sec)"
                value={rest}
                onDec={() => setRest((v) => clamp(v - 5, 5, 600))}
                onInc={() => setRest((v) => clamp(v + 5, 5, 600))}
              />
              <StepRow
                label="Rounds"
                value={rounds}
                onDec={() => setRounds((v) => clamp(v - 1, 1, 50))}
                onInc={() => setRounds((v) => clamp(v + 1, 1, 50))}
              />

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    if (intervalRunning) {
                      pauseIntervals();
                    }
                    initIntervals();
                    setIntOpen(false);
                  }}
                  style={styles.btnPrimary}
                >
                  <Text style={styles.btnPrimaryText}>Apply</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} onPress={() => setIntOpen(false)} style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Tempo Custom Modal */}
        <Modal visible={tempoOpen} transparent animationType="fade" onRequestClose={() => setTempoOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setTempoOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Custom BPM</Text>
              <Text style={styles.modalHint}>30–240 BPM</Text>

              <StepRow
                label="BPM"
                value={bpm}
                onDec={() => setBpm((v) => clamp(v - 5, 30, 240))}
                onInc={() => setBpm((v) => clamp(v + 5, 30, 240))}
              />

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    if (tempoRunning) {
                      stopTempo();
                    }
                    startTempo(60);
                    setTempoOpen(false);
                  }}
                  style={styles.btnPrimary}
                >
                  <Text style={styles.btnPrimaryText}>Start</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} onPress={() => setTempoOpen(false)} style={styles.btnGhost}>
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

function StepRow({ label, value, onDec, onInc }) {
  return (
    <View style={styles.stepRow}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepRight}>
        <TouchableOpacity activeOpacity={0.9} onPress={onDec} style={styles.stepBtn}>
          <Text style={styles.stepBtnTxt}>−</Text>
        </TouchableOpacity>
        <View style={styles.stepValBox}>
          <Text style={styles.stepValTxt}>{value}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={onInc} style={styles.stepBtn}>
          <Text style={styles.stepBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  screen: { flex: 1, backgroundColor: THEME.bg },

  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  hTitle: { color: THEME.text, fontSize: 20, fontWeight: '900' },
  hSub: { color: THEME.text2, marginTop: 4 },

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
  mutedSmall: { color: THEME.text2, fontSize: 12, fontWeight: '800' },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },

  presetRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 10 },
  presetBtn: {
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  presetTxt: { color: THEME.text, fontWeight: '900' },

  bigBox: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: THEME.deep,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigTime: { color: THEME.text, fontWeight: '900', fontSize: 34 },
  bigHint: { color: THEME.text2, marginTop: 6, fontWeight: '800', textAlign: 'center' },

  btnPrimary: { backgroundColor: THEME.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, flex: 1, alignItems: 'center' },
  btnPrimaryText: { color: THEME.bg, fontWeight: '900' },

  btnGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  btnGhostText: { color: THEME.text, fontWeight: '900' },

  wideBtn: {
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  wideTxt: { color: THEME.text, fontWeight: '900' },

  footerTip: { color: THEME.text2, marginTop: 10, lineHeight: 18 },

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
    minWidth: 54,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  stepValTxt: { color: THEME.text, fontWeight: '900' },
});
