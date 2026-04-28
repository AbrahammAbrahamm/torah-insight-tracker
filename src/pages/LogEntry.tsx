import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCategories, useEntries, LearningComponent, LearningEntry } from '@/lib/store';
import { Check, Plus, Minus, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function LogEntry() {
  const { categories } = useCategories();
  const { addEntry } = useEntries();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, tn } = useI18n();

  const prefillCategory = searchParams.get('category');
  const prefillUnit = searchParams.get('unit');

  const [categoryId, setCategoryId] = useState(prefillCategory || categories[0]?.id || '');
  const [unit, setUnit] = useState(prefillUnit || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [components, setComponents] = useState<LearningComponent[]>([]);
  const [newComponent, setNewComponent] = useState('');

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
      toast.error(t('log.fillUnit'));
      return;
    }

    const entry: LearningEntry = {
      id: generateId(),
      categoryId,
      date,
      unit: unit.trim(),
      unitType: selectedCategory?.unitType || 'custom',
      components,
      createdAt: new Date().toISOString(),
    };

    addEntry(entry);
    toast.success(t('log.entryLogged'));
    navigate('/');
  };

  const unitLabel = selectedCategory?.structure === 'gemara' ? t('log.dafAmud') :
    selectedCategory?.structure === 'tanach' ? t('log.seferPerekPasuk') : t('log.unitName');

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <PageHeader title={t('log.title')} subtitle={t('log.subtitle')} />

      <div className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('log.category')}</label>
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
                <span>{cat.icon}</span> {tn(cat.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Name + compact Date on same row */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-muted-foreground">{unitLabel}</label>
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
          <div className="shrink-0">
            <label className="text-xs font-medium text-muted-foreground">{t('log.date')}</label>
            <input
              type="date"
              className="mt-1 px-2 py-2.5 bg-background border rounded-lg text-xs w-[140px]"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Components */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">{t('log.components')}</label>
            <span className="text-xs text-muted-foreground">
              {components.filter(c => c.learned).length}/{components.length} {t('log.learnedRatio')}
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
                    {t('common.remove')}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    onClick={() => updateComponent(comp.id, { learned: !comp.learned })}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      comp.learned ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> {t('log.learned')}{comp.learned ? ' ✓' : ''}
                  </button>
                  <button
                    onClick={() => updateComponent(comp.id, { reviewed: !comp.reviewed })}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      comp.reviewed ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> {t('log.reviewed')}{comp.reviewed ? ' ✓' : ''}
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

                {selectedCategory?.trackByLines && (
                  <div className="flex gap-3 mb-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">{t('log.linesLearned')}</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full mt-0.5 px-2 py-1.5 bg-background border rounded-lg text-xs"
                        value={comp.linesLearned || 0}
                        onChange={e => updateComponent(comp.id, { linesLearned: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">{t('log.linesReviewed')}</label>
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

                <input
                  className="w-full px-2 py-1.5 bg-background border rounded-lg text-xs placeholder:text-muted-foreground/50"
                  placeholder={t('common.notes')}
                  value={comp.notes}
                  onChange={e => updateComponent(comp.id, { notes: e.target.value })}
                />
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 px-3 py-2 bg-background border rounded-lg text-sm placeholder:text-muted-foreground/50"
              placeholder={t('log.addComponent')}
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

        <button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold"
        >
          {t('log.save')}
        </button>
      </div>
    </div>
  );
}
