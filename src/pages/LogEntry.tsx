import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  useCategories,
  useEntries,
  LearningComponent,
  LearningEntry,
  findLatestEntryForUnit,
  finalizeComponentsForSave,
} from '@/lib/store';
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
  const { entries, saveEntry } = useEntries();
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
      const existingEntry = unit.trim()
        ? findLatestEntryForUnit(entries, categoryId, unit)
        : undefined;
      const savedByName = new Map(
        existingEntry?.components.map(component => [component.name.toLowerCase(), component]) ?? []
      );
      const defaultComponents = selectedCategory.defaultComponents.map(name => {
        const saved = savedByName.get(name.toLowerCase());
        return {
          id: saved?.id || generateId(),
          name,
          learned: saved?.learned ?? false,
          reviewed: saved?.reviewed ?? false,
          reviewCount: saved?.reviewCount ?? 0,
          notes: saved?.notes ?? '',
        };
      });
      const customComponents = (existingEntry?.components ?? [])
        .filter(component => !selectedCategory.defaultComponents.some(name => name.toLowerCase() === component.name.toLowerCase()))
        .map(component => ({
          ...component,
          reviewCount: component.reviewCount ?? 0,
          reviewed: component.reviewed || (component.reviewCount ?? 0) > 0,
        }));

      if (existingEntry) setDate(existingEntry.date);
      setComponents([...defaultComponents, ...customComponents]);
    }
  }, [categoryId, entries, selectedCategory]);

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

    // If any component is marked learned, ensure the first component is also learned
    // so the unit registers as completed in the tree (which keys off the first component).
    const finalComponents = finalizeComponentsForSave(components);

    const entry: LearningEntry = {
      id: generateId(),
      categoryId,
      date,
      unit: unit.trim(),
      unitType: selectedCategory?.unitType || 'custom',
      components: finalComponents,
      createdAt: new Date().toISOString(),
    };

    saveEntry(entry);
    toast.success(t('log.entryLogged'));
    navigate('/');
  };

  const unitLabel = selectedCategory?.structure === 'gemara' ? t('log.dafAmud') :
    selectedCategory?.structure === 'tanach' ? t('log.seferPerekPasuk') : t('log.unitName');

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <PageHeader title={t('log.title')} subtitle={t('log.subtitle')} />

      <div className="space-y-4">
        {/* Header: unit + category label */}
        <div className="bg-card border rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {selectedCategory && <span>{selectedCategory.icon}</span>}
            <span>{selectedCategory ? tn(selectedCategory.name) : t('log.category')}</span>
          </div>
          <p className="mt-1 text-base font-semibold truncate">
            {unit.trim() || t('log.fillUnit')}
          </p>
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
                  <span className="text-sm font-medium">{tn(comp.name)}</span>
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
                  <div
                    className={`flex items-center rounded-lg overflow-hidden text-xs font-medium transition-colors ${
                      comp.reviewCount > 0 ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <button
                      onClick={() => updateComponent(comp.id, {
                        reviewCount: Math.max(0, comp.reviewCount - 1),
                        reviewed: Math.max(0, comp.reviewCount - 1) > 0,
                      })}
                      className="px-2 py-1.5"
                      aria-label="Decrease review count"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex items-center gap-1 px-1.5 py-1.5">
                      <Check className="w-3.5 h-3.5" /> {t('log.reviewed')} {comp.reviewCount}×
                    </span>
                    <button
                      onClick={() => updateComponent(comp.id, {
                        reviewCount: comp.reviewCount + 1,
                        reviewed: true,
                      })}
                      className="px-2 py-1.5"
                      aria-label="Increase review count"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

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

        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-secondary text-foreground rounded-xl py-3 text-sm font-semibold hover:bg-secondary/80 transition-colors"
          >
            {t('log.goBack')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold"
          >
            {t('log.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
