import { useEffect, useRef } from 'react';
import { useSettings } from '@/lib/store';
import type { ReminderConfig } from '@/lib/store';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { createElement } from 'react';

// Lightweight in-app reminder scheduler. Fires while the app is open using
// setTimeout. When permission is granted we use the Web Notifications API
// via the Service Worker (works even when the tab is backgrounded — and on
// mobile, when the PWA is installed, fires even when the app is closed).

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
  const fallback = new Date(candidate);
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
}

async function showSystemNotification(title: string, body: string, tag?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, { body, tag, requireInteraction: true, icon: '/placeholder.svg', badge: '/placeholder.svg' });
      return;
    }
  } catch {}
  try { new Notification(title, { body }); } catch {}
}

function fireReminder(label: string) {
  try {
    toast(label || 'Reminder', {
      description: 'Time for your learning.',
      icon: createElement(Bell, { className: 'w-4 h-4' }),
      duration: 10000,
    });
  } catch {}
  showSystemNotification(label || 'Reminder', 'Time for your learning.', `reminder-${label}-${Date.now()}`);
}

export async function enablePushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    toast.error('Notifications not supported on this device');
    return false;
  }
  try {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/sw.js');
    }
  } catch (e) {
    console.warn('SW register failed', e);
  }
  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await Notification.requestPermission();
  }
  if (perm !== 'granted') {
    toast.error('Notifications permission denied');
    return false;
  }
  toast.success('Notifications enabled');
  return true;
}

export function ReminderScheduler() {
  const { settings } = useSettings();
  const timersRef = useRef<number[]>([]);
  const firedKeyRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (settings.pushNotificationsEnabled && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];

    if (!settings.reminders?.length) return;

    const schedule = (r: ReminderConfig) => {
      if (!r.enabled) return;
      const now = new Date();
      const next = nextOccurrence(r.time, r.frequency, now);
      const delay = Math.max(1000, next.getTime() - now.getTime());
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
  }, [settings.reminders, settings.pushNotificationsEnabled]);

  return null;
}

export function testReminder(label: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
  fireReminder(label);
}
