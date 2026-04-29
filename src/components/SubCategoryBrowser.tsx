import { useState } from 'react';
import { SubCategory } from '@/lib/category-structures';
import { ChevronRight, ChevronDown, BookOpen, CheckCircle2, CheckCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEntries, useCategories, LearningEntry, LearningComponent } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

interface SubCategoryBrowserProps {
  subcategories: SubCategory[];
  categoryName: string;
  categoryId: string;
}

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
    if (e.components.length === 0) {
      best = Math.max(best, 1);
    } else {
      const learned = e.components.filter(c => c.learned).length;
      best = Math.max(best, learned / e.components.length);
    }
  }
  return best;
}

function getNodeProgress(
  node: SubCategory,
  categoryId: string,
  parentPath: string[],
  entries: LearningEntry[]
): { fraction: number; leafCount: number; completedLeaves: number } {
  if (!node.children || node.children.length === 0) {
    const label = buildUnitLabel(parentPath, node);
    const frac = getLeafProgress(entries, categoryId, label);
    return { fraction: frac, leafCount: 1, completedLeaves: frac >= 0.999 ? 1 : 0 };
  }
  let totalFrac = 0;
  let leafCount = 0;
  let completed = 0;
  for (const child of node.children) {
    const sub = getNodeProgress(child, categoryId, [...parentPath, node.name], entries);
    totalFrac += sub.fraction * sub.leafCount;
    leafCount += sub.leafCount;
    completed += sub.completedLeaves;
  }
  return {
    fraction: leafCount > 0 ? totalFrac / leafCount : 0,
    leafCount,
    completedLeaves: completed,
  };
}

// Collect all leaf labels under a node (for bulk logging).
function collectLeafLabels(node: SubCategory, parentPath: string[], out: string[]) {
  if (!node.children || node.children.length === 0) {
    out.push(buildUnitLabel(parentPath, node));
    return;
  }
  for (const child of node.children) {
    collectLeafLabels(child, [...parentPath, node.name], out);
  }
}

function ProgressBar({ value, tone }: { value: number; tone: 'success' | 'primary' | 'muted' }) {
  const pct = Math.round(value * 100);
  const fillClass =
    tone === 'success' ? 'bg-success' : tone === 'primary' ? 'bg-primary' : 'bg-muted-foreground/30';
  return (
    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0" aria-label={`${pct}% complete`}>
      <div className={`h-full ${fillClass} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function SubCategoryNode({
  node,
  depth = 0,
  path = [],
  categoryId,
  entries,
  onLogLeaf,
  onLogAll,
  onUnlogAll,
}: {
  node: SubCategory;
  depth?: number;
  path?: string[];
  categoryId: string;
  entries: LearningEntry[];
  onLogLeaf: (unitLabel: string) => void;
  onLogAll: (node: SubCategory, path: string[]) => void;
  onUnlogAll: (node: SubCategory, path: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { tn } = useI18n();
  const hasChildren = node.children && node.children.length > 0;
  const currentPath = [...path, node.name];

  const leafLabel = !hasChildren ? buildUnitLabel(path, node) : '';
  const progress = getNodeProgress(node, categoryId, path, entries);
  const pct = Math.round(progress.fraction * 100);
  const tone: 'success' | 'primary' | 'muted' =
    pct >= 100 ? 'success' : pct > 0 ? 'primary' : 'muted';

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onLogLeaf(leafLabel);
    }
  };

  return (
    <div>
      <div
        className={`w-full flex items-center gap-2 pr-2 py-2.5 text-left transition-colors rounded-lg hover:bg-secondary/60 ${
          depth === 0 ? 'font-semibold text-sm' : depth === 1 ? 'font-medium text-sm' : 'text-xs text-muted-foreground'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <button
          onClick={handleClick}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )
          ) : pct >= 100 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
          ) : (
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          )}
          <span className={`flex-1 truncate ${pct >= 100 ? 'text-success' : ''}`}>{tn(node.name)}</span>

          <ProgressBar value={progress.fraction} tone={tone} />
          <span
            className={`text-[10px] tabular-nums shrink-0 w-8 text-right ${
              tone === 'success' ? 'text-success' : tone === 'primary' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {pct}%
          </span>
        </button>
        {hasChildren && pct < 100 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogAll(node, path);
            }}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-success hover:bg-success/10"
            title="Log all below as learned"
            aria-label="Log all below as learned"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
        )}
        {hasChildren && pct > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnlogAll(node, path);
            }}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Unlog all below"
            aria-label="Unlog all below"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children!.map(child => (
              <SubCategoryNode
                key={child.id}
                node={child}
                depth={depth + 1}
                path={currentPath}
                categoryId={categoryId}
                entries={entries}
                onLogLeaf={onLogLeaf}
                onLogAll={onLogAll}
                onUnlogAll={onUnlogAll}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function SubCategoryBrowser({ subcategories, categoryName, categoryId }: SubCategoryBrowserProps) {
  const navigate = useNavigate();
  const { entries, addEntries } = useEntries();
  const { categories } = useCategories();
  const { t, tn } = useI18n();

  const handleLogLeaf = (unitLabel: string) => {
    const params = new URLSearchParams({ category: categoryId, unit: unitLabel });
    navigate(`/log?${params.toString()}`);
  };

  const handleLogAll = (node: SubCategory, path: string[]) => {
    const labels: string[] = [];
    collectLeafLabels(node, path, labels);
    if (labels.length === 0) return;

    const cat = categories.find(c => c.id === categoryId);
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // Skip leaves that are already fully complete.
    const labelsToLog = labels.filter(label => getLeafProgress(entries, categoryId, label) < 1);
    if (labelsToLog.length === 0) {
      toast.info('Already fully logged');
      return;
    }

    const newEntries: LearningEntry[] = labelsToLog.map(label => {
      const components: LearningComponent[] = (cat?.defaultComponents || ['Learned']).map(name => ({
        id: generateId(),
        name,
        learned: true,
        reviewed: false,
        reviewCount: 0,
        notes: '',
      }));
      return {
        id: generateId(),
        categoryId,
        date: today,
        unit: label,
        unitType: cat?.unitType || 'custom',
        components,
        createdAt: nowIso,
      };
    });

    addEntries(newEntries);
    toast.success(`Logged ${newEntries.length} units in ${tn(node.name)}`);
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto py-1">
        {subcategories.map(node => (
          <SubCategoryNode
            key={node.id}
            node={node}
            categoryId={categoryId}
            entries={entries}
            onLogLeaf={handleLogLeaf}
            onLogAll={handleLogAll}
          />
        ))}
      </div>
    </div>
  );
}
