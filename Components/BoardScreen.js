

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
} from 'react-native';

const LOGO = require('../assets/logo.png');
const GEAR = require('../assets/gear.png');

const THEME = {
  bg: '#0B1522',
  card: '#0F1F33',
  deep: '#132A41',
  text: '#FFFFFF',
  text2: '#A9B7C6',
  line: '#1B334A',

  // RaimfortActionSport vibe
  mint: '#42E8D6',
  purple: '#6D5BFF',

  // Pills
  win: '#10B981',  // W
  draw: '#F59E0B', // D
  loss: '#EF4444', // L

  blue: '#4DABF7',
  pink: '#F783AC',
  green: '#51CF66',
  orange: '#FF6B6B',
};

const TABS = ['All', 'Strength', 'Cardio', 'Mobility'];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function initials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return 'A';
  const a = parts[0][0] || 'A';
  const b = parts.length > 1 ? (parts[1][0] || '') : (parts[0][1] || '');
  return (a + b).toUpperCase();
}

function tempoPoints(formArr) {
  // W=3, D=1, L=0
  return (formArr || []).reduce((s, x) => s + (x === 'W' ? 3 : x === 'D' ? 1 : 0), 0);
}

function pickWorkoutResult(adherencePct) {
  // adherencePct: 0..100
  // higher -> more W, lower -> more L
  const pW = 0.20 + (adherencePct / 100) * 0.65; // 0.20..0.85
  const pD = 0.10 + (1 - adherencePct / 100) * 0.20; // 0.10..0.30
  const pL = 1 - (pW + pD);

  const r = Math.random();
  if (r < pW) return 'W';
  if (r < pW + pD) return 'D';
  return 'L';
}

function mkAthlete(name, focus, accent, weeklyGoalMin, weekMin, streak, form5) {
  return {
    id: `${name}-${Math.random().toString(16).slice(2)}`,
    name,
    focus,
    accent,
    weeklyGoalMin,
    weekMin,
    streak,
    form: (form5 || []).slice(0, 5),
    // tiny extra to make ranking richer
    intensity: clamp(Math.round(55 + Math.random() * 35), 40, 95), // 40..95
  };
}

function generateRandomForm() {
  const results = ['W', 'D', 'L'];
  const weights = [0.5, 0.3, 0.2]; // W более вероятен
  const form = [];
  for (let i = 0; i < 5; i++) {
    const r = Math.random();
    if (r < weights[0]) form.push('W');
    else if (r < weights[0] + weights[1]) form.push('D');
    else form.push('L');
  }
  return form;
}

function makeInitial() {
  const names = [
    { name: 'Mark Tempo', focus: 'All', accent: THEME.mint },
    { name: 'Nova Sprint', focus: 'Cardio', accent: THEME.blue },
    { name: 'Atlas Core', focus: 'Strength', accent: THEME.purple },
    { name: 'Luna Mobility', focus: 'Mobility', accent: THEME.pink },
    { name: 'Rex Power', focus: 'Strength', accent: THEME.orange },
    { name: 'Zen Runner', focus: 'Cardio', accent: THEME.green },
    { name: 'Echo Balance', focus: 'Mobility', accent: '#A78BFA' },
  ];

  return names.map((n) => {
    const weeklyGoalMin = 100 + Math.round(Math.random() * 100); // 100-200
    const weekMin = Math.round(weeklyGoalMin * (0.6 + Math.random() * 0.5)); // 60-110% от цели
    const streak = Math.round(Math.random() * 10); // 0-10
    const form = generateRandomForm();
    
    return mkAthlete(n.name, n.focus, n.accent, weeklyGoalMin, weekMin, streak, form);
  });
}

function pillStyle(r) {
  if (r === 'W') return { backgroundColor: THEME.win };
  if (r === 'D') return { backgroundColor: THEME.draw };
  return { backgroundColor: THEME.loss };
}

export default function BoardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('All');
  const [query, setQuery] = useState('');
  const [list, setList] = useState(() => makeInitial());

  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase();

    const mapped = list
      .filter((a) => (activeTab === 'All' ? true : a.focus === activeTab))
      .filter((a) => (q ? a.name.toLowerCase().includes(q) : true))
      .map((a) => {
        const adherence = a.weeklyGoalMin > 0 ? clamp(Math.round((a.weekMin / a.weeklyGoalMin) * 100), 0, 160) : 0;
        const tp = tempoPoints(a.form);
        // TempoScore: blends last-5 form + adherence + intensity
        const score = Math.round(tp * 9 + adherence * 0.9 + a.intensity * 0.6 + a.streak * 2);
        return {
          ...a,
          adherence,
          tempoPts: tp,
          tempoScore: score,
        };
      })
      .sort((x, y) => {
        if (y.tempoScore !== x.tempoScore) return y.tempoScore - x.tempoScore;
        if (y.adherence !== x.adherence) return y.adherence - x.adherence;
        return y.weekMin - x.weekMin;
      });

    return mapped;
  }, [list, activeTab, query]);

  const myRank = useMemo(() => {
    const idx = ranked.findIndex((x) => x.name === 'Mark Tempo');
    return idx >= 0 ? idx + 1 : null;
  }, [ranked]);

  const onReset = () => {
    setQuery('');
    setActiveTab('All');
    setList(makeInitial());
  };

  // Функция для обновления данных (можно вызывать периодически или при действиях)
  const updateAthleteData = () => {
    setList((prev) =>
      prev.map((a) => {
        const adherence = a.weeklyGoalMin > 0 ? clamp((a.weekMin / a.weeklyGoalMin) * 100, 0, 160) : 0;
        const r = pickWorkoutResult(adherence);
        const add =
          r === 'W'
            ? 20 + Math.round(Math.random() * 25)
            : r === 'D'
            ? 8 + Math.round(Math.random() * 10)
            : Math.round(Math.random() * 5);

        const nextMin = clamp(a.weekMin + add, 0, 999);
        const nextStreak = r === 'L' ? 0 : a.streak + 1;

        return {
          ...a,
          weekMin: nextMin,
          streak: nextStreak,
          form: [r, ...a.form].slice(0, 5),
          intensity: clamp(a.intensity + (r === 'W' ? 1 : r === 'D' ? 0 : -1), 40, 95),
        };
      })
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={LOGO} style={styles.logo} />
            <View style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
              <Text style={styles.hTitle} numberOfLines={1} ellipsizeMode="tail">Tempo League</Text>
              <Text style={styles.hSub} numberOfLines={1} ellipsizeMode="tail">Rank by consistency + tempo</Text>
            </View>
          </View>

          <View style={styles.headerBtns}>
            <TouchableOpacity activeOpacity={0.9} onPress={onReset} style={styles.btnGhost}>
              <Text style={styles.btnGhostText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation?.navigate?.('Profile')}
              style={styles.iconBtn}
            >
              <Image source={GEAR} style={styles.iconImg} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {/* My card */}
          <View style={styles.hero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Your league status</Text>
              <Text style={styles.heroText}>
                {myRank ? `You’re #${myRank} today.` : `Join the board by logging workouts.`}
              </Text>
              <Text style={styles.heroHint}>
                W = full workout • D = light / recovery • L = missed day
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeTop}>Tempo</Text>
              <Text style={styles.heroBadgeBig}>FIT</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map((t) => {
              const active = activeTab === t;
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.9}
                  onPress={() => setActiveTab(t)}
                  style={[
                    styles.tab,
                    active && { backgroundColor: THEME.mint, borderColor: 'rgba(255,255,255,0.0)' },
                  ]}
                >
                  <Text style={[styles.tabText, { color: active ? THEME.bg : THEME.text }]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search athlete..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.searchInput}
            />
          </View>

          {/* Board card */}
          <View style={styles.boardCard}>
            <View style={styles.boardHead}>
              <Text style={[styles.th, { flex: 1, minWidth: 0 }]}>Athlete</Text>
              <Text style={[styles.th, { width: 65, textAlign: 'right', flexShrink: 0 }]}>Load</Text>
              <Text style={[styles.th, { width: 65, textAlign: 'right', flexShrink: 0 }]}>Score</Text>
            </View>

            <View style={styles.hr} />

            {ranked.map((a, idx) => {
              const load = clamp(a.adherence, 0, 160); // allow >100 for over-goal
              const loadPct = clamp(load, 0, 100);

              return (
                <TouchableOpacity
                  key={a.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (navigation?.navigate) {
                      navigation.navigate('ChallengeDetails', { athlete: a });
                    }
                  }}
                  style={styles.row}
                >
                  {/* Left block */}
                  <View style={[styles.left, { flex: 1, minWidth: 0, maxWidth: '100%' }]}>
                    <Text style={styles.rank}>{idx + 1}</Text>

                    <View style={[styles.avatar, { borderColor: a.accent }]}>
                      <Text style={[styles.avatarText, { color: a.accent }]}>{initials(a.name)}</Text>
                    </View>

                    <View style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
                      <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{a.name}</Text>
                      
                      <View style={styles.nameRow}>
                        <View style={[styles.focusTag, { flexShrink: 0 }]}>
                          <Text style={styles.focusTagText} numberOfLines={1}>{a.focus}</Text>
                        </View>
                      </View>

                      <Text style={styles.meta} numberOfLines={1} ellipsizeMode="tail">
                        Goal {a.weeklyGoalMin}m • Week {a.weekMin}m • Streak {a.streak}d
                      </Text>

                      {/* L/D/W pills */}
                      <View style={styles.formRow}>
                        {a.form.map((r, i) => (
                          <View key={`${a.id}-${i}-${r}`} style={[styles.pill, pillStyle(r)]}>
                            <Text style={styles.pillText}>{r}</Text>
                          </View>
                        ))}
                        <View style={[styles.formPts, { flexShrink: 0 }]}>
                          <Text style={styles.formPtsText}>{tempoPoints(a.form)} pts</Text>
                        </View>
                      </View>

                      {/* Original: mini multi-color load line */}
                      <View style={styles.miniTrack}>
                        <View style={styles.miniTicks} />
                        <View style={[styles.miniFillWrap, { width: `${loadPct}%` }]}>
                          <View style={[styles.miniSeg, { backgroundColor: THEME.mint }]} />
                          <View style={[styles.miniSeg, { backgroundColor: THEME.blue }]} />
                          <View style={[styles.miniSeg, { backgroundColor: THEME.pink }]} />
                        </View>
                        <View style={[styles.miniEdge, { left: `${loadPct}%` }]} />
                      </View>
                    </View>
                  </View>

                  {/* Load */}
                  <View style={{ width: 65, alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={styles.loadBig}>{clamp(a.adherence, 0, 999)}%</Text>
                    <Text style={styles.loadSmall}>goal</Text>
                  </View>

                  {/* Score */}
                  <View style={{ width: 65, alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={styles.scoreBig}>{a.tempoScore}</Text>
                    <Text style={styles.scoreSmall}>tempo</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.footer}>
            Tip: tap a row → open details.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  screen: { flex: 1, backgroundColor: THEME.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brand: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    flex: 1, 
    flexShrink: 1, 
    minWidth: 0,
    maxWidth: '60%',
  },
  logo: { width: 28, height: 28, resizeMode: 'contain' },
  hTitle: { color: THEME.text, fontSize: 18, fontWeight: '900', flexShrink: 1 },
  hSub: { color: THEME.text2, fontWeight: '800', marginTop: 2, fontSize: 11, flexShrink: 1 },

  headerBtns: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    flexShrink: 0,
    marginLeft: 8,
  },
  btnGhost: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  btnGhostText: { color: THEME.text, fontWeight: '900', fontSize: 11 },

  btnPrimary: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: THEME.purple,
  },
  btnPrimaryText: { color: '#0B1522', fontWeight: '900', fontSize: 11 },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImg: { width: 18, height: 18, resizeMode: 'contain', tintColor: THEME.text },

  content: { paddingHorizontal: 16, paddingBottom: 60, flexGrow: 1 },

  hero: {
    marginTop: 6,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: THEME.card,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  heroTitle: { color: THEME.text, fontWeight: '900', fontSize: 18 },
  heroText: { color: THEME.text2, fontWeight: '800', marginTop: 6, lineHeight: 18 },
  heroHint: { color: 'rgba(255,255,255,0.45)', fontWeight: '800', marginTop: 8 },

  heroBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeTop: { color: THEME.mint, fontWeight: '900', letterSpacing: 1 },
  heroBadgeBig: { color: THEME.text, fontWeight: '900', fontSize: 20, marginTop: 4 },

  tabsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tabText: { fontWeight: '900' },

  searchWrap: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: THEME.card,
    padding: 12,
  },
  searchInput: {
    color: THEME.text,
    fontWeight: '900',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
  },

  boardCard: {
    marginTop: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: THEME.card,
    padding: 12,
    overflow: 'visible',
  },

  boardHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingBottom: 8, paddingTop: 4 },
  th: { color: THEME.text2, fontWeight: '900', fontSize: 10 },
  hr: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },

  left: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, flex: 1, minWidth: 0, maxWidth: '100%' },

  rank: { width: 16, color: THEME.text2, fontWeight: '900', marginTop: 3, flexShrink: 0, fontSize: 11 },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: THEME.deep,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontWeight: '900', fontSize: 11 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  name: { color: THEME.text, fontWeight: '900', fontSize: 14, flexShrink: 0, minWidth: 0, lineHeight: 18 },
  focusTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  focusTagText: { color: THEME.text2, fontWeight: '900', fontSize: 9 },

  meta: { color: THEME.text2, marginTop: 2, fontWeight: '800', fontSize: 10 },

  formRow: { flexDirection: 'row', gap: 5, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' },
  pill: { width: 24, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pillText: { color: '#0B1522', fontWeight: '900', fontSize: 10 },
  formPts: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  formPtsText: { color: THEME.text, fontWeight: '900', fontSize: 9 },

  // Mini colorful load line (original element)
  miniTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
  },
  miniTicks: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    opacity: 0.6,
  },
  miniFillWrap: { height: '100%', flexDirection: 'row' },
  miniSeg: { flex: 1 },
  miniEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 10,
    marginLeft: -5,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  loadBig: { color: THEME.text, fontWeight: '900', fontSize: 14, marginTop: 2 },
  loadSmall: { color: THEME.text2, fontWeight: '800', marginTop: 1, fontSize: 9 },

  scoreBig: { color: THEME.text, fontWeight: '900', fontSize: 15, marginTop: 2 },
  scoreSmall: { color: THEME.text2, fontWeight: '800', marginTop: 1, fontSize: 9 },

  footer: { color: THEME.text2, textAlign: 'center', marginTop: 12, lineHeight: 18, fontWeight: '700' },
});
