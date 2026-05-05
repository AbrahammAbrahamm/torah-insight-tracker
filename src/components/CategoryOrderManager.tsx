import { useCategories } from '@/lib/store';
import { ArrowUp, ArrowDown, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function CategoryOrderManager() {
  const { categories, setCategories, updateCategory, removeCategory } = useCategories({ includeHidden: true });
  const { tn } = useI18n();

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...categories];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setCategories(next.map((c, i) => ({ ...c, order: i })));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground px-1">Reorder, hide, or delete main categories.</p>
      {categories.map((cat, idx) => (
        <div key={cat.id} className={`bg-card border rounded-xl p-3 flex items-center gap-2 ${cat.hidden ? 'opacity-60' : ''}`}>
          <span className="text-xl">{cat.icon}</span>
          <span className="flex-1 text-sm font-medium truncate">{tn(cat.name)}</span>
          <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30" aria-label="Move up">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button onClick={() => move(idx, 1)} disabled={idx === categories.length - 1} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30" aria-label="Move down">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button onClick={() => updateCategory(cat.id, { hidden: !cat.hidden })} className="p-1.5 rounded hover:bg-secondary" aria-label={cat.hidden ? 'Show' : 'Hide'}>
            {cat.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => { if (confirm(`Delete ${cat.name}?`)) removeCategory(cat.id); }} className="p-1.5 rounded hover:bg-destructive/10 text-destructive" aria-label="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
