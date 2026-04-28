import { PageHeader } from '@/components/layout/PageHeader';
import { useSettings, useEntries, useCategories, useGoals } from '@/lib/store';
import { Download, Share2, Sun, Moon, Monitor, Palette, Bell, Layout, LogIn, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryManager } from '@/components/CategoryManager';
import { useI18n, LANGUAGES, Language } from '@/lib/i18n';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { entries } = useEntries();
  const { categories } = useCategories();
  const { goals } = useGoals();
  const { t, lang, setLang } = useI18n();

  // Apply theme
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

  const shareProgress = async () => {
    const text = `📚 Learning Progress\n${entries.length} units logged · ${categories.length} categories · ${goals.length} goals`;
    if (navigator.share) {
      await navigator.share({ title: 'Learning Progress', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Progress copied to clipboard!');
    }
  };

  const handleLogin = () => {
    toast.info('Login coming soon');
  };

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

      {/* Account / Login */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3">{t('settings.account')}</h2>
        <button
          onClick={handleLogin}
          className="w-full flex items-center gap-3 bg-card border rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors"
        >
          <LogIn className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{t('settings.login')}</p>
            <p className="text-xs text-muted-foreground">{t('settings.loginDesc')}</p>
          </div>
        </button>
      </section>

      {/* Language */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Languages className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">{t('settings.language')}</h2>
        </div>
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
      </section>

      {/* Theme */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">{t('settings.theme')}</h2>
        </div>
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
      </section>

      {/* Layout Density */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">{t('settings.density')}</h2>
        </div>
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
      </section>

      {/* Reminders */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">{t('settings.reminders')}</h2>
        </div>
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('settings.enableReminders')}</span>
            <button
              onClick={() => updateSettings({ reminderEnabled: !settings.reminderEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.reminderEnabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${
                settings.reminderEnabled ? 'left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>
          {settings.reminderEnabled && (
            <div>
              <label className="text-xs text-muted-foreground">{t('settings.reminderTime')}</label>
              <input
                type="time"
                className="w-full mt-1 px-3 py-2 bg-background border rounded-lg text-sm"
                value={settings.reminderTime}
                onChange={e => updateSettings({ reminderTime: e.target.value })}
              />
            </div>
          )}
        </div>
      </section>

      {/* Categories management */}
      <section className="mb-6">
        <CategoryManager />
      </section>

      {/* Export & Share */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3">{t('settings.exportShare')}</h2>
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
          <button
            onClick={shareProgress}
            className="w-full flex items-center gap-3 bg-card border rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <Share2 className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-medium">{t('settings.shareProgress')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.shareProgressDesc')}</p>
            </div>
          </button>
        </div>
      </section>

      {/* Data Info */}
      <section className="mb-6">
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('settings.dataLocal')}
            <br />
            {entries.length} {t('settings.entries')} · {categories.length} {t('settings.categoriesCount')} · {goals.length} {t('settings.goalsCount')}
          </p>
        </div>
      </section>
    </div>
  );
}
