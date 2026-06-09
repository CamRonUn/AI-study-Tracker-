import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { BookOpen, Check, Clock, FileText, Filter, GraduationCap, Trash2 } from 'lucide-react-native';
import { colors, radius, tone } from '../theme';
import { BottomNav } from '../components/BottomNav';
import { useCalendarEvents } from '../data/CalendarContext';
import { CalendarEvent, formatDaysLeft, getDueSortKey, getStage, getStageHint, isReminderEvent } from '../data/calendarEvents';
import { useFocusEffect } from '@react-navigation/native';

const typeConfig = {
  assignment: { label: 'Assignment', Icon: FileText, tone: 'peach' },
  exam: { label: 'Exam', Icon: GraduationCap, tone: 'mint' },
  revision: { label: 'Revision', Icon: BookOpen, tone: 'lavender' },
};

const priorityColor = {
  High: '#D94F70',
  Medium: '#E08A2E',
  Low: '#4C7EEA',
};

type ReminderFilter = 'all' | 'assignment' | 'exam' | 'revision';

const filters: { id: ReminderFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'assignment', label: 'Assignments' },
  { id: 'exam', label: 'Exams' },
  { id: 'revision', label: 'Revision' },
];

export function RemindersScreen() {
  const { events, toggleComplete, deleteEvent, refreshEvents } = useCalendarEvents();
  const [activeFilter, setActiveFilter] = useState<ReminderFilter>('all');

  useFocusEffect(
    useCallback(() => {
      refreshEvents();
    }, [refreshEvents])
  );

  const reminderEvents = useMemo(
    () =>
      events
        .filter(isReminderEvent)
        .filter((event) => activeFilter === 'all' || event.type === activeFilter),
    [activeFilter, events]
  );

  const upcoming = reminderEvents
    .filter((event) => !event.completed)
    .sort((a, b) => getDueSortKey(a).localeCompare(getDueSortKey(b)));

  const completed = reminderEvents
    .filter((event) => event.completed)
    .sort((a, b) => getDueSortKey(b).localeCompare(getDueSortKey(a)));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.muted}>Stay on track</Text>
          <Text style={s.h1}>Reminders</Text>
        </View>
        <View style={s.iconBtn}>
          <Filter size={16} color={colors.foreground + '99'} strokeWidth={1.6} />
        </View>
      </View>

      <View style={s.filters}>
        {filters.map((filter) => (
          <Pressable
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
            style={[s.fpill, activeFilter === filter.id && { backgroundColor: colors.foreground }]}
          >
            <Text style={[s.fpillText, activeFilter === filter.id && { color: colors.background }]}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 100, gap: 10 }} style={{ flex: 1 }}>
        <SummaryCard upcomingCount={upcoming.length} completedCount={completed.length} />

        <Text style={s.section}>UPCOMING</Text>
        {upcoming.map((event) => (
          <ReminderCard key={event.id} event={event} onToggle={toggleComplete} onDelete={deleteEvent} />
        ))}

        <Text style={s.section}>COMPLETED</Text>
        {completed.map((event) => (
          <ReminderCard key={event.id} event={event} onToggle={toggleComplete} onDelete={deleteEvent} />
        ))}
      </ScrollView>

      <BottomNav active="reminders" />
    </SafeAreaView>
  );
}

function SummaryCard({
  upcomingCount,
  completedCount,
}: {
  upcomingCount: number;
  completedCount: number;
}) {
  return (
    <View style={s.summary}>
      <View>
        <Text style={s.muted}>Assignments, exams and revision</Text>
        <Text style={s.h2}>{upcomingCount} active reminders</Text>
      </View>
      <View style={s.doneBubble}>
        <Check size={16} color={colors.foreground} strokeWidth={2.2} />
        <Text style={s.doneText}>{completedCount}</Text>
      </View>
    </View>
  );
}

function ReminderCard({
  event,
  onToggle,
  onDelete,
}: {
  event: CalendarEvent;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const config = typeConfig[event.type as keyof typeof typeConfig];
  const stage = getStage(event);
  const stageHint = getStageHint(event);
  const toneName = config.tone;
  const priority = event.priority || 'Low';
  const showPriority = event.type === 'assignment' || event.type === 'exam';
  const Icon = config.Icon;

  return (
    <View style={[s.card, { backgroundColor: tone[toneName].bg }]}>
      <View style={[s.iconWrap, { backgroundColor: tone[toneName].tag }]}>
        <Icon size={18} color={colors.foreground} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{event.course}</Text>
            <Text style={[s.cardSub, event.completed && s.completedText]}>{event.title}</Text>
          </View>
          <View style={[s.statusPill, { backgroundColor: tone[toneName].tag }]}>
            <Text style={s.statusText}>{stage}</Text>
          </View>
        </View>

        <View style={s.metaRow}>
          <Clock size={12} color={colors.muted} strokeWidth={1.8} />
          <Text style={s.metaText}>{event.dueDate ? formatDaysLeft(event.dueDate) : 'No due date'}</Text>
          {event.dueTime && <Text style={s.metaText}>at {event.dueTime}</Text>}
          <Text style={s.metaText}>-</Text>
          <Text style={s.metaText}>{config.label}</Text>
        </View>
        <Text style={s.stageHint}>{stageHint}</Text>

        {showPriority && (
          <View style={s.priorityRow}>
            <View style={[s.priorityDot, { backgroundColor: priorityColor[priority] }]} />
            <Text style={s.metaText}>{priority} priority</Text>
          </View>
        )}
      </View>

      <View style={[s.checkbox, event.completed && s.checkboxDone]}>
        <Pressable onPress={() => onToggle(event.id)} style={s.checkboxHit}>
          {event.completed && <Check size={14} color={colors.background} strokeWidth={3} />}
        </Pressable>
      </View>
      <Pressable onPress={() => onDelete(event.id)} style={s.deleteBtn}>
        <Trash2 size={15} color={colors.foreground + '99'} strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  muted: { fontSize: 12, color: colors.muted },
  h1: { fontSize: 22, fontWeight: '700', color: colors.foreground, letterSpacing: -0.5 },
  h2: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 2 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 16 },
  fpill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.secondary },
  fpillText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  section: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1.2, marginTop: 8, marginBottom: 2 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.lavenderSoft, padding: 16, borderRadius: 20 },
  doneBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.pill },
  doneText: { fontSize: 12, color: colors.foreground, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 20 },
  iconWrap: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  cardSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  statusText: { fontSize: 10, fontWeight: '700', color: colors.foreground },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  metaText: { fontSize: 11, color: colors.muted, fontWeight: '500' },
  stageHint: { fontSize: 11, color: colors.foreground, fontWeight: '600', marginTop: 6 },
  completedText: { textDecorationLine: 'line-through' },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.foreground + '33', alignItems: 'center', justifyContent: 'center', marginTop: 7 },
  checkboxHit: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  deleteBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, marginTop: 5 },
});
