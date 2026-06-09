import React, { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import { CalendarEvent, NewCalendarEvent } from './calendarEvents';
import { getTasks, addSingletask, deleteTask, updateTask } from '../controller/tasks';

type CalendarContextValue = {
  events: CalendarEvent[];
  loading: boolean;
  addEvent: (event: NewCalendarEvent) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  refreshEvents: () => Promise<void>;
};

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('CalendarContext: failed to load events:', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvent = async (event: NewCalendarEvent) => {
    try {
      const updated = await addSingletask({ ...event, completed: event.completed ?? false });
      if (Array.isArray(updated)) setEvents(updated);
    } catch (e) {
      console.error('CalendarContext: failed to add event:', e);
    }
  };

  const toggleComplete = async (id: number) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    setEvents((current) =>
      current.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
    try {
      const updated = await updateTask({ completed: !event.completed }, id);
      if (Array.isArray(updated)) setEvents(updated);
    } catch (e) {
      console.error('CalendarContext: failed to toggle complete:', e);
      setEvents((current) =>
        current.map((e) => (e.id === id ? { ...e, completed: event.completed } : e))
      );
    }
  };

  const deleteEvent = async (id: number) => {
    setEvents((current) => current.filter((e) => e.id !== id));
    try {
      const updated = await deleteTask(id);
      if (Array.isArray(updated)) setEvents(updated);
    } catch (e) {
      console.error('CalendarContext: failed to delete event:', e);
    }
  };

  return (
    <CalendarContext.Provider value={{ events, loading, addEvent, toggleComplete, deleteEvent, refreshEvents }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarEvents() {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendarEvents must be used inside CalendarProvider');
  return context;
}