export type CalendarEventType = 'class' | 'assignment' | 'exam' | 'revision';

export type Priority = 'High' | 'Medium' | 'Low';

export type Stage = 'Draft' | 'Progress check' | 'Deadline' | 'Revision plan' | 'Completed';

export type CalendarEvent = {
  id: number;
  type: CalendarEventType;
  course: string;
  title: string;
  completed: boolean;
  createdDate?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: Priority;
  weekday?: string;
  startTime?: string;
  endTime?: string;
  repeatsWeekly?: boolean;
};

export type NewCalendarEvent = Omit<CalendarEvent, 'id' | 'completed'> & {
  completed?: boolean;
};

export const calendarEvents: CalendarEvent[] = [
  {
    id: 1,
    type: 'class',
    course: 'COMP1100',
    title: 'Lecture',
    weekday: 'Monday',
    startTime: '10:00',
    endTime: '12:00',
    repeatsWeekly: true,
    completed: false,
  },
  {
    id: 2,
    type: 'class',
    course: 'MATH1051',
    title: 'Tutorial',
    weekday: 'Wednesday',
    startTime: '14:00',
    endTime: '15:00',
    repeatsWeekly: true,
    completed: false,
  },
  {
    id: 3,
    type: 'assignment',
    course: 'COMP1100',
    title: 'Assignment 2',
    createdDate: '2026-05-21',
    dueDate: '2026-05-29',
    dueTime: '17:00',
    priority: 'Medium',
    completed: false,
  },
  {
    id: 4,
    type: 'exam',
    course: 'MATH1051',
    title: 'Mid-semester exam',
    createdDate: '2026-05-21',
    dueDate: '2026-05-24',
    dueTime: '09:00',
    priority: 'High',
    completed: false,
  },
  {
    id: 5,
    type: 'revision',
    course: 'COMP1100',
    title: 'Revise recursion and lists',
    createdDate: '2026-05-21',
    dueDate: '2026-05-23',
    dueTime: '19:00',
    completed: false,
  },
  {
    id: 6,
    type: 'assignment',
    course: 'ENGL1004',
    title: 'Essay draft',
    createdDate: '2026-05-14',
    dueDate: '2026-05-20',
    dueTime: '23:59',
    priority: 'High',
    completed: true,
  },
];

export function isReminderEvent(event: CalendarEvent) {
  return event.type === 'assignment' || event.type === 'exam' || event.type === 'revision';
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatShortDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDueDateTime(dueDate: string, dueTime?: string) {
  return dueTime ? `${formatShortDate(dueDate)} at ${dueTime}` : formatShortDate(dueDate);
}

export function getDueSortKey(event: CalendarEvent) {
  return `${event.dueDate || '9999-99-99'} ${event.dueTime || '99:99'}`;
}

export function daysUntil(dueDate: string, fromDate = new Date()) {
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const deadline = new Date(`${dueDate}T00:00:00`);
  const diff = deadline.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStage(event: CalendarEvent, fromDate = new Date()): Stage {
  if (event.completed) {
    return 'Completed';
  }

  if (!event.dueDate || event.type === 'revision') {
    return 'Revision plan';
  }

  const daysLeft = daysUntil(event.dueDate, fromDate);

  if (daysLeft <= 1) {
    return 'Deadline';
  }

  if (event.type !== 'assignment' && event.type !== 'exam') {
    return 'Revision plan';
  }

  const createdDate = event.createdDate || formatDateKey(fromDate);
  const totalDays = Math.max(daysUntil(event.dueDate, new Date(`${createdDate}T00:00:00`)), 1);
  const elapsedDays = Math.max(totalDays - daysLeft, 0);
  const draftDays = Math.max(Math.min(2, totalDays - 2), 1);

  if (elapsedDays < draftDays) {
    return 'Draft';
  }

  if (daysLeft > 1) {
    return 'Progress check';
  }

  return 'Deadline';
}

export function getStageHint(event: CalendarEvent, fromDate = new Date()) {
  const stage = getStage(event, fromDate);

  if (stage === 'Completed') {
    return 'Finished';
  }

  if (stage === 'Draft') {
    return event.type === 'exam' ? 'Make the first study plan' : 'Prepare the first draft';
  }

  if (stage === 'Progress check') {
    return event.type === 'exam' ? 'Check weak topics and revise' : 'Check progress and fix gaps';
  }

  if (stage === 'Deadline') {
    return event.type === 'exam' ? 'Final review today' : 'Final submission check';
  }

  return 'Custom revision reminder';
}

export function formatDaysLeft(dueDate: string, fromDate = new Date()) {
  const daysLeft = daysUntil(dueDate, fromDate);

  if (daysLeft < 0) {
    return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue`;
  }

  if (daysLeft === 0) {
    return 'Due today';
  }

  if (daysLeft === 1) {
    return 'Due tomorrow';
  }

  return `${daysLeft} days left`;
}
