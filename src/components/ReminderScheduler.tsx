import { useEffect, useRef } from 'react';
import { useSettings } from '@/lib/store';
import type { ReminderConfig } from '@/lib/store';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { createElement } from 'react';

// Lightweight in-app reminder scheduler. Fires while the app is open using
// setTimeout. When permission is granted we use the Web Notifications API
// (works even when the tab is backgrounded). We always also surface an in-app
// toast as a guaranteed visible fallback (notifications can be blocked in
// iframes / when permission is not granted).

function shouldFireToday(freq: ReminderConfig['frequency'], date: Date): boolean {
  const day = date.getDay();
  if (freq === 'daily') return true;
  if (freq === 'weekdays') return day >= 1 && day <= 5;
  if (freq === 'weekly') return day === 0;
  return true;
}

function nextOccurrence(time: string, freq: ReminderConfig['frequency'], from: Date): Date {
  const [h, m] = time.split(':').map(Number);
  const candidate = new Date(from);
  candidate.setHours(h || 0, m || 0, 0, 0);
  if (candidate > from && shouldFireToday(freq, candidate)) return candidate;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(candidate);
    d.setDate(d.getDate() + i);
    if (shouldFireToday(freq, d)) return d;
  }
  // Fallback: tomorrow same time.
  const fallback = new Date(candidate);
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
}

function fireReminder(label: string) {
  // In-app toast (always visible while app is open).
  try {
    toast(label || 'Reminder', {
      description: 'Time for your learning.',
      icon: createElement(Bell, { className: 'w-4 h-4' }),
      duration: 10000,
    });
  } catch {}
  // System notification (works backgrounded if permission granted).
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(label || 'Reminder', { body: 'Time for your learning.' });
    } catch {}
  }
}

export function ReminderScheduler() {
  const { settings } = useSettings();
  const timersRef = useRef<number[]>([]);
  const firedKeyRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const anyEnabled = settings.reminders?.some(r => r.enabled);
    if (anyEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];

    if (!settings.reminders?.length) return;

    const schedule = (r: ReminderConfig) => {
      if (!r.enabled) return;
      const now = new Date();
      const next = nextOccurrence(r.time, r.frequency, now);
      const delay = Math.max(1000, next.getTime() - now.getTime());
      // Cap at 24h so timers stay accurate across DST / sleep.
      const cappedDelay = Math.min(delay, 24 * 60 * 60 * 1000);
      const willFire = cappedDelay === delay;
      const key = `${r.id}@${next.toISOString()}`;
      const tid = window.setTimeout(() => {
        if (willFire && !firedKeyRef.current.has(key)) {
          firedKeyRef.current.add(key);
          fireReminder(r.label);
        }
        schedule(r);
      }, cappedDelay);
      timersRef.current.push(tid);
    };

    settings.reminders.forEach(schedule);

    // Re-evaluate on focus/visibility (catches missed timers after sleep).
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        timersRef.current.forEach(id => window.clearTimeout(id));
        timersRef.current = [];
        settings.reminders.forEach(schedule);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      timersRef.current.forEach(id => window.clearTimeout(id));
      timersRef.current = [];
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [settings.reminders]);

  return null;
}

export function testReminder(label: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
  fireReminder(label);
}
