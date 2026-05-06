import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSettings, useEntries, useCategories, useGoals } from '@/lib/store';
import { Download, Share2, Sun, Moon, Monitor, Palette, Bell, Layout, LogIn, Languages, ChevronDown, BookOpen, ListOrdered } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryManager } from '@/components/CategoryManager';
import { testReminder } from '@/components/ReminderScheduler';
import { CategoryOrderManager } from '@/components/CategoryOrderManager';
import { useI18n, LANGUAGES, Language } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  storageKey,
  children,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  storageKey: string;
  children: ReactNode;
}) {
  const fullKey = `torahTracker_settings_open_${storageKey}`;
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const v = sessionStorage.getItem(fullKey);
      if (v === '1') return true;
      if (v === '0') return false;
    } catch {}
    return defaultOpen;
  });
  const toggle = () => {
    setOpen(prev => {
      const next = !prev;
      try { sessionStorage.setItem(fullKey, next ? '1' : '0'); } catch {}
      return next;
    });
  };
  return (
    <section className="mb-3">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-card border rounded-xl text-left hover:bg-secondary/40 transition-colors"
        aria-expanded={open}
      >
        {icon}
        <h2 className="text-sm font-semibold flex-1">{title}</h2>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-2 ml-4 pl-2 border-l-2 border-border/60">{children}</div>}
    </section>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { entries } = useEntries();
  const { categories } = useCategories();
  const { goals } = useGoals();
  const { t, lang, setLang } = useI18n();
  const { user, profile, signOut } = useAuth();

  const updateReminder = (id: string, patch: Partial<typeof settings.reminders[number]>) => {
    updateSettings({
      reminders: settings.reminders.map(r => r.id === id ? { ...r, ...patch } : r),
    });
  };

  const [shareOptions, setShareOptions] = useState({
    perCategory: true,
    streak: true,
    recent: false,
    goals: true,
  });

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Unit', 'Component', 'Learned', 'Reviewed', 'Review Count', 'Notes'];
    const rows = entries.flatMap(e => {
      const cat = categories.find(c => c.id === e.categoryId);
      return e.components.map(comp => [
        e.date,
        cat?.name || e.categoryId,
        e.unit,
        comp.name,
        comp.learned ? 'Yes' : 'No',
        comp.reviewed ? 'Yes' : 'No',
        comp.reviewCount.toString(),
        comp.notes,
      ]);
    });

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const buildShareText = (opts: { perCategory: boolean; streak: boolean; recent: boolean; goals: boolean }) => {
    const lines: string[] = ['📚 Learning Progress'];
    lines.push(`${entries.length} entries logged across ${categories.length} categories`);
    if (opts.perCategory) {
      const byCat = categories.map(cat => {
        const catEntries = entries.filter(e => e.categoryId === cat.id);
        const units = new Set(catEntries.map(e => e.unit)).size;
        if (units === 0) return null;
        const unitWord = cat.unitType === 'daf' ? 'daf' : cat.unitType === 'siman' ? 'simanim' : cat.unitType === 'sif-katan' ? 'sif katanim' : cat.unitType + 's';
        return `• ${cat.name}: ${units} ${unitWord}`;
      }).filter(Boolean);
      if (byCat.length) lines.push('', 'By category:', ...byCat as string[]);
    }
    if (opts.streak) {
      const dates = [...new Set(entries.map(e => e.date))];
      lines.push('', `🔥 Active days: ${dates.length}`);
    }
    if (opts.goals && goals.length) {
      lines.push('', `🎯 Goals: ${goals.length}`);
    }
    if (opts.recent) {
      const recent = entries.slice(0, 5);
      if (recent.length) {
        lines.push('', 'Recent:');
        recent.forEach(e => {
          const cat = categories.find(c => c.id === e.categoryId);
          lines.push(`• ${e.date} — ${cat?.name || e.categoryId}: ${e.unit}`);
        });
      }
    }
    return lines.join('\n');
  };

  const shareProgress = async () => {
    const text = buildShareText(shareOptions);
    if (navigator.share) {
      try { await navigator.share({ title: 'Learning Progress', text }); return; } catch {}
    }
    navigator.clipboard.writeText(text);
    toast.success('Progress copied to clipboard!');
  };

  const navigate = useNavigate();
  const handleLogin = () => navigate('/auth');
  const themes = [
    { value: 'light' as const, icon: Sun, label: t('settings.themeLight') },
    { value: 'dark' as const, icon: Moon, label: t('settings.themeDark') },
    { value: 'system' as const, icon: Monitor, label: t('settings.themeSystem') },
  ];

  const densities = [
    { value: 'compact' as const, label: t('settings.compact') },
    { value: 'comfortable' as const, label: t('settings.comfortable') },
    { value: 'spacious' as const, label: t('settings.spacious') },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      {user ? (
        <section className="mb-3">
          <div className="bg-card border rounded-xl p-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium truncate">{profile?.display_name || user?.email}</p>
              {profile?.display_name && <p className="text-xs text-muted-foreground truncate">{user?.email}</p>}
            </div>
            <button
              onClick={async () => { await signOut(); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </section>
      ) : (
        <section className="mb-3">
          <button
            onClick={handleLogin}
            className="w-full flex items-center gap-3 bg-card border rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <LogIn className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sign in / Create account</p>
              <p className="text-xs text-muted-foreground">Save your progress to the cloud</p>
            </div>
          </button>
        </section>
      )}

      <CollapsibleSection title={t('settings.language')} storageKey="language" icon={<Languages className="w-4 h-4 text-primary" />}>
        <div className="bg-card border rounded-xl divide-y">
          {LANGUAGES.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLang(opt.value as Language)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                lang === opt.value ? 'bg-primary/5' : 'hover:bg-secondary/40'
              }`}
            >
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  lang === opt.value ? 'border-primary' : 'border-muted-foreground/30'
                }`}
              >
                {lang === opt.value && <span className="w-2 h-2 rounded-full bg-primary" />}
              </span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="View" storageKey="view" icon={<Layout className="w-4 h-4 text-primary" />}>
        <CollapsibleSection title={t('settings.theme')} storageKey="theme" icon={<Palette className="w-4 h-4 text-primary" />}>
          <div className="flex gap-2">
            {themes.map(th => (
              <button
                key={th.value}
                onClick={() => applyTheme(th.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  settings.theme === th.value ? 'bg-primary/10 border-primary text-foreground' : 'bg-card border-border text-muted-foreground'
                }`}
              >
                <th.icon className="w-4 h-4" /> {th.label}
              </button>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title={t('settings.density')} storageKey="density" icon={<Layout className="w-4 h-4 text-primary" />}>
          <div className="flex gap-2">
            {densities.map(d => (
              <button
                key={d.value}
                onClick={() => updateSettings({ layoutDensity: d.value })}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  settings.layoutDensity === d.value ? 'bg-primary/10 border-primary text-foreground' : 'bg-card border-border text-muted-foreground'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </CollapsibleSection>
      </CollapsibleSection>

      <CollapsibleSection title={t('settings.reminders')} storageKey="reminders" icon={<Bell className="w-4 h-4 text-primary" />}>
        <div className="space-y-2">
          {settings.reminders.map(r => (
            <div key={r.id} className="bg-card border rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 min-w-0 px-2 py-1.5 bg-background border rounded-lg text-sm"
                  value={r.label}
                  onChange={e => updateReminder(r.id, { label: e.target.value })}
                  placeholder="Reminder name"
                />
                <button
                  onClick={() => updateReminder(r.id, { enabled: !r.enabled })}
                  className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${r.enabled ? 'bg-primary' : 'bg-secondary'}`}
                  aria-label={`Toggle ${r.label}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${r.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
                <button
                  onClick={() => updateSettings({ reminders: settings.reminders.filter(x => x.id !== r.id) })}
                  className="shrink-0 text-xs text-destructive/70 hover:text-destructive px-1"
                  aria-label="Delete reminder"
                >
                  ✕
                </button>
                  </div>
                  <button
                    onClick={() => testReminder(r.label)}
                    className="col-span-2 mt-1 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/70"
                  >
                    Test now
                  </button>
                </div>
              {r.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Time</label>
                    <input
                      type="time"
                      className="w-full mt-1 px-2 py-2 bg-background border rounded-lg text-sm"
                      value={r.time}
                      onChange={e => updateReminder(r.id, { time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Frequency</label>
                    <select
                      className="w-full mt-1 px-2 py-2 bg-background border rounded-lg text-sm"
                      value={r.frequency}
                      onChange={e => updateReminder(r.id, { frequency: e.target.value as 'daily' | 'weekdays' | 'weekly' })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => updateSettings({
              reminders: [
                ...settings.reminders,
                { id: `custom-${Date.now()}`, type: 'custom', label: 'New Reminder', enabled: true, time: '09:00', frequency: 'daily' },
              ],
            })}
            className="w-full py-2 rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-secondary/40"
          >
            + Add reminder
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Main Categories" storageKey="main-cats" icon={<ListOrdered className="w-4 h-4 text-primary" />}>
        <CategoryOrderManager />
      </CollapsibleSection>

      <CollapsibleSection title="Chumash structure" storageKey="chumash-structure" icon={<BookOpen className="w-4 h-4 text-primary" />}>
        <div className="flex gap-2">
          {(['perek','parsha'] as const).map(v => (
            <button key={v}
              onClick={() => updateSettings({ chumashStructure: v })}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                (settings.chumashStructure ?? 'perek') === v ? 'bg-primary/10 border-primary text-foreground' : 'bg-card border-border text-muted-foreground'
              }`}
            >
              {v === 'perek' ? 'By Perek' : 'By Parsha → Aliya'}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t('settings.categories') || 'Custom Categories'} storageKey="categories">
        <CategoryManager />
      </CollapsibleSection>

      <CollapsibleSection title={t('settings.exportShare')} storageKey="exportShare">
        <div className="space-y-2">
          <button
            onClick={exportCSV}
            className="w-full flex items-center gap-3 bg-card border rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <Download className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{t('settings.exportCsv')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.exportCsvDesc')}</p>
            </div>
          </button>

          <div className="bg-card border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t('settings.shareProgress')}</p>
                <p className="text-xs text-muted-foreground">Choose what to include</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['perCategory', 'Per-category counts'],
                ['streak', 'Active days / streak'],
                ['goals', 'Goals'],
                ['recent', 'Recent entries'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-xs bg-background border rounded-lg px-2 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareOptions[key]}
                    onChange={e => setShareOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button
              onClick={shareProgress}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold"
            >
              {t('settings.shareProgress')}
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <section className="mb-6 mt-4">
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            {entries.length} {t('settings.entries')} · {categories.length} {t('settings.categoriesCount')} · {goals.length} {t('settings.goalsCount')}
          </p>
        </div>
      </section>
    </div>
  );
}
