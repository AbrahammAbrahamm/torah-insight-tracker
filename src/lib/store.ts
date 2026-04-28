// Local storage based store for Torah learning data
import { useState, useEffect, useCallback } from 'react';
import { SubCategory, GEMARA_STRUCTURE, TANACH_STRUCTURE, MISHNAYOS_STRUCTURE, HALACHA_STRUCTURE } from './category-structures';

export type { SubCategory } from './category-structures';

// Attach default subcategory tree based on the category's id/structure when missing.
// For known built-in categories, always refresh from the canonical structure so
// users get updates (e.g. new Mishna level) without clearing localStorage.
const BUILTIN_STRUCTURES: Record<string, SubCategory[]> = {
  gemara: GEMARA_STRUCTURE,
  mishnayos: MISHNAYOS_STRUCTURE,
  tanach: TANACH_STRUCTURE,
  halacha: HALACHA_STRUCTURE,
};

function withDefaultSubcategories(cat: StudyCategory): StudyCategory {
  const builtin = BUILTIN_STRUCTURES[cat.id];
  if (builtin) return { ...cat, subcategories: builtin };
  if (cat.subcategories && cat.subcategories.length > 0) return cat;
  let subs: SubCategory[] | undefined;
  if (cat.structure === 'gemara') subs = GEMARA_STRUCTURE;
  else if (cat.structure === 'tanach') subs = TANACH_STRUCTURE;
  return subs ? { ...cat, subcategories: subs } : cat;
}

export interface LearningComponent {
  id: string;
  name: string;
  learned: boolean;
  reviewed: boolean;
  reviewCount: number;
  linesLearned?: number;
  linesReviewed?: number;
  notes: string;
}

export interface LearningEntry {
  id: string;
  categoryId: string;
  date: string; // ISO date
  unit: string; // e.g., "Bava Metzia 2a" or "Bereishis 1:1"
  unitType: string; // daf, amud, perek, pasuk, minutes
  components: LearningComponent[];
  duration?: number; // minutes
  createdAt: string;
}

export interface StudyCategory {
  id: string;
  name: string;
  icon: string;
  unitType: string;
  defaultComponents: string[];
  color: string; // HSL string
  trackByLines: boolean;
  structure?: 'gemara' | 'tanach' | 'custom';
  subcategories?: SubCategory[];
}

export interface StudyGoal {
  id: string;
  categoryId: string;
  title: string;
  target: number;
  targetUnit: string;
  startDate: string;
  endDate: string;
  current: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  reminderEnabled: boolean;
  reminderTime: string;
  reminderDays: number[];
}

const DEFAULT_CATEGORIES: StudyCategory[] = [
  {
    id: 'gemara',
    name: 'Gemara',
    icon: '📜',
    unitType: 'daf',
    defaultComponents: ['Gemara Text', 'Rashi', 'Tosfos'],
    color: '142 25% 36%',
    trackByLines: true,
    structure: 'gemara',
    subcategories: GEMARA_STRUCTURE,
  },
  {
    id: 'mishnayos',
    name: 'Mishnayos',
    icon: '📖',
    unitType: 'perek',
    defaultComponents: ['Mishna', 'Bartenura', 'Tosfos Yom Tov'],
    color: '210 40% 45%',
    trackByLines: false,
    structure: 'custom',
    subcategories: MISHNAYOS_STRUCTURE,
  },
  {
    id: 'halacha',
    name: 'Halacha',
    icon: '⚖️',
    unitType: 'siman',
    defaultComponents: ['Shulchan Aruch', 'Mishnah Berurah'],
    color: '280 30% 45%',
    trackByLines: false,
    structure: 'custom',
    subcategories: HALACHA_STRUCTURE,
  },
  {
    id: 'tanach',
    name: 'Tanach',
    icon: '📗',
    unitType: 'pasuk',
    defaultComponents: ['Pasuk', 'Rashi', 'Targum', 'Ramban'],
    color: '38 70% 50%',
    trackByLines: false,
    structure: 'tanach',
    subcategories: TANACH_STRUCTURE,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  layoutDensity: 'comfortable',
  reminderEnabled: false,
  reminderTime: '09:00',
  reminderDays: [0, 1, 2, 3, 4], // Sun-Thu
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useCategories() {
  const [categories, setCategories] = useState<StudyCategory[]>(() =>
    loadFromStorage<StudyCategory[]>('torahTracker_categories', DEFAULT_CATEGORIES).map(withDefaultSubcategories)
  );

  useEffect(() => {
    saveToStorage('torahTracker_categories', categories);
  }, [categories]);

  const addCategory = useCallback((cat: StudyCategory) => {
    setCategories(prev => [...prev, cat]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<StudyCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  return { categories, addCategory, updateCategory, removeCategory, setCategories };
}

export function useEntries() {
  const [entries, setEntries] = useState<LearningEntry[]>(() =>
    loadFromStorage('torahTracker_entries', [])
  );

  useEffect(() => {
    saveToStorage('torahTracker_entries', entries);
  }, [entries]);

  const addEntry = useCallback((entry: LearningEntry) => {
    setEntries(prev => [entry, ...prev]);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<LearningEntry>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return { entries, addEntry, updateEntry, removeEntry, setEntries };
}

export function useGoals() {
  const [goals, setGoals] = useState<StudyGoal[]>(() =>
    loadFromStorage('torahTracker_goals', [])
  );

  useEffect(() => {
    saveToStorage('torahTracker_goals', goals);
  }, [goals]);

  const addGoal = useCallback((goal: StudyGoal) => {
    setGoals(prev => [...prev, goal]);
  }, []);

  const removeGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  return { goals, addGoal, removeGoal, setGoals };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage('torahTracker_settings', DEFAULT_SETTINGS)
  );

  useEffect(() => {
    saveToStorage('torahTracker_settings', settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return { settings, updateSettings };
}

// Helper: compute streak
export function computeStreak(entries: LearningEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Helper: get entries for a date range
export function getEntriesInRange(entries: LearningEntry[], startDate: string, endDate: string): LearningEntry[] {
  return entries.filter(e => e.date >= startDate && e.date <= endDate);
}

// Helper: get today's entries
export function getTodayEntries(entries: LearningEntry[]): LearningEntry[] {
  const today = new Date().toISOString().split('T')[0];
  return entries.filter(e => e.date === today);
}

// Helper: stats per category
export function getCategoryStats(entries: LearningEntry[], categoryId: string) {
  const catEntries = entries.filter(e => e.categoryId === categoryId);
  const totalUnits = catEntries.length;
  const totalComponents = catEntries.reduce((sum, e) => sum + e.components.length, 0);
  const learnedComponents = catEntries.reduce(
    (sum, e) => sum + e.components.filter(c => c.learned).length, 0
  );
  const reviewedComponents = catEntries.reduce(
    (sum, e) => sum + e.components.filter(c => c.reviewed).length, 0
  );
  return { totalUnits, totalComponents, learnedComponents, reviewedComponents };
}
