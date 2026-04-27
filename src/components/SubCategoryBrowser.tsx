import { useState } from 'react';
import { SubCategory } from '@/lib/category-structures';
import { ChevronRight, ChevronDown, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEntries, LearningEntry } from '@/lib/store';

interface SubCategoryBrowserProps {
  subcategories: SubCategory[];
  categoryName: string;
  categoryId: string;
}

// Build a human label like "Bava Metzia Daf 2a" from path + node
function buildUnitLabel(parentPath: string[], node: SubCategory): string {
  const masechta = parentPath[parentPath.length - 1] || '';
  const cleanName = node.name.replace(/\s*\(.*\)\s*$/, '');
  return `${masechta} ${cleanName}`.trim();
}

// Returns a fraction 0..1 of how complete a leaf unit is, based on logged entries.
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

// Aggregate progress: average of leaf fractions under this node
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
}: {
  node: SubCategory;
  depth?: number;
  path?: string[];
  categoryId: string;
  entries: LearningEntry[];
  onLogLeaf: (unitLabel: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
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
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors rounded-lg hover:bg-secondary/60 ${
          depth === 0 ? 'font-semibold text-sm' : depth === 1 ? 'font-medium text-sm' : 'text-xs text-muted-foreground'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
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
        <span className={`flex-1 truncate ${pct >= 100 ? 'text-success' : ''}`}>{node.name}</span>

        <ProgressBar value={progress.fraction} tone={tone} />
        <span
          className={`text-[10px] tabular-nums shrink-0 w-8 text-right ${
            tone === 'success' ? 'text-success' : tone === 'primary' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {pct}%
        </span>
      </button>

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
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SubCategoryBrowser({ subcategories, categoryName, categoryId }: SubCategoryBrowserProps) {
  const navigate = useNavigate();
  const { entries } = useEntries();

  const handleLogLeaf = (unitLabel: string) => {
    const params = new URLSearchParams({ category: categoryId, unit: unitLabel });
    navigate(`/log?${params.toString()}`);
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b bg-secondary/30">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {categoryName} Structure
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">Tap any unit to log it</p>
      </div>
      <div className="max-h-[400px] overflow-y-auto py-1">
        {subcategories.map(node => (
          <SubCategoryNode
            key={node.id}
            node={node}
            categoryId={categoryId}
            entries={entries}
            onLogLeaf={handleLogLeaf}
          />
        ))}
      </div>
    </div>
  );
}
