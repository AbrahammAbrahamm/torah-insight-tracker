import { useState } from 'react';
import { useCategories, useEntries } from '@/lib/store';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubCategoryBrowser, getCategoryProgress } from '@/components/SubCategoryBrowser';
import { useI18n } from '@/lib/i18n';

export default function Categories() {
  const { categories } = useCategories();
  const { entries } = useEntries();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const { tn, isRtl } = useI18n();

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="space-y-3">
        {categories.map(cat => {
          const hasSubs = !!(cat.subcategories && cat.subcategories.length > 0);
          const isOpen = expandedCat === cat.id;
          const progress = hasSubs
            ? getCategoryProgress(cat.subcategories!, cat.id, entries)
            : { fraction: 0, leafCount: 0, completedLeaves: 0 };
          const pct = Math.round(progress.fraction * 100);
          const tone = pct >= 100 ? 'bg-success' : pct > 0 ? 'bg-primary' : 'bg-muted-foreground/30';

          return (
            <div key={cat.id}>
              <motion.div
                layout
                role={hasSubs ? 'button' : undefined}
                tabIndex={hasSubs ? 0 : undefined}
                onClick={() => hasSubs && setExpandedCat(isOpen ? null : cat.id)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && hasSubs) {
                    e.preventDefault();
                    setExpandedCat(isOpen ? null : cat.id);
                  }
                }}
                className={`bg-card border rounded-2xl p-5 transition-colors ${
                  hasSubs ? 'cursor-pointer hover:bg-secondary/40' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold font-display leading-tight">{tn(cat.name)}</p>
                  </div>
                  {hasSubs && (
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : (isRtl ? 'rotate-180' : '')}`} />
                  )}
                </div>
                {hasSubs && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${tone} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs tabular-nums font-semibold shrink-0 ${
                      pct >= 100 ? 'text-success' : pct > 0 ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {pct}%
                    </span>
                  </div>
                )}
              </motion.div>

              <AnimatePresence>
                {isOpen && cat.subcategories && (
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
                      categoryId={cat.id}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
