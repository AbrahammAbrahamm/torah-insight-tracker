import { useState } from 'react';
import { SubCategory } from '@/lib/category-structures';
import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubCategoryBrowserProps {
  subcategories: SubCategory[];
  categoryName: string;
  onSelectUnit?: (path: string[]) => void;
}

function SubCategoryNode({ node, depth = 0, path = [] }: {
  node: SubCategory;
  depth?: number;
  path?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const currentPath = [...path, node.name];

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsOpen(!isOpen)}
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
        ) : (
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
        )}
        <span className="flex-1 truncate">{node.name}</span>
        {node.totalUnits !== undefined && !node.children && (
          <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5 shrink-0">
            {node.totalUnits} daf
          </span>
        )}
        {node.totalUnits !== undefined && hasChildren && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            {node.totalUnits} daf
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
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SubCategoryBrowser({ subcategories, categoryName }: SubCategoryBrowserProps) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b bg-secondary/30">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {categoryName} Structure
        </h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto py-1">
        {subcategories.map(node => (
          <SubCategoryNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
