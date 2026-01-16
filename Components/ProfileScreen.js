
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
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';

const LOGO = require('../assets/logo.png');
const GEAR = require('../assets/gear.png');

const BOLT = require('../assets/bolt.png');
const CLOCK = require('../assets/clock.png');
const HEART = require('../assets/heart.png');
const FLAME = require('../assets/flame.png');
const TRASH = require('../assets/trash.png');

const THEME = {
  bg: '#0B1522',
  card: '#0F1F33',
  deep: '#132A41',
  text: '#FFFFFF',
  text2: '#A9B7C6',
  line: '#1B334A',
  accent: '#42E8D6',
  purple: '#6D5BFF',
  warn: '#F59E0B',
  orange: '#FF6B6B',
  green: '#51CF66',
  blue: '#4DABF7',
  pink: '#F783AC',
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const fmtMin = (m) => `${m} min`;

function formatPrettyDate(d) {
  try {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function ProfileScreen({ navigation }) {
  // Avatar (uri from picker)
  const [avatarUri, setAvatarUri] = useState(null);

  // Profile
  const [name, setName] = useState('Athlete');
  const [goal, setGoal] = useState('Build consistency (5 days/week)');
  const [weeklyTargetMin, setWeeklyTargetMin] = useState('150');

  // Preferences
  const [reminders, setReminders] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [autoStartIntervals, setAutoStartIntervals] = useState(false);

  // Date picker (weekly check-in)
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Demo stats
  const [streak, setStreak] = useState(6);
  const [weekSessions, setWeekSessions] = useState(4);
  const [weekMinutes, setWeekMinutes] = useState(132);
  const [avgHR, setAvgHR] = useState(138);
  const [weekKcal, setWeekKcal] = useState(920);

  // Demo chart data (last 7 days)
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      minutes: [20, 35, 15, 45, 30, 25, 40][i],
      calories: [150, 280, 120, 360, 240, 200, 320][i],
      heartRate: [125, 140, 130, 150, 135, 128, 145][i],
      sessions: [1, 2, 1, 2, 1, 1, 2][i],
    }));
  }, []);

  const targetMinutes = useMemo(
    () => clamp(parseInt(weeklyTargetMin || '0', 10) || 0, 0, 2000),
    [weeklyTargetMin]
  );

  // Extra goals (demo)
  const goalCalories = 1400;
  const goalSessions = 5;
  const hrZone = { min: 130, max: 150 };

  const minutesPct = useMemo(() => (targetMinutes ? clamp(Math.round((weekMinutes / targetMinutes) * 100), 0, 100) : 0), [
    targetMinutes,
    weekMinutes,
  ]);
  const caloriesPct = useMemo(() => clamp(Math.round((weekKcal / goalCalories) * 100), 0, 100), [weekKcal]);
  const sessionsPct = useMemo(() => clamp(Math.round((weekSessions / goalSessions) * 100), 0, 100), [weekSessions]);
  const hrPct = useMemo(() => {
    if (!avgHR) return 0;
    if (avgHR >= hrZone.min && avgHR <= hrZone.max) return 100;
    if (avgHR < hrZone.min) return clamp(Math.round((avgHR / hrZone.min) * 100), 0, 100);
    return clamp(Math.round((hrZone.max / avgHR) * 100), 0, 100);
  }, [avgHR]);

  const pickFromLibrary = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
    });

    if (res?.didCancel) return;
    if (res?.errorCode) {
      Alert.alert('ImagePicker error', `${res.errorCode}: ${res.errorMessage || ''}`.trim());
      return;
    }

    const uri = res?.assets?.[0]?.uri;
    if (uri) setAvatarUri(uri);
  };

  const onAvatarPress = () => {
    Alert.alert('Profile photo', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Library', onPress: pickFromLibrary },
      ...(avatarUri ? [{ text: 'Remove', style: 'destructive', onPress: () => setAvatarUri(null) }] : []),
    ]);
  };

  const resetDemo = () => {
    Alert.alert('Reset demo data?', 'This will reset profile stats on this screen (demo only).', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setAvatarUri(null);
          setName('Athlete');
          setGoal('Build consistency (5 days/week)');
          setWeeklyTargetMin('150');
          setReminders(true);
          setHaptics(true);
          setAutoStartIntervals(false);

          const d = new Date();
          d.setDate(d.getDate() + 7);
          d.setHours(12, 0, 0, 0);
          setCheckInDate(d);

          setStreak(0);
          setWeekSessions(0);
          setWeekMinutes(0);
          setAvgHR(0);
          setWeekKcal(0);
        },
      },
    ]);
  };

  const saveProfile = () => {
    Alert.alert('Saved (demo)', `Name: ${name}\nCheck-in: ${formatPrettyDate(checkInDate)}`);
  };

  const onPickDate = () => setShowDatePicker(true);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event?.type === 'dismissed') return;
    }
    if (selectedDate) {
      const d = new Date(selectedDate);
      d.setHours(12, 0, 0, 0);
      setCheckInDate(d);
    }
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
              <Text style={styles.hTitle}>Profile</Text>
              <Text style={styles.hSub}>RaimfortActionSport settings & stats</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation?.navigate?.('Settings')} style={styles.iconBtn}>
            <Image source={GEAR} style={styles.iconImg} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Identity */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Athlete</Text>
            <Text style={styles.muted}>Tap your avatar to add a profile photo.</Text>

            <View style={styles.avatarRow}>
              <TouchableOpacity activeOpacity={0.9} onPress={onAvatarPress} style={styles.avatarWrap}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{(name?.[0] || 'A').toUpperCase()}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.avatarTitle}>{name}</Text>
                <Text style={styles.avatarSub}>Photo helps personalize your training logs.</Text>

                <View style={styles.avatarBtnsRow}>
                  <TouchableOpacity activeOpacity={0.9} onPress={pickFromLibrary} style={styles.smallBtn}>
                    <Text style={styles.smallBtnText}>Library</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Display name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Athlete"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.fieldInput}
                maxLength={24}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Goal</Text>
              <TextInput
                value={goal}
                onChangeText={setGoal}
                placeholder="Your goal..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.fieldInput}
                maxLength={60}
              />
            </View>

            {/* DatePicker row */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Weekly check-in date</Text>

              <TouchableOpacity activeOpacity={0.9} onPress={onPickDate} style={styles.dateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateValue}>{formatPrettyDate(checkInDate)}</Text>
                  <Text style={styles.dateHint}>Tap to choose when you review progress & adjust plan.</Text>
                </View>

                <View style={styles.dateBtn}>
                  <Image source={CLOCK} style={styles.dateIcon} />
                  <Text style={styles.dateBtnText}>Pick</Text>
                </View>
              </TouchableOpacity>

              {Platform.OS === 'ios' && showDatePicker && (
                <View style={styles.iosPickerWrap}>
                  <DateTimePicker value={checkInDate} mode="date" display="inline" onChange={onChangeDate} themeVariant="dark" />
                  <TouchableOpacity activeOpacity={0.9} onPress={() => setShowDatePicker(false)} style={styles.doneBtn}>
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker value={checkInDate} mode="date" display="calendar" onChange={onChangeDate} />
            )}

            <View style={styles.actionsRow}>
              <TouchableOpacity activeOpacity={0.9} onPress={saveProfile} style={styles.btnPrimaryIcon}>
                <Image source={BOLT} style={styles.actionIcon} />
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={resetDemo} style={styles.btnGhostIcon}>
                <Image source={TRASH} style={styles.actionIconGhost} />
                <Text style={styles.btnGhostText}>Reset demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Multi progress lines (colorful) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progress Lines</Text>
            <Text style={styles.muted}>More lines = clearer momentum.</Text>

            <ProgressRow
              icon={CLOCK}
              title="Minutes"
              value={`${weekMinutes}/${targetMinutes || 0} min`}
              pct={minutesPct}
              colors={[THEME.accent, THEME.blue, THEME.pink]}
            />
            <ProgressRow
              icon={FLAME}
              title="Calories"
              value={`${weekKcal}/${goalCalories} kcal`}
              pct={caloriesPct}
              colors={[THEME.orange, THEME.warn, THEME.pink]}
            />
            <ProgressRow
              icon={BOLT}
              title="Sessions"
              value={`${weekSessions}/${goalSessions}`}
              pct={sessionsPct}
              colors={[THEME.green, THEME.accent, THEME.purple]}
            />
            <ProgressRow
              icon={HEART}
              title="Avg HR"
              value={avgHR ? `${avgHR} bpm (zone ${hrZone.min}-${hrZone.max})` : '—'}
              pct={hrPct}
              colors={[THEME.purple, THEME.pink, THEME.orange]}
            />

            {/* Extra mini “streak” line */}
            <View style={{ marginTop: 12 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.smallMuted}>Streak</Text>
                <Text style={styles.smallStrong}>{streak} days</Text>
              </View>
              <DotLine data={chartData.map(d => d.sessions)} />
            </View>
          </View>

          {/* Weekly colorful lines (7-day strips) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Lines</Text>
            <Text style={styles.muted}>Rainbow strips (per day intensity).</Text>

            <WeeklyStrip title="Minutes" data={chartData} keyName="minutes" unit="min" baseColor={THEME.accent} />
            <WeeklyStrip title="Calories" data={chartData} keyName="calories" unit="kcal" baseColor={THEME.purple} />
            <WeeklyStrip title="Heart Rate" data={chartData} keyName="heartRate" unit="bpm" baseColor={THEME.orange} />
            <WeeklyStrip title="Sessions" data={chartData} keyName="sessions" unit="" baseColor={THEME.green} />
          </View>

          {/* Preferences */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preferences</Text>

            <PrefRow label="Reminders" value={reminders} onValueChange={setReminders} hint="Gentle nudges to stay consistent." />
            <PrefRow label="Haptics" value={haptics} onValueChange={setHaptics} hint="Vibration feedback on actions." />
            <PrefRow
              label="Auto-start intervals"
              value={autoStartIntervals}
              onValueChange={setAutoStartIntervals}
              hint="When you send a program to Timer, start immediately."
            />
          </View>

          <Text style={styles.footer}>RaimfortActionSport • keep it simple, keep it repeatable.</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ProgressRow({ icon, title, value, pct, colors }) {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressTop}>
        <View style={styles.progressLeft}>
          <View style={styles.progressIconWrap}>
            <Image source={icon} style={styles.progressIcon} />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={styles.progressTitle}>{title}</Text>
            <Text style={styles.progressValue}>{value}</Text>
          </View>
        </View>

        <View style={styles.pctPill}>
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
      </View>

      <MultiProgressBar pct={pct} colors={colors} />
      <TickRow />
    </View>
  );
}

function MultiProgressBar({ pct, colors }) {
  const widthPct = `${clamp(pct, 0, 100)}%`;
  return (
    <View style={styles.track2}>
      {/* ticks background */}
      <View style={styles.tickLine} />
      <View style={[styles.tickLine, { left: '25%' }]} />
      <View style={[styles.tickLine, { left: '50%' }]} />
      <View style={[styles.tickLine, { left: '75%' }]} />

      {/* filled rainbow */}
      <View style={[styles.fillWrap, { width: widthPct }]}>
        <View style={[styles.fillSeg, { backgroundColor: colors[0] }]} />
        <View style={[styles.fillSeg, { backgroundColor: colors[1] }]} />
        <View style={[styles.fillSeg, { backgroundColor: colors[2] }]} />
      </View>

      {/* glow edge */}
      <View style={[styles.glowEdge, { left: widthPct }]} />
    </View>
  );
}

function TickRow() {
  return (
    <View style={styles.tickLabelsRow}>
      <Text style={styles.tickText}>0</Text>
      <Text style={styles.tickText}>25</Text>
      <Text style={styles.tickText}>50</Text>
      <Text style={styles.tickText}>75</Text>
      <Text style={styles.tickText}>100</Text>
    </View>
  );
}

function WeeklyStrip({ title, data, keyName, unit, baseColor }) {
  const maxVal = Math.max(...data.map(d => d[keyName] || 0), 1);
  const sum = data.reduce((s, d) => s + (d[keyName] || 0), 0);

  const rainbow = [THEME.accent, THEME.purple, THEME.pink, THEME.orange, THEME.blue, THEME.green, THEME.warn];

  return (
    <View style={styles.stripCard}>
      <View style={styles.stripHeader}>
        <Text style={styles.stripTitle}>{title}</Text>
        <Text style={styles.stripValue}>
          {unit ? `${sum} ${unit}` : `${sum}`}
        </Text>
      </View>

      <View style={styles.stripBar}>
        {data.map((d, i) => {
          const val = d[keyName] || 0;
          const intensity = clamp(val / maxVal, 0, 1);
          const c = rainbow[i % rainbow.length];
          return (
            <View
              key={`${title}-${i}`}
              style={[
                styles.stripSeg,
                {
                  backgroundColor: c,
                  opacity: 0.25 + intensity * 0.75,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.daysRow}>
        {data.map((d) => (
          <Text key={`${title}-${d.day}`} style={styles.dayMini}>
            {d.day}
          </Text>
        ))}
      </View>

      {/* tiny underline (base color) */}
      <View style={[styles.underline, { backgroundColor: baseColor }]} />
    </View>
  );
}

function DotLine({ data }) {
  // data: array of numbers (sessions per day)
  const maxVal = Math.max(...data, 1);
  return (
    <View style={styles.dotLine}>
      {data.map((v, i) => {
        const on = v > 0;
        const scale = 0.9 + (v / maxVal) * 0.7;
        const c = on ? [THEME.green, THEME.accent, THEME.purple, THEME.pink, THEME.orange, THEME.blue, THEME.warn][i % 7] : 'rgba(255,255,255,0.10)';
        return (
          <View key={i} style={[styles.dot, { backgroundColor: c, transform: [{ scale }] }]} />
        );
      })}
    </View>
  );
}

function PrefRow({ label, value, onValueChange, hint }) {
  return (
    <View style={styles.prefRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.prefLabel}>{label}</Text>
        <Text style={styles.prefHint}>{hint}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  screen: { flex: 1, backgroundColor: THEME.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 30, height: 30, resizeMode: 'contain' },
  hTitle: { color: THEME.text, fontWeight: '900', fontSize: 20 },
  hSub: { color: THEME.text2, fontWeight: '800', marginTop: 2 },

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
  iconImg: { width: 18, height: 18, resizeMode: 'contain', tintColor: THEME.text },

  content: { paddingHorizontal: 16, paddingBottom: 26 },

  card: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 14,
    marginTop: 12,
  },

  cardTitle: { color: THEME.text, fontWeight: '900', fontSize: 18 },
  muted: { color: THEME.text2, marginTop: 8, lineHeight: 18, fontWeight: '700' },

  // Avatar
  avatarRow: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 74,
    height: 74,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(66,232,214,0.10)' },
  avatarInitial: { color: THEME.accent, fontWeight: '900', fontSize: 28 },
  avatarTitle: { color: THEME.text, fontWeight: '900', fontSize: 18 },
  avatarSub: { color: THEME.text2, fontWeight: '700', lineHeight: 18 },

  avatarBtnsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: THEME.accent,
  },
  smallBtnText: { color: THEME.bg, fontWeight: '900' },

  field: { marginTop: 12 },
  fieldLabel: { color: THEME.text2, fontWeight: '900', marginBottom: 8 },
  fieldInput: {
    color: THEME.text,
    fontWeight: '900',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
  },

  // DatePicker UI
  dateRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateValue: { color: THEME.text, fontWeight: '900', fontSize: 16 },
  dateHint: { color: THEME.text2, marginTop: 6, fontWeight: '700', lineHeight: 18 },

  dateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(66,232,214,0.25)',
    backgroundColor: 'rgba(66,232,214,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateIcon: { width: 16, height: 16, resizeMode: 'contain', tintColor: THEME.accent },
  dateBtnText: { color: THEME.accent, fontWeight: '900' },

  iosPickerWrap: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  doneBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  doneText: { color: THEME.text, fontWeight: '900' },

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

  // Progress block
  progressRow: { marginTop: 12 },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  progressIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIcon: { width: 16, height: 16, resizeMode: 'contain', tintColor: THEME.text },
  progressTitle: { color: THEME.text, fontWeight: '900' },
  progressValue: { color: THEME.text2, fontWeight: '800' },

  pctPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pctText: { color: THEME.text, fontWeight: '900' },

  track2: {
    marginTop: 10,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    position: 'relative',
  },
  tickLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '0%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  fillWrap: {
    height: '100%',
    flexDirection: 'row',
  },
  fillSeg: { flex: 1 },

  glowEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 10,
    marginLeft: -5,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  tickLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  tickText: { color: THEME.text2, fontWeight: '800', fontSize: 10 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  smallMuted: { color: THEME.text2, fontWeight: '800' },
  smallStrong: { color: THEME.text, fontWeight: '900' },

  // Weekly strips
  stripCard: {
    marginTop: 12,
    backgroundColor: THEME.deep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 12,
  },
  stripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stripTitle: { color: THEME.text, fontWeight: '900' },
  stripValue: { color: THEME.text2, fontWeight: '900' },

  stripBar: {
    marginTop: 10,
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  stripSeg: { flex: 1 },

  daysRow: { marginTop: 8, flexDirection: 'row' },
  dayMini: { flex: 1, textAlign: 'center', color: THEME.text2, fontWeight: '800', fontSize: 10 },

  underline: { marginTop: 10, height: 2, borderRadius: 999, opacity: 0.75 },

  // dot line
  dotLine: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  prefRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 12,
  },
  prefLabel: { color: THEME.text, fontWeight: '900', fontSize: 16 },
  prefHint: { color: THEME.text2, marginTop: 4, fontWeight: '700' },

  footer: { color: THEME.text2, textAlign: 'center', marginTop: 14, marginBottom: 10, fontWeight: '700' },
});
