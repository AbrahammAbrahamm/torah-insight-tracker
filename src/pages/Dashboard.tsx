import { PageHeader } from '@/components/layout/PageHeader';
import { useEntries, useCategories, useGoals, computeStreak, getTodayEntries, getCategoryStats } from '@/lib/store';
import { Flame, BookOpen, CheckCircle2, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function Dashboard() {
  const { entries } = useEntries();
  const { categories } = useCategories();
  const { goals } = useGoals();
  const navigate = useNavigate();

  const streak = computeStreak(entries);
  const todayEntries = getTodayEntries(entries);
  const todayUnits = todayEntries.length;
  const totalEntries = entries.length;

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = entries.filter(e => e.date === dateStr);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      count: dayEntries.length,
    };
  });

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Log button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/log')}
          className="flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full px-4 py-2"
        >
          <Plus className="w-4 h-4" /> Log
        </button>
      </div>

      {/* Stats Row */}
      <motion.div className="grid grid-cols-3 gap-3 mb-6" {...fadeIn}>
        <div className="bg-card rounded-xl p-3 text-center border">
          <Flame className="w-6 h-6 mx-auto text-streak mb-1" />
          <p className="text-2xl font-bold font-display">{streak}</p>
          <p className="text-[11px] text-muted-foreground">Day Streak</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border">
          <BookOpen className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold font-display">{todayUnits}</p>
          <p className="text-[11px] text-muted-foreground">Today</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border">
          <CheckCircle2 className="w-6 h-6 mx-auto text-success mb-1" />
          <p className="text-2xl font-bold font-display">{totalEntries}</p>
          <p className="text-[11px] text-muted-foreground">Total Units</p>
        </div>
      </motion.div>

      {/* Weekly Chart */}
      <motion.div
        className="bg-card rounded-xl border p-4 mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">This Week</h2>
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Categories Overview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold mb-3">Categories</h2>
        <div className="space-y-2">
          {categories.map(cat => {
            const stats = getCategoryStats(entries, cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => navigate('/categories')}
                className="w-full flex items-center gap-3 bg-card border rounded-xl p-3 text-left hover:bg-secondary/50 transition-colors"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalUnits} units · {stats.learnedComponents} components learned
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{cat.unitType}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Goals */}
      {goals.length > 0 && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold mb-3">Active Goals</h2>
          <div className="space-y-2">
            {goals.slice(0, 3).map(goal => {
              const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
              return (
                <div key={goal.id} className="bg-card border rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">{goal.title}</p>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent entries */}
      {entries.length > 0 && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-sm font-semibold mb-3">Recent</h2>
          <div className="space-y-2">
            {entries.slice(0, 5).map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId);
              return (
                <div key={entry.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">{cat?.icon || '📚'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.unit}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat?.name} · {entry.components.filter(c => c.learned).length}/{entry.components.length} components
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
