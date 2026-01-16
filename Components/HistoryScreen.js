// Components/HistoryScreen.js — RaimfortActionSport (English, FULL, with bolt + trash icons)

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
const BOLT = require('../assets/bolt.png');
const TRASH = require('../assets/trash.png');

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

function toISODate(d = new Date()) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, '0');
  const dd = String(x.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function formatPretty(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function startOfRangeISO(range) {
  const now = new Date();
  const d = new Date(now);
  if (range === '7D') d.setDate(d.getDate() - 6);
  else if (range === '30D') d.setDate(d.getDate() - 29);
  else d.setDate(d.getDate() - 179); // ALL ~ 6 months
  return toISODate(d);
}

function mk(title, type, min, kcal, hr, tempo, tempoScore, dateObj, note) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: toISODate(dateObj),
    title,
    type, // Strength | HIIT | Zone2 | Mobility
    minutes: min,
    calories: kcal,
    avgHR: hr,
    tempo,
    tempoScore, // 0..100
    note: note || '',
  };
}

function makeDemo() {
  return [
    mk('Strength + Tempo', 'Strength', 45, 320, 138, '3-1-1', 86, daysAgo(1), 'Clean tempo. Solid depth.'),
    mk('HIIT Intervals', 'HIIT', 25, 240, 155, '2-1-1', 74, daysAgo(2), 'Hard but controlled.'),
    mk('Zone 2 Base', 'Zone2', 35, 210, 132, '—', 92, daysAgo(3), 'Easy breathing, steady.'),
    mk('Pull + Mobility', 'Mobility', 40, 180, 118, '2-1-2', 88, daysAgo(5), 'Back felt great after.'),
    mk('Full Body', 'Strength', 50, 360, 142, '2-1-1', 80, daysAgo(7), 'Finisher was spicy.'),
    mk('Intervals Builder', 'HIIT', 18, 170, 158, '—', 70, daysAgo(9), 'Quick tabata session.'),
    mk('Zone 2 Base', 'Zone2', 30, 190, 128, '—', 95, daysAgo(11), 'Kept it easy.'),
    mk('Strength + Tempo', 'Strength', 42, 300, 136, '3-1-1', 84, daysAgo(13), 'Tempo improved.'),
  ];
}

export default function HistoryScreen({ navigation }) {
  const [range, setRange] = useState('30D'); // 7D | 30D | ALL
  const [type, setType] = useState('All'); // All | Strength | HIIT | Zone2 | Mobility
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState(() => makeDemo());

  const rangeStart = useMemo(() => startOfRangeISO(range), [range]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs
      .filter((x) => x.date >= rangeStart)
      .filter((x) => (type === 'All' ? true : x.type === type))
      .filter((x) => (q ? (x.title + ' ' + x.note).toLowerCase().includes(q) : true))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [logs, rangeStart, type, query]);

  const stats = useMemo(() => {
    const totalSessions = filtered.length;
    const totalMinutes = filtered.reduce((s, x) => s + x.minutes, 0);
    const totalCalories = filtered.reduce((s, x) => s + x.calories, 0);
    const avgTempo = filtered.length
      ? Math.round(filtered.reduce((s, x) => s + (x.tempoScore || 0), 0) / filtered.length)
      : 0;

    const byDate = new Set(filtered.map((x) => x.date));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const iso = toISODate(daysAgo(i));
      if (byDate.has(iso)) streak += 1;
      else break;
    }

    const dayMap = {};
    filtered.forEach((x) => {
      dayMap[x.date] = (dayMap[x.date] || 0) + x.minutes;
    });
    const best = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];
    const bestDay = best ? { date: best[0], minutes: best[1] } : null;

    return { totalSessions, totalMinutes, totalCalories, avgTempo, streak, bestDay };
  }, [filtered]);

  const heatmap = useMemo(() => {
    const days = range === '7D' ? 7 : range === '30D' ? 30 : 180;
    const arr = [];
    const minutesBy = {};
    logs.forEach((x) => {
      minutesBy[x.date] = (minutesBy[x.date] || 0) + x.minutes;
    });

    for (let i = days - 1; i >= 0; i--) {
      const iso = toISODate(daysAgo(i));
      const m = minutesBy[iso] || 0;
      arr.push({ iso, minutes: m });
    }
    return arr;
  }, [logs, range]);

  const addQuickLog = () => {
    const today = new Date();
    const types = ['Strength', 'HIIT', 'Zone2', 'Mobility'];
    const t = types[Math.floor(Math.random() * types.length)];
    const titleMap = {
      Strength: 'Strength + Tempo',
      HIIT: 'HIIT Intervals',
      Zone2: 'Zone 2 Base',
      Mobility: 'Pull + Mobility',
    };
    const mins = t === 'HIIT' ? 18 : t === 'Zone2' ? 30 : t === 'Mobility' ? 35 : 45;
    const kcal = t === 'HIIT' ? 190 : t === 'Zone2' ? 200 : t === 'Mobility' ? 150 : 320;
    const hr = t === 'HIIT' ? 158 : t === 'Zone2' ? 130 : t === 'Mobility' ? 115 : 140;
    const tempo = t === 'Strength' ? '3-1-1' : t === 'Mobility' ? '2-1-2' : '—';
    const score = t === 'HIIT' ? 72 : t === 'Zone2' ? 93 : t === 'Mobility' ? 88 : 84;

    setLogs((prev) => [mk(titleMap[t], t, mins, kcal, hr, tempo, score, today, 'Quick log added.'), ...prev]);
  };

  const clearFilteredLogs = () => {
    const keep = logs.filter(
      (x) => !(x.date >= rangeStart && (type === 'All' ? true : x.type === type))
    );
    setLogs(keep);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={LOGO} style={styles.logo} />
            <View>
              <Text style={styles.hTitle}>History</Text>
              <Text style={styles.hSub}>RaimfortActionSport • your training timeline</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation?.navigate?.('Profile')}
            style={styles.iconBtn}
          >
            <Image source={GEAR} style={styles.iconImg} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Filters */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Filters</Text>
              <Text style={styles.mutedSmall}>{filtered.length} sessions</Text>
            </View>

            <View style={styles.segment}>
              {['7D', '30D', 'ALL'].map((k) => {
                const active = range === k;
                return (
                  <TouchableOpacity
                    key={k}
                    activeOpacity={0.9}
                    onPress={() => setRange(k)}
                    style={[
                      styles.segBtn,
                      active && {
                        backgroundColor: 'rgba(66,232,214,0.16)',
                        borderColor: 'rgba(66,232,214,0.35)',
                      },
                    ]}
                  >
                    <Text style={[styles.segText, { color: active ? THEME.text : THEME.text2 }]}>{k}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.chipsRow}>
              {['All', 'Strength', 'HIIT', 'Zone2', 'Mobility'].map((k) => {
                const active = type === k;
                return (
                  <TouchableOpacity
                    key={k}
                    activeOpacity={0.9}
                    onPress={() => setType(k)}
                    style={[
                      styles.chip,
                      active && {
                        borderColor: 'rgba(66,232,214,0.35)',
                        backgroundColor: 'rgba(66,232,214,0.10)',
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? THEME.accent : THEME.text2 }]}>{k}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchLabel}>Search</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Type keywords…"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.searchInput}
              />
            </View>
          </View>

          {/* Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>

            <View style={styles.summaryRow}>
              <StatBox label="Sessions" value={`${stats.totalSessions}`} />
              <StatBox label="Minutes" value={`${stats.totalMinutes}`} />
              <StatBox label="Calories" value={`${stats.totalCalories}`} />
            </View>

            <View style={styles.summaryRow}>
              <StatBox label="Tempo Score" value={`${stats.avgTempo}%`} accent />
              <StatBox label="Streak" value={`${stats.streak}d`} />
              <StatBox
                label="Best Day"
                value={stats.bestDay ? `${formatPretty(stats.bestDay.date)} • ${stats.bestDay.minutes}m` : '—'}
                wide
              />
            </View>

            <View style={styles.actionsRow}>
              {/* Quick Log */}
              <TouchableOpacity activeOpacity={0.9} onPress={addQuickLog} style={styles.btnPrimaryIcon}>
                <Image source={BOLT} style={styles.actionIcon} />
                <Text style={styles.btnPrimaryText}>Quick Log</Text>
              </TouchableOpacity>

              {/* Clear */}
              <TouchableOpacity activeOpacity={0.9} onPress={clearFilteredLogs} style={styles.btnGhostIcon}>
                <Image source={TRASH} style={styles.actionIconGhost} />
                <Text style={styles.btnGhostText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.tip}>
              Tempo Score = how clean your “controlled reps” are. Try to keep it above 80% on strength days.
            </Text>
          </View>

          {/* Consistency heatmap */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Consistency</Text>
              <Text style={styles.mutedSmall}>{range === 'ALL' ? 'Last 180 days' : range}</Text>
            </View>

            <View style={styles.heatWrap}>
              {heatmap.map((d) => {
                const lvl = d.minutes >= 45 ? 3 : d.minutes >= 25 ? 2 : d.minutes >= 10 ? 1 : 0;
                return (
                  <View
                    key={d.iso}
                    style={[
                      styles.heatCell,
                      lvl === 0 && {
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderColor: 'rgba(255,255,255,0.10)',
                      },
                      lvl === 1 && {
                        backgroundColor: 'rgba(66,232,214,0.10)',
                        borderColor: 'rgba(66,232,214,0.18)',
                      },
                      lvl === 2 && {
                        backgroundColor: 'rgba(66,232,214,0.18)',
                        borderColor: 'rgba(66,232,214,0.28)',
                      },
                      lvl === 3 && {
                        backgroundColor: 'rgba(66,232,214,0.28)',
                        borderColor: 'rgba(66,232,214,0.40)',
                      },
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.legendRow}>
              <Text style={styles.legendText}>Low</Text>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.10)' }]} />
              <View style={[styles.legendDot, { backgroundColor: 'rgba(66,232,214,0.10)', borderColor: 'rgba(66,232,214,0.18)' }]} />
              <View style={[styles.legendDot, { backgroundColor: 'rgba(66,232,214,0.18)', borderColor: 'rgba(66,232,214,0.28)' }]} />
              <View style={[styles.legendDot, { backgroundColor: 'rgba(66,232,214,0.28)', borderColor: 'rgba(66,232,214,0.40)' }]} />
              <Text style={styles.legendText}>High</Text>
            </View>
          </View>

          {/* List */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Sessions</Text>
              <Text style={styles.mutedSmall}>Tap to open (optional)</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {filtered.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>No sessions found</Text>
                  <Text style={styles.emptySub}>Try changing filters or add a quick log.</Text>
                </View>
              ) : (
                filtered.map((x) => (
                  <TouchableOpacity
                    key={x.id}
                    activeOpacity={0.9}
                    onPress={() => {
                      // optional details screen:
                      // navigation?.navigate?.('HistoryDetails', { item: x });
                    }}
                    style={styles.itemRow}
                  >
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemDate}>{formatPretty(x.date)}</Text>
                      <Text style={styles.itemTitle}>{x.title}</Text>
                      <Text style={styles.itemSub}>
                        {x.type} • {x.minutes}m • {x.calories} kcal • Avg HR {x.avgHR}
                      </Text>
                      {!!x.note && <Text style={styles.itemNote}>{x.note}</Text>}
                    </View>

                    <View style={styles.itemRight}>
                      <View style={[styles.badge, badgeStyle(x.type)]}>
                        <Text style={styles.badgeText}>{x.type}</Text>
                      </View>

                      <View style={[styles.scoreBox, scoreStyle(x.tempoScore)]}>
                        <Text style={styles.scoreText}>{x.tempoScore}%</Text>
                        <Text style={styles.scoreLabel}>Tempo</Text>
                      </View>

                      <Text style={styles.tempoHint}>{x.tempo !== '—' ? `Tempo ${x.tempo}` : '—'}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          <Text style={styles.footer}>RaimfortActionSport • keep it clean, keep it consistent.</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
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

function StatBox({ label, value, accent, wide }) {
  return (
    <View
      style={[
        styles.statBox,
        wide && { flex: 1.4 },
        accent && { borderColor: 'rgba(66,232,214,0.35)', backgroundColor: 'rgba(66,232,214,0.08)' },
      ]}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: THEME.accent }]}>{value}</Text>
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
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 34, height: 34, resizeMode: 'contain' },
  hTitle: { color: THEME.text, fontSize: 18, fontWeight: '900' },
  hSub: { color: THEME.text2, fontSize: 12, marginTop: 2 },

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
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },

  segment: { marginTop: 10, flexDirection: 'row', gap: 10 },
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

  chipsRow: { flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: { fontWeight: '900', fontSize: 12 },

  searchBox: {
    marginTop: 10,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 16,
    padding: 12,
  },
  searchLabel: { color: THEME.text2, fontWeight: '800', fontSize: 11 },
  searchInput: {
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

  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  statBox: {
    flex: 1,
    minWidth: 110,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 12,
  },
  statLabel: { color: THEME.text2, fontWeight: '800', fontSize: 11 },
  statValue: { color: THEME.text, fontWeight: '900', fontSize: 14, marginTop: 6 },

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
  btnPrimaryText: { color: THEME.bg, fontWeight: '900' },

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
  btnGhostText: { color: THEME.text, fontWeight: '900' },

  actionIcon: { width: 18, height: 18, resizeMode: 'contain', tintColor: THEME.bg },
  actionIconGhost: { width: 18, height: 18, resizeMode: 'contain', tintColor: THEME.text },

  tip: { color: THEME.text2, marginTop: 12, lineHeight: 18 },

  heatWrap: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heatCell: { width: 10, height: 10, borderRadius: 3, borderWidth: 1 },

  legendRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 3, borderWidth: 1 },
  legendText: { color: THEME.text2, fontWeight: '800', fontSize: 11 },

  empty: {
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  emptyTitle: { color: THEME.text, fontWeight: '900' },
  emptySub: { color: THEME.text2, marginTop: 6 },

  itemRow: {
    backgroundColor: THEME.deep,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  itemLeft: { flex: 1, gap: 4 },
  itemDate: { color: THEME.text2, fontWeight: '900', fontSize: 12 },
  itemTitle: { color: THEME.text, fontWeight: '900', fontSize: 14 },
  itemSub: { color: THEME.text2, lineHeight: 18 },
  itemNote: { color: THEME.text, marginTop: 6, fontWeight: '800', fontSize: 12 },

  itemRight: { alignItems: 'flex-end', gap: 8 },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { color: THEME.text, fontWeight: '900', fontSize: 11 },

  scoreBox: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 70,
  },
  scoreText: { color: THEME.text, fontWeight: '900', fontSize: 14 },
  scoreLabel: { color: THEME.text2, fontWeight: '800', fontSize: 11, marginTop: 2 },

  tempoHint: { color: THEME.text2, fontWeight: '800', fontSize: 11 },

  footer: { color: THEME.text2, textAlign: 'center', marginTop: 6 },
});
