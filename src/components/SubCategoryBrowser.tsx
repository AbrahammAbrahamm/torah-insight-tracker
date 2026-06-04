import { useState, memo, useMemo } from 'react';
import { SubCategory } from '@/lib/category-structures';
import { ChevronRight, ChevronDown, BookOpen, CheckCircle2, CheckCheck, X } from 'lucide-react';
import { List, type RowComponentProps } from 'react-window';
import { useNavigate } from 'react-router-dom';
import {
  useEntries,
  useCategories,
  useCompletedUnits,
  LearningEntry,
  LearningComponent,
  unitsMatch,
  normalizeUnitKey,
} from '@/lib/store';
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

function getLeafProgress(completed: Set<string>, categoryId: string, unitLabel: string): number {
  return completed.has(normalizeUnitKey(unitLabel, categoryId)) ? 1 : 0;
}

export function getNodeProgress(
  node: SubCategory,
  categoryId: string,
  parentPath: string[],
  completed: Set<string>
): { fraction: number; leafCount: number; completedLeaves: number } {
  if (!node.children || node.children.length === 0) {
    const label = buildUnitLabel(parentPath, node);
    const frac = getLeafProgress(completed, categoryId, label);
    return { fraction: frac, leafCount: 1, completedLeaves: frac >= 0.999 ? 1 : 0 };
  }
  let totalFrac = 0;
  let leafCount = 0;
  let doneCount = 0;
  const childPath = [...parentPath, node.name];
  for (const child of node.children) {
    const sub = getNodeProgress(child, categoryId, childPath, completed);
    totalFrac += sub.fraction * sub.leafCount;
    leafCount += sub.leafCount;
    doneCount += sub.completedLeaves;
  }
  return {
    fraction: leafCount > 0 ? totalFrac / leafCount : 0,
    leafCount,
    completedLeaves: doneCount,
  };
}

export function getCategoryProgress(
  subcategories: SubCategory[],
  categoryId: string,
  completed: Set<string>
): { fraction: number; leafCount: number; completedLeaves: number } {
  let totalFrac = 0;
  let leafCount = 0;
  let doneCount = 0;
  for (const child of subcategories) {
    const sub = getNodeProgress(child, categoryId, [], completed);
    totalFrac += sub.fraction * sub.leafCount;
    leafCount += sub.leafCount;
    doneCount += sub.completedLeaves;
  }
  return {
    fraction: leafCount > 0 ? totalFrac / leafCount : 0,
    leafCount,
    completedLeaves: doneCount,
  };
}

function collectLeafLabels(node: SubCategory, parentPath: string[], out: string[]) {
  if (!node.children || node.children.length === 0) {
    out.push(buildUnitLabel(parentPath, node));
    return;
  }
  const childPath = [...parentPath, node.name];
  for (const child of node.children) {
    collectLeafLabels(child, childPath, out);
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

interface NodeProps {
  node: SubCategory;
  depth: number;
  path: string[];
  categoryId: string;
  completed: Set<string>;
  onLogLeaf: (unitLabel: string) => void;
  onLogAll: (node: SubCategory, path: string[]) => void;
  onUnlogAll: (node: SubCategory, path: string[]) => void;
}

const SubCategoryNode = memo(function SubCategoryNode({
  node,
  depth,
  path,
  categoryId,
  completed,
  onLogLeaf,
  onLogAll,
  onUnlogAll,
}: NodeProps) {
  const nodeKey = `torahTracker_open_${categoryId}_${[...path, node.name].join('>')}`;
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try { return sessionStorage.getItem(nodeKey) === '1'; } catch { return false; }
  });
  const toggleOpen = (next: boolean) => {
    setIsOpen(next);
    try {
      if (next) sessionStorage.setItem(nodeKey, '1');
      else sessionStorage.removeItem(nodeKey);
    } catch {}
  };
  const { tn } = useI18n();
  const hasChildren = !!(node.children && node.children.length > 0);
  const currentPath = useMemo(() => [...path, node.name], [path, node.name]);

  const leafLabel = !hasChildren ? buildUnitLabel(path, node) : '';
  const progress = getNodeProgress(node, categoryId, path, completed);
  const pct = Math.round(progress.fraction * 100);
  const tone: 'success' | 'primary' | 'muted' =
    pct >= 100 ? 'success' : pct > 0 ? 'primary' : 'muted';

  const handleClick = () => {
    if (hasChildren) {
      toggleOpen(!isOpen);
    } else {
      onLogLeaf(leafLabel);
    }
  };

  return (
    <div style={{ contentVisibility: 'auto', containIntrinsicSize: '44px' } as any}>
      <div
        className={`w-full flex items-center gap-2 pr-2 py-2.5 text-left transition-colors rounded-lg hover:bg-secondary/60 ${
          depth === 0 ? 'font-semibold text-sm' : depth === 1 ? 'font-medium text-sm' : 'text-xs text-muted-foreground'
        }`}
        style={{ paddingLeft: `${(depth + 1) * 24}px` }}
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
        {pct < 100 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogAll(node, path);
            }}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-success hover:bg-success/10"
            title={hasChildren ? 'Log all below as learned' : 'Mark as learned'}
            aria-label={hasChildren ? 'Log all below as learned' : 'Mark as learned'}
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
        )}
        {pct > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnlogAll(node, path);
            }}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title={hasChildren ? 'Unlog all below' : 'Unlog'}
            aria-label={hasChildren ? 'Unlog all below' : 'Unlog'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && hasChildren && (
        <NodeChildren
          children={node.children!}
          depth={depth + 1}
          path={currentPath}
          categoryId={categoryId}
          completed={completed}
          onLogLeaf={onLogLeaf}
          onLogAll={onLogAll}
          onUnlogAll={onUnlogAll}
        />
      )}
    </div>
  );
});

const LEAF_ROW_HEIGHT = 44;
const VIRTUALIZE_THRESHOLD = 50;
const MAX_VIRT_LIST_HEIGHT = 400;

interface ChildRowProps {
  items: SubCategory[];
  depth: number;
  path: string[];
  categoryId: string;
  completed: Set<string>;
  onLogLeaf: (unitLabel: string) => void;
  onLogAll: (node: SubCategory, path: string[]) => void;
  onUnlogAll: (node: SubCategory, path: string[]) => void;
}

function ChildRow({ index, style, items, depth, path, categoryId, completed, onLogLeaf, onLogAll, onUnlogAll }: RowComponentProps<ChildRowProps>) {
  return (
    <div style={style}>
      <SubCategoryNode
        node={items[index]}
        depth={depth}
        path={path}
        categoryId={categoryId}
        completed={completed}
        onLogLeaf={onLogLeaf}
        onLogAll={onLogAll}
        onUnlogAll={onUnlogAll}
      />
    </div>
  );
}

function NodeChildren({
  children,
  depth,
  path,
  categoryId,
  completed,
  onLogLeaf,
  onLogAll,
  onUnlogAll,
}: {
  children: SubCategory[];
  depth: number;
  path: string[];
  categoryId: string;
  completed: Set<string>;
  onLogLeaf: (unitLabel: string) => void;
  onLogAll: (node: SubCategory, path: string[]) => void;
  onUnlogAll: (node: SubCategory, path: string[]) => void;
}) {
  const allLeaves = useMemo(
    () => children.every(c => !c.children || c.children.length === 0),
    [children]
  );
  const shouldVirtualize = allLeaves && children.length > VIRTUALIZE_THRESHOLD;

  if (shouldVirtualize) {
    const height = Math.min(MAX_VIRT_LIST_HEIGHT, children.length * LEAF_ROW_HEIGHT);
    return (
      <List
        rowComponent={ChildRow}
        rowCount={children.length}
        rowHeight={LEAF_ROW_HEIGHT}
        style={{ height }}
        rowProps={{
          items: children,
          depth,
          path,
          categoryId,
          completed,
          onLogLeaf,
          onLogAll,
          onUnlogAll,
        }}
      />
    );
  }

  return (
    <>
      {children.map(child => (
        <SubCategoryNode
          key={child.id}
          node={child}
          depth={depth}
          path={path}
          categoryId={categoryId}
          completed={completed}
          onLogLeaf={onLogLeaf}
          onLogAll={onLogAll}
          onUnlogAll={onUnlogAll}
        />
      ))}
    </>
  );
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function SubCategoryBrowser({ subcategories, categoryName, categoryId }: SubCategoryBrowserProps) {
  const navigate = useNavigate();
  const { entries, addEntries, setEntries } = useEntries();
  const { categories } = useCategories();
  const completed = useCompletedUnits();
  const { tn } = useI18n();

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

    const labelsToLog = labels.filter(label => !completed.has(normalizeUnitKey(label, categoryId)));
    if (labelsToLog.length === 0) {
      toast.info('Already fully logged');
      return;
    }

    const newEntries: LearningEntry[] = labelsToLog.map(label => {
      const compNames = cat?.defaultComponents?.length ? cat.defaultComponents : ['Learned'];
      const components: LearningComponent[] = compNames.map((name, idx) => ({
        id: generateId(),
        name,
        learned: idx === 0,
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

  const handleUnlogAll = (node: SubCategory, path: string[]) => {
    const labels: string[] = [];
    collectLeafLabels(node, path, labels);
    if (labels.length === 0) return;
    const needles = labels.map(l => l.toLowerCase());
    const before = entries.length;
    const remaining = entries.filter(
      e => !(e.categoryId === categoryId && needles.some(n => unitsMatch(e.unit, n, categoryId)))
    );
    const removed = before - remaining.length;
    if (removed === 0) {
      toast.info('Nothing to unlog');
      return;
    }
    setEntries(remaining);
    toast.success(`Unlogged ${removed} entries in ${tn(node.name)}`);
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto py-1">
        {subcategories.map(node => (
          <SubCategoryNode
            key={node.id}
            node={node}
            depth={0}
            path={[]}
            categoryId={categoryId}
            completed={completed}
            onLogLeaf={handleLogLeaf}
            onLogAll={handleLogAll}
            onUnlogAll={handleUnlogAll}
          />
        ))}
      </div>
    </div>
  );
}
