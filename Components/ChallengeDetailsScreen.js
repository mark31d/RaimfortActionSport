
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
} from 'react-native';

const LOGO = require('../assets/logo.png');
const BACK = require('../assets/back.png');

const THEME = {
  bg: '#0B1522',
  card: '#0F1F33',
  deep: '#132A41',
  text: '#FFFFFF',
  text2: '#A9B7C6',
  line: '#1B334A',
  mint: '#42E8D6',
  purple: '#6D5BFF',

  win: '#10B981',
  draw: '#F59E0B',
  loss: '#EF4444',

  blue: '#4DABF7',
  pink: '#F783AC',
  green: '#51CF66',
  orange: '#FF6B6B',
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function pillStyle(r) {
  if (r === 'W') return { backgroundColor: THEME.win };
  if (r === 'D') return { backgroundColor: THEME.draw };
  return { backgroundColor: THEME.loss };
}

function ptsFromForm(form = []) {
  return form.reduce((s, x) => s + (x === 'W' ? 3 : x === 'D' ? 1 : 0), 0);
}

function winsFromForm(form = []) {
  return form.reduce((s, x) => s + (x === 'W' ? 1 : 0), 0);
}

function pickResult(power01) {
  // power01: 0..1
  const w = 0.22 + power01 * 0.60;       // 0.22..0.82
  const d = 0.10 + (1 - power01) * 0.20; // 0.10..0.30
  const l = 1 - (w + d);

  const r = Math.random();
  if (r < w) return 'W';
  if (r < w + d) return 'D';
  return 'L';
}

function initials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return 'A';
  const a = parts[0][0] || 'A';
  const b = parts.length > 1 ? (parts[1][0] || '') : (parts[0][1] || '');
  return (a + b).toUpperCase();
}

export default function ChallengeDetailsScreen({ navigation, route }) {
  const athlete = route?.params?.athlete;

  const [name, setName] = useState(athlete?.name || 'Tempo Wolves');
  const [power, setPower] = useState(clamp(athlete?.power ?? 80, 40, 95)); // 40..95
  const [tempoIndex, setTempoIndex] = useState(clamp(athlete?.intensity ? athlete.intensity / 50 : 1.6, 1.0, 2.2));
  const [form, setForm] = useState((athlete?.form?.length ? athlete.form : ['D', 'L', 'D', 'D', 'W']).slice(0, 5));

  // “Done/Missed” for last 31 days (demo)
  const [done, setDone] = useState(clamp(athlete?.weekMin ? Math.round(athlete.weekMin / 7) : 19, 0, 31));
  const [missed, setMissed] = useState(clamp(31 - done, 0, 31));

  // 10-day trend bars (demo, 0..100)
  const [trend, setTrend] = useState(() => {
    const base = clamp(Math.round((power / 100) * 70 + 15), 20, 90);
    const arr = new Array(10).fill(0).map((_, i) => {
      const wobble = Math.round((Math.random() - 0.5) * 28);
      return clamp(base + wobble + (i > 5 ? 6 : 0), 10, 100);
    });
    return arr;
  });

  // Strength profile (demo)
  const [profile, setProfile] = useState(() => ({
    tempoControl: 80,
    volume: 70,
    technique: 88,
    recovery: 30,
  }));

  const formPts = useMemo(() => ptsFromForm(form), [form]);
  const formWins = useMemo(() => winsFromForm(form), [form]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <View style={styles.screen}>
        {/* Header (no overlap) */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={LOGO} style={styles.logo} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.hTitle} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
              <Text style={styles.hSub} numberOfLines={1} ellipsizeMode="tail">Challenge details</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation?.goBack?.()}
            style={styles.backBtn}
          >
            <Image source={BACK} style={styles.backImg} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Overview card (fixed layout) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Challenge Overview</Text>

            <View style={styles.overviewBody}>
              {/* left: avatar */}
              <View style={styles.avatarTile}>
                <Text style={styles.avatarText}>{initials(name)}</Text>
              </View>

              {/* right: info columns */}
              <View style={{ flex: 1 }}>
                <View style={styles.overviewGrid}>
                  {/* Column A */}
                  <View style={styles.col}>
                    <StatLine label="Power" value={`${power}`} />
                    <StatLine label="Tempo Index" value={`${tempoIndex}`} />
                    <View style={styles.miniRow}>
                      <Text style={styles.miniMuted}>Done</Text>
                      <Text style={styles.miniStrong}>{done}</Text>
                      <Text style={[styles.miniMuted, { marginLeft: 10 }]}>Missed</Text>
                      <Text style={styles.miniStrong}>{missed}</Text>
                    </View>
                  </View>

                  {/* Column B: Form */}
                  <View style={styles.col}>
                    <Text style={styles.formLabel}>Form (last 5)</Text>

                    <View style={styles.formRow}>
                      {form.map((r, i) => (
                        <View key={`${r}-${i}`} style={[styles.pill, pillStyle(r)]}>
                          <Text style={styles.pillText}>{r}</Text>
                        </View>
                      ))}
                    </View>

                    <Text style={styles.formMeta}>
                      Wins {formWins} • Pts {formPts}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Performance Trend */}
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>Performance Trend</Text>
              <Text style={styles.smallMuted}>Last 10 days</Text>
            </View>

            <View style={styles.trendBox}>
              <View style={styles.trendBarsRow}>
                {trend.map((v, i) => {
                  const h = clamp(Math.round((v / 100) * 140), 10, 140);
                  return (
                    <View key={i} style={styles.trendBarSlot}>
                      <View style={[styles.trendBar, { height: h }]} />
                    </View>
                  );
                })}
              </View>

              <View style={styles.legendRow}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Tempo / quality proxy</Text>
              </View>
            </View>
          </View>

          {/* Strength Profile */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Strength Profile</Text>
            <Text style={[styles.smallMuted, { marginTop: 6 }]}>RaimfortActionSport priorities</Text>

            <View style={{ marginTop: 12 }}>
              <ProgressRow label="Tempo Control" value={profile.tempoControl} color={THEME.mint} />
              <ProgressRow label="Volume" value={profile.volume} color={THEME.purple} />
              <ProgressRow label="Technique" value={profile.technique} color={THEME.draw} />
              <ProgressRow label="Recovery" value={profile.recovery} color={THEME.blue} />
            </View>
          </View>

          {/* Actions (RaimfortActionSport-style) */}
          <View style={styles.actionsRow}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation?.navigate?.('Home')} style={styles.actionLeft}>
              <Text style={styles.actionLeftText}>New challenge</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate('PlanDetails');
                }
              }}
              style={styles.actionRight}
            >
              <Text style={styles.actionRightText}>View plan</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            W = workout • D = easy/recovery • L = missed. This screen is demo-driven (no backend).
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function StatLine({ label, value }) {
  return (
    <View style={styles.statLine}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ProgressRow({ label, value, color }) {
  const pct = clamp(value, 0, 100);
  return (
    <View style={styles.prRow}>
      <View style={styles.prTop}>
        <Text style={styles.prLabel}>{label}</Text>
        <Text style={styles.prValue}>{pct}%</Text>
      </View>
      <View style={styles.prTrack}>
        <View style={[styles.prFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  screen: { flex: 1, backgroundColor: THEME.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  brand: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    flexShrink: 1, 
    minWidth: 0,
    maxWidth: '65%',
  },
  logo: { width: 24, height: 24, resizeMode: 'contain', marginRight: 8 },
  hTitle: { color: THEME.text, fontWeight: '900', fontSize: 20, flexShrink: 1 },
  hSub: { color: THEME.text2, fontWeight: '800', marginTop: 2, fontSize: 12, flexShrink: 1 },

  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  backImg: { width: 12, height: 12, resizeMode: 'contain', tintColor: THEME.text, marginRight: 5 },
  backText: { color: THEME.text, fontWeight: '900', fontSize: 12 },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 130, // IMPORTANT: so bottom tab bar doesn’t cover content
  },

  card: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: THEME.card,
    padding: 12,
  },

  cardTitle: { color: THEME.text, fontWeight: '900', fontSize: 18 },
  smallMuted: { color: THEME.text2, fontWeight: '800', fontSize: 12 },

  // Overview layout (fixed)
  overviewBody: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarTile: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { color: THEME.mint, fontWeight: '900', fontSize: 20 },

  overviewGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },

  statLine: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  statLabel: { color: THEME.text2, fontWeight: '900', marginRight: 8, fontSize: 13 },
  statValue: { color: THEME.text, fontWeight: '900', fontSize: 18 },

  miniRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  miniMuted: { color: THEME.text2, fontWeight: '800', fontSize: 12 },
  miniStrong: { color: THEME.text, fontWeight: '900', marginLeft: 6, fontSize: 13 },

  formLabel: { color: THEME.text2, fontWeight: '900', marginBottom: 6, fontSize: 13 },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    width: 30,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { color: THEME.bg, fontWeight: '900', fontSize: 12 },
  formMeta: { color: THEME.text2, fontWeight: '800', marginTop: 4, fontSize: 12 },

  // Trend
  trendBox: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
    padding: 12,
  },
  trendBarsRow: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  trendBarSlot: { flex: 1, alignItems: 'center' },
  trendBar: {
    width: '72%',
    borderRadius: 8,
    backgroundColor: '#78C6FF',
    minHeight: 10,
  },

  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: '#78C6FF', marginRight: 10 },
  legendText: { color: THEME.text2, fontWeight: '800' },

  // Progress rows
  prRow: { marginTop: 14 },
  prTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prLabel: { color: THEME.text2, fontWeight: '900', fontSize: 16 },
  prValue: { color: THEME.text, fontWeight: '900', fontSize: 18 },
  prTrack: {
    marginTop: 10,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  prFill: { height: '100%', borderRadius: 999 },

  // Actions
  actionsRow: { flexDirection: 'row', marginTop: 14 },
  actionLeft: {
    flex: 1,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: THEME.purple,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLeftText: { color: THEME.bg, fontWeight: '900', fontSize: 16 },

  actionRight: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRightText: { color: THEME.text, fontWeight: '900', fontSize: 16 },

  footer: {
    color: THEME.text2,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
});
