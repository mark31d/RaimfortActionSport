// Components/SettingsScreen.js — RaimfortActionSport (dark navy, containers, practical settings)
// Includes: Units, Training days, Session start time (time picker), Weekly check-in (date picker),
// Data actions (Clear History), App actions (Rate / Tips), toggles.
//
// Requires: @react-native-community/datetimepicker
//
// Assets used:
// ./assets/logo.png
// ./assets/gear.png
// ./assets/back.png
// ./assets/trash.png
// ./assets/bolt.png
// ./assets/clock.png

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
  Alert,
  Platform,
  Switch,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const LOGO = require('../assets/logo.png');
const GEAR = require('../assets/gear.png');
const BACK = require('../assets/back.png');
const TRASH = require('../assets/trash.png');
const BOLT = require('../assets/bolt.png');
const CLOCK = require('../assets/clock.png');

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
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function prettyDate(d) {
  try {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}
function prettyTime(d) {
  try {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SettingsScreen({ navigation }) {
  // Units
  const [units, setUnits] = useState('Metric'); // Metric / Imperial

  // Training days
  const [days, setDays] = useState([true, true, true, true, true, false, false]); // 5 days default

  // Toggles
  const [reminders, setReminders] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [autoStartTimer, setAutoStartTimer] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Date/Time pickers
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [sessionTime, setSessionTime] = useState(() => {
    const d = new Date();
    d.setHours(19, 0, 0, 0); // 7 PM
    return d;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Modal for Units (nice iOS-like)
  const [unitsModal, setUnitsModal] = useState(false);

  const selectedDaysText = useMemo(() => {
    const picked = DAYS.filter((_, i) => days[i]);
    if (!picked.length) return 'None';
    if (picked.length === 7) return 'Every day';
    return picked.join(', ');
  }, [days]);

  const trainingDaysCount = useMemo(() => days.filter(Boolean).length, [days]);

  const toggleDay = (idx) => {
    setDays(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

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

  const onChangeTime = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event?.type === 'dismissed') return;
    }
    if (selectedDate) {
      const d = new Date(selectedDate);
      // keep today's date, store time only
      setSessionTime(d);
    }
  };

  const clearHistory = () => {
    Alert.alert('Clear history?', 'This is a UI demo. In a real app, it would wipe workouts & logs.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Cleared (demo)') },
    ]);
  };

  const exportData = () => {
    Alert.alert('Export (demo)', 'Here you could generate a CSV/JSON export of your sessions.');
  };

  const rateApp = () => {
    Alert.alert('Rate RaimfortActionSport (demo)', 'Open App Store / Google Play rating flow here.');
  };

  const openTips = () => {
    Alert.alert(
      'Tempo Tips',
      '• Keep rest short on circuit days.\n• If you feel low-energy, mark D (light).\n• Track consistency more than intensity.'
    );
  };

  const saveSettings = () => {
    Alert.alert(
      'Saved (demo)',
      `Units: ${units}\nDays: ${trainingDaysCount}/7\nStart: ${prettyTime(sessionTime)}\nCheck-in: ${prettyDate(checkInDate)}`
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
            <View>
              <Text style={styles.hTitle}>Settings</Text>
              <Text style={styles.hSub}>RaimfortActionSport preferences</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation?.goBack?.()} style={styles.iconBtn}>
              <Image source={BACK} style={styles.iconImg} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} onPress={saveSettings} style={styles.iconBtn}>
              <Image source={GEAR} style={styles.iconImg} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Units */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Units</Text>
            <Text style={styles.muted}>Choose how RaimfortActionSport displays distance and weight.</Text>

            <TouchableOpacity activeOpacity={0.9} onPress={() => setUnitsModal(true)} style={styles.rowBtn}>
              <Text style={styles.rowLabel}>Measurement</Text>
              <Text style={styles.rowValue}>{units}</Text>
            </TouchableOpacity>
          </View>

          {/* Schedule */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Schedule</Text>
            <Text style={styles.muted}>Set your typical training days and preferred start time.</Text>

            <View style={styles.daysRow}>
              {DAYS.map((d, i) => {
                const active = days[i];
                return (
                  <TouchableOpacity
                    key={d}
                    activeOpacity={0.9}
                    onPress={() => toggleDay(i)}
                    style={[
                      styles.dayChip,
                      active
                        ? { backgroundColor: 'rgba(66,232,214,0.16)', borderColor: 'rgba(66,232,214,0.35)' }
                        : null,
                    ]}
                  >
                    <Text style={[styles.dayText, { color: active ? THEME.accent : THEME.text2 }]}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.smallMuted}>Selected</Text>
              <Text style={styles.smallStrong}>{selectedDaysText}</Text>
            </View>

            {/* Session start time */}
            <TouchableOpacity activeOpacity={0.9} onPress={() => setShowTimePicker(true)} style={styles.rowBtn}>
              <Text style={styles.rowLabel}>Session start</Text>
              <View style={styles.rowRight}>
                <Image source={CLOCK} style={styles.rowIcon} />
                <Text style={styles.rowValue}>{prettyTime(sessionTime)}</Text>
              </View>
            </TouchableOpacity>

            {/* Weekly check-in date */}
            <TouchableOpacity activeOpacity={0.9} onPress={() => setShowDatePicker(true)} style={styles.rowBtn}>
              <Text style={styles.rowLabel}>Weekly check-in</Text>
              <View style={styles.rowRight}>
                <Image source={CLOCK} style={styles.rowIcon} />
                <Text style={styles.rowValue}>{prettyDate(checkInDate)}</Text>
              </View>
            </TouchableOpacity>

            {/* iOS inline pickers */}
            {Platform.OS === 'ios' && showTimePicker && (
              <View style={styles.iosPickerWrap}>
                <DateTimePicker
                  value={sessionTime}
                  mode="time"
                  display="spinner"
                  onChange={onChangeTime}
                  themeVariant="dark"
                />
                <TouchableOpacity activeOpacity={0.9} onPress={() => setShowTimePicker(false)} style={styles.doneBtn}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {Platform.OS === 'ios' && showDatePicker && (
              <View style={styles.iosPickerWrap}>
                <DateTimePicker
                  value={checkInDate}
                  mode="date"
                  display="inline"
                  onChange={onChangeDate}
                  themeVariant="dark"
                />
                <TouchableOpacity activeOpacity={0.9} onPress={() => setShowDatePicker(false)} style={styles.doneBtn}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Android popups */}
            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker value={sessionTime} mode="time" display="clock" onChange={onChangeTime} />
            )}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker value={checkInDate} mode="date" display="calendar" onChange={onChangeDate} />
            )}
          </View>

          {/* Preferences */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preferences</Text>

            <ToggleRow
              label="Reminders"
              hint="Gentle nudges on selected training days."
              value={reminders}
              onValueChange={setReminders}
            />
            <ToggleRow
              label="Haptics"
              hint="Vibration feedback on actions."
              value={haptics}
              onValueChange={setHaptics}
            />
            <ToggleRow
              label="Auto-start Timer"
              hint="Start timer immediately when a program is sent."
              value={autoStartTimer}
              onValueChange={setAutoStartTimer}
            />
            <ToggleRow
              label="Reduce Motion"
              hint="Lower animation intensity for comfort."
              value={reduceMotion}
              onValueChange={setReduceMotion}
            />
          </View>

          {/* Data */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data</Text>
            <Text style={styles.muted}>Manage your logs and backups.</Text>

            <TouchableOpacity activeOpacity={0.9} onPress={exportData} style={styles.actionRow}>
              <View style={styles.actionLeft}>
                <Image source={BOLT} style={styles.actionIcon} />
                <Text style={styles.actionText}>Export data</Text>
              </View>
              <Text style={styles.actionHint}>CSV / JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={clearHistory} style={[styles.actionRow, { marginTop: 10 }]}>
              <View style={styles.actionLeft}>
                <Image source={TRASH} style={[styles.actionIcon, { tintColor: THEME.warn }]} />
                <Text style={styles.actionText}>Clear history</Text>
              </View>
              <Text style={[styles.actionHint, { color: THEME.warn }]}>Danger</Text>
            </TouchableOpacity>
          </View>

          {/* App */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>App</Text>

            <TouchableOpacity activeOpacity={0.9} onPress={openTips} style={styles.actionRow}>
              <View style={styles.actionLeft}>
                <Image source={BOLT} style={styles.actionIcon} />
                <Text style={styles.actionText}>Quick tips</Text>
              </View>
              <Text style={styles.actionHint}>Open</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={rateApp} style={[styles.actionRow, { marginTop: 10 }]}>
              <View style={styles.actionLeft}>
                <Image source={BOLT} style={styles.actionIcon} />
                <Text style={styles.actionText}>Rate RaimfortActionSport</Text>
              </View>
              <Text style={styles.actionHint}>★ ★ ★ ★ ★</Text>
            </TouchableOpacity>
          </View>

          {/* Save button */}
          <TouchableOpacity activeOpacity={0.9} onPress={saveSettings} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save Settings</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>RaimfortActionSport • settings are local in this demo screen.</Text>
        </ScrollView>
      </View>

      {/* Units modal */}
      <Modal visible={unitsModal} transparent animationType="fade" onRequestClose={() => setUnitsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Measurement Units</Text>
            <Text style={styles.modalSub}>Choose the system you prefer.</Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setUnits('Metric');
                setUnitsModal(false);
              }}
              style={[styles.modalOption, units === 'Metric' && styles.modalOptionActive]}
            >
              <Text style={[styles.modalOptionText, units === 'Metric' && styles.modalOptionTextActive]}>Metric</Text>
              <Text style={styles.modalHint}>kg, km</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setUnits('Imperial');
                setUnitsModal(false);
              }}
              style={[styles.modalOption, units === 'Imperial' && styles.modalOptionActive]}
            >
              <Text style={[styles.modalOptionText, units === 'Imperial' && styles.modalOptionTextActive]}>Imperial</Text>
              <Text style={styles.modalHint}>lb, mi</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={() => setUnitsModal(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ToggleRow({ label, hint, value, onValueChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
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

  rowBtn: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: { color: THEME.text, fontWeight: '900', fontSize: 16 },
  rowValue: { color: THEME.text2, fontWeight: '900' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowIcon: { width: 16, height: 16, resizeMode: 'contain', tintColor: THEME.accent },

  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  dayChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dayText: { fontWeight: '900' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  smallMuted: { color: THEME.text2, fontWeight: '800' },
  smallStrong: { color: THEME.text, fontWeight: '900' },

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

  toggleRow: {
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
  toggleLabel: { color: THEME.text, fontWeight: '900', fontSize: 16 },
  toggleHint: { color: THEME.text2, marginTop: 4, fontWeight: '700' },

  actionRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionIcon: { width: 18, height: 18, resizeMode: 'contain', tintColor: THEME.text },
  actionText: { color: THEME.text, fontWeight: '900', fontSize: 16 },
  actionHint: { color: THEME.text2, fontWeight: '900' },

  saveBtn: {
    marginTop: 14,
    backgroundColor: THEME.purple,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: THEME.bg, fontWeight: '900', fontSize: 18 },

  footer: { color: THEME.text2, textAlign: 'center', marginTop: 14, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: THEME.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.line,
    padding: 14,
  },
  modalTitle: { color: THEME.text, fontWeight: '900', fontSize: 18 },
  modalSub: { color: THEME.text2, marginTop: 8, fontWeight: '700' },

  modalOption: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: THEME.deep,
    padding: 12,
  },
  modalOptionActive: { borderColor: 'rgba(66,232,214,0.35)', backgroundColor: 'rgba(66,232,214,0.10)' },
  modalOptionText: { color: THEME.text, fontWeight: '900', fontSize: 16 },
  modalOptionTextActive: { color: THEME.accent },
  modalHint: { color: THEME.text2, marginTop: 6, fontWeight: '700' },

  modalClose: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { color: THEME.text, fontWeight: '900' },
});
