/**
 * @file DashboardScreen.tsx
 * @description Main home screen showing the user's calendar events and progress.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Bell, Plus, Check, BookOpen, CalendarDays, FileText, GraduationCap, Trash2 } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius, tone } from '../theme';
import { BottomNav } from '../components/BottomNav';
import { AddCalendarEventModal } from '../components/AddCalendarEventModal';
import { useCalendarEvents } from '../data/CalendarContext';
import { CalendarEvent, formatDaysLeft, formatDueDateTime, getDueSortKey } from '../data/calendarEvents';
import { getuser } from '../controller/oauth';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

// ==== CONSTANTS ====
const typeConfig = {
  class:      { label: 'Class',      Icon: CalendarDays, tone: 'sky' },
  assignment: { label: 'Assignment', Icon: FileText,      tone: 'peach' },
  exam:       { label: 'Exam',       Icon: GraduationCap, tone: 'mint' },
  revision:   { label: 'Revision',   Icon: BookOpen,      tone: 'lavender' },
};

const DAY_LETTERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ==== HELPERS ====
function buildWeekStrip(): { d: string; n: number; active: boolean }[] {
  const today = new Date();
  const todayDate = today.getDate();
  const todayDay = today.getDay();
  const strip = [];
  for (let i = 1; i <= 7; i++) {
    const offset = i - (todayDay === 0 ? 7 : todayDay);
    const date = new Date(today);
    date.setDate(todayDate + offset);
    strip.push({
      d: DAY_LETTERS[date.getDay()],
      n: date.getDate(),
      active: date.getDate() === todayDate && date.getMonth() === today.getMonth(),
    });
  }
  return strip;
}

// ==== COMPONENT ====
export function DashboardScreen() {
  const { events, toggleComplete, deleteEvent, refreshEvents } = useCalendarEvents();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [firstName, setFirstName] = useState('');

  // 1. Intercept onboarding params safely
  const route = useRoute();
  const extraTask = route.params?.initialOnboardingTask;
  
  const combinedEvents = [...events];
  if (extraTask && !combinedEvents.some(e => e.id === extraTask.id)) {
    combinedEvents.push(extraTask);
  }

  const today = new Date();
  const todayName = DAY_NAMES[today.getDay()];  
  const weekStrip = buildWeekStrip();            

  // 2. FIXED: Update all statistics and lists to read from combinedEvents!
  const completed = combinedEvents.filter((e) => e.completed).length;
  const pct = combinedEvents.length ? (completed / combinedEvents.length) * 94.2 : 0;
  const homeEvents = [...combinedEvents].sort(sortHomeEvents); 

  // Re-fetch user and events every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const user = await getuser();
          const full = user.full_name ?? '';
          setFirstName(full.split(' ')[0]);
        } catch (e) {
          console.error('DashboardScreen: failed to load user:', e);
        }
      };
      fetchUser();
      refreshEvents();
    }, [refreshEvents])
  ); 

  return (
    <SafeAreaView style={s.safe}>
      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={s.muted}>{todayName}</Text>
          <Text style={s.h1}>Hi, {firstName || '...'}</Text>
        </View>
        <View style={s.iconBtn}>
          <Bell size={16} color={colors.foreground + '99'} strokeWidth={1.6} />
        </View>
      </View>

      {/* DATE STRIP */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }} style={{ marginTop: 16, flexGrow: 0 }}>
        {weekStrip.map((day) => (
          <Pressable key={day.n} style={[s.day, day.active && s.dayActive]}>
            <Text style={[s.dayLetter, day.active && { color: colors.background }]}>{day.d}</Text>
            <Text style={[s.dayNum, day.active && { color: colors.background }]}>{day.n}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* PROGRESS CARD */}
      <View style={s.progress}>
        <View>
          <Text style={s.muted}>Calendar progress</Text>
          <Text style={s.h2}>{completed} of {combinedEvents.length} done</Text>
        </View>
        <Svg width={48} height={48} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={24} cy={24} r={20} stroke={colors.background} strokeWidth={4} fill="none" />
          <Circle cx={24} cy={24} r={20} stroke={colors.lavender} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={`${pct} 200`} />
        </Svg>
      </View>

      {/* SECTION HEADER */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Calendar list</Text>
        <View style={s.pill}><Text style={s.pillText}>View all</Text></View>
      </View>

      {/* EVENT LIST */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 8 }} style={{ flex: 1 }}>
        {homeEvents.map((event) => {
          const config = typeConfig[event.type];
          const Icon = config.Icon;
          return (
            <View key={event.id} style={[s.task, { backgroundColor: tone[config.tone].bg }]}>
              <Pressable onPress={() => toggleComplete(event.id)} style={[s.checkbox, event.completed && s.checkboxDone]}>
                {event.completed && <Check size={14} color={colors.background} strokeWidth={3} />}
              </Pressable>
              <View style={[s.iconWrap, { backgroundColor: tone[config.tone].tag }]}>
                <Icon size={16} color={colors.foreground} strokeWidth={1.7} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.taskTitle, event.completed && s.completedText]}>{event.title}</Text>
                <View style={s.meta}>
                  <View style={[s.dot, { backgroundColor: tone[config.tone].tag }]} />
                  <Text style={s.metaText}>{event.course}</Text>
                  <Text style={s.metaText}>-</Text>
                  <Text style={s.metaText}>{getHomeMeta(event)}</Text>
                </View>
              </View>
              <Pressable onPress={() => deleteEvent(event.id)} style={s.deleteBtn}>
                <Trash2 size={15} color={colors.foreground + '99'} strokeWidth={1.8} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <Pressable style={s.fab} onPress={() => setIsAddOpen(true)}>
        <Plus size={20} color={colors.background} />
      </Pressable>
      <AddCalendarEventModal visible={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <BottomNav active="home" />
    </SafeAreaView>
  );
}

// ==== HELPERS ====
function getHomeMeta(event: CalendarEvent) {
  if (event.type === 'class') return `${event.weekday} ${event.startTime}-${event.endTime} weekly`;
  if (!event.dueDate) return typeConfig[event.type].label;
  return `${formatDueDateTime(event.dueDate, event.dueTime)} - ${formatDaysLeft(event.dueDate)}`;
}

function sortHomeEvents(a: CalendarEvent, b: CalendarEvent) {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  return getDueSortKey(a).localeCompare(getDueSortKey(b));
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  muted:         { fontSize: 12, color: colors.muted },
  h1:            { fontSize: 22, fontWeight: '700', color: colors.foreground, letterSpacing: -0.5 },
  h2:            { fontSize: 16, fontWeight: '700', color: colors.foreground },
  iconBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  day:           { width: 48, height: 64, borderRadius: 16, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  dayActive:     { backgroundColor: colors.foreground },
  dayLetter:     { fontSize: 11, color: colors.muted },
  dayNum:        { fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 4 },
  progress:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.lavenderSoft, padding: 16, borderRadius: 24, marginHorizontal: 20, marginTop: 16 },
  sectionRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  sectionTitle:  { fontSize: 14, fontWeight: '700', color: colors.foreground },
  pill:          { backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  pillText:      { fontSize: 11, color: colors.muted, fontWeight: '600' },
  task:          { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20 },
  checkbox:      { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.foreground + '33', backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  checkboxDone:  { backgroundColor: colors.foreground, borderColor: 'transparent' },
  iconWrap:      { width: 32, height: 32, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  taskTitle:     { fontSize: 13, fontWeight: '600', color: colors.foreground },
  completedText: { color: colors.muted, textDecorationLine: 'line-through' },
  meta:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  dot:           { width: 6, height: 6, borderRadius: 3 },
  metaText:      { fontSize: 11, color: colors.muted, fontWeight: '500' },
  fab:           { position: 'absolute', bottom: 88, right: 20, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.foreground, alignItems: 'center', justifyContent: 'center' },
});