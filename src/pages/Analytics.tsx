import { PageHeader } from '@/components/layout/PageHeader';
import { useEntries, useCategories, computeStreak, getCategoryStats, LearningEntry, unitsMatch } from '@/lib/store';
import { SubCategory } from '@/lib/category-structures';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Flame, Calendar, BookOpen, RotateCcw, Target, Trophy, TrendingUp, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

const CHART_COLORS = [
  'hsl(142, 25%, 36%)',
  'hsl(25, 60%, 52%)',
  'hsl(210, 40%, 45%)',
  'hsl(280, 30%, 45%)',
  'hsl(38, 70%, 50%)',
  'hsl(0, 65%, 52%)',
];

type TimeRange = '7d' | '30d' | '90d' | 'all';

function buildUnitLabel(parentPath: string[], node: SubCategory): string {
  const masechta = parentPath[parentPath.length - 1] || '';
  const cleanName = node.name.replace(/\s*\(.*\)\s*$/, '');
  return `${masechta} ${cleanName}`.trim();
}

function getLeafProgress(entries: LearningEntry[], categoryId: string, unitLabel: string): number {
  const matches = entries.filter(
    e => e.categoryId === categoryId && unitsMatch(e.unit, unitLabel, categoryId)
  );
  if (matches.length === 0) return 0;
  let best = 0;
  for (const e of matches) {
    if (e.components.length === 0) best = Math.max(best, 1);
    else {
      const learned = e.components.filter(c => c.learned).length;
      best = Math.max(best, learned / e.components.length);
    }
  }
  return best;
}

interface LeafProgress {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  unitLabel: string;
  fraction: number;
}

function collectLeaves(
  nodes: SubCategory[],
  path: string[],
  categoryId: string,
  categoryName: string,
  categoryIcon: string,
  entries: LearningEntry[],
  out: LeafProgress[],
) {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      collectLeaves(node.children, [...path, node.name], categoryId, categoryName, categoryIcon, entries, out);
    } else {
      const label = buildUnitLabel(path, node);
      const frac = getLeafProgress(entries, categoryId, label);
      out.push({ categoryId, categoryName, categoryIcon, unitLabel: label, fraction: frac });
    }
  }
}

export default function Analytics() {
  const { entries } = useEntries();
  const { categories } = useCategories();
  const [range, setRange] = useState<TimeRange>('30d');
  const { t, tn } = useI18n();

  const streak = computeStreak(entries);

  const now = new Date();
  const rangeStart = range === 'all' ? '' :
    new Date(now.getTime() - (range === '7d' ? 7 : range === '30d' ? 30 : 90) * 86400000)
      .toISOString().split('T')[0];

  const filteredEntries = rangeStart ? entries.filter(e => e.date >= rangeStart) : entries;

  // Category breakdown
  const categoryData = categories.map((cat, i) => {
    const stats = getCategoryStats(filteredEntries, cat.id);
    return {
      name: tn(cat.name),
      icon: cat.icon,
      units: stats.totalUnits,
      learned: stats.learnedComponents,
      reviewed: stats.reviewedComponents,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    };
  }).filter(d => d.units > 0);

  // Daily trend
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 60;
  const dailyData = Array.from({ length: Math.min(days, 60) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (Math.min(days, 60) - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      count: entries.filter(e => e.date === dateStr).length,
    };
  });

  // Review stats
  const totalReviews = filteredEntries.reduce(
    (sum, e) => sum + e.components.reduce((s, c) => s + c.reviewCount, 0), 0
  );
  const totalLearned = filteredEntries.reduce(
    (sum, e) => sum + e.components.filter(c => c.learned).length, 0
  );
  const uniqueDays = new Set(filteredEntries.map(e => e.date)).size;

  // Closest to completion: leaves with progress > 0 and < 1, sorted desc
  const closestToCompletion = useMemo(() => {
    const out: LeafProgress[] = [];
    for (const cat of categories) {
      if (!cat.subcategories || cat.subcategories.length === 0) continue;
      collectLeaves(cat.subcategories, [], cat.id, cat.name, cat.icon, entries, out);
    }
    return out
      .filter(l => l.fraction > 0 && l.fraction < 1)
      .sort((a, b) => b.fraction - a.fraction)
      .slice(0, 8);
  }, [categories, entries]);

  // Highlights
  const totalEntries = filteredEntries.length;
  const avgPerDay = uniqueDays > 0 ? (totalEntries / uniqueDays).toFixed(1) : '0';

  const dayCounts = new Map<string, number>();
  filteredEntries.forEach(e => dayCounts.set(e.date, (dayCounts.get(e.date) || 0) + 1));
  let bestDay: { date: string; count: number } | null = null;
  for (const [date, count] of dayCounts) {
    if (!bestDay || count > bestDay.count) bestDay = { date, count };
  }
  const bestDayLabel = bestDay
    ? `${bestDay.count} (${new Date(bestDay.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })})`
    : '—';

  const topCategory = categoryData.slice().sort((a, b) => b.units - a.units)[0];

  // Weekday distribution (Sun..Sat)
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayData = weekdayLabels.map(label => ({ day: label, count: 0 }));
  filteredEntries.forEach(e => {
    const d = new Date(e.date);
    weekdayData[d.getDay()].count += 1;
  });

  // 12-week heatmap (last 12 weeks ending this week, Sun-aligned).
  const heatmapWeeks = 12;
  const heatmapStart = new Date();
  heatmapStart.setDate(heatmapStart.getDate() - heatmapStart.getDay() - (heatmapWeeks - 1) * 7);
  const heatmap: { date: string; count: number }[][] = [];
  let maxHeat = 0;
  for (let w = 0; w < heatmapWeeks; w++) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(heatmapStart);
      day.setDate(heatmapStart.getDate() + w * 7 + d);
      const ds = day.toISOString().split('T')[0];
      const c = entries.filter(e => e.date === ds).length;
      if (c > maxHeat) maxHeat = c;
      week.push({ date: ds, count: c });
    }
    heatmap.push(week);
  }
  const heatColor = (c: number) => {
    if (c === 0) return 'bg-secondary';
    const intensity = maxHeat > 0 ? c / maxHeat : 0;
    if (intensity > 0.75) return 'bg-primary';
    if (intensity > 0.5) return 'bg-primary/70';
    if (intensity > 0.25) return 'bg-primary/45';
    return 'bg-primary/25';
  };

  const recentEntries = entries.slice(0, 5);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <PageHeader title={t('analytics.title')} subtitle={t('analytics.subtitle')} />

      {/* Time range */}
      <div className="flex gap-2 mb-6">
        {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              range === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {r === 'all' ? t('analytics.allTime') : r}
          </button>
        ))}
      </div>

      {/* Key Stats */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <Flame className="w-8 h-8 text-streak" />
          <div>
            <p className="text-xl font-bold font-display">{streak}</p>
            <p className="text-[11px] text-muted-foreground">{t('analytics.dayStreak')}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <div>
            <p className="text-xl font-bold font-display">{uniqueDays}</p>
            <p className="text-[11px] text-muted-foreground">{t('analytics.activeDays')}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-success" />
          <div>
            <p className="text-xl font-bold font-display">{totalLearned}</p>
            <p className="text-[11px] text-muted-foreground">{t('analytics.learned')}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-accent" />
          <div>
            <p className="text-xl font-bold font-display">{totalReviews}</p>
            <p className="text-[11px] text-muted-foreground">{t('analytics.reviews')}</p>
          </div>
        </div>
      </motion.div>

      {/* Daily trend */}
      <motion.div
        className="bg-card border rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold mb-3">{t('analytics.dailyActivity')}</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(0, Math.floor(dailyData.length / 7) - 1)}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Highlights */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <Trophy className="w-7 h-7 text-streak" />
          <div className="min-w-0">
            <p className="text-sm font-bold font-display truncate">{bestDayLabel}</p>
            <p className="text-[11px] text-muted-foreground">{t('analytics.bestDay')}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-primary" />
          <div>
            <p className="text-sm font-bold font-display">{avgPerDay}</p>
            <p className="text-[11px] text-muted-foreground">{t('analytics.avgPerDay')}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-success" />
          <div>
            <p className="text-sm font-bold font-display">{totalEntries}</p>
            <p className="text-[11px] text-muted-foreground">{t('analytics.totalEntries')}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <Star className="w-7 h-7 text-accent" />
          <div className="min-w-0">
            <p className="text-sm font-bold font-display truncate">
              {topCategory ? `${topCategory.icon} ${topCategory.name}` : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">{t('analytics.topCategory')}</p>
          </div>
        </div>
      </motion.div>

      {/* 12-week heatmap */}
      <motion.div
        className="bg-card border rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-sm font-semibold mb-3">{t('analytics.heatmap')}</h2>
        <div className="flex gap-1 justify-center" dir="ltr">
          {heatmap.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm ${heatColor(day.count)}`}
                  title={`${day.date}: ${day.count}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground">
          <span>{t('analytics.heatmapLess')}</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-secondary" />
          <span className="w-2.5 h-2.5 rounded-sm bg-primary/25" />
          <span className="w-2.5 h-2.5 rounded-sm bg-primary/45" />
          <span className="w-2.5 h-2.5 rounded-sm bg-primary/70" />
          <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <span>{t('analytics.heatmapMore')}</span>
        </div>
      </motion.div>

      {/* By weekday */}
      {totalEntries > 0 && (
        <motion.div
          className="bg-card border rounded-xl p-4 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <h2 className="text-sm font-semibold mb-3">{t('analytics.byWeekday')}</h2>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      {categoryData.length > 0 && (

        <motion.div
          className="bg-card border rounded-xl p-4 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold mb-3">{t('analytics.byCategory')}</h2>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="units"
                    nameKey="name"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                  >
                    {categoryData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {categoryData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                  <span className="flex-1 truncate">{d.icon} {d.name}</span>
                  <span className="font-medium">{d.units}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Per-category detail */}
      {categoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold mb-3">{t('analytics.categoryDetails')}</h2>
          <div className="space-y-2">
            {categoryData.map((d, i) => {
              const completionPct = d.units > 0 ? Math.round((d.learned / Math.max(1, d.learned + (d.units - d.learned))) * 100) : 0;
              return (
                <div key={i} className="bg-card border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{d.icon} {d.name}</span>
                    <span className="text-xs text-muted-foreground">{completionPct}% {t('analytics.learnedLabel')}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${completionPct}%`, backgroundColor: d.fill }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{d.units} {t('analytics.units')}</span>
                    <span>{d.learned} {t('analytics.learnedLabel')}</span>
                    <span>{d.reviewed} {t('analytics.reviewedLabel')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {closestToCompletion.length > 0 && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">{t('analytics.closestCompletion')}</h2>
          </div>
          <div className="space-y-2">
            {closestToCompletion.map((item, i) => {
              const pct = Math.round(item.fraction * 100);
              return (
                <div key={`${item.categoryId}-${item.unitLabel}-${i}`} className="bg-card border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate">
                      <span className="mr-1">{item.categoryIcon}</span>
                      {item.unitLabel}
                    </span>
                    <span className="text-xs font-semibold text-primary tabular-nums shrink-0 ml-2">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{tn(item.categoryName)}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {recentEntries.length > 0 && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold mb-3">{t('analytics.recentActivity')}</h2>
          <div className="space-y-2">
            {recentEntries.map(e => {
              const cat = categories.find(c => c.id === e.categoryId);
              return (
                <div key={e.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">{cat?.icon || '📚'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.unit}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {cat ? tn(cat.name) : ''} · {e.components.filter(c => c.learned).length}/{e.components.length} {t('analytics.learnedLabel')}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">{t('analytics.empty')}</p>
        </div>
      )}

    </div>
  );
}
