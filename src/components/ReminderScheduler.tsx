import { useEffect, useRef } from 'react';
import { useSettings } from '@/lib/store';
import type { ReminderConfig } from '@/lib/store';

// Lightweight in-app reminder scheduler. Uses the Web Notifications API when
// permission is granted; otherwise no-ops silently. Fires once per reminder per
// day at the configured time, respecting the chosen frequency.

function shouldFireToday(freq: ReminderConfig['frequency'], date: Date): boolean {
  const day = date.getDay(); // 0=Sun..6=Sat
  if (freq === 'daily') return true;
  if (freq === 'weekdays') return day >= 1 && day <= 5;
  if (freq === 'weekly') return day === 0; // Sunday
  return true;
}

function nextOccurrence(time: string, freq: ReminderConfig['frequency'], from: Date): Date {
  const [h, m] = time.split(':').map(Number);
  const candidate = new Date(from);
  candidate.setHours(h || 0, m || 0, 0, 0);
  if (candidate <= from || !shouldFireToday(freq, candidate)) {
    // Try subsequent days up to 7 ahead.
    for (let i = 1; i <= 7; i++) {
      const d = new Date(candidate);
      d.setDate(d.getDate() + i);
      if (shouldFireToday(freq, d) && d > from) return d;
    }
  }
  return candidate;
}

export function ReminderScheduler() {
  const { settings } = useSettings();
  const timersRef = useRef<number[]>([]);
  const firedKeyRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission once when any reminder is enabled.
    const anyEnabled = settings.reminders?.some(r => r.enabled);
    if (anyEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    // Clear any prior timers on settings change.
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];

    if (!settings.reminders?.length) return;

    const schedule = (r: ReminderConfig) => {
      if (!r.enabled) return;
      const now = new Date();
      const next = nextOccurrence(r.time, r.frequency, now);
      const delay = Math.max(1000, next.getTime() - now.getTime());
      const key = `${r.id}@${next.toDateString()}`;
      const tid = window.setTimeout(() => {
        if (!firedKeyRef.current.has(key)) {
          firedKeyRef.current.add(key);
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(r.label || 'Reminder', { body: 'Time for your learning.' });
            } catch {}
          }
        }
        // Re-schedule the next occurrence.
        schedule(r);
      }, delay);
      timersRef.current.push(tid);
    };

    settings.reminders.forEach(schedule);

    return () => {
      timersRef.current.forEach(id => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [settings.reminders]);

  return null;
}
