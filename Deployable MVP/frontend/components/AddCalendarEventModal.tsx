import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { colors, radius } from '../theme';
import { useCalendarEvents } from '../data/CalendarContext';
import { CalendarEventType, formatDateKey, NewCalendarEvent, Priority } from '../data/calendarEvents';
import { getCources } from '../controller/cources';

const eventTypes: { type: CalendarEventType; label: string }[] = [
  { type: 'class', label: 'Class' },
  { type: 'assignment', label: 'Assignment' },
  { type: 'exam', label: 'Exam' },
  { type: 'revision', label: 'Revision' },
];

const priorities: Priority[] = ['High', 'Medium', 'Low'];
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const hours = Array.from({ length: 24 }, (_, index) => `${index}`.padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '59'];
const today = new Date();

type UserCourse = {
  Course_code?: string | null;
  Course_name?: string | null;
  code?: string | null;
  name?: string | null;
};

export function AddCalendarEventModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addEvent } = useCalendarEvents();
  const [type, setType] = useState<CalendarEventType>('assignment');
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [useOtherCourse, setUseOtherCourse] = useState(false);
  const [course, setCourse] = useState('');
  const [otherCourse, setOtherCourse] = useState('');
  const [title, setTitle] = useState('');
  const [formError, setFormError] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
  const [dueTime, setDueTime] = useState('17:00');
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [weekday, setWeekday] = useState('Monday');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isActive = true;

    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const data = await getCources();
        const userCourses = normalizeCourses(data);

        if (isActive) {
          setCourses(userCourses);
          setCourse((current) =>
            current.trim() || userCourses.length === 0 ? current : getCourseLabel(userCourses[0])
          );
        }
      } catch (error) {
        console.error('AddCalendarEventModal: failed to load courses:', error);
        if (isActive) {
          setCourses([]);
        }
      } finally {
        if (isActive) {
          setCoursesLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      isActive = false;
    };
  }, [visible]);

  useEffect(() => {
    if (type !== 'revision' && useOtherCourse) {
      setUseOtherCourse(false);
      setCourse(courses[0] ? getCourseLabel(courses[0]) : '');
      setOtherCourse('');
    }
    setFormError('');
  }, [courses, type, useOtherCourse]);

  useEffect(() => {
    if (type === 'revision' && !coursesLoading && courses.length === 0) {
      setUseOtherCourse(true);
    }
  }, [courses.length, coursesLoading, type]);

  const resetForm = () => {
    setUseOtherCourse(false);
    setCourse('');
    setOtherCourse('');
    setTitle('');
    setFormError('');
    setPriority('Medium');
    setSelectedDate(formatDateKey(today));
    setDueTime('17:00');
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setWeekday('Monday');
    setStartTime('10:00');
    setEndTime('12:00');
  };

  const close = () => {
    resetForm();
    onClose();
  };

  const submit = () => {
    const cleanCourse = useOtherCourse ? otherCourse.trim() || 'Other' : course.trim();
    const cleanTitle = title.trim();

    if (!cleanCourse) {
      setFormError('Select a course first.');
      return;
    }

    if (!cleanTitle) {
      setFormError('Add a detail first.');
      return;
    }

    const event: NewCalendarEvent =
      type === 'class'
        ? {
            type,
            course: cleanCourse,
            title: cleanTitle,
            weekday,
            startTime,
            endTime,
            repeatsWeekly: true,
          }
        : {
            type,
            course: cleanCourse,
            title: cleanTitle,
            createdDate: formatDateKey(new Date()),
            dueDate: selectedDate,
            dueTime,
            priority: type === 'revision' ? undefined : priority,
          };

    addEvent(event);
    close();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={close}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <View style={s.header}>
            <View>
              <Text style={s.eyebrow}>Calendar</Text>
              <Text style={s.title}>Add event</Text>
            </View>
            <Pressable onPress={close} style={s.iconButton}>
              <X size={18} color={colors.foreground} strokeWidth={1.8} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <View style={s.chipRow}>
              {eventTypes.map((item) => (
                <Pressable
                  key={item.type}
                  onPress={() => setType(item.type)}
                  style={[s.chip, type === item.type && s.chipActive]}
                >
                  <Text style={[s.chipText, type === item.type && s.chipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <CourseSelector
              courses={courses}
              loading={coursesLoading}
              selectedCourse={course}
              onSelect={setCourse}
              allowOther={type === 'revision'}
              otherSelected={useOtherCourse}
              onUseOther={setUseOtherCourse}
              otherCourse={otherCourse}
              onChangeOther={setOtherCourse}
            />

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={getNotePlaceholder(type)}
              placeholderTextColor={colors.muted}
              style={[s.input, s.titleInput]}
            />

            {type === 'class' ? (
              <View style={s.group}>
                <Text style={s.groupTitle}>Weekly class time</Text>
                <View style={s.chipRow}>
                  {weekdays.map((day) => (
                    <Pressable
                      key={day}
                      onPress={() => setWeekday(day)}
                      style={[s.chip, weekday === day && s.chipActive]}
                    >
                      <Text style={[s.chipText, weekday === day && s.chipTextActive]}>
                        {day.slice(0, 3)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TimeSelector label="Start time" value={startTime} onSelect={setStartTime} />
                <TimeSelector label="End time" value={endTime} onSelect={setEndTime} />
              </View>
            ) : (
              <View style={s.group}>
                <Text style={s.groupTitle}>Due date</Text>
                <MonthPicker
                  selectedDate={selectedDate}
                  viewMonth={viewMonth}
                  onSelect={setSelectedDate}
                  onChangeMonth={setViewMonth}
                />
                <TimeSelector label="Deadline time" value={dueTime} onSelect={setDueTime} />

                {(type === 'assignment' || type === 'exam') && (
                  <View style={s.priorityGroup}>
                    <Text style={s.groupTitle}>Priority</Text>
                    <View style={s.chipRow}>
                      {priorities.map((item) => (
                        <Pressable
                          key={item}
                          onPress={() => {
                            setPriority(item);
                            setFormError('');
                          }}
                          style={[s.priorityChip, priority === item && s.chipActive]}
                        >
                          <Text style={[s.chipText, priority === item && s.chipTextActive]}>
                            {item}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <Pressable onPress={submit} style={s.submitButton}>
            <Text style={s.submitText}>Add to calendar</Text>
          </Pressable>
          {!!formError && <Text style={s.errorText}>{formError}</Text>}
        </View>
      </View>
    </Modal>
  );
}

function CourseSelector({
  courses,
  loading,
  selectedCourse,
  onSelect,
  allowOther,
  otherSelected,
  onUseOther,
  otherCourse,
  onChangeOther,
}: {
  courses: UserCourse[];
  loading: boolean;
  selectedCourse: string;
  onSelect: (course: string) => void;
  allowOther: boolean;
  otherSelected: boolean;
  onUseOther: (value: boolean) => void;
  otherCourse: string;
  onChangeOther: (value: string) => void;
}) {
  const hasCourses = courses.length > 0;

  return (
    <View style={s.courseGroup}>
      <View style={s.courseHeader}>
        <Text style={s.groupTitle}>Course</Text>
        {loading && <Text style={s.helperText}>Loading courses...</Text>}
      </View>

      {hasCourses ? (
        <View style={s.optionRow}>
          {courses.map((course, index) => {
            const label = getCourseLabel(course);
            const code = getCourseCode(course);
            const name = getCourseName(course);
            const isActive = selectedCourse === label;

            return (
              <Pressable
                key={`${label}-${index}`}
                onPress={() => {
                  onUseOther(false);
                  onSelect(label);
                }}
                style={[s.courseChoice, isActive && s.courseChoiceActive]}
              >
                {!!code && (
                  <Text style={[s.courseCode, isActive && s.courseTextActive]}>{code}</Text>
                )}
                <Text
                  numberOfLines={2}
                  style={[s.courseName, isActive && s.courseTextActive]}
                >
                  {name || label}
                </Text>
              </Pressable>
            );
          })}

          {allowOther && (
            <>
              <Pressable
                onPress={() => {
                  onUseOther(true);
                  onSelect('');
                  onChangeOther('');
                }}
                style={[s.courseChoice, otherSelected && s.courseChoiceActive]}
              >
                <Text style={[s.courseCode, otherSelected && s.courseTextActive]}>Other</Text>
                <Text style={[s.courseName, otherSelected && s.courseTextActive]}>
                  Self study
                </Text>
              </Pressable>

              {otherSelected && (
                <TextInput
                  value={otherCourse}
                  onChangeText={onChangeOther}
                  placeholder="Self study topic"
                  placeholderTextColor={colors.muted}
                  style={[s.input, s.titleInput]}
                />
              )}
            </>
          )}
        </View>
      ) : allowOther ? (
        <View style={s.courseList}>
          <Pressable
            onPress={() => {
              onUseOther(true);
              onSelect('');
            }}
            style={[s.courseChoice, s.courseChoiceActive]}
          >
            <Text style={[s.courseCode, s.courseTextActive]}>Other</Text>
            <Text style={[s.courseName, s.courseTextActive]}>Self study</Text>
          </Pressable>
          <TextInput
            value={otherCourse}
            onChangeText={onChangeOther}
            placeholder="Self study topic"
            placeholderTextColor={colors.muted}
            style={[s.input, s.titleInput]}
          />
        </View>
      ) : (
        <View style={s.emptyCourseBox}>
          <Text style={s.emptyCourseText}>
            {loading ? 'Loading courses...' : 'Add courses in Profile first.'}
          </Text>
        </View>
      )}
    </View>
  );
}

function getNotePlaceholder(type: CalendarEventType) {
  if (type === 'class') {
    return 'Class detail';
  }

  if (type === 'assignment') {
    return 'Assignment detail';
  }

  if (type === 'exam') {
    return 'Exam detail';
  }

  return 'Revision detail';
}

function TimeSelector({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: string;
  onSelect: (time: string) => void;
}) {
  const [selectedHour = '00', selectedMinute = '00'] = value.split(':');
  const setHour = (hour: string) => onSelect(`${hour}:${selectedMinute}`);
  const setMinute = (minute: string) => onSelect(`${selectedHour}:${minute}`);

  return (
    <View style={s.timePicker}>
      <View style={s.timeHeader}>
        <Text style={s.timeLabel}>{label}</Text>
        <Text style={s.timeValue}>{value}</Text>
      </View>
      <View style={s.wheelWrap}>
        <WheelColumn values={hours} selected={selectedHour} onSelect={setHour} />
        <Text style={s.timeColon}>:</Text>
        <WheelColumn values={minutes} selected={selectedMinute} onSelect={setMinute} />
      </View>
    </View>
  );
}

function WheelColumn({
  values,
  selected,
  onSelect,
}: {
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView
      style={s.wheelColumn}
      contentContainerStyle={s.wheelContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {values.map((value) => (
        <Pressable
          key={value}
          onPress={() => onSelect(value)}
          style={[s.wheelItem, selected === value && s.wheelItemActive]}
        >
          <Text style={[s.wheelText, selected === value && s.wheelTextActive]}>{value}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function MonthPicker({
  selectedDate,
  viewMonth,
  onSelect,
  onChangeMonth,
}: {
  selectedDate: string;
  viewMonth: Date;
  onSelect: (date: string) => void;
  onChangeMonth: (date: Date) => void;
}) {
  const days = getMonthCells(viewMonth);
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const moveMonth = (amount: number) => {
    onChangeMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + amount, 1));
  };

  return (
    <View style={s.picker}>
      <View style={s.pickerHeader}>
        <Pressable onPress={() => moveMonth(-1)} style={s.iconButton}>
          <ChevronLeft size={16} color={colors.foreground} strokeWidth={1.8} />
        </Pressable>
        <View style={s.monthTitle}>
          <Calendar size={14} color={colors.foreground} strokeWidth={1.8} />
          <Text style={s.monthText}>{monthLabel}</Text>
        </View>
        <Pressable onPress={() => moveMonth(1)} style={s.iconButton}>
          <ChevronRight size={16} color={colors.foreground} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={s.weekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={s.weekText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={s.dateGrid}>
        {days.map((date, index) => {
          if (!date) {
            return <View key={`blank-${index}`} style={s.dateCell} />;
          }

          const dateKey = formatDateKey(date);
          const isSelected = selectedDate === dateKey;

          return (
            <Pressable
              key={dateKey}
              onPress={() => onSelect(dateKey)}
              style={[s.dateCell, isSelected && s.dateCellActive]}
            >
              <Text style={[s.dateText, isSelected && s.dateTextActive]}>{date.getDate()}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getMonthCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function normalizeCourses(data: unknown): UserCourse[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((course) => {
      if (typeof course === 'string') {
        return { code: course, name: course };
      }

      if (!course || typeof course !== 'object') {
        return null;
      }

      return course as UserCourse;
    })
    .filter((course): course is UserCourse => !!course && !!getCourseLabel(course));
}

function getCourseCode(course: UserCourse) {
  return `${course.Course_code ?? course.code ?? ''}`.trim();
}

function getCourseName(course: UserCourse) {
  return `${course.Course_name ?? course.name ?? ''}`.trim();
}

function getCourseLabel(course: UserCourse) {
  const code = getCourseCode(course);
  const name = getCourseName(course);

  if (code && name) {
    return `${code} - ${name}`;
  }

  return name || code;
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(42, 34, 56, 0.32)' },
  sheet: { maxHeight: '88%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  title: { fontSize: 22, color: colors.foreground, fontWeight: '700', marginTop: 2 },
  iconButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary },
  content: { gap: 12, paddingBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.secondary },
  priorityChip: { minWidth: 82, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.secondary },
  chipActive: { backgroundColor: colors.foreground },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: colors.background },
  input: { minHeight: 44, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, color: colors.foreground, fontSize: 13 },
  titleInput: { width: '100%' },
  courseGroup: { gap: 8 },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  helperText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  courseList: { gap: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  courseChoice: { minWidth: 112, maxWidth: '100%', minHeight: 48, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center' },
  courseChoiceActive: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  courseCode: { color: colors.foreground, fontSize: 12, fontWeight: '800' },
  courseName: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  courseTextActive: { color: colors.background },
  emptyCourseBox: { minHeight: 44, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, justifyContent: 'center' },
  emptyCourseText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  group: { gap: 10 },
  groupTitle: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  priorityGroup: { gap: 8 },
  picker: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 10, gap: 8 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthText: { fontSize: 13, color: colors.foreground, fontWeight: '700' },
  weekRow: { flexDirection: 'row' },
  weekText: { flex: 1, textAlign: 'center', color: colors.muted, fontSize: 11, fontWeight: '700' },
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateCell: { width: `${100 / 7}%`, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  dateCellActive: { backgroundColor: colors.foreground },
  dateText: { color: colors.foreground, fontSize: 12, fontWeight: '600' },
  dateTextActive: { color: colors.background },
  timePicker: { gap: 8 },
  timeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  timeValue: { color: colors.foreground, fontSize: 12, fontWeight: '800' },
  wheelWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 10 },
  wheelColumn: { width: 74, height: 132 },
  wheelContent: { gap: 6, paddingVertical: 42 },
  wheelItem: { height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  wheelItemActive: { backgroundColor: colors.foreground },
  wheelText: { color: colors.muted, fontSize: 16, fontWeight: '700' },
  wheelTextActive: { color: colors.background },
  timeColon: { color: colors.foreground, fontSize: 22, fontWeight: '800', paddingBottom: 2 },
  submitButton: { alignItems: 'center', justifyContent: 'center', minHeight: 46, borderRadius: radius.pill, backgroundColor: colors.foreground },
  submitText: { color: colors.background, fontSize: 13, fontWeight: '700' },
  errorText: { color: colors.muted, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: -6 },
});
