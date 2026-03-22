import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCategories, StudyCategory } from '@/lib/store';
import { Plus, Pencil, Trash2, X, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubCategoryBrowser } from '@/components/SubCategoryBrowser';

const ICONS = ['📜', '📖', '📕', '📗', '📘', '📙', '⚖️', '🕯️', '✡️', '🔖', '📚', '🎓'];
const UNIT_TYPES = ['daf', 'amud', 'perek', 'pasuk', 'siman', 'halacha', 'minutes', 'pages', 'custom'];
const STRUCTURES = [
  { value: 'gemara', label: 'Gemara (lines-based)' },
  { value: 'tanach', label: 'Tanach (Sefer → Perek → Pasuk)' },
  { value: 'custom', label: 'Custom' },
] as const;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Categories() {
  const { categories, addCategory, updateCategory, removeCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    icon: '📚',
    unitType: 'perek',
    defaultComponents: '',
    structure: 'custom' as 'gemara' | 'tanach' | 'custom',
    trackByLines: false,
  });

  const resetForm = () => {
    setForm({ name: '', icon: '📚', unitType: 'perek', defaultComponents: '', structure: 'custom', trackByLines: false });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (cat: StudyCategory) => {
    setForm({
      name: cat.name,
      icon: cat.icon,
      unitType: cat.unitType,
      defaultComponents: cat.defaultComponents.join(', '),
      structure: cat.structure || 'custom',
      trackByLines: cat.trackByLines,
    });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const components = form.defaultComponents.split(',').map(s => s.trim()).filter(Boolean);
    if (editId) {
      updateCategory(editId, {
        name: form.name,
        icon: form.icon,
        unitType: form.unitType,
        defaultComponents: components,
        structure: form.structure,
        trackByLines: form.trackByLines,
      });
    } else {
      addCategory({
        id: generateId(),
        name: form.name,
        icon: form.icon,
        unitType: form.unitType,
        defaultComponents: components,
        color: '142 25% 36%',
        trackByLines: form.trackByLines,
        structure: form.structure,
      });
    }
    resetForm();
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <PageHeader
        title="Categories"
        subtitle="Manage your learning types"
        action={
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full px-4 py-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="bg-card border rounded-xl p-4 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input
                  className="w-full mt-1 px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Gemara, Mishnayos..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Icon</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      className={`text-xl p-1.5 rounded-lg border transition-colors ${form.icon === icon ? 'bg-primary/10 border-primary' : 'border-transparent'}`}
                      onClick={() => setForm(f => ({ ...f, icon }))}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Unit Type</label>
                  <select
                    className="w-full mt-1 px-3 py-2 bg-background border rounded-lg text-sm"
                    value={form.unitType}
                    onChange={e => setForm(f => ({ ...f, unitType: e.target.value }))}
                  >
                    {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Structure</label>
                  <select
                    className="w-full mt-1 px-3 py-2 bg-background border rounded-lg text-sm"
                    value={form.structure}
                    onChange={e => setForm(f => ({
                      ...f,
                      structure: e.target.value as 'gemara' | 'tanach' | 'custom',
                      trackByLines: e.target.value === 'gemara',
                    }))}
                  >
                    {STRUCTURES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Default Components (comma-separated)</label>
                <input
                  className="w-full mt-1 px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.defaultComponents}
                  onChange={e => setForm(f => ({ ...f, defaultComponents: e.target.value }))}
                  placeholder="e.g., Rashi, Tosfos, Ramban"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trackByLines"
                  checked={form.trackByLines}
                  onChange={e => setForm(f => ({ ...f, trackByLines: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="trackByLines" className="text-sm text-muted-foreground">Track by lines</label>
              </div>

              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium">
                  <Check className="w-4 h-4" /> {editId ? 'Update' : 'Create'}
                </button>
                <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-foreground border rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id}>
            <motion.div
              layout
              className="bg-card border rounded-xl p-4 flex items-center gap-3"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cat.unitType} · {cat.defaultComponents.join(', ')}
                </p>
                {cat.structure !== 'custom' && (
                  <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">
                    {cat.structure}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCat === cat.id ? 'rotate-90' : ''}`} />
                  </button>
                )}
                <button onClick={() => startEdit(cat)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => removeCategory(cat.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {expandedCat === cat.id && cat.subcategories && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-2"
                >
                  <SubCategoryBrowser
                    subcategories={cat.subcategories}
                    categoryName={cat.name}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
