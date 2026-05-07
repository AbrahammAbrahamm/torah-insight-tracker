// Supabase-backed store for Torah learning data (with localStorage migration)
import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode, createElement } from 'react';
import { SubCategory, GEMARA_STRUCTURE, TANACH_STRUCTURE, MISHNAYOS_STRUCTURE, HALACHA_STRUCTURE, CHUMASH_STRUCTURE, CHUMASH_BY_PARSHA_STRUCTURE, TANACH_NACH_STRUCTURE, MISHNAH_BERURAH_STRUCTURE } from './category-structures';
import { RAMBAM_BY_BOOKS_STRUCTURE, RAMBAM_BY_YOMI_STRUCTURE } from './rambam-data';
import { buildMussarStructure } from './mussar-data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type { SubCategory } from './category-structures';

// Attach default subcategory tree based on the category's id/structure when missing.
// For known built-in categories, always refresh from the canonical structure so
// users get updates (e.g. new Mishna level) without clearing localStorage.
const BUILTIN_STRUCTURES: Record<string, SubCategory[]> = {
  gemara: GEMARA_STRUCTURE,
  mishnayos: MISHNAYOS_STRUCTURE,
  chumash: CHUMASH_STRUCTURE,
  nach: TANACH_NACH_STRUCTURE,
  halacha: HALACHA_STRUCTURE,
  'mishnah-berurah': MISHNAH_BERURAH_STRUCTURE,
  rambam: RAMBAM_BY_BOOKS_STRUCTURE,
  'mussar-chasidus': [],
};

export function applyRambamStructure(cats: StudyCategory[], style: 'books' | 'yomi'): StudyCategory[] {
  return cats.map(c => {
    if (c.id !== 'rambam') return c;
    return { ...c, subcategories: style === 'yomi' ? RAMBAM_BY_YOMI_STRUCTURE : RAMBAM_BY_BOOKS_STRUCTURE };
  });
}

export function applyMussarStructure(cats: StudyCategory[], enabledIds: string[]): StudyCategory[] {
  return cats.map(c => {
    if (c.id !== 'mussar-chasidus') return c;
    return { ...c, subcategories: buildMussarStructure(enabledIds) };
  });
}

function withDefaultSubcategories(cat: StudyCategory): StudyCategory {
  const builtin = BUILTIN_STRUCTURES[cat.id];
  if (builtin) return { ...cat, subcategories: builtin };
  if (cat.subcategories && cat.subcategories.length > 0) return cat;
  let subs: SubCategory[] | undefined;
  if (cat.structure === 'gemara') subs = GEMARA_STRUCTURE;
  else if (cat.structure === 'tanach') subs = TANACH_STRUCTURE;
  return subs ? { ...cat, subcategories: subs } : cat;
}

export function applyChumashStructure(cats: StudyCategory[], style: 'perek' | 'parsha'): StudyCategory[] {
  return cats.map(c => {
    if (c.id !== 'chumash') return c;
    return { ...c, subcategories: style === 'parsha' ? CHUMASH_BY_PARSHA_STRUCTURE : CHUMASH_STRUCTURE };
  });
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
  hidden?: boolean;
  order?: number;
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

export type ReminderFrequency = 'daily' | 'weekdays' | 'weekly';

export interface ReminderConfig {
  id: string;
  type: 'daf-yomi' | 'review-daf-yomi' | 'shnayim-mikra' | 'custom';
  label: string;
  enabled: boolean;
  time: string; // HH:MM
  frequency: ReminderFrequency;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  reminderEnabled: boolean;
  reminderTime: string;
  reminderDays: number[];
  reminders: ReminderConfig[];
  chumashStructure?: 'perek' | 'parsha';
  rambamStructure?: 'books' | 'yomi';
  mussarSefarim?: string[];
  pushNotificationsEnabled?: boolean;
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
    defaultComponents: ['Shulchan Aruch'],
    color: '280 30% 45%',
    trackByLines: false,
    structure: 'custom',
    subcategories: HALACHA_STRUCTURE,
  },
  {
    id: 'mishnah-berurah',
    name: 'Mishnah Berurah',
    icon: '📚',
    unitType: 'sif-katan',
    defaultComponents: ['Mishnah Berurah Text'],
    color: '15 60% 45%',
    trackByLines: false,
    structure: 'custom',
    subcategories: MISHNAH_BERURAH_STRUCTURE,
  },
  {
    id: 'chumash',
    name: 'Chumash',
    icon: '📗',
    unitType: 'pasuk',
    defaultComponents: ['Pasuk', 'Rashi', 'Targum', 'Ramban'],
    color: '38 70% 50%',
    trackByLines: false,
    structure: 'tanach',
    subcategories: CHUMASH_STRUCTURE,
  },
  {
    id: 'nach',
    name: 'Nach',
    icon: '📘',
    unitType: 'perek',
    defaultComponents: ['Pasuk', 'Rashi'],
    color: '200 50% 45%',
    trackByLines: false,
    structure: 'tanach',
    subcategories: TANACH_NACH_STRUCTURE,
  },
  {
    id: 'rambam',
    name: 'Rambam',
    icon: '📕',
    unitType: 'perek',
    defaultComponents: ['Rambam Text'],
    color: '0 50% 45%',
    trackByLines: false,
    structure: 'custom',
    subcategories: RAMBAM_BY_BOOKS_STRUCTURE,
  },
  {
    id: 'mussar-chasidus',
    name: 'Mussar / Chasidus',
    icon: '✨',
    unitType: 'perek',
    defaultComponents: ['Text'],
    color: '260 40% 50%',
    trackByLines: false,
    structure: 'custom',
    subcategories: [],
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  layoutDensity: 'comfortable',
  reminderEnabled: false,
  reminderTime: '09:00',
  reminderDays: [0, 1, 2, 3, 4],
  reminders: [
    { id: 'daf-yomi', type: 'daf-yomi', label: 'Daf Yomi', enabled: false, time: '07:00', frequency: 'daily' },
    { id: 'shnayim-mikra', type: 'shnayim-mikra', label: 'Shnayim Mikra', enabled: false, time: '15:00', frequency: 'weekly' },
  ],
  chumashStructure: 'perek',
  rambamStructure: 'books',
  mussarSefarim: [],
  pushNotificationsEnabled: false,
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

export function normalizeUnitLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function unitsMatch(savedUnit: string, targetUnit: string, categoryId: string): boolean {
  const saved = normalizeUnitLabel(savedUnit);
  const target = normalizeUnitLabel(targetUnit);
  if (saved === target) return true;
  if (categoryId === 'gemara') {
    return saved.replace(/\bdaf\s+/g, '') === target.replace(/\bdaf\s+/g, '');
  }
  return false;
}

export function findLatestEntryForUnit(
  entries: LearningEntry[],
  categoryId: string,
  unit: string
): LearningEntry | undefined {
  return entries.find(e => e.categoryId === categoryId && unitsMatch(e.unit, unit, categoryId));
}

export function finalizeComponentsForSave(components: LearningComponent[]): LearningComponent[] {
  const normalized = components.map(c => ({
    ...c,
    reviewCount: c.reviewCount ?? 0,
    reviewed: c.reviewed || (c.reviewCount ?? 0) > 0,
  }));

  const anyLearned = normalized.some(c => c.learned);
  if (anyLearned && normalized.length > 0 && !normalized[0].learned) {
    return normalized.map((c, i) => i === 0 ? { ...c, learned: true } : c);
  }

  return normalized;
}

export function upsertEntryForUnit(entries: LearningEntry[], entry: LearningEntry): LearningEntry[] {
  const withoutCurrentUnit = entries.filter(
    e => !(e.categoryId === entry.categoryId && unitsMatch(e.unit, entry.unit, entry.categoryId))
  );
  return [entry, ...withoutCurrentUnit];
}

function migrateCategories(cats: StudyCategory[]): StudyCategory[] {
  // Replace legacy "tanach" category with separate "chumash" and "nach".
  const hasTanach = cats.some(c => c.id === 'tanach');
  let result = cats;
  if (hasTanach) {
    const chumashDefaults = DEFAULT_CATEGORIES.find(c => c.id === 'chumash')!;
    const nachDefaults = DEFAULT_CATEGORIES.find(c => c.id === 'nach')!;
    result = cats.flatMap(c => {
      if (c.id === 'tanach') {
        return [chumashDefaults, nachDefaults].filter(d => !cats.some(x => x.id === d.id));
      }
      return [c];
    });
  }
  // Ensure Mishnah Berurah category exists as its own top-level category.
  if (!result.some(c => c.id === 'mishnah-berurah')) {
    const mb = DEFAULT_CATEGORIES.find(c => c.id === 'mishnah-berurah');
    if (mb) result = [...result, mb];
  }
  // Ensure Rambam category exists.
  if (!result.some(c => c.id === 'rambam')) {
    const r = DEFAULT_CATEGORIES.find(c => c.id === 'rambam');
    if (r) result = [...result, r];
  }
  // Ensure Mussar/Chasidus category exists.
  if (!result.some(c => c.id === 'mussar-chasidus')) {
    const m = DEFAULT_CATEGORIES.find(c => c.id === 'mussar-chasidus');
    if (m) result = [...result, m];
  }
  // Remove legacy "Mishnah Berurah" from Halacha default components.
  result = result.map(c => {
    if (c.id === 'halacha' && c.defaultComponents?.some(n => /mishnah?\s*berurah/i.test(n))) {
      return { ...c, defaultComponents: c.defaultComponents.filter(n => !/mishnah?\s*berurah/i.test(n)) };
    }
    return c;
  });
  // Enforce canonical order for known built-in categories.
  const ORDER = ['chumash', 'nach', 'mishnayos', 'gemara', 'halacha', 'mishnah-berurah', 'rambam', 'mussar-chasidus'];
  const known = ORDER
    .map(id => result.find(c => c.id === id))
    .filter((c): c is StudyCategory => !!c);
  const others = result.filter(c => !ORDER.includes(c.id));
  return [...known, ...others].map(withDefaultSubcategories);
}

// ============================================================
// Supabase-backed DataProvider (replaces localStorage hooks)
// ============================================================

interface DataContextValue {
  loading: boolean;
  error: string | null;
  categories: StudyCategory[];
  setCategories: (cats: StudyCategory[]) => void;
  addCategory: (cat: StudyCategory) => void;
  updateCategory: (id: string, updates: Partial<StudyCategory>) => void;
  removeCategory: (id: string) => void;
  entries: LearningEntry[];
  setEntriesAll: (next: LearningEntry[]) => void;
  addEntry: (entry: LearningEntry) => void;
  saveEntry: (entry: LearningEntry) => void;
  addEntries: (newEntries: LearningEntry[]) => void;
  updateEntry: (id: string, updates: Partial<LearningEntry>) => void;
  removeEntry: (id: string) => void;
  goals: StudyGoal[];
  setGoalsAll: (next: StudyGoal[]) => void;
  addGoal: (goal: StudyGoal) => void;
  removeGoal: (id: string) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function entryFromRow(row: any): LearningEntry {
  return {
    id: row.id,
    categoryId: row.category_id,
    date: row.date,
    unit: row.unit,
    unitType: row.unit_type,
    components: (row.components as LearningComponent[]) ?? [],
    duration: row.duration ?? undefined,
    createdAt: row.created_at,
  };
}
function entryToRow(entry: LearningEntry, userId: string) {
  return {
    id: entry.id,
    user_id: userId,
    category_id: entry.categoryId,
    date: entry.date,
    unit: entry.unit,
    unit_type: entry.unitType,
    components: entry.components as any,
    duration: entry.duration ?? null,
  };
}
function goalFromRow(row: any): StudyGoal {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    target: Number(row.target),
    targetUnit: row.target_unit ?? '',
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    current: Number(row.current),
  };
}
function goalToRow(goal: StudyGoal, userId: string) {
  return {
    id: goal.id,
    user_id: userId,
    category_id: goal.categoryId,
    title: goal.title,
    target: goal.target,
    target_unit: goal.targetUnit || null,
    start_date: goal.startDate || null,
    end_date: goal.endDate || null,
    current: goal.current,
  };
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
function ensureUuid(id: string): string {
  return isUuid(id) ? id : crypto.randomUUID();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategoriesState] = useState<StudyCategory[]>(DEFAULT_CATEGORIES);
  const [entries, setEntriesState] = useState<LearningEntry[]>([]);
  const [goals, setGoalsState] = useState<StudyGoal[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const migratedRef = useRef(false);

  const persistCategories = useCallback(async (cats: StudyCategory[]) => {
    if (!user) return;
    const { error } = await supabase.from('user_categories').upsert({ user_id: user.id, categories: cats as any });
    if (error) console.error('persist categories', error);
  }, [user]);

  const persistSettings = useCallback(async (s: AppSettings) => {
    if (!user) return;
    const { error } = await supabase.from('user_settings').upsert({ user_id: user.id, settings: s as any });
    if (error) console.error('persist settings', error);
  }, [user]);

  // Load all user data when authenticated.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCategoriesState(migrateCategories(DEFAULT_CATEGORIES));
      setEntriesState([]);
      setGoalsState([]);
      setSettingsState(DEFAULT_SETTINGS);
      setLoading(false);
      migratedRef.current = false;
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Migrate localStorage data on first login (per-session).
        if (!migratedRef.current) {
          migratedRef.current = true;
          await migrateLocalStorageToSupabase(user.id);
        }

        const [catsRes, entriesRes, goalsRes, settingsRes] = await Promise.all([
          supabase.from('user_categories').select('categories').eq('user_id', user.id).maybeSingle(),
          supabase.from('learning_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1000),
          supabase.from('study_goals').select('*').eq('user_id', user.id),
          supabase.from('user_settings').select('settings').eq('user_id', user.id).maybeSingle(),
        ]);

        if (cancelled) return;

        const loadedCats = catsRes.data?.categories
          ? migrateCategories(catsRes.data.categories as unknown as StudyCategory[])
          : DEFAULT_CATEGORIES;
        if (!catsRes.data) {
          await supabase.from('user_categories').upsert({ user_id: user.id, categories: loadedCats as any });
        }
        setCategoriesState(loadedCats);

        setEntriesState((entriesRes.data ?? []).map(entryFromRow));
        setGoalsState((goalsRes.data ?? []).map(goalFromRow));

        const loadedSettings = settingsRes.data?.settings
          ? { ...DEFAULT_SETTINGS, ...(settingsRes.data.settings as any), reminders: (settingsRes.data.settings as any).reminders ?? DEFAULT_SETTINGS.reminders }
          : DEFAULT_SETTINGS;
        setSettingsState(loadedSettings);
      } catch (e: any) {
        console.error('Data load failed', e);
        if (!cancelled) setError(e?.message || 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // ---------- categories ----------
  const setCategories = useCallback((cats: StudyCategory[]) => {
    setCategoriesState(cats);
    persistCategories(cats);
  }, [persistCategories]);
  const addCategory = useCallback((cat: StudyCategory) => {
    setCategoriesState(prev => { const next = [...prev, cat]; persistCategories(next); return next; });
  }, [persistCategories]);
  const updateCategory = useCallback((id: string, updates: Partial<StudyCategory>) => {
    setCategoriesState(prev => { const next = prev.map(c => c.id === id ? { ...c, ...updates } : c); persistCategories(next); return next; });
  }, [persistCategories]);
  const removeCategory = useCallback((id: string) => {
    setCategoriesState(prev => { const next = prev.filter(c => c.id !== id); persistCategories(next); return next; });
  }, [persistCategories]);

  // ---------- entries ----------
  const setEntriesAll = useCallback((next: LearningEntry[]) => {
    const prev = entries;
    setEntriesState(next);
    if (!user) return;
    const prevIds = new Set(prev.map(e => e.id));
    const nextIds = new Set(next.map(e => e.id));
    const toDelete = prev.filter(e => !nextIds.has(e.id)).map(e => e.id);
    const toUpsert = next.filter(e => !prevIds.has(e.id));
    (async () => {
      if (toDelete.length) await supabase.from('learning_entries').delete().in('id', toDelete);
      if (toUpsert.length) await supabase.from('learning_entries').upsert(toUpsert.map(e => entryToRow({ ...e, id: ensureUuid(e.id) }, user.id)));
    })();
  }, [entries, user]);

  const addEntry = useCallback((entry: LearningEntry) => {
    const e = { ...entry, id: ensureUuid(entry.id) };
    setEntriesState(prev => [e, ...prev]);
    if (!user) return;
    supabase.from('learning_entries').upsert(entryToRow(e, user.id)).then(({ error }) => {
      if (error) console.error('addEntry', error);
    });
  }, [user]);

  const saveEntry = useCallback((entry: LearningEntry) => {
    const e = { ...entry, id: ensureUuid(entry.id) };
    setEntriesState(prev => upsertEntryForUnit(prev, e));
    if (!user) return;
    (async () => {
      const existing = entries.filter(x => x.categoryId === e.categoryId && unitsMatch(x.unit, e.unit, e.categoryId));
      if (existing.length) {
        await supabase.from('learning_entries').delete().in('id', existing.map(x => x.id));
      }
      await supabase.from('learning_entries').upsert(entryToRow(e, user.id));
    })();
  }, [entries, user]);

  const addEntries = useCallback((newEntries: LearningEntry[]) => {
    const normalized = newEntries.map(e => ({ ...e, id: ensureUuid(e.id) }));
    setEntriesState(prev => [...normalized, ...prev]);
    if (!user) return;
    supabase.from('learning_entries').upsert(normalized.map(e => entryToRow(e, user.id))).then(({ error }) => {
      if (error) console.error('addEntries', error);
    });
  }, [user]);

  const updateEntry = useCallback((id: string, updates: Partial<LearningEntry>) => {
    setEntriesState(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (!user) return;
    const merged = entries.find(e => e.id === id);
    if (merged) {
      const updated = { ...merged, ...updates };
      supabase.from('learning_entries').update(entryToRow(updated, user.id)).eq('id', id);
    }
  }, [entries, user]);

  const removeEntry = useCallback((id: string) => {
    setEntriesState(prev => prev.filter(e => e.id !== id));
    if (!user) return;
    supabase.from('learning_entries').delete().eq('id', id);
  }, [user]);

  // ---------- goals ----------
  const setGoalsAll = useCallback((next: StudyGoal[]) => {
    const prev = goals;
    setGoalsState(next);
    if (!user) return;
    const nextIds = new Set(next.map(g => g.id));
    const toDelete = prev.filter(g => !nextIds.has(g.id)).map(g => g.id);
    (async () => {
      if (toDelete.length) await supabase.from('study_goals').delete().in('id', toDelete);
      if (next.length) await supabase.from('study_goals').upsert(next.map(g => goalToRow({ ...g, id: ensureUuid(g.id) }, user.id)));
    })();
  }, [goals, user]);
  const addGoal = useCallback((goal: StudyGoal) => {
    const g = { ...goal, id: ensureUuid(goal.id) };
    setGoalsState(prev => [...prev, g]);
    if (!user) return;
    supabase.from('study_goals').upsert(goalToRow(g, user.id));
  }, [user]);
  const removeGoal = useCallback((id: string) => {
    setGoalsState(prev => prev.filter(g => g.id !== id));
    if (!user) return;
    supabase.from('study_goals').delete().eq('id', id);
  }, [user]);

  // ---------- settings ----------
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...updates };
      persistSettings(next);
      return next;
    });
  }, [persistSettings]);

  return createElement(DataContext.Provider, {
    value: {
      loading, error,
      categories, setCategories, addCategory, updateCategory, removeCategory,
      entries, setEntriesAll, addEntry, saveEntry, addEntries, updateEntry, removeEntry,
      goals, setGoalsAll, addGoal, removeGoal,
      settings, updateSettings,
    },
  }, children);
}

function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

// ---- Backwards-compatible hook signatures (used across the app) ----

export function useCategories(opts?: { includeHidden?: boolean }) {
  const d = useData();
  const include = opts?.includeHidden ?? false;
  const style = d.settings.chumashStructure ?? 'perek';
  const rambamStyle = d.settings.rambamStructure ?? 'books';
  const mussarIds = d.settings.mussarSefarim ?? [];
  let cats = applyChumashStructure(d.categories, style);
  cats = applyRambamStructure(cats, rambamStyle);
  cats = applyMussarStructure(cats, mussarIds);
  cats = [...cats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (!include) cats = cats.filter(c => !c.hidden);
  return {
    categories: cats,
    addCategory: d.addCategory,
    updateCategory: d.updateCategory,
    removeCategory: d.removeCategory,
    setCategories: d.setCategories,
  };
}

export function useEntries() {
  const d = useData();
  return {
    entries: d.entries,
    addEntry: d.addEntry,
    saveEntry: d.saveEntry,
    addEntries: d.addEntries,
    updateEntry: d.updateEntry,
    removeEntry: d.removeEntry,
    setEntries: d.setEntriesAll,
  };
}

export function useGoals() {
  const d = useData();
  return {
    goals: d.goals,
    addGoal: d.addGoal,
    removeGoal: d.removeGoal,
    setGoals: d.setGoalsAll,
  };
}

export function useSettings() {
  const d = useData();
  return { settings: d.settings, updateSettings: d.updateSettings };
}

export function useDataStatus() {
  const d = useData();
  return { loading: d.loading, error: d.error };
}

// ---- Migration from legacy localStorage ----

async function migrateLocalStorageToSupabase(userId: string) {
  try {
    const legacyEntries = localStorage.getItem('torahTracker_entries');
    const legacyCategories = localStorage.getItem('torahTracker_categories');
    const legacyGoals = localStorage.getItem('torahTracker_goals');
    const legacySettings = localStorage.getItem('torahTracker_settings');

    if (legacyEntries) {
      const parsed: LearningEntry[] = JSON.parse(legacyEntries);
      if (Array.isArray(parsed) && parsed.length) {
        const rows = parsed.map(e => entryToRow({ ...e, id: ensureUuid(e.id) }, userId));
        await supabase.from('learning_entries').upsert(rows);
      }
      localStorage.removeItem('torahTracker_entries');
    }
    if (legacyCategories) {
      const parsed = JSON.parse(legacyCategories);
      await supabase.from('user_categories').upsert({ user_id: userId, categories: parsed });
      localStorage.removeItem('torahTracker_categories');
    }
    if (legacyGoals) {
      const parsed: StudyGoal[] = JSON.parse(legacyGoals);
      if (Array.isArray(parsed) && parsed.length) {
        await supabase.from('study_goals').upsert(parsed.map(g => goalToRow({ ...g, id: ensureUuid(g.id) }, userId)));
      }
      localStorage.removeItem('torahTracker_goals');
    }
    if (legacySettings) {
      const parsed = JSON.parse(legacySettings);
      await supabase.from('user_settings').upsert({ user_id: userId, settings: parsed });
      localStorage.removeItem('torahTracker_settings');
    }
  } catch (e) {
    console.warn('localStorage migration skipped', e);
  }
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
