import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCategories, useEntries, LearningComponent, LearningEntry } from '@/lib/store';
import { Check, Plus, Minus, Clock, BookOpen, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function LogEntry() {
  const { categories } = useCategories();
  const { addEntry } = useEntries();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const prefillCategory = searchParams.get('category');
  const prefillUnit = searchParams.get('unit');

  const [categoryId, setCategoryId] = useState(prefillCategory || categories[0]?.id || '');
  const [unit, setUnit] = useState(prefillUnit || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [components, setComponents] = useState<LearningComponent[]>([]);
  const [newComponent, setNewComponent] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const selectedCategory = categories.find(c => c.id === categoryId);

  useEffect(() => {
    if (selectedCategory) {
      setComponents(
        selectedCategory.defaultComponents.map(name => ({
          id: generateId(),
          name,
          learned: false,
          reviewed: false,
          reviewCount: 0,
          linesLearned: selectedCategory.trackByLines ? 0 : undefined,
          linesReviewed: selectedCategory.trackByLines ? 0 : undefined,
          notes: '',
        }))
      );
    }
  }, [categoryId]);

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const updateComponent = (id: string, updates: Partial<LearningComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCustomComponent = () => {
    if (!newComponent.trim()) return;
    setComponents(prev => [...prev, {
      id: generateId(),
      name: newComponent.trim(),
      learned: false,
      reviewed: false,
      reviewCount: 0,
      linesLearned: selectedCategory?.trackByLines ? 0 : undefined,
      linesReviewed: selectedCategory?.trackByLines ? 0 : undefined,
      notes: '',
    }]);
    setNewComponent('');
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = () => {
    if (!unit.trim() || !categoryId) {
      toast.error('Please fill in the unit name');
      return;
    }

    const entry: LearningEntry = {
      id: generateId(),
      categoryId,
      date,
      unit: unit.trim(),
      unitType: selectedCategory?.unitType || 'custom',
      components,
      duration: timerSeconds > 0 ? Math.round(timerSeconds / 60) : undefined,
      createdAt: new Date().toISOString(),
    };

    addEntry(entry);
    toast.success('Entry logged!');
    navigate('/');
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <PageHeader title="Log Learning" subtitle="Record your progress" />

      <div className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  categoryId === cat.id
                    ? 'bg-primary/10 border-primary text-foreground'
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            {selectedCategory?.structure === 'gemara' ? 'Daf / Amud' :
             selectedCategory?.structure === 'tanach' ? 'Sefer, Perek:Pasuk' : 'Unit Name'}
          </label>
          <input
            className="w-full mt-1 px-3 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={unit}
            onChange={e => setUnit(e.target.value)}
            placeholder={
              selectedCategory?.structure === 'gemara' ? 'e.g., Bava Metzia 2a' :
              selectedCategory?.structure === 'tanach' ? 'e.g., Bereishis 1:1-10' : 'Enter unit name'
            }
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <input
            type="date"
            className="w-full mt-1 px-3 py-2.5 bg-background border rounded-lg text-sm"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Timer */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Timer</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-mono font-bold tabular-nums">{formatTime(timerSeconds)}</span>
              <button
                onClick={() => setTimerActive(!timerActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  timerActive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                }`}
              >
                {timerActive ? 'Stop' : 'Start'}
              </button>
              {timerSeconds > 0 && !timerActive && (
                <button onClick={() => setTimerSeconds(0)} className="p-1">
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Components */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Components</label>
            <span className="text-xs text-muted-foreground">
              {components.filter(c => c.learned).length}/{components.length} learned
            </span>
          </div>

          <div className="space-y-2">
            {components.map(comp => (
              <motion.div
                key={comp.id}
                layout
                className="bg-card border rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{comp.name}</span>
                  <button
                    onClick={() => removeComponent(comp.id)}
                    className="text-xs text-destructive/60 hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    onClick={() => updateComponent(comp.id, { learned: !comp.learned })}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      comp.learned ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> {comp.learned ? 'Learned ✓' : 'Learned'}
                  </button>
                  <button
                    onClick={() => updateComponent(comp.id, { reviewed: !comp.reviewed })}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      comp.reviewed ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> {comp.reviewed ? 'Reviewed ✓' : 'Reviewed'}
                  </button>
                  <div className="flex items-center gap-1 bg-secondary rounded-lg px-2">
                    <button
                      onClick={() => updateComponent(comp.id, { reviewCount: Math.max(0, comp.reviewCount - 1) })}
                      className="p-1"
                    >
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <span className="text-xs font-medium min-w-[20px] text-center">{comp.reviewCount}×</span>
                    <button
                      onClick={() => updateComponent(comp.id, { reviewCount: comp.reviewCount + 1 })}
                      className="p-1"
                    >
                      <Plus className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Lines tracking for Gemara */}
                {selectedCategory?.trackByLines && (
                  <div className="flex gap-3 mb-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">Lines learned</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full mt-0.5 px-2 py-1.5 bg-background border rounded-lg text-xs"
                        value={comp.linesLearned || 0}
                        onChange={e => updateComponent(comp.id, { linesLearned: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">Lines reviewed</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full mt-0.5 px-2 py-1.5 bg-background border rounded-lg text-xs"
                        value={comp.linesReviewed || 0}
                        onChange={e => updateComponent(comp.id, { linesReviewed: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <input
                  className="w-full px-2 py-1.5 bg-background border rounded-lg text-xs placeholder:text-muted-foreground/50"
                  placeholder="Notes (optional)"
                  value={comp.notes}
                  onChange={e => updateComponent(comp.id, { notes: e.target.value })}
                />
              </motion.div>
            ))}
          </div>

          {/* Add component */}
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 px-3 py-2 bg-background border rounded-lg text-sm placeholder:text-muted-foreground/50"
              placeholder="Add component (e.g., Maharsha)"
              value={newComponent}
              onChange={e => setNewComponent(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomComponent()}
            />
            <button
              onClick={addCustomComponent}
              className="px-3 py-2 bg-secondary rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
}
