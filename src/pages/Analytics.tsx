import { PageHeader } from '@/components/layout/PageHeader';
import { useEntries, useCategories, computeStreak, getCategoryStats, LearningEntry } from '@/lib/store';
import { SubCategory } from '@/lib/category-structures';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Flame, Calendar, BookOpen, RotateCcw, Target } from 'lucide-react';
import { useState, useMemo } from 'react';

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
  const needle = unitLabel.toLowerCase();
  const matches = entries.filter(
    e => e.categoryId === categoryId && e.unit.toLowerCase().includes(needle)
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
      name: cat.name,
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

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <PageHeader title="Analytics" subtitle="Your learning insights" />

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
            {r === 'all' ? 'All Time' : r}
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
            <p className="text-[11px] text-muted-foreground">Day Streak</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <div>
            <p className="text-xl font-bold font-display">{uniqueDays}</p>
            <p className="text-[11px] text-muted-foreground">Active Days</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-success" />
          <div>
            <p className="text-xl font-bold font-display">{totalLearned}</p>
            <p className="text-[11px] text-muted-foreground">Learned</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-accent" />
          <div>
            <p className="text-xl font-bold font-display">{totalReviews}</p>
            <p className="text-[11px] text-muted-foreground">Reviews</p>
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
        <h2 className="text-sm font-semibold mb-3">Daily Activity</h2>
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

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <motion.div
          className="bg-card border rounded-xl p-4 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold mb-3">By Category</h2>
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
          <h2 className="text-sm font-semibold mb-3">Category Details</h2>
          <div className="space-y-2">
            {categoryData.map((d, i) => {
              const completionPct = d.units > 0 ? Math.round((d.learned / Math.max(1, d.learned + (d.units - d.learned))) * 100) : 0;
              return (
                <div key={i} className="bg-card border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{d.icon} {d.name}</span>
                    <span className="text-xs text-muted-foreground">{completionPct}% learned</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${completionPct}%`, backgroundColor: d.fill }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{d.units} units</span>
                    <span>{d.learned} learned</span>
                    <span>{d.reviewed} reviewed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">Start logging to see your analytics</p>
        </div>
      )}
    </div>
  );
}
