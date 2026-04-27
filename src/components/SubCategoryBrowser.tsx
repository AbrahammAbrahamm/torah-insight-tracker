import { useState } from 'react';
import { SubCategory } from '@/lib/category-structures';
import { ChevronRight, ChevronDown, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/lib/store';

interface SubCategoryBrowserProps {
  subcategories: SubCategory[];
  categoryName: string;
  categoryId: string;
}

function isLeafCompleted(entries: Array<{ categoryId: string; unit: string }>, categoryId: string, unitLabel: string) {
  const needle = unitLabel.toLowerCase();
  return entries.some(e => e.categoryId === categoryId && e.unit.toLowerCase().includes(needle));
}

function countCompletedLeaves(node: SubCategory, categoryId: string, parentPath: string[], entries: Array<{ categoryId: string; unit: string }>): { done: number; total: number } {
  if (!node.children || node.children.length === 0) {
    const label = [...parentPath, node.name].join(' ');
    return { done: isLeafCompleted(entries, categoryId, buildUnitLabel(parentPath, node)) ? 1 : 0, total: 1 };
  }
  let done = 0, total = 0;
  for (const child of node.children) {
    const sub = countCompletedLeaves(child, categoryId, [...parentPath, node.name], entries);
    done += sub.done;
    total += sub.total;
  }
  return { done, total };
}

// Build a human label like "Bava Metzia Daf 2a"
function buildUnitLabel(parentPath: string[], node: SubCategory): string {
  // parentPath includes seder + masechta names typically. Use last meaningful parent (masechta) + node name.
  const masechta = parentPath[parentPath.length - 1] || '';
  // Strip "(Amud Aleph)" type suffix from node.name to keep it short
  const cleanName = node.name.replace(/\s*\(.*\)\s*$/, '');
  return `${masechta} ${cleanName}`.trim();
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
  entries: Array<{ categoryId: string; unit: string }>;
  onLogLeaf: (unitLabel: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const currentPath = [...path, node.name];

  const leafLabel = !hasChildren ? buildUnitLabel(path, node) : '';
  const leafDone = !hasChildren && isLeafCompleted(entries, categoryId, leafLabel);

  const progress = hasChildren ? countCompletedLeaves(node, categoryId, path, entries) : null;

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
        } ${leafDone ? 'text-success' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )
        ) : leafDone ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
        ) : (
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
        )}
        <span className="flex-1 truncate">{node.name}</span>
        {progress && progress.total > 0 && (
          <span className={`text-[10px] shrink-0 rounded-full px-2 py-0.5 ${
            progress.done === progress.total
              ? 'bg-success/15 text-success'
              : progress.done > 0
                ? 'bg-primary/10 text-primary'
                : 'bg-secondary text-muted-foreground'
          }`}>
            {progress.done}/{progress.total}
          </span>
        )}
        {!hasChildren && node.totalUnits !== undefined && !leafDone && (
          <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5 shrink-0">
            log
          </span>
        )}
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
