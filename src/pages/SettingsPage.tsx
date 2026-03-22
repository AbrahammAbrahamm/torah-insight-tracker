import { PageHeader } from '@/components/layout/PageHeader';
import { useSettings, useEntries, useCategories, useGoals } from '@/lib/store';
import { Download, Share2, Sun, Moon, Monitor, Palette, Bell, Layout } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { entries } = useEntries();
  const { categories } = useCategories();
  const { goals } = useGoals();

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
    a.download = `torah-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const shareProgress = async () => {
    const text = `🔥 Torah Learning Progress\n📚 ${entries.length} total units logged\n📂 ${categories.length} categories\n🎯 ${goals.length} active goals`;
    if (navigator.share) {
      await navigator.share({ title: 'Torah Tracker Progress', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Progress copied to clipboard!');
    }
  };

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  const densities = [
    { value: 'compact' as const, label: 'Compact' },
    { value: 'comfortable' as const, label: 'Comfortable' },
    { value: 'spacious' as const, label: 'Spacious' },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <PageHeader title="Settings" subtitle="Customize your experience" />

      {/* Theme */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Theme</h2>
        </div>
        <div className="flex gap-2">
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => applyTheme(t.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                settings.theme === t.value ? 'bg-primary/10 border-primary text-foreground' : 'bg-card border-border text-muted-foreground'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Layout Density */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Layout Density</h2>
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
          <h2 className="text-sm font-semibold">Reminders</h2>
        </div>
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Enable reminders</span>
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
              <label className="text-xs text-muted-foreground">Reminder time</label>
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

      {/* Export & Share */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3">Export & Share</h2>
        <div className="space-y-2">
          <button
            onClick={exportCSV}
            className="w-full flex items-center gap-3 bg-card border rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <Download className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Export as CSV</p>
              <p className="text-xs text-muted-foreground">Download all learning data</p>
            </div>
          </button>
          <button
            onClick={shareProgress}
            className="w-full flex items-center gap-3 bg-card border rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <Share2 className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-medium">Share Progress</p>
              <p className="text-xs text-muted-foreground">Share a summary of your learning</p>
            </div>
          </button>
        </div>
      </section>

      {/* Data Info */}
      <section className="mb-6">
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Data is stored locally on this device.
            <br />
            {entries.length} entries · {categories.length} categories · {goals.length} goals
          </p>
        </div>
      </section>
    </div>
  );
}
